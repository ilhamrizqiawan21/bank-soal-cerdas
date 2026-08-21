@extends('layouts.app')

@section('title', 'Detail Ujian')
@section('breadcrumb', 'Detail Ujian')
@section('breadcrumb_parent', 'Manajemen Ujian')
@section('breadcrumb_parent_url', '{{ route(\'ujian.index\') }}')

@section('content')
<div class="container-fluid">
    <div class="stat-card">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h5 class="fw-bold mb-0">Detail Ujian</h5>
            <div>
                @if($ujian->status === 'draft' || $ujian->status === 'active')
                    <a href="{{ route('ujian.edit', $ujian) }}" class="btn btn-warning btn-sm">
                        <i class="fas fa-edit me-1"></i> Edit
                    </a>
                    @if($ujian->status === 'draft')
                        <form id="publish-form" action="{{ route('ujian.publish', $ujian) }}" method="POST" class="d-inline">
                            @csrf
                            <button type="button"
                                    class="btn btn-success btn-sm"
                                    data-confirm="Publikasikan ujian ini?"
                                    data-confirm-title="Publikasikan Ujian"
                                    data-confirm-form="publish-form">
                                <i class="fas fa-check me-1"></i> Publikasikan
                            </button>
                        </form>
                    @endif
                @endif
                <a href="{{ route('ujian.index') }}" class="btn btn-secondary btn-sm">
                    <i class="fas fa-arrow-left me-1"></i> Kembali
                </a>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-8">
                <div class="mb-4">
                    <h4>{{ $ujian->title }}</h4>
                    @if($ujian->description)
                        <p class="text-muted">{{ $ujian->description }}</p>
                    @endif
                </div>
                
                <h6 class="fw-bold mb-3">Informasi Ujian</h6>
                <div class="row mb-3">
                    <div class="col-md-4">
                        <small class="text-muted d-block">Paket Soal</small>
                        <span class="fw-bold">{{ $ujian->paketSoal->name ?? '-' }}</span>
                    </div>
                    <div class="col-md-4">
                        <small class="text-muted d-block">Total Soal</small>
                        <span class="fw-bold">{{ $ujian->total_soal }}</span>
                    </div>
                    <div class="col-md-4">
                        <small class="text-muted d-block">Durasi</small>
                        <span class="fw-bold">{{ $ujian->duration_text }}</span>
                    </div>
                </div>
                
                <div class="row mb-3">
                    <div class="col-md-4">
                        <small class="text-muted d-block">Siswa</small>
                        <span class="fw-bold">{{ $ujian->siswa->name ?? '-' }}</span>
                    </div>
                    <div class="col-md-4">
                        <small class="text-muted d-block">Status</small>
                        <span class="badge bg-{{ $ujian->status_badge }}">
                            {{ $ujian->status_label }}
                        </span>
                    </div>
                    <div class="col-md-4">
                        <small class="text-muted d-block">Nilai</small>
                        <span class="fw-bold">{{ $ujian->total_score ?? 'Belum dinilai' }}</span>
                    </div>
                </div>
            </div>
            
            <div class="col-md-4">
                <div class="card bg-light">
                    <div class="card-body">
                        <h6 class="fw-bold mb-3">Timeline</h6>
                        <hr>
                        <div class="mb-2">
                            <small class="text-muted d-block">Dibuat</small>
                            <span class="fw-bold">{{ $ujian->created_at->format('d M Y H:i') }}</span>
                        </div>
                        @if($ujian->started_at)
                            <div class="mb-2">
                                <small class="text-muted d-block">Dimulai</small>
                                <span class="fw-bold">{{ $ujian->started_at->format('d M Y H:i') }}</span>
                            </div>
                        @endif
                        @if($ujian->submitted_at)
                            <div class="mb-2">
                                <small class="text-muted d-block">Disubmit</small>
                                <span class="fw-bold">{{ $ujian->submitted_at->format('d M Y H:i') }}</span>
                            </div>
                        @endif
                        @if($ujian->finished_at)
                            <div class="mb-2">
                                <small class="text-muted d-block">Selesai</small>
                                <span class="fw-bold">{{ $ujian->finished_at->format('d M Y H:i') }}</span>
                            </div>
                        @endif
                        <div>
                            <small class="text-muted d-block">Dibuat oleh</small>
                            <span class="fw-bold">{{ $ujian->creator->name ?? '-' }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection