<?php

namespace App\Http\Controllers;

use App\Models\PaketSoal;
use App\Models\Question;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class PaketSoalController extends Controller
{
    public function index(Request $request)
    {
        $query = PaketSoal::with(['creator', 'items']);

        // Filter
        if ($request->filled('jenjang')) {
            $query->where('jenjang', $request->jenjang);
        }
        if ($request->filled('curriculum')) {
            $query->where('curriculum', $request->curriculum);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        $paketSoal = $query->latest()->paginate(10)->withQueryString();
        
        return view('paket_soal.index', compact('paketSoal'));
    }

    public function create()
    {
        $questions = Question::with(['subject', 'kko'])->latest()->get();
        return view('paket_soal.create', compact('questions'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'jenjang' => 'required|in:SD,SMP,SMA',
            'curriculum' => 'required|in:merdeka,kbc,both',
            'duration_minutes' => 'nullable|integer|min:1|max:180',
            'status' => 'in:draft,published,archived',
            'questions' => 'required|array|min:1',
            'questions.*' => 'exists:questions,id',
            'scores' => 'nullable|array',
            'scores.*' => 'integer|min:1|max:100',
        ]);

        try {
            $paket = PaketSoal::create([
                'name' => $request->name,
                'description' => $request->description,
                'jenjang' => $request->jenjang,
                'curriculum' => $request->curriculum,
                'duration_minutes' => $request->duration_minutes,
                'created_by' => Auth::id(),
                'status' => $request->status ?? 'draft',
                'total_soal' => count($request->questions),
            ]);

            // Simpan soal-soal
            foreach ($request->questions as $index => $questionId) {
                $paket->items()->create([
                    'question_id' => $questionId,
                    'order' => $index + 1,
                    'score' => $request->scores[$index] ?? 1,
                ]);
            }

            return redirect()->route('paket-soal.index')
                ->with('success', 'Paket soal berhasil dibuat!');

        } catch (\Exception $e) {
            Log::error('PaketSoal store error: ' . $e->getMessage());
            return back()->withInput()->with('error', 'Gagal membuat paket soal.');
        }
    }

    public function show(PaketSoal $paketSoal)
    {
        $paketSoal->load(['creator', 'items.question.subject', 'items.question.kko']);
        return view('paket_soal.show', compact('paketSoal'));
    }

    public function edit(PaketSoal $paketSoal)
    {
        $questions = Question::with(['subject', 'kko'])->latest()->get();
        $paketSoal->load(['items']);
        return view('paket_soal.edit', compact('paketSoal', 'questions'));
    }

    public function update(Request $request, PaketSoal $paketSoal)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'jenjang' => 'required|in:SD,SMP,SMA',
            'curriculum' => 'required|in:merdeka,kbc,both',
            'duration_minutes' => 'nullable|integer|min:1|max:180',
            'status' => 'in:draft,published,archived',
            'questions' => 'required|array|min:1',
            'questions.*' => 'exists:questions,id',
            'scores.*' => 'nullable|integer|min:1|max:100',
        ]);

        try {
            $paketSoal->update([
                'name' => $request->name,
                'description' => $request->description,
                'jenjang' => $request->jenjang,
                'curriculum' => $request->curriculum,
                'duration_minutes' => $request->duration_minutes,
                'status' => $request->status ?? 'draft',
                'total_soal' => count($request->questions),
            ]);

            // Hapus items lama
            $paketSoal->items()->delete();

            // Simpan baru
            foreach ($request->questions as $index => $questionId) {
                $paketSoal->items()->create([
                    'question_id' => $questionId,
                    'order' => $index + 1,
                    'score' => $request->scores[$index] ?? 1,
                ]);
            }

            return redirect()->route('paket-soal.index')
                ->with('success', 'Paket soal berhasil diperbarui!');

        } catch (\Exception $e) {
            Log::error('PaketSoal update error: ' . $e->getMessage());
            return back()->withInput()->with('error', 'Gagal memperbarui paket soal.');
        }
    }

    public function destroy(PaketSoal $paketSoal)
    {
        try {
            $paketSoal->delete();
            return redirect()->route('paket-soal.index')
                ->with('success', 'Paket soal berhasil dihapus!');
        } catch (\Exception $e) {
            Log::error('PaketSoal delete error: ' . $e->getMessage());
            return back()->with('error', 'Gagal menghapus paket soal.');
        }
    }

    public function duplicate(PaketSoal $paketSoal)
    {
        try {
            $newPaket = $paketSoal->replicate();
            $newPaket->name = $paketSoal->name . ' (Copy)';
            $newPaket->created_by = Auth::id();
            $newPaket->status = 'draft';
            $newPaket->save();

            foreach ($paketSoal->items as $item) {
                $newPaket->items()->create([
                    'question_id' => $item->question_id,
                    'order' => $item->order,
                    'score' => $item->score,
                ]);
            }

            return redirect()->route('paket-soal.index')
                ->with('success', 'Paket soal berhasil diduplikasi!');

        } catch (\Exception $e) {
            Log::error('PaketSoal duplicate error: ' . $e->getMessage());
            return back()->with('error', 'Gagal menduplikasi paket soal.');
        }
    }

    public function getQuestions(Request $request)
    {
        $query = Question::with(['subject', 'kko']);

        if ($request->filled('jenjang')) {
            $query->where('jenjang', $request->jenjang);
        }
        if ($request->filled('curriculum')) {
            $query->where('curriculum', $request->curriculum);
        }
        if ($request->filled('level_c')) {
            $query->where('level_c', $request->level_c);
        }
        if ($request->filled('search')) {
            $query->where('question_text', 'like', "%{$request->search}%");
        }

        $questions = $query->latest()->paginate(20);
        return response()->json($questions);
    }
}