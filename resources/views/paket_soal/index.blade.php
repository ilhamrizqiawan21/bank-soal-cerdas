@extends('layouts.app')

@section('title', 'Paket Soal')
@section('breadcrumb', 'Paket Soal')

@section('content')
<div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h5 class="fw-bold mb-0">Daftar Paket Soal</h5>
        <a href="{{ route('paket-soal.create') }}" class="btn btn-primary">
            <i class="fas fa-plus me-1"></i> Buat Paket Soal
        </a>
    </div>

    <!-- Filter -->
    <div class="stat-card mb-4">
        <form method="GET" action="{{ route('paket-soal.index') }}" class="row g-3 align-items-end">
            <div class="col-md-3">
                <label class="form-label small fw-bold">Jenjang</label>
                <select name="jenjang" class="form-select form-select-sm">
                    <option value="">Semua</option>
                    <option value="SD" {{ request('jenjang') == 'SD' ? 'selected' : '' }}>SD</option>
                    <option value="SMP" {{ request('jenjang') == 'SMP' ? 'selected' : '' }}>SMP</option>
                    <option value="SMA" {{ request('jenjang') == 'SMA' ? 'selected' : '' }}>SMA</option>
                </select>
            </div>
            <div class="col-md-3">
                <label class="form-label small fw-bold">Kurikulum</label>
                <select name="curriculum" class="form-select form-select-sm">
                    <option value="">Semua</option>
                    <option value="merdeka" {{ request('curriculum') == 'merdeka' ? 'selected' : '' }}>Merdeka</option>
                    <option value="kbc" {{ request('curriculum') == 'kbc' ? 'selected' : '' }}>KBC</option>
                    <option value="both" {{ request('curriculum') == 'both' ? 'selected' : '' }}>Merdeka & KBC</option>
                </select>
            </div>
            <div class="col-md-3">
                <label class="form-label small fw-bold">Status</label>
                <select name="status" class="form-select form-select-sm">
                    <option value="">Semua</option>
                    <option value="draft" {{ request('status') == 'draft' ? 'selected' : '' }}>Draft</option>
                    <option value="published" {{ request('status') == 'published' ? 'selected' : '' }}>Published</option>
                    <option value="archived" {{ request('status') == 'archived' ? 'selected' : '' }}>Archived</option>
                </select>
            </div>
            <div class="col-md-3">
                <div class="input-group">
                    <input type="text" name="search" class="form-control form-control-sm" placeholder="Cari paket..." value="{{ request('search') }}">
                    <button type="submit" class="btn btn-primary btn-sm">
                        <i class="fas fa-search"></i>
                    </button>
                </div>
            </div>
        </form>
    </div>

    <!-- Tabel -->
    <div class="stat-card">
        <div class="table-responsive">
            <table class="table table-striped table-hover">
                <thead>
                    <tr>
                        <th width="50">No</th>
                        <th>Nama Paket</th>
                        <th>Jenjang</th>
                        <th>Kurikulum</th>
                        <th>Total Soal</th>
                        <th>Durasi</th>
                        <th>Status</th>
                        <th width="150">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($paketSoal as $index => $paket)
                        <tr>
                            <td>{{ $paketSoal->firstItem() + $index }}</td>
                            <td>
                                <div class="fw-bold">{{ $paket->name }}</div>
                                @if($paket->description)
                                    <small class="text-muted">{{ Str::limit($paket->description, 50) }}</small>
                                @endif
                            </td>
                            <td>{{ $paket->jenjang }}</td>
                            <td>
                                <span class="badge {{ $paket->curriculum === 'merdeka' ? 'badge-merdeka' : 'badge-kbc' }}">
                                    {{ $paket->curriculum_label }}
                                </span>
                            </td>
                            <td>{{ $paket->total_soal }}</td>
                            <td>{{ $paket->duration_minutes ? $paket->duration_minutes . ' menit' : '-' }}</td>
                            <td>
                                <span class="badge bg-{{ $paket->status_badge }}">
                                    {{ $paket->status_label }}
                                </span>
                            </td>
                            <td>
                                <div class="btn-group btn-group-sm">
                                    <a href="{{ route('paket-soal.show', $paket) }}" class="btn btn-outline-primary">
                                        <i class="fas fa-eye"></i>
                                    </a>
                                    <a href="{{ route('paket-soal.edit', $paket) }}" class="btn btn-outline-warning">
                                        <i class="fas fa-edit"></i>
                                    </a>
                                    <a href="{{ route('paket-soal.duplicate', $paket) }}" class="btn btn-outline-secondary"
                                       onclick="return confirm('Duplikasi paket ini?')">
                                        <i class="fas fa-copy"></i>
                                    </a>
                                    <button class="btn btn-outline-danger"
                                            onclick="if(confirm('Yakin hapus paket ini?')) document.getElementById('delete-form-{{ $paket->id }}').submit()">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                    <form id="delete-form-{{ $paket->id }}"
                                          action="{{ route('paket-soal.destroy', $paket) }}"
                                          method="POST" class="d-none">
                                        @csrf
                                        @method('DELETE')
                                    </form>
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="8" class="text-center py-5">
                                <i class="fas fa-box fa-3x text-muted mb-3 d-block"></i>
                                <p class="text-muted">Belum ada paket soal. Klik "Buat Paket Soal" untuk memulai.</p>
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        <div class="d-flex justify-content-between align-items-center mt-3">
            <small class="text-muted">
                Menampilkan {{ $paketSoal->firstItem() ?? 0 }}–{{ $paketSoal->lastItem() ?? 0 }} dari {{ $paketSoal->total() ?? 0 }} data
            </small>
            {{ $paketSoal->links() }}
        </div>
    </div>
</div>
@endsection