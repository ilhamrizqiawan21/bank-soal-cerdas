<?php

namespace App\Http\Controllers;

use App\Models\Question;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    public function index()
    {
        try {
            // Statistik dengan fallback
            $totalQuestions = Question::count() ?: 0;
            $merdekaCount = Question::where('curriculum', 'merdeka')->count() ?: 0;
            $kbcCount = Question::where('curriculum', 'kbc')->count() ?: 0;
            $hotsCount = Question::whereIn('level_c', ['C4', 'C5', 'C6'])->count() ?: 0;
            
            // Distribusi level - lebih efisien dengan 1 query
            $levelCounts = Question::selectRaw('level_c, count(*) as total')
                ->groupBy('level_c')
                ->pluck('total', 'level_c')
                ->toArray();
            
            $levelDistribution = [
                'C1' => $levelCounts['C1'] ?? 0,
                'C2' => $levelCounts['C2'] ?? 0,
                'C3' => $levelCounts['C3'] ?? 0,
                'C4' => $levelCounts['C4'] ?? 0,
                'C5' => $levelCounts['C5'] ?? 0,
                'C6' => $levelCounts['C6'] ?? 0,
            ];
            
            // Soal terbaru
            $recentQuestions = Question::with(['subject', 'kko', 'creator'])
                ->latest()
                ->take(5)
                ->get();
            
            return view('dashboard', compact(
                'totalQuestions',
                'merdekaCount',
                'kbcCount',
                'hotsCount',
                'levelDistribution',
                'recentQuestions'
            ));
            
        } catch (\Exception $e) {
            Log::error('Dashboard error: ' . $e->getMessage());
            return view('dashboard', [
                'totalQuestions' => 0,
                'merdekaCount' => 0,
                'kbcCount' => 0,
                'hotsCount' => 0,
                'levelDistribution' => ['C1' => 0, 'C2' => 0, 'C3' => 0, 'C4' => 0, 'C5' => 0, 'C6' => 0],
                'recentQuestions' => collect(),
            ])->with('error', 'Gagal memuat dashboard.');
        }
    }
}