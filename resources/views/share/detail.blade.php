@extends('layouts.app')

@section('title', 'Detail Kolaborasi')
@section('breadcrumb', 'Detail Kolaborasi')

@section('content')
<div class="container-fluid">
    <div class="stat-card">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h5 class="fw-bold mb-0">Detail Kolaborasi</h5>
            <a href="{{ route('share.index') }}" class="btn btn-secondary btn-sm">
                <i class="fas fa-arrow-left me-1"></i> Kembali
            </a>
        </div>
        
        @if($type === 'soal')
            <div class="row">
                <div class="col-md-8">
                    <h6 class="fw-bold mb-3">Informasi Soal</h6>
                    <div class="p-3 bg-light rounded mb-3">
                        <p>{{ $item->question->question_text ?? '-' }}</p>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-4">
                            <small class="text-muted d-block">Mata Pelajaran</small>
                            <span class="fw-bold">{{ $item->question->subject->name ?? '-' }}</span>
                        </div>
                        <div class="col-md-4">
                            <small class="text-muted d-block">Level Kognitif</small>
                            <span class="badge badge-{{ strtolower($item->question->level_c ?? '') }}">
                                {{ $item->question->level_c ?? '-' }}
                            </span>
                        </div>
                        <div class="col-md-4">
                            <small class="text-muted d-block">Kurikulum</small>
                            <span class="badge {{ $item->question->curriculum === 'merdeka' ? 'badge-merdeka' : 'badge-kbc' }}">
                                {{ $item->question->curriculum_label ?? '-' }}
                            </span>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <small class="text-muted d-block">KKO</small>
                        <span class="fw-bold">{{ $item->question->kko->verb ?? '-' }}</span>
                    </div>
                    
                    @if($item->question->indicator_text)
                        <div class="mb-3">
                            <small class="text-muted d-block">Indikator Soal</small>
                            <p>{{ $item->question->indicator_text }}</p>
                        </div>
                    @endif
                </div>
                
                <div class="col-md-4">
                    <div class="card bg-light">
                        <div class="card-body">
                            <h6 class="fw-bold mb-3">Informasi Share</h6>
                            <hr>
                            <div class="mb-2">
                                <small class="text-muted d-block">Dibagikan oleh</small>
                                <span class="fw-bold">{{ $item->sharedBy->name ?? '-' }}</span>
                            </div>
                            <div class="mb-2">
                                <small class="text-muted d-block">Kepada</small>
                                <span class="fw-bold">{{ $item->sharedTo->name ?? '-' }}</span>
                            </div>
                            <div class="mb-2">
                                <small class="text-muted d-block">Izin</small>
                                <span class="badge bg-info">{{ $item->permission_label }}</span>
                            </div>
                            <div class="mb-2">
                                <small class="text-muted d-block">Status</small>
                                @if($item->is_accepted)
                                    <span class="badge bg-success">Diterima</span>
                                @else
                                    <span class="badge bg-warning">Pending</span>
                                @endif
                            </div>
                            <div class="mb-2">
                                <small class="text-muted d-block">Tanggal Share</small>
                                <span class="fw-bold">{{ $item->created_at->format('d M Y H:i') }}</span>
                            </div>
                            @if($item->accepted_at)
                                <div>
                                    <small class="text-muted d-block">Diterima pada</small>
                                    <span class="fw-bold">{{ $item->accepted_at->format('d M Y H:i') }}</span>
                                </div>
                            @endif
                        </div>
                    </div>
                </div>
            </div>
        @else
            <div class="row">
                <div class="col-md-8">
                    <h6 class="fw-bold mb-3">Informasi Paket Soal</h6>
                    <h5>{{ $item->paketSoal->name ?? '-' }}</h5>
                    @if($item->paketSoal->description)
                        <p class="text-muted">{{ $item->paketSoal->description }}</p>
                    @endif
                    
                    <div class="row mb-3">
                        <div class="col-md-4">
                            <small class="text-muted d-block">Jenjang</small>
                            <span class="fw-bold">{{ $item->paketSoal->jenjang ?? '-' }}</span>
                        </div>
                        <div class="col-md-4">
                            <small class="text-muted d-block">Kurikulum</small>
                            <span class="badge {{ $item->paketSoal->curriculum === 'merdeka' ? 'badge-merdeka' : 'badge-kbc' }}">
                                {{ $item->paketSoal->curriculum_label ?? '-' }}
                            </span>
                        </div>
                        <div class="col-md-4">
                            <small class="text-muted d-block">Total Soal</small>
                            <span class="fw-bold">{{ $item->paketSoal->total_soal ?? 0 }}</span>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-4">
                    <div class="card bg-light">
                        <div class="card-body">
                            <h6 class="fw-bold mb-3">Informasi Share</h6>
                            <hr>
                            <div class="mb-2">
                                <small class="text-muted d-block">Dibagikan oleh</small>
                                <span class="fw-bold">{{ $item->sharedBy->name ?? '-' }}</span>
                            </div>
                            <div class="mb-2">
                                <small class="text-muted d-block">Kepada</small>
                                <span class="fw-bold">{{ $item->sharedTo->name ?? '-' }}</span>
                            </div>
                            <div class="mb-2">
                                <small class="text-muted d-block">Izin</small>
                                <span class="badge bg-info">{{ $item->permission_label }}</span>
                            </div>
                            <div class="mb-2">
                                <small class="text-muted d-block">Status</small>
                                @if($item->is_accepted)
                                    <span class="badge bg-success">Diterima</span>
                                @else
                                    <span class="badge bg-warning">Pending</span>
                                @endif
                            </div>
                            <div class="mb-2">
                                <small class="text-muted d-block">Tanggal Share</small>
                                <span class="fw-bold">{{ $item->created_at->format('d M Y H:i') }}</span>
                            </div>
                            @if($item->accepted_at)
                                <div>
                                    <small class="text-muted d-block">Diterima pada</small>
                                    <span class="fw-bold">{{ $item->accepted_at->format('d M Y H:i') }}</span>
                                </div>
                            @endif
                        </div>
                    </div>
                </div>
            </div>
        @endif
    </div>
</div>
@endsection