<?php

namespace App\Http\Controllers;

use App\Models\Ujian;
use App\Models\PaketSoal;
use App\Models\Question;
use App\Models\User;
use App\Models\UjianJawaban;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class UjianController extends Controller
{
    // ============ GURU / ADMIN ============
    
    public function index(Request $request)
    {
        // Cek role (middleware sudah melindungi, ini hanya tambahan)
        if (!in_array(Auth::user()->role, ['admin', 'guru'])) {
            abort(403, 'Anda tidak memiliki akses.');
        }
        
        $query = Ujian::with(['paketSoal', 'siswa', 'creator']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('search')) {
            $query->where('title', 'like', "%{$request->search}%");
        }

        $ujian = $query->latest()->paginate(10)->withQueryString();
        
        return view('ujian.index', compact('ujian'));
    }

    public function create()
    {
        if (!in_array(Auth::user()->role, ['admin', 'guru'])) {
            abort(403, 'Anda tidak memiliki akses.');
        }
        
        $paketSoal = PaketSoal::where('status', 'published')->get();
        $siswa = User::where('role', 'siswa')->where('is_active', true)->get();
        return view('ujian.create', compact('paketSoal', 'siswa'));
    }

    public function store(Request $request)
    {
        if (!in_array(Auth::user()->role, ['admin', 'guru'])) {
            abort(403, 'Anda tidak memiliki akses.');
        }
        
        $request->validate([
            'paket_soal_id' => 'required|exists:paket_soal,id',
            'siswa_id' => 'required|exists:users,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'duration_minutes' => 'nullable|integer|min:1|max:180',
        ]);

        try {
            $paket = PaketSoal::find($request->paket_soal_id);
            
            $ujian = Ujian::create([
                'paket_soal_id' => $request->paket_soal_id,
                'siswa_id' => $request->siswa_id,
                'created_by' => Auth::id(),
                'title' => $request->title,
                'description' => $request->description,
                'duration_minutes' => $request->duration_minutes ?? $paket->duration_minutes,
                'total_soal' => $paket->total_soal,
                'status' => 'draft',
            ]);

            return redirect()->route('ujian.index')
                ->with('success', 'Ujian berhasil dibuat!');

        } catch (\Exception $e) {
            Log::error('Ujian store error: ' . $e->getMessage());
            return back()->withInput()->with('error', 'Gagal membuat ujian.');
        }
    }

    public function show(Ujian $ujian)
    {
        $ujian->load(['paketSoal', 'siswa', 'creator', 'jawaban.question']);
        
        if (Auth::user()->role === 'siswa' && Auth::id() !== $ujian->siswa_id) {
            abort(403, 'Anda tidak memiliki akses ke ujian ini.');
        }
        
        return view('ujian.show', compact('ujian'));
    }

    public function edit(Ujian $ujian)
    {
        if (!in_array(Auth::user()->role, ['admin', 'guru'])) {
            abort(403, 'Anda tidak memiliki akses.');
        }
        
        $paketSoal = PaketSoal::where('status', 'published')->get();
        $siswa = User::where('role', 'siswa')->where('is_active', true)->get();
        return view('ujian.edit', compact('ujian', 'paketSoal', 'siswa'));
    }

    public function update(Request $request, Ujian $ujian)
    {
        if (!in_array(Auth::user()->role, ['admin', 'guru'])) {
            abort(403, 'Anda tidak memiliki akses.');
        }
        
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'duration_minutes' => 'nullable|integer|min:1|max:180',
            'status' => 'in:draft,active,finished,expired',
        ]);

        try {
            $ujian->update($request->except(['_token', '_method']));

            return redirect()->route('ujian.index')
                ->with('success', 'Ujian berhasil diperbarui!');

        } catch (\Exception $e) {
            Log::error('Ujian update error: ' . $e->getMessage());
            return back()->withInput()->with('error', 'Gagal memperbarui ujian.');
        }
    }

    public function destroy(Ujian $ujian)
    {
        if (!in_array(Auth::user()->role, ['admin', 'guru'])) {
            abort(403, 'Anda tidak memiliki akses.');
        }
        
        try {
            $ujian->delete();
            return redirect()->route('ujian.index')
                ->with('success', 'Ujian berhasil dihapus!');
        } catch (\Exception $e) {
            Log::error('Ujian delete error: ' . $e->getMessage());
            return back()->with('error', 'Gagal menghapus ujian.');
        }
    }

    public function publish(Ujian $ujian)
    {
        if (!in_array(Auth::user()->role, ['admin', 'guru'])) {
            abort(403, 'Anda tidak memiliki akses.');
        }
        
        try {
            $ujian->update([
                'status' => 'active',
                'started_at' => now(),
            ]);
            return back()->with('success', 'Ujian berhasil dipublikasikan!');
        } catch (\Exception $e) {
            Log::error('Ujian publish error: ' . $e->getMessage());
            return back()->with('error', 'Gagal mempublikasikan ujian.');
        }
    }

    // ============ SISWA ============

    public function daftarUjian()
    {
        if (Auth::user()->role !== 'siswa') {
            abort(403, 'Hanya siswa yang dapat mengakses halaman ini.');
        }
        
        $ujian = Ujian::where('siswa_id', Auth::id())
            ->whereIn('status', ['active', 'finished'])
            ->with(['paketSoal'])
            ->latest()
            ->get();
        
        return view('ujian.daftar', compact('ujian'));
    }

    public function kerjakan($id)
    {
        if (Auth::user()->role !== 'siswa') {
            abort(403, 'Hanya siswa yang dapat mengakses halaman ini.');
        }
        
        $ujian = Ujian::where('id', $id)
            ->where('siswa_id', Auth::id())
            ->with(['paketSoal.items.question', 'jawaban'])
            ->firstOrFail();
        
        if ($ujian->status !== 'active') {
            return redirect()->route('ujian.daftar')
                ->with('error', 'Ujian ini tidak aktif atau sudah selesai.');
        }
        
        if ($ujian->submitted_at) {
            return redirect()->route('ujian.hasil', $ujian->id)
                ->with('info', 'Anda sudah menyelesaikan ujian ini.');
        }
        
        if ($ujian->duration_minutes) {
            $started = $ujian->started_at;
            $deadline = $started->addMinutes($ujian->duration_minutes);
            if (now()->gt($deadline)) {
                $ujian->update(['status' => 'expired']);
                return redirect()->route('ujian.daftar')
                    ->with('error', 'Waktu ujian telah habis!');
            }
        }
        
        // ===== INISIALISASI JAWABAN =====
        if ($ujian->jawaban->count() === 0) {
            foreach ($ujian->paketSoal->items as $item) {
                UjianJawaban::create([
                    'ujian_id' => $ujian->id,
                    'question_id' => $item->question_id,
                    'paket_soal_item_id' => $item->id,
                    'max_score' => $item->score ?? 1,
                ]);
            }
            $ujian->load('jawaban');
        }
        
        // ===== PENGACAKAN SOAL =====
        $items = $ujian->paketSoal->items;
        
        // Acak urutan soal jika diaktifkan
        if ($ujian->paketSoal->acak_soal ?? false) {
            $items = $items->shuffle();
        }
        
        // Acak pilihan jawaban untuk PG jika diaktifkan
        if ($ujian->paketSoal->acak_pilihan ?? false) {
            foreach ($items as $item) {
                if ($item->question->type === 'pg') {
                    $options = $item->question->pgOptions->shuffle();
                    $item->question->setRelation('pgOptions', $options);
                }
            }
        }
        
        // ===== DATA UNTUK APLIKASI KERJAKAN (Alpine) =====
        // Kunci jawaban TIDAK dikirim ke browser (anti-kecurangan)
        $questionsPayload = $items->map(fn ($item) => $this->questionToPayload($item->question))->values();

        $deadline = null;
        if ($ujian->duration_minutes && $ujian->started_at) {
            $deadline = $ujian->started_at->addMinutes($ujian->duration_minutes)->getTimestamp();
        }

        return view('ujian.kerjakan', compact('ujian', 'questionsPayload', 'deadline'));
    }

    /**
     * Ubah soal menjadi payload aman untuk ditampilkan di browser.
     * is_correct (PG) dan right_text (menjodohkan) sengaja tidak disertakan.
     */
    private function questionToPayload(Question $question): array
    {
        $payload = [
            'id' => $question->id,
            'type' => $question->type,
            'question_text' => $question->question_text,
        ];

        if ($question->type === 'pg') {
            $payload['options'] = $question->pgOptions
                ->map(fn ($o) => ['label' => $o->label, 'option_text' => $o->option_text])
                ->values();
        } elseif ($question->type === 'menjodohkan') {
            $payload['pairs'] = $question->matchingPairs
                ->map(fn ($p) => ['id' => $p->id, 'left_text' => $p->left_text])
                ->values();
        }

        return $payload;
    }

    public function submitJawaban(Request $request, $id)
    {
        if (Auth::user()->role !== 'siswa') {
            return response()->json(['error' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'jawaban' => 'required|array',
            'jawaban.*.jawaban' => 'nullable|string|max:10000',
            'jawaban.*.selected_option' => 'nullable|integer',
        ]);

        $ujian = Ujian::where('id', $id)
            ->where('siswa_id', Auth::id())
            ->where('status', 'active')
            ->firstOrFail();
        
        if ($ujian->submitted_at) {
            return response()->json(['error' => 'Ujian sudah disubmit.'], 400);
        }

        // Batas waktu ujian
        if ($ujian->duration_minutes) {
            $deadline = $ujian->started_at?->addMinutes($ujian->duration_minutes);
            if ($deadline && now()->gt($deadline)) {
                $ujian->update(['status' => 'expired']);
                return response()->json(['error' => 'Waktu ujian telah habis.'], 403);
            }
        }

        try {
            foreach ($validated['jawaban'] as $questionId => $jawaban) {
                $ujianJawaban = UjianJawaban::where('ujian_id', $ujian->id)
                    ->where('question_id', $questionId)
                    ->first();
                
                if ($ujianJawaban) {
                    $ujianJawaban->update([
                        'jawaban' => $jawaban['jawaban'] ?? null,
                        'selected_option' => $jawaban['selected_option'] ?? null,
                    ]);
                }
            }
            
            return response()->json(['success' => true, 'message' => 'Jawaban berhasil disimpan!']);
            
        } catch (\Exception $e) {
            return response()->json(['error' => 'Gagal menyimpan jawaban.'], 500);
        }
    }

    public function submitUjian($id)
    {
        if (Auth::user()->role !== 'siswa') {
            abort(403, 'Hanya siswa yang dapat mengakses halaman ini.');
        }
        
        $ujian = Ujian::where('id', $id)
            ->where('siswa_id', Auth::id())
            ->where('status', 'active')
            ->firstOrFail();
        
        if ($ujian->submitted_at) {
            return redirect()->route('ujian.daftar')
                ->with('error', 'Ujian sudah disubmit.');
        }

        try {
            $totalScore = 0;
            foreach ($ujian->jawaban as $jawaban) {
                $question = $jawaban->question;
                $isCorrect = false;
                
                if ($question->type === 'pg') {
                    $correctOption = $question->pgOptions->where('is_correct', true)->first();
                    if ($correctOption && $jawaban->selected_option !== null) {
                        $selectedOption = $question->pgOptions->get($jawaban->selected_option);
                        if ($selectedOption && $selectedOption->is_correct) {
                            $isCorrect = true;
                        }
                    }
                } elseif ($question->type === 'benar_salah') {
                    $isCorrect = $jawaban->selected_option == ($question->correct_boolean ? 1 : 0);
                } elseif ($question->type === 'uraian') {
                    // Untuk uraian, nilai diberikan manual oleh guru
                    // Atau bisa menggunakan keyword matching sederhana
                    $isCorrect = false;
                } elseif ($question->type === 'menjodohkan') {
                    // Untuk menjodohkan, nilai diberikan manual oleh guru
                    $isCorrect = false;
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
                'total_score' => $totalScore,
            ]);
            
            return redirect()->route('ujian.hasil', $ujian->id)
                ->with('success', 'Ujian berhasil disubmit!');

        } catch (\Exception $e) {
            Log::error('Ujian submit error: ' . $e->getMessage());
            return back()->with('error', 'Gagal submit ujian.');
        }
    }

    public function hasil($id)
    {
        if (Auth::user()->role !== 'siswa') {
            abort(403, 'Hanya siswa yang dapat mengakses halaman ini.');
        }
        
        $ujian = Ujian::where('id', $id)
            ->where('siswa_id', Auth::id())
            ->with(['paketSoal', 'jawaban.question'])
            ->firstOrFail();
        
        if ($ujian->status !== 'finished') {
            return redirect()->route('ujian.daftar')
                ->with('error', 'Ujian belum selesai.');
        }
        
        return view('ujian.hasil', compact('ujian'));
    }
}