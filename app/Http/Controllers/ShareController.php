<?php

namespace App\Http\Controllers;

use App\Models\Question;
use App\Models\PaketSoal;
use App\Models\ShareSoal;
use App\Models\SharePaket;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ShareController extends Controller
{

    // ============ SHARE SOAL ============

    public function shareSoal(Request $request, $id)
    {
        if (!in_array(Auth::user()->role, ['admin', 'guru'])) {
            abort(403, 'Anda tidak memiliki akses.');
        }

        // Gunakan $id dari parameter, bukan dari request
        $question = Question::findOrFail($id);

        // Hanya pemilik soal (atau admin) yang boleh membagikan
        if (Auth::user()->role !== 'admin' && $question->created_by !== Auth::id()) {
            abort(403, 'Anda tidak memiliki akses ke soal ini.');
        }
        
        $request->validate([
            'shared_to' => 'required|exists:users,id',
            'permission' => 'required|in:view,edit,copy',
        ]);

        // Cek apakah sudah pernah di-share
        $existing = ShareSoal::where('question_id', $id)
            ->where('shared_to', $request->shared_to)
            ->first();

        if ($existing) {
            return back()->with('error', 'Soal ini sudah dibagikan ke user tersebut.');
        }

        ShareSoal::create([
            'question_id' => $id,
            'shared_by' => Auth::id(),
            'shared_to' => $request->shared_to,
            'permission' => $request->permission,
            'is_accepted' => false,
        ]);

        return back()->with('success', 'Soal berhasil dibagikan!');
    }

    public function acceptSoal($id)
    {
        $share = ShareSoal::where('id', $id)
            ->where('shared_to', Auth::id())
            ->firstOrFail();

        $share->update([
            'is_accepted' => true,
            'accepted_at' => now(),
        ]);

        return back()->with('success', 'Berhasil menerima soal!');
    }

    public function rejectSoal($id)
    {
        $share = ShareSoal::where('id', $id)
            ->where('shared_to', Auth::id())
            ->firstOrFail();

        $share->delete();

        return back()->with('success', 'Berhasil menolak soal.');
    }

    // ============ SHARE PAKET ============

    public function sharePaket(Request $request, $id)
    {
        if (!in_array(Auth::user()->role, ['admin', 'guru'])) {
            abort(403, 'Anda tidak memiliki akses.');
        }

        $paket = PaketSoal::findOrFail($id);

        // Hanya pemilik paket (atau admin) yang boleh membagikan
        if (Auth::user()->role !== 'admin' && $paket->created_by !== Auth::id()) {
            abort(403, 'Anda tidak memiliki akses ke paket soal ini.');
        }
        
        $request->validate([
            'shared_to' => 'required|exists:users,id',
            'permission' => 'required|in:view,edit,copy',
        ]);

        $existing = SharePaket::where('paket_soal_id', $id)
            ->where('shared_to', $request->shared_to)
            ->first();

        if ($existing) {
            return back()->with('error', 'Paket soal ini sudah dibagikan ke user tersebut.');
        }

        SharePaket::create([
            'paket_soal_id' => $id,
            'shared_by' => Auth::id(),
            'shared_to' => $request->shared_to,
            'permission' => $request->permission,
            'is_accepted' => false,
        ]);

        return back()->with('success', 'Paket soal berhasil dibagikan!');
    }

    public function detail($type, $id)
{
    if (!in_array(Auth::user()->role, ['admin', 'guru'])) {
        abort(403, 'Anda tidak memiliki akses.');
    }

    if ($type === 'soal') {
        $item = ShareSoal::with(['question', 'sharedBy', 'sharedTo'])
            ->where(fn ($q) => $q->where('shared_to', Auth::id())->orWhere('shared_by', Auth::id()))
            ->findOrFail($id);
    } else {
        $item = SharePaket::with(['paketSoal', 'sharedBy', 'sharedTo'])
            ->where(fn ($q) => $q->where('shared_to', Auth::id())->orWhere('shared_by', Auth::id()))
            ->findOrFail($id);
    }

    return redirect('/app/share');
}

public function riwayat(Request $request)
{
    if (!in_array(Auth::user()->role, ['admin', 'guru'])) {
        abort(403, 'Anda tidak memiliki akses.');
    }

    return redirect('/app/share');
}



    public function acceptPaket($id)
    {
        $share = SharePaket::where('id', $id)
            ->where('shared_to', Auth::id())
            ->firstOrFail();

        $share->update([
            'is_accepted' => true,
            'accepted_at' => now(),
        ]);

        return back()->with('success', 'Berhasil menerima paket soal!');
    }

    public function rejectPaket($id)
    {
        $share = SharePaket::where('id', $id)
            ->where('shared_to', Auth::id())
            ->firstOrFail();

        $share->delete();

        return back()->with('success', 'Berhasil menolak paket soal.');
    }

    // ============ DAFTAR SHARE ============

    public function index()
    {
        return redirect('/app/share');
    }
}
