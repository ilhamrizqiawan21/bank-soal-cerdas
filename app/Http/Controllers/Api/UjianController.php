<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PaketSoal;
use App\Models\Ujian;
use App\Models\UjianJawaban;
use App\Models\User;
use App\Policies\PaketSoalPolicy;
use App\Policies\UjianPolicy;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class UjianController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Ujian::class);

        $query = UjianPolicy::scopeManageableBy(
            Ujian::with(['paketSoal', 'siswa', 'creator']),
            $request->user()
        );

        if ($request->filled('status') && $request->status !== 'semua') {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = (string) $request->string('search');
            $query->where(fn ($q) => $q
                ->where('title', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%"));
        }

        match ((string) $request->string('sort', 'latest')) {
            'oldest' => $query->oldest(),
            'title' => $query->orderBy('title'),
            default => $query->latest(),
        };

        $ujian = $query->paginate($this->perPage($request))->withQueryString();

        return $this->paginated($ujian);
    }

    public function show(Ujian $ujian): JsonResponse
    {
        Gate::authorize('view', $ujian);

        if ($ujian->status === 'active' && ! $ujian->jawaban()->exists()) {
            $this->initializeAnswers($ujian);
        }

        return response()->json([
            'data' => $ujian->load([
                'paketSoal.items.question.subject',
                'paketSoal.items.question.kko',
                'paketSoal.items.question.pgOptions',
                'paketSoal.items.question.matchingPairs',
                'paketSoal.items.question.essayRubric',
                'siswa',
                'creator',
                'jawaban.question.subject',
                'jawaban.question.kko',
                'jawaban.question.pgOptions',
                'jawaban.question.matchingPairs',
                'jawaban.question.essayRubric',
            ]),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        Gate::authorize('create', Ujian::class);

        $validated = $request->validate([
            'paket_soal_id' => 'required|integer|exists:paket_soal,id',
            'siswa_id' => [
                'required',
                Rule::exists('users', 'id')->where(fn ($query) => $query->where('role', 'siswa')->where('is_active', true)),
            ],
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'duration_minutes' => 'nullable|integer|min:1|max:180',
        ]);

        $paket = PaketSoalPolicy::scopeVisibleTo(
            PaketSoal::where('status', 'published'),
            $request->user()
        )->findOrFail($validated['paket_soal_id']);

        $ujian = Ujian::create([
            'paket_soal_id' => $paket->id,
            'siswa_id' => $validated['siswa_id'],
            'created_by' => $request->user()->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'duration_minutes' => $validated['duration_minutes'] ?? $paket->duration_minutes,
            'total_soal' => $paket->total_soal,
            'status' => 'draft',
        ]);

        return response()->json(['data' => $ujian->load(['paketSoal', 'siswa', 'creator'])], 201);
    }

    public function update(Request $request, Ujian $ujian): JsonResponse
    {
        Gate::authorize('update', $ujian);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'duration_minutes' => 'nullable|integer|min:1|max:180',
            'status' => 'sometimes|in:draft,active,finished,expired',
        ]);

        $ujian->update($validated);

        return response()->json(['data' => $ujian->fresh(['paketSoal', 'siswa', 'creator'])]);
    }

    public function destroy(Ujian $ujian): JsonResponse
    {
        Gate::authorize('delete', $ujian);

        $ujian->delete();

        return response()->json(['data' => null]);
    }

    public function publish(Ujian $ujian): JsonResponse
    {
        Gate::authorize('publish', $ujian);

        abort_if($ujian->status !== 'draft', 422, 'Ujian hanya bisa dipublikasikan dari status draft.');

        $ujian->update([
            'status' => 'active',
            'started_at' => now(),
        ]);

        return response()->json(['data' => $ujian->fresh(['paketSoal', 'siswa', 'creator'])]);
    }

    public function mine(Request $request): JsonResponse
    {
        $ujian = Ujian::where('siswa_id', $request->user()->id)
            ->whereIn('status', ['active', 'finished', 'expired'])
            ->with(['paketSoal'])
            ->latest()
            ->paginate($this->perPage($request))
            ->withQueryString();

        return $this->paginated($ujian);
    }

    public function answer(Request $request, Ujian $ujian): JsonResponse
    {
        $this->authorizeStudentExam($request, $ujian);

        $validated = $request->validate([
            'jawaban' => 'required|array',
            'jawaban.*.jawaban' => 'nullable|string|max:10000',
            'jawaban.*.selected_option' => 'nullable|integer',
            'jawaban.*.selected_option_id' => 'nullable|integer|exists:question_pg_options,id',
        ]);

        abort_if($ujian->submitted_at, 400, 'Ujian sudah disubmit.');
        abort_if($ujian->status !== 'active', 403, 'Ujian tidak aktif.');
        abort_if($this->isExpired($ujian), 403, 'Waktu ujian telah habis.');

        DB::transaction(function () use ($ujian, $validated) {
            $this->initializeAnswers($ujian);
            $ujian->load('jawaban.question.pgOptions');

            foreach ($validated['jawaban'] as $questionId => $answer) {
                $ujianJawaban = $ujian->jawaban->firstWhere('question_id', (int) $questionId);

                if (! $ujianJawaban) {
                    continue;
                }

                $question = $ujianJawaban->question;
                $selectedOptionId = $answer['selected_option_id'] ?? null;

                if ($question->type === 'pg' && $selectedOptionId !== null) {
                    $optionIsValid = $question->pgOptions
                        ->contains(fn ($option) => (int) $option->id === (int) $selectedOptionId);

                    abort_unless($optionIsValid, 422, 'Pilihan jawaban tidak valid untuk soal ini.');
                }

                $ujianJawaban->update([
                    'jawaban' => $answer['jawaban'] ?? null,
                    'selected_option' => $question->type === 'pg' ? null : ($answer['selected_option'] ?? null),
                    'selected_option_id' => $question->type === 'pg' ? $selectedOptionId : null,
                ]);
            }
        });

        return response()->json(['data' => $ujian->fresh(['jawaban'])]);
    }

    public function submit(Request $request, Ujian $ujian): JsonResponse
    {
        $this->authorizeStudentExam($request, $ujian);

        abort_if($ujian->submitted_at, 400, 'Ujian sudah disubmit.');
        abort_if($ujian->status !== 'active', 403, 'Ujian tidak aktif.');
        abort_if($this->isExpired($ujian), 403, 'Waktu ujian telah habis.');

        DB::transaction(function () use ($ujian) {
            $this->initializeAnswers($ujian);
            $ujian->load('jawaban.question.pgOptions');

            $totalScore = 0;
            foreach ($ujian->jawaban as $jawaban) {
                $question = $jawaban->question;
                $isCorrect = false;

                if ($question->type === 'pg') {
                    $selectedOption = $jawaban->selected_option_id
                        ? $question->pgOptions->first(fn ($option) => (int) $option->id === (int) $jawaban->selected_option_id)
                        : null;
                    $isCorrect = (bool) $selectedOption?->is_correct;
                } elseif ($question->type === 'benar_salah') {
                    $isCorrect = $jawaban->selected_option == ($question->correct_boolean ? 1 : 0);
                }

                $jawaban->update([
                    'is_correct' => $isCorrect,
                    'score' => $isCorrect ? $jawaban->max_score : 0,
                ]);

                if ($isCorrect) {
                    $totalScore += $jawaban->max_score;
                }
            }

            $ujian->update([
                'status' => 'finished',
                'submitted_at' => now(),
                'finished_at' => now(),
                'total_score' => $totalScore,
            ]);
        });

        return response()->json(['data' => $ujian->fresh(['paketSoal', 'jawaban.question'])]);
    }

    private function authorizeStudentExam(Request $request, Ujian $ujian): void
    {
        abort_unless($request->user()->role === 'siswa', 403, 'Hanya siswa yang dapat mengakses ujian ini.');
        abort_unless((int) $ujian->siswa_id === (int) $request->user()->id, 404);
    }

    private function initializeAnswers(Ujian $ujian): void
    {
        if ($ujian->jawaban()->exists()) {
            return;
        }

        $ujian->loadMissing('paketSoal.items');
        foreach ($ujian->paketSoal->items as $item) {
            UjianJawaban::create([
                'ujian_id' => $ujian->id,
                'question_id' => $item->question_id,
                'paket_soal_item_id' => $item->id,
                'max_score' => $item->score ?? 1,
            ]);
        }
    }

    private function isExpired(Ujian $ujian): bool
    {
        if (! $ujian->duration_minutes || ! $ujian->started_at) {
            return false;
        }

        if (now()->lte($ujian->started_at->copy()->addMinutes($ujian->duration_minutes))) {
            return false;
        }

        $ujian->update(['status' => 'expired']);

        return true;
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
