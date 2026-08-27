<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::query();

        if ($request->filled('role') && $request->role !== 'all') {
            $query->where('role', $request->role);
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('is_active', $request->status === 'active');
        }

        if ($request->filled('search')) {
            $search = (string) $request->string('search');
            $query->where(fn ($q) => $q
                ->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhere('nip', 'like', "%{$search}%"));
        }

        match ((string) $request->string('sort', 'latest')) {
            'oldest' => $query->oldest(),
            'name' => $query->orderBy('name'),
            default => $query->latest(),
        };

        $users = $query->paginate(min(max((int) $request->integer('per_page', 15), 1), 100))->withQueryString();

        return response()->json([
            'data' => $users->items(),
            'meta' => [
                'current_page' => $users->currentPage(),
                'from' => $users->firstItem(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'to' => $users->lastItem(),
                'total' => $users->total(),
            ],
            'links' => [
                'first' => $users->url(1),
                'last' => $users->url($users->lastPage()),
                'prev' => $users->previousPageUrl(),
                'next' => $users->nextPageUrl(),
            ],
        ]);
    }

    public function options(Request $request): JsonResponse
    {
        $query = User::query()->where('is_active', true);

        if ($request->filled('roles')) {
            $roles = collect(explode(',', (string) $request->string('roles')))
                ->map(fn ($role) => trim($role))
                ->filter()
                ->all();

            $query->whereIn('role', $roles);
        } elseif ($request->filled('role')) {
            $query->where('role', $request->string('role'));
        }

        return response()->json([
            'data' => $query->orderBy('name')->get(['id', 'name', 'email', 'role', 'nip', 'is_active', 'created_at']),
        ]);
    }

    public function show(User $user): JsonResponse
    {
        return response()->json([
            'data' => $user->loadCount(['questions', 'paketSoal']),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validated($request);

        $user = User::create([
            ...collect($validated)->except(['password', 'password_confirmation'])->all(),
            'password' => Hash::make($validated['password']),
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json(['data' => $user], 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $this->validated($request, $user);
        $data = collect($validated)->except(['password', 'password_confirmation'])->all();

        if ($request->filled('password')) {
            $data['password'] = Hash::make($validated['password']);
        }

        if ((int) $user->id === (int) $request->user()->id) {
            unset($data['is_active']);
        }

        $user->update($data);

        return response()->json(['data' => $user->fresh()]);
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        abort_if((int) $user->id === (int) $request->user()->id, 422, 'Anda tidak dapat menghapus akun sendiri.');

        $user->delete();

        return response()->json(['data' => null]);
    }

    public function toggleStatus(Request $request, User $user): JsonResponse
    {
        abort_if((int) $user->id === (int) $request->user()->id, 422, 'Anda tidak dapat menonaktifkan akun sendiri.');

        $user->update(['is_active' => ! $user->is_active]);

        return response()->json(['data' => $user->fresh()]);
    }

    private function validated(Request $request, ?User $user = null): array
    {
        $passwordRule = $user ? 'nullable|string|min:8|confirmed' : 'required|string|min:8|confirmed';

        return $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($user?->id)],
            'password' => $passwordRule,
            'password_confirmation' => $user ? 'nullable|required_with:password|string' : 'required|string',
            'role' => 'required|in:admin,guru,siswa',
            'nip' => ['nullable', 'string', 'max:50', Rule::unique('users', 'nip')->ignore($user?->id)],
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'gender' => 'nullable|in:L,P',
            'birth_date' => 'nullable|date|before:today',
            'is_active' => 'sometimes|boolean',
        ]);
    }
}
