@extends('layouts.app')

@section('title', 'Manajemen Pengguna')
@section('breadcrumb', 'Manajemen Pengguna')

@section('content')
<div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h5 class="fw-bold mb-0">Daftar Pengguna</h5>
        <a href="{{ route('users.create') }}" class="btn btn-primary">
            <i class="fas fa-plus me-1"></i> Tambah Pengguna
        </a>
    </div>

    <!-- Filter -->
    <div class="stat-card mb-4">
        <form method="GET" action="{{ route('users.index') }}" class="row g-3 align-items-end">
            <div class="col-md-3">
                <label class="form-label small fw-bold">Role</label>
                <select name="role" class="form-select form-select-sm">
                    <option value="">Semua</option>
                    <option value="admin" {{ request('role') == 'admin' ? 'selected' : '' }}>Admin</option>
                    <option value="guru" {{ request('role') == 'guru' ? 'selected' : '' }}>Guru</option>
                    <option value="siswa" {{ request('role') == 'siswa' ? 'selected' : '' }}>Siswa</option>
                </select>
            </div>
            <div class="col-md-3">
                <label class="form-label small fw-bold">Status</label>
                <select name="status" class="form-select form-select-sm">
                    <option value="">Semua</option>
                    <option value="active" {{ request('status') == 'active' ? 'selected' : '' }}>Aktif</option>
                    <option value="inactive" {{ request('status') == 'inactive' ? 'selected' : '' }}>Tidak Aktif</option>
                </select>
            </div>
            <div class="col-md-4">
                <label class="form-label small fw-bold">Cari</label>
                <input type="text" name="search" class="form-control form-control-sm" 
                       placeholder="Cari nama, email, NIP..." value="{{ request('search') }}">
            </div>
            <div class="col-md-2">
                <button type="submit" class="btn btn-primary btn-sm w-100">
                    <i class="fas fa-search me-1"></i> Filter
                </button>
            </div>
        </form>
    </div>

    <!-- Tabel -->
    <div class="stat-card">
        <div class="table-responsive">
            <table class="table table-striped table-hover table-responsive-card mb-0">
                <thead>
                    <tr>
                        <th width="50">No</th>
                        <th>Nama</th>
                        <th>Email</th>
                        <th>NIP</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Terakhir Login</th>
                        <th width="180">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($users as $index => $user)
                        <tr>
                            <td data-label="No">{{ $users->firstItem() + $index }}</td>
                            <td data-label="Nama">
                                <div class="d-flex align-items-center">
                                    @if($user->avatar)
                                        <img src="{{ asset('storage/' . $user->avatar) }}" 
                                             alt="{{ $user->name }}" 
                                             class="rounded-circle me-2" 
                                             width="35" height="35">
                                    @else
                                        <div class="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center me-2" 
                                             style="width:35px;height:35px;font-size:14px;">
                                            {{ strtoupper(substr($user->name, 0, 1)) }}
                                        </div>
                                    @endif
                                    <div>
                                        <div class="fw-bold">{{ $user->name }}</div>
                                        <small class="text-muted">{{ $user->gender_label }}</small>
                                    </div>
                                </div>
                            </td>
                            <td data-label="Email">{{ $user->email }}</td>
                            <td data-label="NIP">{{ $user->nip ?? '-' }}</td>
                            <td data-label="Role">
                                <span class="badge bg-{{ $user->role_badge }}">
                                    {{ $user->role_label }}
                                </span>
                            </td>
                            <td data-label="Status">
                                <span class="badge bg-{{ $user->status_badge }}">
                                    {{ $user->status_label }}
                                </span>
                            </td>
                            <td data-label="Terakhir Login">
                                <small class="text-muted">
                                    {{ $user->last_login_at ? $user->last_login_at->diffForHumans() : 'Belum pernah' }}
                                </small>
                            </td>
                            <td data-label="Aksi">
                                <div class="btn-group btn-group-sm">
                                    <a href="{{ route('users.show', $user) }}" class="btn btn-outline-primary">
                                        <i class="fas fa-eye"></i>
                                    </a>
                                    <a href="{{ route('users.edit', $user) }}" class="btn btn-outline-warning">
                                        <i class="fas fa-edit"></i>
                                    </a>
                                    @if($user->id !== auth()->id())
                                        <form id="toggle-form-{{ $user->id }}" action="{{ route('users.toggle-status', $user) }}" method="POST" class="d-none">
                                            @csrf
                                        </form>
                                        <button type="button"
                                                class="btn btn-outline-{{ $user->is_active ? 'danger' : 'success' }}"
                                                data-confirm="{{ $user->is_active ? 'Nonaktifkan' : 'Aktifkan' }} user ini?"
                                                data-confirm-title="Ubah Status User"
                                                data-confirm-form="toggle-form-{{ $user->id }}">
                                            <i class="fas fa-{{ $user->is_active ? 'ban' : 'check-circle' }}"></i>
                                        </button>
                                        <button type="button" class="btn btn-outline-danger"
                                                data-confirm="Yakin hapus user ini?"
                                                data-confirm-title="Hapus User"
                                                data-confirm-text="Ya, hapus"
                                                data-confirm-form="delete-form-{{ $user->id }}">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                        <form id="delete-form-{{ $user->id }}"
                                              action="{{ route('users.destroy', $user) }}"
                                              method="POST" class="d-none">
                                            @csrf
                                            @method('DELETE')
                                        </form>
                                    @endif
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="8" class="text-center py-5">
                                <x-empty-state
                                    icon="fas fa-users"
                                    title="Belum ada pengguna"
                                    description="Klik tombol di atas untuk menambahkan pengguna baru."
                                    button-text="Tambah Pengguna"
                                    button-href="{{ route('users.create') }}"
                                    button-class="btn btn-primary"
                                />
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        <div class="d-flex justify-content-between align-items-center mt-3">
            <small class="text-muted">
                Menampilkan {{ $users->firstItem() ?? 0 }}–{{ $users->lastItem() ?? 0 }} dari {{ $users->total() ?? 0 }} data
            </small>
            {{ $users->links() }}
        </div>
    </div>
</div>
@endsection