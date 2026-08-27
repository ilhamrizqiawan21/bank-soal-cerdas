<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PaketSoal;
use App\Models\Question;
use App\Models\SharePaket;
use App\Models\ShareSoal;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

class ShareController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $shares = $this->visibleShares($request)
            ->when($request->filled('type'), fn ($collection) => $collection->where('resource_type', $this->normalizeType((string) $request->string('type'))))
            ->when($request->filled('status'), fn ($collection) => $collection->where('status', (string) $request->string('status')))
            ->sortByDesc('created_at')
            ->values();

        $page = max((int) $request->integer('page', 1), 1);
        $perPage = min(max((int) $request->integer('per_page', 15), 1), 100);
        $paginator = new LengthAwarePaginator(
            $shares->forPage($page, $perPage)->values(),
            $shares->count(),
            $perPage,
            $page,
            ['path' => $request->url(), 'query' => $request->query()]
        );

        return response()->json([
            'data' => $paginator->items(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'from' => $paginator->firstItem(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'to' => $paginator->lastItem(),
                'total' => $paginator->total(),
            ],
            'links' => [
                'first' => $paginator->url(1),
                'last' => $paginator->url($paginator->lastPage()),
                'prev' => $paginator->previousPageUrl(),
                'next' => $paginator->nextPageUrl(),
            ],
        ]);
    }

    public function show(Request $request, string $share): JsonResponse
    {
        $model = $this->resolveShare($request, $share);
        $this->authorizeVisible($request, $model);

        return response()->json(['data' => $this->toPayload($model)]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'resource_type' => 'required|in:question,soal,paket,paket_soal',
            'resource_id' => 'required|integer',
            'shared_to' => 'required|integer|exists:users,id',
            'permission' => 'required|in:view,edit,copy',
            'note' => 'nullable|string|max:2000',
        ]);

        $resourceType = $this->normalizeType($validated['resource_type']);
        abort_if((int) $validated['shared_to'] === (int) $request->user()->id, 422, 'Tidak bisa membagikan ke diri sendiri.');

        $recipient = User::whereIn('role', ['admin', 'guru'])->findOrFail($validated['shared_to']);
        $resource = $this->findShareableResource($resourceType, $validated['resource_id'], $request);

        if ($resourceType === 'question') {
            abort_if(ShareSoal::where('question_id', $resource->id)->where('shared_to', $recipient->id)->exists(), 422, 'Soal ini sudah dibagikan ke user tersebut.');

            $share = ShareSoal::create([
                'question_id' => $resource->id,
                'shared_by' => $request->user()->id,
                'shared_to' => $recipient->id,
                'permission' => $validated['permission'],
                'note' => $validated['note'] ?? null,
                'is_accepted' => false,
            ]);
        } else {
            abort_if(SharePaket::where('paket_soal_id', $resource->id)->where('shared_to', $recipient->id)->exists(), 422, 'Paket soal ini sudah dibagikan ke user tersebut.');

            $share = SharePaket::create([
                'paket_soal_id' => $resource->id,
                'shared_by' => $request->user()->id,
                'shared_to' => $recipient->id,
                'permission' => $validated['permission'],
                'note' => $validated['note'] ?? null,
                'is_accepted' => false,
            ]);
        }

        return response()->json(['data' => $this->toPayload($share->fresh())], 201);
    }

    public function update(Request $request, string $share): JsonResponse
    {
        $model = $this->resolveShare($request, $share);
        abort_unless((int) $model->shared_by === (int) $request->user()->id || $request->user()->role === 'admin', 403);

        $validated = $request->validate([
            'permission' => 'required|in:view,edit,copy',
            'note' => 'nullable|string|max:2000',
        ]);

        $model->update($validated);

        return response()->json(['data' => $this->toPayload($model->fresh())]);
    }

    public function destroy(Request $request, string $share): JsonResponse
    {
        $model = $this->resolveShare($request, $share);
        $this->authorizeVisible($request, $model);

        $model->delete();

        return response()->json(['data' => null]);
    }

    public function accept(Request $request, string $share): JsonResponse
    {
        $model = $this->resolveShare($request, $share);
        abort_unless((int) $model->shared_to === (int) $request->user()->id, 403);

        $model->update([
            'is_accepted' => true,
            'accepted_at' => now(),
        ]);

        return response()->json(['data' => $this->toPayload($model->fresh())]);
    }

    public function reject(Request $request, string $share): JsonResponse
    {
        $model = $this->resolveShare($request, $share);
        abort_unless((int) $model->shared_to === (int) $request->user()->id, 403);

        $model->delete();

        return response()->json(['data' => null]);
    }

    public function addNote(Request $request, string $share): JsonResponse
    {
        $model = $this->resolveShare($request, $share);
        $this->authorizeVisible($request, $model);

        $validated = $request->validate([
            'text' => 'required|string|max:2000',
        ]);

        $note = [
            'id' => 'note-'.now()->timestamp.'-'.$request->user()->id,
            'user_id' => (string) $request->user()->id,
            'user_name' => $request->user()->name,
            'user_role' => match ($request->user()->role) {
                'admin' => 'Administrator',
                'guru' => 'Guru',
                default => 'Siswa',
            },
            'text' => $validated['text'],
            'created_at' => now()->toISOString(),
        ];

        $model->notes = array_values(array_merge((array) ($model->notes ?? []), [$note]));
        $model->save();

        return response()->json([
            'data' => [
                'share' => $this->toPayload($model->fresh()),
                'note' => $note,
            ],
        ], 201);
    }

    private function visibleShares(Request $request)
    {
        $userId = $request->user()->id;

        $soal = ShareSoal::with(['question', 'sharedBy', 'sharedTo'])
            ->where(fn ($q) => $q->where('shared_to', $userId)->orWhere('shared_by', $userId))
            ->get()
            ->map(fn ($share) => $this->toPayload($share));

        $paket = SharePaket::with(['paketSoal', 'sharedBy', 'sharedTo'])
            ->where(fn ($q) => $q->where('shared_to', $userId)->orWhere('shared_by', $userId))
            ->get()
            ->map(fn ($share) => $this->toPayload($share));

        return collect($soal->all())->merge($paket->all());
    }

    private function findShareableResource(string $resourceType, int $id, Request $request)
    {
        if ($resourceType === 'question') {
            $question = Question::findOrFail($id);
            abort_unless($request->user()->role === 'admin' || (int) $question->created_by === (int) $request->user()->id, 403);

            return $question;
        }

        $paket = PaketSoal::findOrFail($id);
        abort_unless($request->user()->role === 'admin' || (int) $paket->created_by === (int) $request->user()->id, 403);

        return $paket;
    }

    private function resolveShare(Request $request, string $share)
    {
        [$type, $id] = $this->parseShareKey($request, $share);

        return $type === 'question'
            ? ShareSoal::with(['question', 'sharedBy', 'sharedTo'])->findOrFail($id)
            : SharePaket::with(['paketSoal', 'sharedBy', 'sharedTo'])->findOrFail($id);
    }

    private function parseShareKey(Request $request, string $share): array
    {
        if (str_contains($share, ':')) {
            [$type, $id] = explode(':', $share, 2);

            return [$this->normalizeType($type), (int) $id];
        }

        if (str_contains($share, '-')) {
            [$type, $id] = explode('-', $share, 2);

            return [$this->normalizeType($type), (int) $id];
        }

        return [$this->normalizeType($request->input('resource_type', $request->input('type', 'question'))), (int) $share];
    }

    private function normalizeType(string $type): string
    {
        return in_array($type, ['question', 'soal'], true) ? 'question' : 'paket';
    }

    private function authorizeVisible(Request $request, $share): void
    {
        abort_unless(
            (int) $share->shared_to === (int) $request->user()->id
                || (int) $share->shared_by === (int) $request->user()->id
                || $request->user()->role === 'admin',
            403
        );
    }

    private function toPayload($share): array
    {
        $isQuestion = $share instanceof ShareSoal;
        $resource = $isQuestion ? $share->question : $share->paketSoal;
        $type = $isQuestion ? 'question' : 'paket';

        return [
            'id' => $share->id,
            'share_key' => "{$type}:{$share->id}",
            'resource_type' => $type,
            'resource_id' => $isQuestion ? $share->question_id : $share->paket_soal_id,
            'resource_title' => $isQuestion ? $resource?->question_text : $resource?->name,
            'shared_by' => $share->sharedBy,
            'shared_to' => $share->sharedTo,
            'permission' => $share->permission,
            'is_accepted' => (bool) $share->is_accepted,
            'status' => $share->is_accepted ? 'accepted' : 'pending',
            'accepted_at' => $share->accepted_at,
            'note' => $share->note,
            'notes' => $share->notes ?? [],
            'created_at' => $share->created_at,
            'updated_at' => $share->updated_at,
        ];
    }
}
