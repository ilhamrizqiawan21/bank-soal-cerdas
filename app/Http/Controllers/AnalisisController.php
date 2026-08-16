<?php

namespace App\Http\Controllers;

use App\Models\Ujian;
use App\Models\Question;
use App\Models\PaketSoal;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AnalisisController extends Controller
{

    public function index(Request $request)
    {
        // Cek role
        if (!in_array(Auth::user()->role, ['admin', 'guru'])) {
            abort(403, 'Anda tidak memiliki akses.');
        }

        // ===== STATISTIK DASAR =====
        $totalUjian = Ujian::count();
        $totalSiswa = User::where('role', 'siswa')->count();
        $totalSoal = Question::count();
        $totalPaket = PaketSoal::count();

        // ===== DISTRIBUSI STATUS UJIAN =====
        $statusDistribution = [
            'draft' => Ujian::where('status', 'draft')->count(),
            'active' => Ujian::where('status', 'active')->count(),
            'finished' => Ujian::where('status', 'finished')->count(),
            'expired' => Ujian::where('status', 'expired')->count(),
        ];

        // ===== RATA-RATA NILAI =====
        $avgScore = Ujian::where('status', 'finished')->avg('total_score') ?? 0;

        // ===== DISTRIBUSI LEVEL KOGNITIF SOAL =====
        $levelDistribution = [
            'C1' => Question::where('level_c', 'C1')->count(),
            'C2' => Question::where('level_c', 'C2')->count(),
            'C3' => Question::where('level_c', 'C3')->count(),
            'C4' => Question::where('level_c', 'C4')->count(),
            'C5' => Question::where('level_c', 'C5')->count(),
            'C6' => Question::where('level_c', 'C6')->count(),
        ];

        // ===== TOP 5 SISWA TERBAIK =====
        $topSiswa = Ujian::where('status', 'finished')
            ->with(['siswa'])
            ->select('siswa_id', DB::raw('AVG(total_score) as avg_score'))
            ->groupBy('siswa_id')
            ->orderBy('avg_score', 'desc')
            ->limit(5)
            ->get();

        // ===== UJIAN TERBARU =====
        $recentUjian = Ujian::with(['paketSoal', 'siswa'])
            ->latest()
            ->limit(5)
            ->get();

        return view('analisis.index', compact(
            'totalUjian',
            'totalSiswa',
            'totalSoal',
            'totalPaket',
            'statusDistribution',
            'avgScore',
            'levelDistribution',
            'topSiswa',
            'recentUjian'
        ));
    }

    public function ujianDetail($id)
    {
        if (!in_array(Auth::user()->role, ['admin', 'guru'])) {
            abort(403, 'Anda tidak memiliki akses.');
        }

        $ujian = Ujian::with(['paketSoal', 'siswa', 'jawaban.question'])
            ->findOrFail($id);

        // Statistik per soal
        $soalStats = [];
        foreach ($ujian->jawaban as $jawaban) {
            $questionId = $jawaban->question_id;
            if (!isset($soalStats[$questionId])) {
                $soalStats[$questionId] = [
                    'question' => $jawaban->question,
                    'total' => 0,
                    'correct' => 0,
                    'wrong' => 0,
                ];
            }
            $soalStats[$questionId]['total']++;
            if ($jawaban->is_correct) {
                $soalStats[$questionId]['correct']++;
            } else {
                $soalStats[$questionId]['wrong']++;
            }
        }

        return view('analisis.ujian', compact('ujian', 'soalStats'));
    }

    public function siswaDetail($id)
    {
        if (!in_array(Auth::user()->role, ['admin', 'guru'])) {
            abort(403, 'Anda tidak memiliki akses.');
        }

        $siswa = User::with(['questions', 'paketSoal'])
            ->where('role', 'siswa')
            ->findOrFail($id);

        $riwayatUjian = Ujian::where('siswa_id', $id)
            ->with(['paketSoal'])
            ->latest()
            ->get();

        $stats = [
            'total_ujian' => $riwayatUjian->count(),
            'total_ujian_selesai' => $riwayatUjian->where('status', 'finished')->count(),
            'rata_rata_nilai' => $riwayatUjian->where('status', 'finished')->avg('total_score') ?? 0,
            'nilai_tertinggi' => $riwayatUjian->where('status', 'finished')->max('total_score') ?? 0,
            'nilai_terendah' => $riwayatUjian->where('status', 'finished')->min('total_score') ?? 0,
        ];

        return view('analisis.siswa', compact('siswa', 'riwayatUjian', 'stats'));
    }

    public function export(Request $request)
    {
        // TODO: Implementasi export PDF/Excel
        return back()->with('info', 'Fitur export sedang dalam pengembangan.');
    }
}