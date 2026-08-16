@extends('layouts.app')

@section('title', 'Riwayat Kolaborasi')
@section('breadcrumb', 'Riwayat Kolaborasi')

@section('content')
<div class="container-fluid">
    <div class="stat-card">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h5 class="fw-bold mb-0">Riwayat Kolaborasi</h5>
            <a href="{{ route('share.index') }}" class="btn btn-secondary btn-sm">
                <i class="fas fa-arrow-left me-1"></i> Kembali
            </a>
        </div>

        <!-- Filter -->
        <div class="mb-4">
            <form method="GET" class="row g-2">
                <div class="col-md-3">
                    <select name="type" class="form-select form-select-sm">
                        <option value="">Semua Jenis</option>
                        <option value="soal" {{ request('type') == 'soal' ? 'selected' : '' }}>Soal</option>
                        <option value="paket" {{ request('type') == 'paket' ? 'selected' : '' }}>Paket Soal</option>
                    </select>
                </div>
                <div class="col-md-3">
                    <select name="status" class="form-select form-select-sm">
                        <option value="">Semua Status</option>
                        <option value="accepted" {{ request('status') == 'accepted' ? 'selected' : '' }}>Diterima</option>
                        <option value="pending" {{ request('status') == 'pending' ? 'selected' : '' }}>Pending</option>
                        <option value="rejected" {{ request('status') == 'rejected' ? 'selected' : '' }}>Ditolak</option>
                    </select>
                </div>
                <div class="col-md-4">
                    <input type="text" name="search" class="form-control form-control-sm" 
                           placeholder="Cari..." value="{{ request('search') }}">
                </div>
                <div class="col-md-2">
                    <button type="submit" class="btn btn-primary btn-sm w-100">
                        <i class="fas fa-search me-1"></i> Filter
                    </button>
                </div>
            </form>
        </div>

        <!-- Tabel Riwayat -->
        <div class="table-responsive">
            <table class="table table-striped table-hover">
                <thead>
                    <tr>
                        <th>No</th>
                        <th>Jenis</th>
                        <th>Judul</th>
                        <th>Dibagikan oleh</th>
                        <th>Kepada</th>
                        <th>Izin</th>
                        <th>Status</th>
                        <th>Tanggal</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($riwayat as $index => $item)
                        <tr>
                            <td>{{ $loop->iteration }}</td>
                            <td>
                                <span class="badge {{ $item->type === 'soal' ? 'bg-primary' : 'bg-success' }}">
                                    {{ ucfirst($item->type) }}
                                </span>
                            </td>
                            <td>
                                @if($item->type === 'soal')
                                    {{ Str::limit($item->question->question_text ?? '-', 50) }}
                                @else
                                    {{ $item->paketSoal->name ?? '-' }}
                                @endif
                            </td>
                            <td>{{ $item->sharedBy->name ?? '-' }}</td>
                            <td>{{ $item->sharedTo->name ?? '-' }}</td>
                            <td>
                                <span class="badge bg-info">{{ $item->permission_label }}</span>
                            </td>
                            <td>
                                @if($item->is_accepted)
                                    <span class="badge bg-success">Diterima</span>
                                @elseif($item->deleted_at)
                                    <span class="badge bg-danger">Ditolak</span>
                                @else
                                    <span class="badge bg-warning">Pending</span>
                                @endif
                            </td>
                            <td>
                                <small class="text-muted">
                                    {{ $item->created_at->format('d M Y') }}
                                </small>
                            </td>
                            <td>
                                <a href="{{ route('share.detail', ['type' => $item->type, 'id' => $item->id]) }}" 
                                   class="btn btn-sm btn-outline-primary">
                                    <i class="fas fa-eye"></i>
                                </a>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="9" class="text-center py-5">
                                <i class="fas fa-history fa-3x text-muted mb-3 d-block"></i>
                                <p class="text-muted">Belum ada riwayat kolaborasi.</p>
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        
        @isset($riwayat)
            <div class="d-flex justify-content-end mt-3">
                {{ $riwayat->links() }}
            </div>
        @endisset
    </div>
</div>
@endsection