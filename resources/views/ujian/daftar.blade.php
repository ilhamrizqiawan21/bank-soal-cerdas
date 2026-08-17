@extends('layouts.app')

@section('title', 'Ujian Saya')
@section('breadcrumb', 'Ujian Saya')

@section('content')
<div class="container-fluid">
    <div class="stat-card">
        <h5 class="fw-bold mb-4">Ujian Saya</h5>
        
        @if($ujian->isEmpty())
            <x-empty-state
                icon="fas fa-file-alt"
                title="Belum ada ujian"
                description="Belum ada ujian yang diberikan kepada Anda."
            />
        @else
            <div class="row">
                @foreach($ujian as $item)
                    <div class="col-md-6 mb-3">
                        <div class="card h-100">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-start">
                                    <div>
                                        <h6 class="fw-bold">{{ $item->title }}</h6>
                                        <p class="text-muted small">{{ $item->paketSoal->name ?? '-' }}</p>
                                    </div>
                                    <span class="badge bg-{{ $item->status_badge }}">
                                        {{ $item->status_label }}
                                    </span>
                                </div>
                                <div class="mt-2">
                                    <div class="d-flex justify-content-between">
                                        <small class="text-muted">Soal: {{ $item->total_soal }}</small>
                                        <small class="text-muted">Durasi: {{ $item->duration_text }}</small>
                                    </div>
                                    @if($item->status === 'finished')
                                        <div class="mt-2">
                                            <span class="badge bg-success">
                                                Nilai: {{ $item->total_score ?? 0 }}
                                            </span>
                                        </div>
                                    @endif
                                </div>
                                <div class="mt-3">
                                    @if($item->status === 'active')
                                        <a href="{{ route('ujian.kerjakan', $item->id) }}" 
                                           class="btn btn-primary btn-sm w-100">
                                            <i class="fas fa-play me-1"></i> Kerjakan Ujian
                                        </a>
                                    @elseif($item->status === 'finished')
                                        <a href="{{ route('ujian.hasil', $item->id) }}" 
                                           class="btn btn-outline-info btn-sm w-100">
                                            <i class="fas fa-chart-bar me-1"></i> Lihat Hasil
                                        </a>
                                    @else
                                        <button class="btn btn-secondary btn-sm w-100" disabled>
                                            <i class="fas fa-clock me-1"></i> {{ $item->status_label }}
                                        </button>
                                    @endif
                                </div>
                            </div>
                        </div>
                    </div>
                @endforeach
            </div>
        @endif
    </div>
</div>
@endsection