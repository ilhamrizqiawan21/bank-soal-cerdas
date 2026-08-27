<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KkoMaster;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KkoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = KkoMaster::query();

        if ($request->filled('level')) {
            $query->where('level', $request->string('level'));
        }

        return response()->json([
            'data' => $query
                ->orderBy('level')
                ->orderBy('bloom_level')
                ->orderBy('verb')
                ->get(['id', 'verb', 'level', 'bloom_level', 'description']),
        ]);
    }
}
