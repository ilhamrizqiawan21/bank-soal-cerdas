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

class DashboardController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role === 'siswa') {
            return response()->json(['data' => $this->studentDashboard($user)]);
        }

        $questionQuery = QuestionPolicy::scopeVisibleTo(Question::query(), $user);
        $paketQuery = PaketSoalPolicy::scopeVisibleTo(PaketSoal::query(), $user);
        $ujianQuery = UjianPolicy::scopeManageableBy(Ujian::query(), $user);

        $levelCounts = (clone $questionQuery)->selectRaw('level_c, count(*) as total')
            ->groupBy('level_c')
            ->pluck('total', 'level_c');

        $statusCounts = (clone $ujianQuery)->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        return response()->json([
            'data' => [
                'role' => $user->role,
                'summary' => [
                    'total_soal' => (clone $questionQuery)->count(),
                    'total_paket' => (clone $paketQuery)->count(),
                    'total_ujian' => (clone $ujianQuery)->count(),
                    'total_siswa' => User::where('role', 'siswa')->where('is_active', true)->count(),
                    'merdeka_count' => (clone $questionQuery)->where('curriculum', 'merdeka')->count(),
                    'kbc_count' => (clone $questionQuery)->where('curriculum', 'kbc')->count(),
                    'hots_count' => (clone $questionQuery)->where('level_c', 'L3')->count(),
                ],
                'level_distribution' => [
                    'L1' => (int) ($levelCounts['L1'] ?? 0),
                    'L2' => (int) ($levelCounts['L2'] ?? 0),
                    'L3' => (int) ($levelCounts['L3'] ?? 0),
                ],
                'status_distribution' => [
                    'draft' => (int) ($statusCounts['draft'] ?? 0),
                    'active' => (int) ($statusCounts['active'] ?? 0),
                    'finished' => (int) ($statusCounts['finished'] ?? 0),
                    'expired' => (int) ($statusCounts['expired'] ?? 0),
                ],
                'recent_questions' => QuestionPolicy::scopeVisibleTo(
                    Question::with(['subject', 'kko', 'creator']),
                    $user
                )->latest()->take(5)->get(),
                'recent_ujian' => UjianPolicy::scopeManageableBy(
                    Ujian::with(['paketSoal', 'siswa']),
                    $user
                )->latest()->take(5)->get(),
            ],
        ]);
    }

    private function studentDashboard(User $user): array
    {
        $exams = Ujian::where('siswa_id', $user->id)
            ->whereIn('status', ['active', 'finished', 'expired'])
            ->with('paketSoal')
            ->latest()
            ->get();

        $finished = $exams->where('status', 'finished');

        return [
            'role' => 'siswa',
            'summary' => [
                'total_ujian' => $exams->count(),
                'active_ujian' => $exams->where('status', 'active')->count(),
                'finished_ujian' => $finished->count(),
                'expired_ujian' => $exams->where('status', 'expired')->count(),
                'average_score' => round((float) ($finished->avg('total_score') ?? 0), 2),
            ],
            'active_ujian' => $exams->where('status', 'active')->values()->map(fn (Ujian $ujian) => $this->examPayload($ujian)),
            'recent_ujian' => $exams->take(5)->values()->map(fn (Ujian $ujian) => $this->examPayload($ujian)),
        ];
    }

    private function examPayload(Ujian $ujian): array
    {
        $deadline = $ujian->duration_minutes && $ujian->started_at
            ? $ujian->started_at->copy()->addMinutes($ujian->duration_minutes)
            : null;

        return [
            ...$ujian->toArray(),
            'deadline_at' => $deadline?->toIso8601String(),
        ];
    }
}
