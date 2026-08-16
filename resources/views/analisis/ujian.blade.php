@extends('layouts.app')

@section('title', 'Analisis Ujian')
@section('breadcrumb', 'Analisis Ujian')

@section('content')
<div class="container-fluid">
    <div class="stat-card">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h5 class="fw-bold mb-0">{{ $ujian->title }}</h5>
                <small class="text-muted">{{ $ujian->paketSoal->name ?? '-' }}</small>
            </div>
            <a href="{{ route('analisis.index') }}" class="btn btn-secondary btn-sm">
                <i class="fas fa-arrow-left me-1"></i> Kembali
            </a>
        </div>

        <!-- Informasi Ujian -->
        <div class="row g-3 mb-4">
            <div class="col-md-3">
                <div class="card bg-light">
                    <div class="card-body text-center">
                        <small class="text-muted">Siswa</small>
                        <h6 class="fw-bold">{{ $ujian->siswa->name ?? '-' }}</h6>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-light">
                    <div class="card-body text-center">
                        <small class="text-muted">Nilai</small>
                        <h6 class="fw-bold">{{ $ujian->total_score ?? 0 }}</h6>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-light">
                    <div class="card-body text-center">
                        <small class="text-muted">Status</small>
                        <h6><span class="badge bg-{{ $ujian->status_badge }}">{{ $ujian->status_label }}</span></h6>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-light">
                    <div class="card-body text-center">
                        <small class="text-muted">Total Soal</small>
                        <h6 class="fw-bold">{{ $ujian->total_soal }}</h6>
                    </div>
                </div>
            </div>
        </div>

        <!-- Analisis Per Soal -->
        <h6 class="fw-bold mb-3">Analisis Per Soal</h6>
        <div class="table-responsive">
            <table class="table table-striped table-hover">
                <thead>
                    <tr>
                        <th width="50">No</th>
                        <th>Soal</th>
                        <th width="100">Tipe</th>
                        <th width="100">Status</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($soalStats as $stat)
                        <tr>
                            <td>{{ $loop->iteration }}</td>
                            <td>
                                <div>{{ Str::limit($stat['question']->question_text ?? '', 100) }}</div>
                                <small class="text-muted">
                                    Level: {{ $stat['question']->level_c ?? '-' }} |
                                    KKO: {{ $stat['question']->kko->verb ?? '-' }}
                                </small>
                            </td>
                            <td>
                                <span class="badge bg-secondary">
                                    {{ $stat['question']->type_label ?? '-' }}
                                </span>
                            </td>
                            <td>
                                <div class="d-flex gap-2">
                                    <span class="badge bg-success">{{ $stat['correct'] }} benar</span>
                                    <span class="badge bg-danger">{{ $stat['wrong'] }} salah</span>
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="4" class="text-center text-muted">Belum ada data jawaban.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>
@endsection