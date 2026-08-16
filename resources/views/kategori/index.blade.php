@extends('layouts.app')

@section('title', 'Manajemen Kategori')
@section('breadcrumb', 'Kategori')

@section('content')
<div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h5 class="fw-bold mb-0">Daftar Kategori</h5>
        <a href="{{ route('kategori.create') }}" class="btn btn-primary">
            <i class="fas fa-plus me-1"></i> Tambah Kategori
        </a>
    </div>

    <!-- Filter -->
    <div class="stat-card mb-4">
        <form method="GET" class="row g-3 align-items-end">
            <div class="col-md-3">
                <label class="form-label small fw-bold">Tipe</label>
                <select name="type" class="form-select form-select-sm">
                    <option value="">Semua</option>
                    <option value="kd" {{ request('type') == 'kd' ? 'selected' : '' }}>Kompetensi Dasar</option>
                    <option value="topik" {{ request('type') == 'topik' ? 'selected' : '' }}>Topik</option>
                    <option value="bab" {{ request('type') == 'bab' ? 'selected' : '' }}>Bab</option>
                </select>
            </div>
            <div class="col-md-6">
                <label class="form-label small fw-bold">Cari</label>
                <input type="text" name="search" class="form-control form-control-sm" 
                       placeholder="Cari kategori..." value="{{ request('search') }}">
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
                        <th>Nama</th>
                        <th>Kode</th>
                        <th>Tipe</th>
                        <th>Induk</th>
                        <th>Total Soal</th>
                        <th width="150">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($kategori as $index => $item)
                        <tr>
                            <td>{{ $kategori->firstItem() + $index }}</td>
                            <td>
                                <div class="fw-bold">{{ $item->name }}</div>
                                @if($item->description)
                                    <small class="text-muted">{{ Str::limit($item->description, 50) }}</small>
                                @endif
                            </td>
                            <td>{{ $item->code ?? '-' }}</td>
                            <td>
                                <span class="badge bg-{{ $item->type === 'kd' ? 'primary' : ($item->type === 'topik' ? 'success' : 'warning') }}">
                                    {{ $item->type_label }}
                                </span>
                            </td>
                            <td>{{ $item->parent->name ?? '-' }}</td>
                            <td>{{ $item->questions->count() }}</td>
                            <td>
                                <div class="btn-group btn-group-sm">
                                    <a href="{{ route('kategori.show', $item) }}" class="btn btn-outline-primary">
                                        <i class="fas fa-eye"></i>
                                    </a>
                                    <a href="{{ route('kategori.edit', $item) }}" class="btn btn-outline-warning">
                                        <i class="fas fa-edit"></i>
                                    </a>
                                    <button class="btn btn-outline-danger"
                                            onclick="if(confirm('Yakin hapus kategori ini?')) document.getElementById('delete-form-{{ $item->id }}').submit()">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                    <form id="delete-form-{{ $item->id }}"
                                          action="{{ route('kategori.destroy', $item) }}"
                                          method="POST" class="d-none">
                                        @csrf
                                        @method('DELETE')
                                    </form>
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="7" class="text-center py-5">
                                <i class="fas fa-folder fa-3x text-muted mb-3 d-block"></i>
                                <p class="text-muted">Belum ada kategori. Klik "Tambah Kategori" untuk memulai.</p>
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        <div class="d-flex justify-content-between align-items-center mt-3">
            <small class="text-muted">
                Menampilkan {{ $kategori->firstItem() ?? 0 }}–{{ $kategori->lastItem() ?? 0 }} dari {{ $kategori->total() ?? 0 }} data
            </small>
            {{ $kategori->links() }}
        </div>
    </div>
</div>
@endsection