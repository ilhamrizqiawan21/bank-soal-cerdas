<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KkoMaster;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class KkoController extends Controller
{
    /**
     * Get KKO berdasarkan level
     */
    public function getByLevel($level): JsonResponse
    {
        try {
            $kko = KkoMaster::where('level', $level)
                ->orderBy('verb')
                ->get(['id', 'verb', 'level']);
                
            return response()->json([
                'success' => true,
                'data' => $kko
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memuat data KKO'
            ], 500);
        }
    }
}