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

    return view('share.detail', compact('item', 'type'));
}

public function riwayat(Request $request)
{
    if (!in_array(Auth::user()->role, ['admin', 'guru'])) {
        abort(403, 'Anda tidak memiliki akses.');
    }

    $query = collect();

    // Ambil share soal
    $shareSoal = ShareSoal::with(['question', 'sharedBy', 'sharedTo'])
        ->where(fn ($q) => $q->where('shared_to', Auth::id())->orWhere('shared_by', Auth::id()));

    // Ambil share paket
    $sharePaket = SharePaket::with(['paketSoal', 'sharedBy', 'sharedTo'])
        ->where(fn ($q) => $q->where('shared_to', Auth::id())->orWhere('shared_by', Auth::id()));

    // Filter type
    if ($request->filled('type')) {
        if ($request->type === 'soal') {
            $sharePaket = $sharePaket->where('id', 0); // tidak tampilkan paket
        } else {
            $shareSoal = $shareSoal->where('id', 0); // tidak tampilkan soal
        }
    }

    // Filter status
    if ($request->filled('status')) {
        if ($request->status === 'accepted') {
            $shareSoal->where('is_accepted', true);
            $sharePaket->where('is_accepted', true);
        } elseif ($request->status === 'pending') {
            $shareSoal->where('is_accepted', false);
            $sharePaket->where('is_accepted', false);
        }
        // rejected = soft delete, handle di view
    }

    // Filter search
    if ($request->filled('search')) {
        $search = $request->search;
        $shareSoal->whereHas('question', function($q) use ($search) {
            $q->where('question_text', 'like', "%{$search}%");
        });
        $sharePaket->whereHas('paketSoal', function($q) use ($search) {
            $q->where('name', 'like', "%{$search}%");
        });
    }

    $shareSoal = $shareSoal->get()->map(function($item) {
        $item->type = 'soal';
        return $item;
    });

    $sharePaket = $sharePaket->get()->map(function($item) {
        $item->type = 'paket';
        return $item;
    });

    $riwayat = $shareSoal->merge($sharePaket)->sortByDesc('created_at');

    // Paginate manually
    $perPage = 10;
    $currentPage = request()->get('page', 1);
    $riwayat = new \Illuminate\Pagination\LengthAwarePaginator(
        $riwayat->forPage($currentPage, $perPage),
        $riwayat->count(),
        $perPage,
        $currentPage,
        ['path' => request()->url(), 'query' => request()->query()]
    );

    return view('share.riwayat', compact('riwayat'));
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
        $shareSoal = ShareSoal::where('shared_to', Auth::id())
            ->orWhere('shared_by', Auth::id())
            ->with(['question', 'sharedBy', 'sharedTo'])
            ->latest()
            ->get();

        $sharePaket = SharePaket::where('shared_to', Auth::id())
            ->orWhere('shared_by', Auth::id())
            ->with(['paketSoal', 'sharedBy', 'sharedTo'])
            ->latest()
            ->get();

        $guruList = User::whereIn('role', ['admin', 'guru'])
            ->where('id', '!=', Auth::id())
            ->get();

        // Tambahkan data untuk dropdown share
        $questions = Question::where('created_by', Auth::id())->get();
        $pakets = PaketSoal::where('created_by', Auth::id())->get();

        return view('share.index', compact('shareSoal', 'sharePaket', 'guruList', 'questions', 'pakets'));
    }
}