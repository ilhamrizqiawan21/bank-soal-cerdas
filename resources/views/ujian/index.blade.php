@extends('layouts.app')

@section('title', 'Manajemen Ujian')
@section('breadcrumb', 'Manajemen Ujian')

@section('content')
<div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h5 class="fw-bold mb-0">Daftar Ujian</h5>
        <a href="{{ route('ujian.create') }}" class="btn btn-primary">
            <i class="fas fa-plus me-1"></i> Buat Ujian
        </a>
    </div>

    <!-- Filter -->
    <div class="stat-card mb-4">
        <form method="GET" class="row g-3 align-items-end">
            <div class="col-md-3">
                <label class="form-label small fw-bold">Status</label>
                <select name="status" class="form-select form-select-sm">
                    <option value="">Semua</option>
                    <option value="draft" {{ request('status') == 'draft' ? 'selected' : '' }}>Draft</option>
                    <option value="active" {{ request('status') == 'active' ? 'selected' : '' }}>Aktif</option>
                    <option value="finished" {{ request('status') == 'finished' ? 'selected' : '' }}>Selesai</option>
                    <option value="expired" {{ request('status') == 'expired' ? 'selected' : '' }}>Kadaluarsa</option>
                </select>
            </div>
            <div class="col-md-6">
                <label class="form-label small fw-bold">Cari</label>
                <input type="text" name="search" class="form-control form-control-sm" 
                       placeholder="Cari judul ujian..." value="{{ request('search') }}">
            </div>
            <div class="col-md-3">
                <button type="submit" class="btn btn-primary btn-sm w-100">
                    <i class="fas fa-search me-1"></i> Filter
                </button>
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
                        <th>Judul Ujian</th>
                        <th>Paket Soal</th>
                        <th>Siswa</th>
                        <th>Soal</th>
                        <th>Durasi</th>
                        <th>Status</th>
                        <th width="200">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($ujian as $index => $item)
                        <tr>
                            <td>{{ $ujian->firstItem() + $index }}</td>
                            <td>
                                <div class="fw-bold">{{ $item->title }}</div>
                                @if($item->description)
                                    <small class="text-muted">{{ Str::limit($item->description, 50) }}</small>
                                @endif
                            </td>
                            <td>{{ $item->paketSoal->name ?? '-' }}</td>
                            <td>{{ $item->siswa->name ?? '-' }}</td>
                            <td>{{ $item->total_soal }}</td>
                            <td>{{ $item->duration_text }}</td>
                            <td>
                                <span class="badge bg-{{ $item->status_badge }}">
                                    {{ $item->status_label }}
                                </span>
                            </td>
                            <td>
                                <div class="btn-group btn-group-sm">
                                    <a href="{{ route('ujian.show', $item) }}" class="btn btn-outline-primary">
                                        <i class="fas fa-eye"></i>
                                    </a>
                                    @if($item->status === 'draft' || $item->status === 'active')
                                        <a href="{{ route('ujian.edit', $item) }}" class="btn btn-outline-warning">
                                            <i class="fas fa-edit"></i>
                                        </a>
                                        @if($item->status === 'draft')
                                            <a href="{{ route('ujian.publish', $item) }}" 
                                               class="btn btn-outline-success"
                                               onclick="return confirm('Publikasikan ujian ini?')">
                                                <i class="fas fa-check"></i>
                                            </a>
                                        @endif
                                    @endif
                                    <button class="btn btn-outline-danger"
                                            onclick="if(confirm('Yakin hapus ujian ini?')) document.getElementById('delete-form-{{ $item->id }}').submit()">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                    <form id="delete-form-{{ $item->id }}"
                                          action="{{ route('ujian.destroy', $item) }}"
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
                                <i class="fas fa-file-alt fa-3x text-muted mb-3 d-block"></i>
                                <p class="text-muted">Belum ada ujian. Klik "Buat Ujian" untuk memulai.</p>
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        <div class="d-flex justify-content-between align-items-center mt-3">
            <small class="text-muted">
                Menampilkan {{ $ujian->firstItem() ?? 0 }}–{{ $ujian->lastItem() ?? 0 }} dari {{ $ujian->total() ?? 0 }} data
            </small>
            {{ $ujian->links() }}
        </div>
    </div>
</div>
@endsection