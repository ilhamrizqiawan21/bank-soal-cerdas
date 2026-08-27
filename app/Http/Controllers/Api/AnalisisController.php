<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PaketSoal;
use App\Models\Question;
use App\Models\Ujian;
use App\Models\User;
use App\Policies\PaketSoalPolicy;
use App\Policies\QuestionPolicy;
use App\Policies\UjianPolicy;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AnalisisController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('view-analytics');

        $user = $request->user();
        $ujianQuery = UjianPolicy::scopeManageableBy(Ujian::query(), $user);
        $questionQuery = QuestionPolicy::scopeVisibleTo(Question::query(), $user);
        $paketQuery = PaketSoalPolicy::scopeVisibleTo(PaketSoal::query(), $user);

        $statusCounts = (clone $ujianQuery)->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $levelCounts = (clone $questionQuery)->selectRaw('level_c, count(*) as total')
            ->groupBy('level_c')
            ->pluck('total', 'level_c');

        $topSiswa = (clone $ujianQuery)->where('status', 'finished')
            ->with('siswa')
            ->select('siswa_id', DB::raw('AVG(total_score) as avg_score'), DB::raw('COUNT(*) as total_ujian'))
            ->groupBy('siswa_id')
            ->orderByDesc('avg_score')
            ->limit(5)
            ->get();

        $recentUjian = UjianPolicy::scopeManageableBy(
            Ujian::with(['paketSoal', 'siswa']),
            $user
        )->latest()->limit(5)->get();

        return response()->json([
            'data' => [
                'summary' => [
                    'total_ujian' => (clone $ujianQuery)->count(),
                    'total_siswa' => User::where('role', 'siswa')->count(),
                    'total_soal' => (clone $questionQuery)->count(),
                    'total_paket' => (clone $paketQuery)->count(),
                    'avg_score' => round((float) ((clone $ujianQuery)->where('status', 'finished')->avg('total_score') ?? 0), 2),
                ],
                'status_distribution' => [
                    'draft' => (int) ($statusCounts['draft'] ?? 0),
                    'active' => (int) ($statusCounts['active'] ?? 0),
                    'finished' => (int) ($statusCounts['finished'] ?? 0),
                    'expired' => (int) ($statusCounts['expired'] ?? 0),
                ],
                'level_distribution' => [
                    'L1' => (int) ($levelCounts['L1'] ?? 0),
                    'L2' => (int) ($levelCounts['L2'] ?? 0),
                    'L3' => (int) ($levelCounts['L3'] ?? 0),
                    'C1' => (int) ($levelCounts['C1'] ?? 0),
                    'C2' => (int) ($levelCounts['C2'] ?? 0),
                    'C3' => (int) ($levelCounts['C3'] ?? 0),
                    'C4' => (int) ($levelCounts['C4'] ?? 0),
                    'C5' => (int) ($levelCounts['C5'] ?? 0),
                    'C6' => (int) ($levelCounts['C6'] ?? 0),
                ],
                'top_siswa' => $topSiswa,
                'recent_ujian' => $recentUjian,
            ],
        ]);
    }

    public function ujian(Ujian $ujian): JsonResponse
    {
        Gate::authorize('view-analytics');
        Gate::authorize('view', $ujian);

        $ujian->load(['paketSoal', 'siswa', 'jawaban.question']);
        $soalStats = $ujian->jawaban
            ->groupBy('question_id')
            ->map(fn ($answers) => [
                'question' => $answers->first()->question,
                'total' => $answers->count(),
                'correct' => $answers->where('is_correct', true)->count(),
                'wrong' => $answers->where('is_correct', false)->count(),
            ])
            ->values();

        return response()->json([
            'data' => [
                'ujian' => $ujian,
                'soal_stats' => $soalStats,
            ],
        ]);
    }

    public function siswa(User $siswa, Request $request): JsonResponse
    {
        Gate::authorize('view-analytics');
        abort_unless($siswa->role === 'siswa', 404);

        $riwayat = UjianPolicy::scopeManageableBy(
            Ujian::where('siswa_id', $siswa->id)->with('paketSoal'),
            $request->user()
        )->latest()->get();

        $finished = $riwayat->where('status', 'finished');

        return response()->json([
            'data' => [
                'siswa' => $siswa,
                'stats' => [
                    'total_ujian' => $riwayat->count(),
                    'total_ujian_selesai' => $finished->count(),
                    'rata_rata_nilai' => round((float) ($finished->avg('total_score') ?? 0), 2),
                    'nilai_tertinggi' => (int) ($finished->max('total_score') ?? 0),
                    'nilai_terendah' => (int) ($finished->min('total_score') ?? 0),
                ],
                'riwayat_ujian' => $riwayat,
            ],
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        Gate::authorize('view-analytics');

        $rows = UjianPolicy::scopeManageableBy(
            Ujian::with(['paketSoal', 'siswa', 'creator'])->latest(),
            $request->user()
        )->get();

        $filename = 'analisis-ujian-'.now()->format('Y-m-d').'.csv';
        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        return response()->streamDownload(function () use ($rows) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['ID Ujian', 'Judul', 'Paket Soal', 'Siswa', 'Pembuat', 'Status', 'Nilai', 'Deadline', 'Dibuat']);

            foreach ($rows as $ujian) {
                fputcsv($handle, [
                    $this->csvCell($ujian->id),
                    $this->csvCell($ujian->title),
                    $this->csvCell($ujian->paketSoal?->name ?? '-'),
                    $this->csvCell($ujian->siswa?->name ?? '-'),
                    $this->csvCell($ujian->creator?->name ?? '-'),
                    $this->csvCell($ujian->status),
                    $this->csvCell($ujian->total_score ?? 0),
                    $this->csvCell(optional($ujian->deadline_at)->format('Y-m-d H:i:s') ?? '-'),
                    $this->csvCell(optional($ujian->created_at)->format('Y-m-d H:i:s') ?? '-'),
                ]);
            }

            fclose($handle);
        }, $filename, $headers);
    }

    private function csvCell(mixed $value): string
    {
        $cell = (string) $value;

        return preg_match('/^[=\-+@]/', $cell) ? "'{$cell}" : $cell;
    }
}
