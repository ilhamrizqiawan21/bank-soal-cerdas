<?php

namespace App\Http\Controllers;

use App\Models\PaketSoal;
use App\Models\Question;
use App\Policies\PaketSoalPolicy;
use App\Policies\QuestionPolicy;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;

class PaketSoalController extends Controller
{
    public function index(Request $request)
    {
        Gate::authorize('viewAny', PaketSoal::class);

        return redirect('/app/paket-soal');
    }

    public function create()
    {
        Gate::authorize('create', PaketSoal::class);

        return redirect('/app/paket-soal/create');
    }

    public function store(Request $request)
    {
        Gate::authorize('create', PaketSoal::class);

        $validated = $request->validate([
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

        $this->authorizeQuestionIds($validated['questions'], $request);

        try {
            $paket = PaketSoal::create([
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'jenjang' => $validated['jenjang'],
                'curriculum' => $validated['curriculum'],
                'duration_minutes' => $validated['duration_minutes'] ?? null,
                'created_by' => Auth::id(),
                'status' => $validated['status'] ?? 'draft',
                'total_soal' => count($validated['questions']),
            ]);

            // Simpan soal-soal
            foreach ($validated['questions'] as $index => $questionId) {
                $paket->items()->create([
                    'question_id' => $questionId,
                    'order' => $index + 1,
                    'score' => $validated['scores'][$index] ?? 1,
                ]);
            }

            return redirect()->route('paket-soal.index')
                ->with('success', 'Paket soal berhasil dibuat!');

        } catch (\Exception $e) {
            Log::error('PaketSoal store error: '.$e->getMessage());

            return back()->withInput()->with('error', 'Gagal membuat paket soal.');
        }
    }

    public function show(PaketSoal $paketSoal)
    {
        Gate::authorize('view', $paketSoal);

        return redirect("/app/paket-soal/{$paketSoal->id}");
    }

    public function edit(PaketSoal $paketSoal)
    {
        Gate::authorize('update', $paketSoal);

        return redirect("/app/paket-soal/{$paketSoal->id}/edit");
    }

    public function update(Request $request, PaketSoal $paketSoal)
    {
        Gate::authorize('update', $paketSoal);

        $validated = $request->validate([
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

        $this->authorizeQuestionIds($validated['questions'], $request);

        try {
            $paketSoal->update([
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'jenjang' => $validated['jenjang'],
                'curriculum' => $validated['curriculum'],
                'duration_minutes' => $validated['duration_minutes'] ?? null,
                'status' => $validated['status'] ?? 'draft',
                'total_soal' => count($validated['questions']),
            ]);

            // Hapus items lama
            $paketSoal->items()->delete();

            // Simpan baru
            foreach ($validated['questions'] as $index => $questionId) {
                $paketSoal->items()->create([
                    'question_id' => $questionId,
                    'order' => $index + 1,
                    'score' => $validated['scores'][$index] ?? 1,
                ]);
            }

            return redirect()->route('paket-soal.index')
                ->with('success', 'Paket soal berhasil diperbarui!');

        } catch (\Exception $e) {
            Log::error('PaketSoal update error: '.$e->getMessage());

            return back()->withInput()->with('error', 'Gagal memperbarui paket soal.');
        }
    }

    public function destroy(PaketSoal $paketSoal)
    {
        Gate::authorize('delete', $paketSoal);

        try {
            $paketSoal->delete();

            return redirect()->route('paket-soal.index')
                ->with('success', 'Paket soal berhasil dihapus!');
        } catch (\Exception $e) {
            Log::error('PaketSoal delete error: '.$e->getMessage());

            return back()->with('error', 'Gagal menghapus paket soal.');
        }
    }

    public function duplicate(PaketSoal $paketSoal)
    {
        Gate::authorize('duplicate', $paketSoal);

        try {
            $newPaket = $paketSoal->replicate();
            $newPaket->name = $paketSoal->name.' (Copy)';
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
            Log::error('PaketSoal duplicate error: '.$e->getMessage());

            return back()->with('error', 'Gagal menduplikasi paket soal.');
        }
    }

    public function getQuestions(Request $request)
    {
        Gate::authorize('viewAny', Question::class);

        $query = QuestionPolicy::scopeVisibleTo(
            Question::with(['subject', 'kko']),
            $request->user()
        );

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

    private function authorizeQuestionIds(array $questionIds, Request $request): void
    {
        $visibleCount = QuestionPolicy::scopeVisibleTo(
            Question::query(),
            $request->user()
        )->whereIn('id', array_unique($questionIds))->count();

        abort_if($visibleCount !== count(array_unique($questionIds)), 403, 'Anda tidak memiliki akses ke sebagian soal yang dipilih.');
    }
}
