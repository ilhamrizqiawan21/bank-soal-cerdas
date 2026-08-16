@extends('layouts.app')

@section('title', 'Analisis Siswa')
@section('breadcrumb', 'Analisis Siswa')

@section('content')
<div class="container-fluid">
    <div class="stat-card">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h5 class="fw-bold mb-0">Profil Siswa: {{ $siswa->name }}</h5>
            <a href="{{ route('analisis.index') }}" class="btn btn-secondary btn-sm">
                <i class="fas fa-arrow-left me-1"></i> Kembali
            </a>
        </div>

        <!-- Statistik -->
        <div class="row g-3 mb-4">
            <div class="col-md-3">
                <div class="card bg-primary text-white">
                    <div class="card-body text-center">
                        <h6 class="text-white-50">Total Ujian</h6>
                        <h3 class="fw-bold">{{ $stats['total_ujian'] }}</h3>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-success text-white">
                    <div class="card-body text-center">
                        <h6 class="text-white-50">Ujian Selesai</h6>
                        <h3 class="fw-bold">{{ $stats['total_ujian_selesai'] }}</h3>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-warning text-dark">
                    <div class="card-body text-center">
                        <h6 class="text-dark-50">Rata-rata Nilai</h6>
                        <h3 class="fw-bold">{{ number_format($stats['rata_rata_nilai'], 1) }}</h3>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-danger text-white">
                    <div class="card-body text-center">
                        <h6 class="text-white-50">Nilai Tertinggi</h6>
                        <h3 class="fw-bold">{{ $stats['nilai_tertinggi'] }}</h3>
                    </div>
                </div>
            </div>
        </div>

        <!-- Riwayat Ujian -->
        <h6 class="fw-bold mb-3">Riwayat Ujian</h6>
        <div class="table-responsive">
            <table class="table table-striped table-hover">
                <thead>
                    <tr>
                        <th>Ujian</th>
                        <th>Paket Soal</th>
                        <th>Nilai</th>
                        <th>Status</th>
                        <th>Tanggal</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($riwayatUjian as $ujian)
                        <tr>
                            <td>
                                <a href="{{ route('analisis.ujian', $ujian->id) }}" class="text-decoration-none">
                                    {{ Str::limit($ujian->title, 30) }}
                                </a>
                            </td>
                            <td>{{ $ujian->paketSoal->name ?? '-' }}</td>
                            <td>
                                <span class="fw-bold">{{ $ujian->total_score ?? '-' }}</span>
                            </td>
                            <td>
                                <span class="badge bg-{{ $ujian->status_badge }}">
                                    {{ $ujian->status_label }}
                                </span>
                            </td>
                            <td>
                                <small class="text-muted">
                                    {{ $ujian->created_at->format('d M Y') }}
                                </small>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="5" class="text-center text-muted">Belum ada riwayat ujian.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>
@endsection