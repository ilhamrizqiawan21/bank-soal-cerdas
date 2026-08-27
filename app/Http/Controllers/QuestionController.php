<?php

namespace App\Http\Controllers;

use App\Exports\QuestionsExport;
use App\Http\Requests\StoreQuestionRequest;
use App\Http\Requests\UpdateQuestionRequest;
use App\Imports\QuestionsImport;
use App\Models\KkoMaster;
use App\Models\Question;
use App\Models\Subject;
use App\Policies\QuestionPolicy;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Facades\Excel;

class QuestionController extends Controller
{
    public function index(Request $request)
    {
        try {
            Gate::authorize('viewAny', Question::class);

            return redirect('/app/questions');
        } catch (\Exception $e) {
            Log::error('Question index error: '.$e->getMessage());

            return redirect('/app/questions')->with('error', 'Gagal memuat data soal.');
        }
    }

    public function create()
    {
        Gate::authorize('create', Question::class);

        return redirect('/app/questions/create');
    }

    public function store(StoreQuestionRequest $request)
    {
        Gate::authorize('create', Question::class);

        try {
            $question = Question::create([
                'subject_id' => $request->subject_id, 'kko_id' => $request->kko_id, 'created_by' => Auth::id(),
                'jenjang' => $request->jenjang, 'curriculum' => $request->curriculum, 'type' => $request->type,
                'level_c' => $request->level_c, 'question_text' => $request->question_text, 'indicator_text' => $request->indicator_text,
                'correct_boolean' => $request->type === 'benar_salah' ? $request->correct_boolean : null,
            ]);
            $this->saveQuestionDetails($question, $request);

            return redirect()->route('questions.index')->with('success', 'Soal berhasil ditambahkan!');
        } catch (\Exception $e) {
            Log::error('Store question error: '.$e->getMessage());

            return back()->withInput()->with('error', 'Gagal menyimpan soal.');
        }
    }

    public function show(Question $question)
    {
        Gate::authorize('view', $question);

        return redirect("/app/questions/{$question->id}");
    }

    public function edit(Question $question)
    {
        Gate::authorize('update', $question);

        return redirect("/app/questions/{$question->id}/edit");
    }

    public function update(UpdateQuestionRequest $request, Question $question)
    {
        Gate::authorize('update', $question);

        try {
            $question->update([
                'subject_id' => $request->subject_id, 'kko_id' => $request->kko_id, 'jenjang' => $request->jenjang,
                'curriculum' => $request->curriculum, 'type' => $request->type, 'level_c' => $request->level_c,
                'question_text' => $request->question_text, 'indicator_text' => $request->indicator_text,
                'correct_boolean' => $request->type === 'benar_salah' ? $request->correct_boolean : null,
            ]);
            $this->updateQuestionDetails($question, $request);

            return redirect()->route('questions.index')->with('success', 'Soal berhasil diperbarui!');
        } catch (\Exception $e) {
            Log::error('Update question error: '.$e->getMessage());

            return back()->withInput()->with('error', 'Gagal memperbarui soal.');
        }
    }

    public function destroy(Question $question)
    {
        Gate::authorize('delete', $question);
        try {
            $question->delete();

            return redirect()->route('questions.index')->with('success', 'Soal berhasil dihapus!');
        } catch (\Exception $e) {
            Log::error('Delete question error: '.$e->getMessage());

            return back()->with('error', 'Gagal menghapus soal.');
        }
    }

    public function duplicate(Question $question)
    {
        Gate::authorize('duplicate', $question);

        try {
            if (Question::where('question_text', $question->question_text.' (Copy)')->where('subject_id', $question->subject_id)->exists()) {
                return back()->with('error', 'Soal ini sudah diduplikasi sebelumnya!');
            }
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

            return redirect()->route('questions.index')->with('success', 'Soal berhasil diduplikasi!');
        } catch (\Exception $e) {
            Log::error('Duplicate question error: '.$e->getMessage());

            return back()->with('error', 'Gagal menduplikasi soal.');
        }
    }

    private function saveQuestionDetails(Question $question, $request): void
    {
        if ($request->type === 'pg') {
            foreach (($request->options ?? []) as $index => $text) {
                if (! empty($text)) {
                    $question->pgOptions()->create(['label' => ['A', 'B', 'C', 'D', 'E'][$index] ?? '?', 'option_text' => $text, 'is_correct' => $index == $request->correct_option]);
                }
            }
        } elseif ($request->type === 'uraian') {
            if ($request->filled('rubric_text')) {
                $question->essayRubric()->create(['rubric_text' => $request->rubric_text]);
            }
        } elseif ($request->type === 'menjodohkan') {
            foreach (($request->left_texts ?? []) as $index => $left) {
                if (! empty($left)) {
                    $question->matchingPairs()->create(['pair_order' => $index + 1, 'left_text' => $left, 'right_text' => $request->right_texts[$index] ?? '']);
                }
            }
        }
    }

    private function updateQuestionDetails(Question $question, $request): void
    {
        $question->pgOptions()->delete();
        $question->matchingPairs()->delete();
        $question->essayRubric()->delete();
        $this->saveQuestionDetails($question, $request);
    }

    public function export()
    {
        Gate::authorize('viewAny', Question::class);

        return Excel::download(new QuestionsExport(Auth::user()), 'bank-soal.xlsx');
    }

    public function import(Request $request)
    {
        $request->validate(['file' => 'required|mimes:xlsx,xls,csv|max:2048']);
        try {
            DB::transaction(fn () => Excel::import(new QuestionsImport, $request->file('file')));

            return back()->with('success', 'Soal berhasil diimport!');
        } catch (\Exception $e) {
            Log::error('Question import error: '.$e->getMessage());

            return back()->with('error', 'Gagal import file. Periksa format file Anda.');
        }
    }
}
