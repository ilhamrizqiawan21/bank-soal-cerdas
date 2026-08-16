@extends('layouts.app')

@section('title', 'Manajemen Tag')
@section('breadcrumb', 'Tag')

@section('content')
<div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h5 class="fw-bold mb-0">Daftar Tag</h5>
        <a href="{{ route('tag.create') }}" class="btn btn-primary">
            <i class="fas fa-plus me-1"></i> Tambah Tag
        </a>
    </div>

    <!-- Filter -->
    <div class="stat-card mb-4">
        <form method="GET" class="row g-3 align-items-end">
            <div class="col-md-9">
                <label class="form-label small fw-bold">Cari</label>
                <input type="text" name="search" class="form-control form-control-sm" 
                       placeholder="Cari tag..." value="{{ request('search') }}">
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
                        <th>Slug</th>
                        <th>Warna</th>
                        <th>Total Soal</th>
                        <th width="150">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($tag as $index => $item)
                        <tr>
                            <td>{{ $tag->firstItem() + $index }}</td>
                            <td>
                                <div class="fw-bold">
                                    <span class="badge" style="background-color: {{ $item->color }}; color: #fff;">
                                        {{ $item->name }}
                                    </span>
                                </div>
                            </td>
                            <td>{{ $item->slug }}</td>
                            <td>
                                <div style="width: 30px; height: 30px; background-color: {{ $item->color }}; border-radius: 50%;"></div>
                            </td>
                            <td>{{ $item->questions->count() }}</td>
                            <td>
                                <div class="btn-group btn-group-sm">
                                    <a href="{{ route('tag.show', $item) }}" class="btn btn-outline-primary">
                                        <i class="fas fa-eye"></i>
                                    </a>
                                    <a href="{{ route('tag.edit', $item) }}" class="btn btn-outline-warning">
                                        <i class="fas fa-edit"></i>
                                    </a>
                                    <button class="btn btn-outline-danger"
                                            onclick="if(confirm('Yakin hapus tag ini?')) document.getElementById('delete-form-{{ $item->id }}').submit()">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                    <form id="delete-form-{{ $item->id }}"
                                          action="{{ route('tag.destroy', $item) }}"
                                          method="POST" class="d-none">
                                        @csrf
                                        @method('DELETE')
                                    </form>
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6" class="text-center py-5">
                                <i class="fas fa-tags fa-3x text-muted mb-3 d-block"></i>
                                <p class="text-muted">Belum ada tag. Klik "Tambah Tag" untuk memulai.</p>
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        <div class="d-flex justify-content-between align-items-center mt-3">
            <small class="text-muted">
                Menampilkan {{ $tag->firstItem() ?? 0 }}–{{ $tag->lastItem() ?? 0 }} dari {{ $tag->total() ?? 0 }} data
            </small>
            {{ $tag->links() }}
        </div>
    </div>
</div>
@endsection