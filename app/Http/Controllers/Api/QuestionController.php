<?php

namespace App\Http\Controllers\Api;

use App\Exports\QuestionsExport;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreQuestionRequest;
use App\Http\Requests\UpdateQuestionRequest;
use App\Imports\QuestionsImport;
use App\Models\Question;
use App\Policies\QuestionPolicy;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class QuestionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Question::class);

        $query = QuestionPolicy::scopeVisibleTo(
            Question::with(['subject', 'kko', 'creator', 'pgOptions', 'matchingPairs', 'essayRubric', 'kategori', 'tags']),
            $request->user()
        );

        foreach (['curriculum', 'level_c', 'type', 'kko_id', 'subject_id', 'jenjang'] as $filter) {
            if ($request->filled($filter) && $request->{$filter} !== 'semua') {
                $query->where($filter, $request->{$filter});
            }
        }

        if ($request->filled('tag_id') && $request->tag_id !== 'semua') {
            $query->whereHas('tags', fn ($tagQuery) => $tagQuery->where('tag.id', $request->tag_id));
        }

        if ($request->filled('bloom_level') && $request->bloom_level !== 'semua') {
            $query->whereHas('kko', fn ($kkoQuery) => $kkoQuery->where('bloom_level', $request->bloom_level));
        }

        if ($request->filled('search')) {
            $search = (string) $request->string('search');
            $query->where(fn ($q) => $q
                ->where('question_text', 'like', "%{$search}%")
                ->orWhere('indicator_text', 'like', "%{$search}%"));
        }

        $sort = $request->string('sort', 'latest');
        match ((string) $sort) {
            'oldest' => $query->oldest(),
            'level' => $query->orderBy('level_c')->orderByDesc('created_at'),
            default => $query->latest(),
        };

        $perPage = min(max((int) $request->integer('per_page', 15), 1), 100);
        $questions = $query->paginate($perPage)->withQueryString();

        return response()->json([
            'data' => $questions->items(),
            'meta' => [
                'current_page' => $questions->currentPage(),
                'from' => $questions->firstItem(),
                'last_page' => $questions->lastPage(),
                'per_page' => $questions->perPage(),
                'to' => $questions->lastItem(),
                'total' => $questions->total(),
            ],
            'links' => [
                'first' => $questions->url(1),
                'last' => $questions->url($questions->lastPage()),
                'prev' => $questions->previousPageUrl(),
                'next' => $questions->nextPageUrl(),
            ],
        ]);
    }

    public function show(Question $question): JsonResponse
    {
        Gate::authorize('view', $question);

        return response()->json([
            'data' => $question->load(['subject', 'kko', 'creator', 'pgOptions', 'matchingPairs', 'essayRubric', 'kategori', 'tags']),
        ]);
    }

    public function store(StoreQuestionRequest $request): JsonResponse
    {
        Gate::authorize('create', Question::class);

        $question = DB::transaction(function () use ($request) {
            $question = Question::create([
                'subject_id' => $request->subject_id,
                'kko_id' => $request->kko_id,
                'created_by' => Auth::id(),
                'jenjang' => $request->jenjang,
                'curriculum' => $request->curriculum,
                'type' => $request->type,
                'level_c' => $request->level_c,
                'question_text' => $request->question_text,
                'indicator_text' => $request->indicator_text,
                'correct_boolean' => $request->type === 'benar_salah' ? $request->correct_boolean : null,
            ]);

            $this->saveQuestionDetails($question, $request);

            return $question;
        });

        return response()->json(['data' => $question->load(['pgOptions', 'matchingPairs', 'essayRubric'])], 201);
    }

    public function update(UpdateQuestionRequest $request, Question $question): JsonResponse
    {
        Gate::authorize('update', $question);

        DB::transaction(function () use ($request, $question) {
            $question->update([
                'subject_id' => $request->subject_id,
                'kko_id' => $request->kko_id,
                'jenjang' => $request->jenjang,
                'curriculum' => $request->curriculum,
                'type' => $request->type,
                'level_c' => $request->level_c,
                'question_text' => $request->question_text,
                'indicator_text' => $request->indicator_text,
                'correct_boolean' => $request->type === 'benar_salah' ? $request->correct_boolean : null,
            ]);

            $question->pgOptions()->delete();
            $question->matchingPairs()->delete();
            $question->essayRubric()->delete();
            $this->saveQuestionDetails($question, $request);
        });

        return response()->json(['data' => $question->fresh(['pgOptions', 'matchingPairs', 'essayRubric'])]);
    }

    public function destroy(Question $question): JsonResponse
    {
        Gate::authorize('delete', $question);

        $question->delete();

        return response()->json(['data' => null]);
    }

    public function duplicate(Question $question): JsonResponse
    {
        Gate::authorize('duplicate', $question);

        $newQuestion = DB::transaction(function () use ($question) {
            $question->load(['pgOptions', 'matchingPairs', 'essayRubric']);
            $newQuestion = $question->replicate();
            $newQuestion->created_by = Auth::id();
            $newQuestion->question_text .= ' (Copy)';
            $newQuestion->save();

            foreach ($question->pgOptions as $option) {
                $newQuestion->pgOptions()->create($option->toArray());
            }
            foreach ($question->matchingPairs as $pair) {
                $newQuestion->matchingPairs()->create($pair->toArray());
            }
            if ($question->essayRubric) {
                $newQuestion->essayRubric()->create($question->essayRubric->toArray());
            }

            return $newQuestion;
        });

        return response()->json(['data' => $newQuestion->load(['pgOptions', 'matchingPairs', 'essayRubric'])], 201);
    }

    public function import(Request $request): JsonResponse
    {
        Gate::authorize('create', Question::class);
        $request->validate(['file' => 'required|mimes:xlsx,xls,csv|max:2048']);

        DB::transaction(fn () => Excel::import(new QuestionsImport, $request->file('file')));

        return response()->json(['data' => null]);
    }

    public function export(): BinaryFileResponse
    {
        Gate::authorize('viewAny', Question::class);

        return Excel::download(new QuestionsExport(Auth::user()), 'bank-soal.xlsx');
    }

    private function saveQuestionDetails(Question $question, Request $request): void
    {
        if ($request->type === 'pg') {
            foreach (($request->options ?? []) as $index => $text) {
                if (! empty($text)) {
                    $question->pgOptions()->create([
                        'label' => ['A', 'B', 'C', 'D', 'E'][$index] ?? '?',
                        'option_text' => $text,
                        'is_correct' => $index == $request->correct_option,
                    ]);
                }
            }
        } elseif ($request->type === 'uraian') {
            $question->essayRubric()->create(['rubric_text' => $request->rubric_text]);
        } elseif ($request->type === 'menjodohkan') {
            foreach (($request->left_texts ?? []) as $index => $left) {
                $question->matchingPairs()->create([
                    'pair_order' => $index + 1,
                    'left_text' => $left,
                    'right_text' => $request->right_texts[$index] ?? '',
                ]);
            }
        }
    }
}
