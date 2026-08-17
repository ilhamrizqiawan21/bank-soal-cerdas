<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    // ============ ADMIN ONLY ============
    
    public function index(Request $request)
    {
        // Cek role manual
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Anda tidak memiliki akses.');
        }
        
        $query = User::query();

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }
        if ($request->filled('status')) {
            $query->where('is_active', $request->status === 'active');
        }
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('nip', 'like', "%{$search}%");
            });
        }

        $users = $query->latest()->paginate(10)->withQueryString();
        
        return view('users.index', compact('users'));
    }

    public function create()
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Anda tidak memiliki akses.');
        }
        return view('users.create');
    }

    public function store(Request $request)
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Anda tidak memiliki akses.');
        }
        
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:admin,guru,siswa',
            'nip' => 'nullable|string|max:50|unique:users,nip',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'gender' => 'nullable|in:L,P',
            'birth_date' => 'nullable|date|before:today',
            'is_active' => 'boolean',
        ]);

        try {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => $request->role,
                'nip' => $request->nip,
                'phone' => $request->phone,
                'address' => $request->address,
                'gender' => $request->gender,
                'birth_date' => $request->birth_date,
                'is_active' => $request->has('is_active'),
            ]);

            return redirect()->route('users.index')
                ->with('success', "User {$user->name} berhasil ditambahkan!");

        } catch (\Exception $e) {
            Log::error('User store error: ' . $e->getMessage());
            return back()->withInput()->with('error', 'Gagal menambahkan user.');
        }
    }

    public function show(User $user)
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Anda tidak memiliki akses.');
        }
        $user->load(['questions', 'paketSoal']);
        return view('users.show', compact('user'));
    }

    public function edit(User $user)
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Anda tidak memiliki akses.');
        }
        return view('users.edit', compact('user'));
    }

    public function update(Request $request, User $user)
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Anda tidak memiliki akses.');
        }
        
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'role' => 'required|in:admin,guru,siswa',
            'nip' => 'nullable|string|max:50|unique:users,nip,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'gender' => 'nullable|in:L,P',
            'birth_date' => 'nullable|date|before:today',
            'is_active' => 'boolean',
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        try {
            $data = $request->except(['password', 'password_confirmation']);
            
            if ($request->filled('password')) {
                $data['password'] = Hash::make($request->password);
            }

            $data['is_active'] = $request->has('is_active');
            $user->update($data);

            return redirect()->route('users.index')
                ->with('success', "User {$user->name} berhasil diperbarui!");

        } catch (\Exception $e) {
            Log::error('User update error: ' . $e->getMessage());
            return back()->withInput()->with('error', 'Gagal memperbarui user.');
        }
    }

    public function destroy(User $user)
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Anda tidak memiliki akses.');
        }
        
        if ($user->id === auth()->id()) {
            return back()->with('error', 'Anda tidak dapat menghapus akun sendiri!');
        }

        try {
            $user->delete();
            return redirect()->route('users.index')
                ->with('success', 'User berhasil dihapus!');
        } catch (\Exception $e) {
            Log::error('User delete error: ' . $e->getMessage());
            return back()->with('error', 'Gagal menghapus user.');
        }
    }

    public function toggleStatus(User $user)
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Anda tidak memiliki akses.');
        }
        
        if ($user->id === auth()->id()) {
            return back()->with('error', 'Anda tidak dapat menonaktifkan akun sendiri!');
        }

        try {
            $user->update(['is_active' => !$user->is_active]);
            $status = $user->is_active ? 'diaktifkan' : 'dinonaktifkan';
            return redirect()->route('users.index')
                ->with('success', "User {$user->name} berhasil {$status}!");
        } catch (\Exception $e) {
            Log::error('User toggle status error: ' . $e->getMessage());
            return back()->with('error', 'Gagal mengubah status user.');
        }
    }

    // ============ PROFILE (untuk semua user) ============
    
    public function profile()
    {
        $user = auth()->user();
        return view('users.profile', compact('user'));
    }

    public function updateProfile(Request $request)
    {
        $user = auth()->user();
        
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'gender' => 'nullable|in:L,P',
            'birth_date' => 'nullable|date|before:today',
        ]);

        try {
            $user->update($request->only(['name', 'email', 'phone', 'address', 'gender', 'birth_date']));
            return back()->with('success', 'Profil berhasil diperbarui!');
        } catch (\Exception $e) {
            Log::error('Profile update error: ' . $e->getMessage());
            return back()->with('error', 'Gagal memperbarui profil.');
        }
    }

    public function updateAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|max:2048',
        ]);

        try {
            $user = auth()->user();
            $path = $request->file('avatar')->store('avatars', 'public');
            $user->update(['avatar' => $path]);
            return back()->with('success', 'Foto profil berhasil diupdate!');
        } catch (\Exception $e) {
            Log::error('Avatar upload error: ' . $e->getMessage());
            return back()->with('error', 'Gagal upload foto.');
        }
    }

    public function updatePassword(Request $request)
    {
        $user = auth()->user();
        
        $request->validate([
            'current_password' => 'required|current_password',
            'password' => 'required|string|min:8|confirmed',
        ]);

        try {
            $user->update([
                'password' => Hash::make($request->password),
            ]);
            return back()->with('success', 'Password berhasil diubah!');
        } catch (\Exception $e) {
            Log::error('Password update error: ' . $e->getMessage());
            return back()->with('error', 'Gagal mengubah password.');
        }
    }
}