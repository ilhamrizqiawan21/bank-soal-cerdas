<?php

namespace App\Http\Controllers;

use App\Models\Question;
use App\Models\Subject;
use App\Models\KkoMaster;
use App\Http\Requests\StoreQuestionRequest;
use App\Http\Requests\UpdateQuestionRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\QuestionsImport;
use App\Exports\QuestionsExport;

class QuestionController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Question::with(['subject', 'kko', 'creator']);
            foreach (['curriculum', 'level_c', 'type', 'kko_id'] as $filter) {
                if ($request->filled($filter) && $request->{$filter} !== 'semua') $query->where($filter, $request->{$filter});
            }
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(fn ($q) => $q->where('question_text', 'like', "%{$search}%")->orWhere('indicator_text', 'like', "%{$search}%"));
            }
            $questions = $query->latest()->paginate($request->get('per_page', 10))->withQueryString();
            return view('questions.index', ['questions' => $questions, 'subjects' => Subject::all(), 'kkoList' => KkoMaster::all()]);
        } catch (\Exception $e) {
            Log::error('Question index error: ' . $e->getMessage());
            return back()->with('error', 'Gagal memuat data soal.');
        }
    }

    public function create() { return view('questions.create', ['subjects' => Subject::all(), 'kkoList' => KkoMaster::all()]); }

    public function store(StoreQuestionRequest $request)
    {
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
            Log::error('Store question error: ' . $e->getMessage());
            return back()->withInput()->with('error', 'Gagal menyimpan soal.');
        }
    }

    public function show(Question $question) { $question->load(['subject', 'kko', 'creator', 'pgOptions', 'matchingPairs', 'essayRubric']); return view('questions.show', compact('question')); }
    public function edit(Question $question) { $question->load(['pgOptions', 'matchingPairs', 'essayRubric']); return view('questions.edit', ['question' => $question, 'subjects' => Subject::all(), 'kkoList' => KkoMaster::all()]); }

    public function update(UpdateQuestionRequest $request, Question $question)
    {
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
            Log::error('Update question error: ' . $e->getMessage());
            return back()->withInput()->with('error', 'Gagal memperbarui soal.');
        }
    }

    public function destroy(Question $question) { try { $question->delete(); return redirect()->route('questions.index')->with('success', 'Soal berhasil dihapus!'); } catch (\Exception $e) { Log::error('Delete question error: '.$e->getMessage()); return back()->with('error', 'Gagal menghapus soal.'); } }

    public function duplicate(Question $question)
    {
        try {
            if (Question::where('question_text', $question->question_text . ' (Copy)')->where('subject_id', $question->subject_id)->exists()) return back()->with('error', 'Soal ini sudah diduplikasi sebelumnya!');
            $newQuestion = $question->replicate(); $newQuestion->created_by = Auth::id(); $newQuestion->question_text .= ' (Copy)'; $newQuestion->save();
            foreach ($question->pgOptions as $option) $newQuestion->pgOptions()->create($option->toArray());
            foreach ($question->matchingPairs as $pair) $newQuestion->matchingPairs()->create($pair->toArray());
            if ($question->essayRubric) $newQuestion->essayRubric()->create($question->essayRubric->toArray());
            return redirect()->route('questions.index')->with('success', 'Soal berhasil diduplikasi!');
        } catch (\Exception $e) { Log::error('Duplicate question error: '.$e->getMessage()); return back()->with('error', 'Gagal menduplikasi soal.'); }
    }

    private function saveQuestionDetails(Question $question, $request): void
    {
        if ($request->type === 'pg') {
            foreach (($request->options ?? []) as $index => $text) if (!empty($text)) $question->pgOptions()->create(['label' => ['A','B','C','D','E'][$index] ?? '?', 'option_text' => $text, 'is_correct' => $index == $request->correct_option]);
        } elseif ($request->type === 'uraian') {
            if ($request->filled('rubric_text')) $question->essayRubric()->create(['rubric_text' => $request->rubric_text]);
        } elseif ($request->type === 'menjodohkan') {
            foreach (($request->left_texts ?? []) as $index => $left) if (!empty($left)) $question->matchingPairs()->create(['pair_order' => $index + 1, 'left_text' => $left, 'right_text' => $request->right_texts[$index] ?? '']);
        }
    }

    private function updateQuestionDetails(Question $question, $request): void
    {
        $question->pgOptions()->delete(); $question->matchingPairs()->delete(); $question->essayRubric()->delete();
        $this->saveQuestionDetails($question, $request);
    }

    public function export() { return Excel::download(new QuestionsExport, 'bank-soal.xlsx'); }

    public function import(Request $request)
    {
        $request->validate(['file' => 'required|mimes:xlsx,xls,csv|max:2048']);
        try { Excel::import(new QuestionsImport, $request->file('file')); return back()->with('success', 'Soal berhasil diimport!'); }
        catch (\Exception $e) { Log::error('Question import error: '.$e->getMessage()); return back()->with('error', 'Gagal import file. Periksa format file Anda.'); }
    }
}
