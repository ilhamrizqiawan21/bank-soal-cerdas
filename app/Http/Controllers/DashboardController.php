<?php

namespace App\Http\Controllers;

use App\Models\Question;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        // Statistik
        $totalQuestions = Question::count();
        $merdekaCount = Question::where('curriculum', 'merdeka')->count();
        $kbcCount = Question::where('curriculum', 'kbc')->count();
        $hotsCount = Question::whereIn('level_c', ['C4', 'C5', 'C6'])->count();
        
        // Distribusi level
        $levelDistribution = [
            'C1' => Question::where('level_c', 'C1')->count(),
            'C2' => Question::where('level_c', 'C2')->count(),
            'C3' => Question::where('level_c', 'C3')->count(),
            'C4' => Question::where('level_c', 'C4')->count(),
            'C5' => Question::where('level_c', 'C5')->count(),
            'C6' => Question::where('level_c', 'C6')->count(),
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
    }
}