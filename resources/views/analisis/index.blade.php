@extends('layouts.app')

@section('title', 'Analisis')
@section('breadcrumb', 'Analisis')

@section('content')
<div class="container-fluid">
    <h5 class="fw-bold mb-4">Dashboard Analisis</h5>

    <!-- Statistik Utama -->
    <div class="row g-3 mb-4">
        <div class="col-md-3">
            <div class="stat-card">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="text-muted mb-1">Total Ujian</h6>
                        <h2 class="fw-bold mb-0">{{ $totalUjian }}</h2>
                    </div>
                    <div class="stat-icon bg-primary bg-opacity-10 text-primary">
                        <i class="fas fa-file-alt"></i>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="stat-card">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="text-muted mb-1">Total Siswa</h6>
                        <h2 class="fw-bold mb-0">{{ $totalSiswa }}</h2>
                    </div>
                    <div class="stat-icon bg-success bg-opacity-10 text-success">
                        <i class="fas fa-users"></i>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="stat-card">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="text-muted mb-1">Total Soal</h6>
                        <h2 class="fw-bold mb-0">{{ $totalSoal }}</h2>
                    </div>
                    <div class="stat-icon bg-warning bg-opacity-10 text-warning">
                        <i class="fas fa-database"></i>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="stat-card">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="text-muted mb-1">Rata-rata Nilai</h6>
                        <h2 class="fw-bold mb-0">{{ number_format($avgScore, 1) }}</h2>
                    </div>
                    <div class="stat-icon bg-danger bg-opacity-10 text-danger">
                        <i class="fas fa-star"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="row g-3 mb-4">
        <!-- Status Ujian -->
        <div class="col-md-6">
            <div class="stat-card">
                <h6 class="fw-bold mb-3">Status Ujian</h6>
                <div class="d-flex gap-3">
                    @foreach(['draft', 'active', 'finished', 'expired'] as $status)
                        <div class="text-center">
                            <span class="badge bg-{{ $status === 'draft' ? 'secondary' : ($status === 'active' ? 'primary' : ($status === 'finished' ? 'success' : 'danger')) }} d-block p-2">
                                {{ ucfirst($status) }}
                            </span>
                            <span class="fw-bold">{{ $statusDistribution[$status] ?? 0 }}</span>
                        </div>
                    @endforeach
                </div>
            </div>
        </div>

        <!-- Distribusi Level -->
        <div class="col-md-6">
            <div class="stat-card">
                <h6 class="fw-bold mb-3">Distribusi Level Kognitif</h6>
                <div class="d-flex gap-2 flex-wrap">
                    @foreach(['C1', 'C2', 'C3', 'C4', 'C5', 'C6'] as $level)
                        <div class="text-center">
                            <span class="badge badge-{{ strtolower($level) }} d-block p-2">
                                {{ $level }}
                            </span>
                            <span class="fw-bold">{{ $levelDistribution[$level] ?? 0 }}</span>
                        </div>
                    @endforeach
                </div>
            </div>
        </div>
    </div>

    <!-- Top 5 Siswa -->
    <div class="row g-3 mb-4">
        <div class="col-md-6">
            <div class="stat-card">
                <h6 class="fw-bold mb-3"><i class="fas fa-trophy me-2"></i>Top 5 Siswa Terbaik</h6>
                @if($topSiswa->isEmpty())
                    <p class="text-muted">Belum ada data ujian selesai.</p>
                @else
                    <div class="list-group list-group-flush">
                        @foreach($topSiswa as $index => $siswa)
                            <div class="list-group-item d-flex justify-content-between align-items-center">
                                <div>
                                    <span class="badge bg-{{ $index === 0 ? 'gold' : ($index === 1 ? 'silver' : ($index === 2 ? 'bronze' : 'secondary')) }} me-2">
                                        #{{ $index + 1 }}
                                    </span>
                                    <a href="{{ route('analisis.siswa', $siswa->siswa_id) }}" class="text-decoration-none">
                                        {{ $siswa->siswa->name ?? 'Unknown' }}
                                    </a>
                                </div>
                                <span class="badge bg-primary">{{ number_format($siswa->avg_score, 1) }}</span>
                            </div>
                        @endforeach
                    </div>
                @endif
            </div>
        </div>

        <!-- Ujian Terbaru -->
        <div class="col-md-6">
            <div class="stat-card">
                <h6 class="fw-bold mb-3"><i class="fas fa-file-alt me-2"></i>Ujian Terbaru</h6>
                @if($recentUjian->isEmpty())
                    <p class="text-muted">Belum ada ujian.</p>
                @else
                    <div class="list-group list-group-flush">
                        @foreach($recentUjian as $ujian)
                            <div class="list-group-item d-flex justify-content-between align-items-center">
                                <div>
                                    <a href="{{ route('analisis.ujian', $ujian->id) }}" class="text-decoration-none">
                                        {{ Str::limit($ujian->title, 30) }}
                                    </a>
                                    <br>
                                    <small class="text-muted">
                                        {{ $ujian->siswa->name ?? '-' }} · {{ $ujian->status_label }}
                                    </small>
                                </div>
                                <span class="badge bg-{{ $ujian->status_badge }}">
                                    {{ $ujian->status_label }}
                                </span>
                            </div>
                        @endforeach
                    </div>
                @endif
            </div>
        </div>
    </div>

    <!-- Export -->
    <div class="row">
        <div class="col-12">
            <div class="stat-card">
                <h6 class="fw-bold mb-3"><i class="fas fa-file-export me-2"></i>Export Data</h6>
                <div class="d-flex gap-2">
                    <a href="{{ route('analisis.export') }}?format=pdf" class="btn btn-danger btn-sm">
                        <i class="fas fa-file-pdf me-1"></i> Export PDF
                    </a>
                    <a href="{{ route('analisis.export') }}?format=excel" class="btn btn-success btn-sm">
                        <i class="fas fa-file-excel me-1"></i> Export Excel
                    </a>
                </div>
                <small class="text-muted">Fitur export sedang dalam pengembangan.</small>
            </div>
        </div>
    </div>
</div>
@endsection
