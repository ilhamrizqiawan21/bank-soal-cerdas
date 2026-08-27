<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PaketSoal;
use App\Models\Question;
use App\Policies\PaketSoalPolicy;
use App\Policies\QuestionPolicy;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class PaketSoalController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', PaketSoal::class);

        $query = PaketSoalPolicy::scopeVisibleTo(
            PaketSoal::with(['creator', 'items.question.subject', 'items.question.kko']),
            $request->user()
        );

        foreach (['jenjang', 'curriculum', 'status'] as $filter) {
            if ($request->filled($filter) && $request->{$filter} !== 'semua') {
                $query->where($filter, $request->{$filter});
            }
        }

        if ($request->filled('search')) {
            $search = (string) $request->string('search');
            $query->where(fn ($q) => $q
                ->where('name', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%"));
        }

        match ((string) $request->string('sort', 'latest')) {
            'oldest' => $query->oldest(),
            'name' => $query->orderBy('name'),
            default => $query->latest(),
        };

        $paket = $query->paginate($this->perPage($request))->withQueryString();

        return $this->paginated($paket);
    }

    public function show(PaketSoal $paketSoal): JsonResponse
    {
        Gate::authorize('view', $paketSoal);

        return response()->json([
            'data' => $paketSoal->load(['creator', 'items.question.subject', 'items.question.kko', 'items.question.pgOptions', 'items.question.matchingPairs']),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        Gate::authorize('create', PaketSoal::class);

        $validated = $this->validated($request);
        $this->authorizeQuestionIds($validated['questions'], $request);

        $paket = DB::transaction(function () use ($request, $validated) {
            $paket = PaketSoal::create([
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'jenjang' => $validated['jenjang'],
                'curriculum' => $validated['curriculum'],
                'duration_minutes' => $validated['duration_minutes'] ?? null,
                'acak_soal' => $validated['acak_soal'] ?? false,
                'acak_pilihan' => $validated['acak_pilihan'] ?? false,
                'created_by' => $request->user()->id,
                'status' => $validated['status'] ?? 'draft',
                'total_soal' => count($validated['questions']),
            ]);

            $this->syncItems($paket, $validated);

            return $paket;
        });

        return response()->json(['data' => $paket->load(['creator', 'items.question.subject', 'items.question.kko'])], 201);
    }

    public function update(Request $request, PaketSoal $paketSoal): JsonResponse
    {
        Gate::authorize('update', $paketSoal);

        $validated = $this->validated($request);
        $this->authorizeQuestionIds($validated['questions'], $request);

        DB::transaction(function () use ($paketSoal, $validated) {
            $paketSoal->update([
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'jenjang' => $validated['jenjang'],
                'curriculum' => $validated['curriculum'],
                'duration_minutes' => $validated['duration_minutes'] ?? null,
                'acak_soal' => $validated['acak_soal'] ?? false,
                'acak_pilihan' => $validated['acak_pilihan'] ?? false,
                'status' => $validated['status'] ?? 'draft',
                'total_soal' => count($validated['questions']),
            ]);

            $paketSoal->items()->delete();
            $this->syncItems($paketSoal, $validated);
        });

        return response()->json([
            'data' => $paketSoal->fresh(['creator', 'items.question.subject', 'items.question.kko']),
        ]);
    }

    public function destroy(PaketSoal $paketSoal): JsonResponse
    {
        Gate::authorize('delete', $paketSoal);

        $paketSoal->delete();

        return response()->json(['data' => null]);
    }

    public function duplicate(PaketSoal $paketSoal): JsonResponse
    {
        Gate::authorize('duplicate', $paketSoal);

        $newPaket = DB::transaction(function () use ($paketSoal) {
            $paketSoal->load('items');

            $newPaket = $paketSoal->replicate();
            $newPaket->name = $paketSoal->name.' (Copy)';
            $newPaket->created_by = request()->user()->id;
            $newPaket->status = 'draft';
            $newPaket->save();

            foreach ($paketSoal->items as $item) {
                $newPaket->items()->create([
                    'question_id' => $item->question_id,
                    'order' => $item->order,
                    'score' => $item->score,
                ]);
            }

            return $newPaket;
        });

        return response()->json(['data' => $newPaket->load(['creator', 'items.question.subject', 'items.question.kko'])], 201);
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'jenjang' => 'required|in:SD,SMP,SMA',
            'curriculum' => 'required|in:merdeka,kbc,both',
            'duration_minutes' => 'nullable|integer|min:1|max:180',
            'acak_soal' => 'sometimes|boolean',
            'acak_pilihan' => 'sometimes|boolean',
            'status' => 'sometimes|in:draft,published,archived',
            'questions' => 'required|array|min:1',
            'questions.*' => 'required|integer|exists:questions,id',
            'scores' => 'nullable|array',
            'scores.*' => 'nullable|integer|min:1|max:100',
        ]);
    }

    private function syncItems(PaketSoal $paket, array $validated): void
    {
        foreach ($validated['questions'] as $index => $questionId) {
            $paket->items()->create([
                'question_id' => $questionId,
                'order' => $index + 1,
                'score' => $validated['scores'][$index] ?? 1,
            ]);
        }
    }

    private function authorizeQuestionIds(array $questionIds, Request $request): void
    {
        $ids = array_unique($questionIds);
        $visibleCount = QuestionPolicy::scopeVisibleTo(Question::query(), $request->user())
            ->whereIn('id', $ids)
            ->count();

        abort_if($visibleCount !== count($ids), 403, 'Anda tidak memiliki akses ke sebagian soal yang dipilih.');
    }

    private function perPage(Request $request): int
    {
        return min(max((int) $request->integer('per_page', 15), 1), 100);
    }

    private function paginated($paginator): JsonResponse
    {
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
}
