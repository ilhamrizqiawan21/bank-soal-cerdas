<?php

namespace App\Http\Controllers;

use App\Models\Question;
use App\Models\Subject;
use App\Models\KkoMaster;
use App\Http\Requests\StoreQuestionRequest;
use App\Http\Requests\UpdateQuestionRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class QuestionController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    // 1. INDEX - Daftar Soal
    public function index(Request $request)
    {
        $query = Question::with(['subject', 'kko', 'creator']);

        // Filter
        if ($request->filled('curriculum') && $request->curriculum != 'semua') {
            $query->where('curriculum', $request->curriculum);
        }
        if ($request->filled('level_c') && $request->level_c != 'semua') {
            $query->where('level_c', $request->level_c);
        }
        if ($request->filled('type') && $request->type != 'semua') {
            $query->where('type', $request->type);
        }
        if ($request->filled('kko_id') && $request->kko_id != 'semua') {
            $query->where('kko_id', $request->kko_id);
        }
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('question_text', 'like', "%{$search}%");
        }

        $questions = $query->latest()->paginate(10);
        $subjects = Subject::all();
        $kkoList = KkoMaster::all();

        return view('questions.index', compact('questions', 'subjects', 'kkoList'));
    }

    // 2. CREATE - Form Tambah Soal
    public function create()
    {
        $subjects = Subject::all();
        $kkoList = KkoMaster::all();
        return view('questions.create', compact('subjects', 'kkoList'));
    }

    // 3. STORE - Simpan Soal
    public function store(StoreQuestionRequest $request)
    {
        try {
            // Simpan soal utama
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

            // Simpan sesuai tipe
            switch ($request->type) {
                case 'pg':
                    $labels = ['A', 'B', 'C', 'D', 'E'];
                    foreach ($request->options as $index => $optionText) {
                        $question->pgOptions()->create([
                            'label' => $labels[$index] ?? '?',
                            'option_text' => $optionText,
                            'is_correct' => $index == $request->correct_option,
                        ]);
                    }
                    break;

                case 'uraian':
                    $question->essayRubric()->create([
                        'rubric_text' => $request->rubric_text,
                    ]);
                    break;

                case 'menjodohkan':
                    foreach ($request->left_texts as $index => $leftText) {
                        $question->matchingPairs()->create([
                            'pair_order' => $index + 1,
                            'left_text' => $leftText,
                            'right_text' => $request->right_texts[$index] ?? '',
                        ]);
                    }
                    break;

                case 'benar_salah':
                    // Sudah tersimpan di correct_boolean
                    break;
            }

            return redirect()->route('questions.index')
                ->with('success', 'Soal berhasil ditambahkan!');

        } catch (\Exception $e) {
            return back()->with('error', 'Gagal menyimpan: ' . $e->getMessage());
        }
    }

    // 4. SHOW - Detail Soal
    public function show(Question $question)
    {
        $question->load(['subject', 'kko', 'creator', 'pgOptions', 'matchingPairs', 'essayRubric']);
        return view('questions.show', compact('question'));
    }

    // 5. EDIT - Form Ubah Soal
    public function edit(Question $question)
    {
        $subjects = Subject::all();
        $kkoList = KkoMaster::all();
        $question->load(['pgOptions', 'matchingPairs', 'essayRubric']);
        return view('questions.edit', compact('question', 'subjects', 'kkoList'));
    }

    // 6. UPDATE - Update Soal
    public function update(UpdateQuestionRequest $request, Question $question)
    {
        try {
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

            // Hapus data lama
            switch ($request->type) {
                case 'pg':
                    $question->pgOptions()->delete();
                    $labels = ['A', 'B', 'C', 'D', 'E'];
                    foreach ($request->options as $index => $optionText) {
                        $question->pgOptions()->create([
                            'label' => $labels[$index] ?? '?',
                            'option_text' => $optionText,
                            'is_correct' => $index == $request->correct_option,
                        ]);
                    }
                    break;

                case 'uraian':
                    $question->essayRubric()->delete();
                    $question->essayRubric()->create([
                        'rubric_text' => $request->rubric_text,
                    ]);
                    break;

                case 'menjodohkan':
                    $question->matchingPairs()->delete();
                    foreach ($request->left_texts as $index => $leftText) {
                        $question->matchingPairs()->create([
                            'pair_order' => $index + 1,
                            'left_text' => $leftText,
                            'right_text' => $request->right_texts[$index] ?? '',
                        ]);
                    }
                    break;

                case 'benar_salah':
                    break;
            }

            return redirect()->route('questions.index')
                ->with('success', 'Soal berhasil diperbarui!');

        } catch (\Exception $e) {
            return back()->with('error', 'Gagal memperbarui: ' . $e->getMessage());
        }
    }

    // 7. DESTROY - Hapus Soal
    public function destroy(Question $question)
    {
        try {
            $question->delete();
            return redirect()->route('questions.index')
                ->with('success', 'Soal berhasil dihapus!');
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal menghapus: ' . $e->getMessage());
        }
    }

    // 8. DUPLICATE - Duplikasi Soal
    public function duplicate(Question $question)
    {
        try {
            $newQuestion = $question->replicate();
            $newQuestion->created_by = Auth::id();
            $newQuestion->question_text = $question->question_text . ' (Copy)';
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

            return redirect()->route('questions.index')
                ->with('success', 'Soal berhasil diduplikasi!');
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal menduplikasi: ' . $e->getMessage());
        }
    }
}