<?php

namespace App\Http\Controllers;

use App\Models\Ujian;
use App\Policies\UjianPolicy;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

class AnalisisController extends Controller
{
    public function index(Request $request)
    {
        Gate::authorize('view-analytics');

        return redirect('/app/analisis');
    }

    public function ujianDetail($id)
    {
        Gate::authorize('view-analytics');

        $ujian = UjianPolicy::scopeManageableBy(
            Ujian::with(['paketSoal', 'siswa', 'jawaban.question']),
            Auth::user()
        )
            ->findOrFail($id);

        return redirect('/app/analisis');
    }

    public function siswaDetail($id)
    {
        Gate::authorize('view-analytics');

        return redirect('/app/analisis');
    }

    public function export(Request $request)
    {
        Gate::authorize('view-analytics');

        return redirect()->to('/api/analisis/export');
    }
}
