@extends('layouts.app')

@section('title', 'Manajemen Ujian')
@section('breadcrumb', 'Manajemen Ujian')

@section('content')
<style>
    .secondary-page .page-hero { padding: 4px 0 22px; }
    .secondary-page .page-kicker { color: #2563eb; font-size: .72rem; font-weight: 700; letter-spacing: .09em; text-transform: uppercase; }
    .secondary-page .page-title { font-size: 1.35rem; font-weight: 750; letter-spacing: -.025em; margin: 3px 0 5px; }
    .secondary-page .page-subtitle { color: #64748b; font-size: .86rem; margin: 0; }
    .secondary-page .page-hero .btn { border-radius: 10px; padding: .65rem .9rem; font-weight: 650; }
    .secondary-page .filter-card { border: 1px solid #e2e8f0; border-radius: 14px; background: #fff; padding: 16px; margin-bottom: 18px; box-shadow: 0 5px 18px rgba(15,23,42,.04); }
    .secondary-page .filter-card .form-label { color: #475569; font-size: .72rem; letter-spacing: .02em; }
    .secondary-page .filter-card .form-control,
    .secondary-page .filter-card .form-select { min-height: 40px; border-radius: 9px; border-color: #dbe3ee; }
    .secondary-page .data-card { border: 1px solid #e2e8f0; border-radius: 14px; background: #fff; overflow: hidden; box-shadow: 0 5px 18px rgba(15,23,42,.04); }
    .secondary-page .data-card-header { padding: 15px 18px; border-bottom: 1px solid #eef2f7; display:flex; align-items:center; justify-content:space-between; gap:12px; }
    .secondary-page .data-card-title { font-size: .88rem; font-weight: 700; margin:0; }
    .secondary-page .table { margin: 0; vertical-align: middle; }
    .secondary-page .table thead th { background:#f8fafc; color:#64748b; border-bottom:1px solid #e2e8f0; font-size:.69rem; font-weight:700; letter-spacing:.04em; text-transform:uppercase; padding:12px 14px; white-space:nowrap; }
    .secondary-page .table tbody td { padding:13px 14px; border-color:#eef2f7; font-size:.82rem; }
    .secondary-page .table tbody tr:last-child td { border-bottom:0; }
    .secondary-page .table tbody tr:hover { background:#f8fbff; }
    .secondary-page .status-pill { border-radius:999px; padding:.35rem .6rem; font-size:.68rem; font-weight:700; }
    .secondary-page .action-group { display:flex; gap:5px; white-space:nowrap; }
    .secondary-page .action-group .btn { width:32px; height:32px; padding:0; display:inline-flex; align-items:center; justify-content:center; border-radius:8px; }
    .secondary-page .data-card-footer { padding:12px 18px; border-top:1px solid #eef2f7; }
    @media (max-width: 768px) {
        .secondary-page .page-hero { padding-bottom:16px; }
        .secondary-page .page-hero .d-flex { align-items:flex-start !important; }
        .secondary-page .page-hero .btn { flex-shrink:0; }
        .secondary-page .filter-card { padding:12px; }
        .secondary-page .data-card { border-radius:12px; }
    }
</style>

<div class="container-fluid secondary-page">
    <div class="page-hero">
        <div class="d-flex justify-content-between align-items-center gap-3">
            <div>
                <div class="page-kicker"><i class="fas fa-file-circle-check me-1"></i> Evaluasi</div>
                <h1 class="page-title">Manajemen Ujian</h1>
                <p class="page-subtitle">Kelola ujian, peserta, durasi, dan status publikasi dalam satu tempat.</p>
            </div>
            <a href="{{ route('ujian.create') }}" class="btn btn-primary">
                <i class="fas fa-plus me-1"></i> Buat Ujian
            </a>
        </div>
    </div>

    <div class="filter-card">
        <form method="GET" class="row g-3 align-items-end">
            <div class="col-md-3">
                <label class="form-label fw-bold">Status</label>
                <select name="status" class="form-select form-select-sm">
                    <option value="">Semua status</option>
                    <option value="draft" {{ request('status') == 'draft' ? 'selected' : '' }}>Draft</option>
                    <option value="active" {{ request('status') == 'active' ? 'selected' : '' }}>Aktif</option>
                    <option value="finished" {{ request('status') == 'finished' ? 'selected' : '' }}>Selesai</option>
                    <option value="expired" {{ request('status') == 'expired' ? 'selected' : '' }}>Kadaluarsa</option>
                </select>
            </div>
            <div class="col-md-6">
                <label class="form-label fw-bold">Cari ujian</label>
                <input type="text" name="search" class="form-control form-control-sm" placeholder="Cari berdasarkan judul ujian..." value="{{ request('search') }}">
            </div>
            <div class="col-md-3">
                <button type="submit" class="btn btn-primary btn-sm w-100"><i class="fas fa-search me-1"></i> Terapkan Filter</button>
            </div>
        </form>
    </div>

    <div class="data-card">
        <div class="data-card-header">
            <div>
                <div class="data-card-title">Daftar Ujian</div>
                <small class="text-muted">Kelola ujian yang tersedia di sistem.</small>
            </div>
            <span class="badge bg-light text-dark border">{{ $ujian->total() ?? 0 }} ujian</span>
        </div>
        <div class="table-responsive">
            <table class="table table-hover table-responsive-card">
                <thead>
                    <tr>
                        <th width="50">No</th><th>Judul Ujian</th><th>Paket Soal</th><th>Siswa</th><th>Soal</th><th>Durasi</th><th>Status</th><th width="150">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($ujian as $index => $item)
                        <tr>
                            <td data-label="No">{{ $ujian->firstItem() + $index }}</td>
                            <td data-label="Judul Ujian"><div class="fw-bold">{{ $item->title }}</div>@if($item->description)<small class="text-muted">{{ Str::limit($item->description, 50) }}</small>@endif</td>
                            <td data-label="Paket Soal">{{ $item->paketSoal->name ?? '-' }}</td>
                            <td data-label="Siswa">{{ $item->siswa->name ?? '-' }}</td>
                            <td data-label="Soal">{{ $item->total_soal }}</td>
                            <td data-label="Durasi">{{ $item->duration_text }}</td>
                            <td data-label="Status"><span class="badge status-pill bg-{{ $item->status_badge }}">{{ $item->status_label }}</span></td>
                            <td data-label="Aksi">
                                <div class="action-group">
                                    <a href="{{ route('ujian.show', $item) }}" class="btn btn-outline-primary" title="Lihat"><i class="fas fa-eye"></i></a>
                                    @if($item->status === 'draft' || $item->status === 'active')
                                        <a href="{{ route('ujian.edit', $item) }}" class="btn btn-outline-warning" title="Edit"><i class="fas fa-edit"></i></a>
                                        @if($item->status === 'draft')
                                            <a href="{{ route('ujian.publish', $item) }}" class="btn btn-outline-success" title="Publikasikan" data-confirm="Publikasikan ujian ini?" data-confirm-title="Publikasikan Ujian" data-confirm-text="Ya, publikasikan" data-confirm-href="{{ route('ujian.publish', $item) }}"><i class="fas fa-check"></i></a>
                                        @endif
                                    @endif
                                    <button type="button" class="btn btn-outline-danger" title="Hapus" data-confirm="Yakin hapus ujian ini?" data-confirm-title="Hapus Ujian" data-confirm-text="Ya, hapus" data-confirm-form="delete-form-{{ $item->id }}"><i class="fas fa-trash"></i></button>
                                    <form id="delete-form-{{ $item->id }}" action="{{ route('ujian.destroy', $item) }}" method="POST" class="d-none">@csrf @method('DELETE')</form>
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr><td colspan="8" class="text-center py-5"><x-empty-state icon="fas fa-file-alt" title="Belum ada ujian" description="Klik tombol di atas untuk membuat ujian baru." button-text="Buat Ujian" button-href="{{ route('ujian.create') }}" button-class="btn btn-primary" /></td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        <div class="data-card-footer d-flex justify-content-between align-items-center gap-3">
            <small class="text-muted">Menampilkan {{ $ujian->firstItem() ?? 0 }}–{{ $ujian->lastItem() ?? 0 }} dari {{ $ujian->total() ?? 0 }} data</small>
            {{ $ujian->links() }}
        </div>
    </div>
</div>
@endsection