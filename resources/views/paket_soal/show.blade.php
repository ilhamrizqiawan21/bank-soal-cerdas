@extends('layouts.app')

@section('title', 'Detail Paket Soal')
@section('breadcrumb', 'Detail Paket Soal')
@section('breadcrumb_parent', 'Paket Soal')
@section('breadcrumb_parent_url', '{{ route(\'paket-soal.index\') }}')

@section('content')
<div class="container-fluid">
    <div class="stat-card">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h5 class="fw-bold mb-0">Detail Paket Soal</h5>
            <div>
                <a href="{{ route('paket-soal.edit', $paketSoal) }}" class="btn btn-warning btn-sm">
                    <i class="fas fa-edit me-1"></i> Edit
                </a>
                <a href="{{ route('paket-soal.duplicate', $paketSoal) }}" class="btn btn-secondary btn-sm">
                    <i class="fas fa-copy me-1"></i> Duplikasi
                </a>
                <a href="{{ route('paket-soal.index') }}" class="btn btn-outline-secondary btn-sm">
                    <i class="fas fa-arrow-left me-1"></i> Kembali
                </a>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-8">
                <div class="mb-4">
                    <h4>{{ $paketSoal->name }}</h4>
                    @if($paketSoal->description)
                        <p class="text-muted">{{ $paketSoal->description }}</p>
                    @endif
                </div>
                
                <h6 class="fw-bold mb-3">Daftar Soal ({{ $paketSoal->total_soal }} soal)</h6>
                <div class="table-responsive">
                    <table class="table table-striped table-hover">
                        <thead>
                            <tr>
                                <th width="50">No</th>
                                <th>Soal</th>
                                <th width="100">Tipe</th>
                                <th width="80">Skor</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($paketSoal->items as $item)
                                <tr>
                                    <td>{{ $loop->iteration }}</td>
                                    <td>
                                        <div>{{ Str::limit($item->question->question_text ?? '', 150) }}</div>
                                        <small class="text-muted">
                                            <span class="badge badge-{{ strtolower($item->question->level_c ?? '') }}">
                                                {{ $item->question->level_c ?? '-' }}
                                            </span>
                                            {{ $item->question->subject->name ?? '-' }}
                                        </small>
                                    </td>
                                    <td>
                                        <span class="badge bg-primary">
                                            {{ $item->question->type_label ?? '-' }}
                                        </span>
                                    </td>
                                    <td>{{ $item->score }}</td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="4" class="text-center text-muted">Belum ada soal dalam paket ini.</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="col-md-4">
                <div class="card bg-light">
                    <div class="card-body">
                        <h6 class="fw-bold mb-3">Informasi Paket</h6>
                        <hr>
                        
                        <div class="mb-2">
                            <small class="text-muted d-block">Jenjang</small>
                            <span class="fw-bold">{{ $paketSoal->jenjang }}</span>
                        </div>
                        
                        <div class="mb-2">
                            <small class="text-muted d-block">Kurikulum</small>
                            <span class="badge {{ $paketSoal->curriculum === 'merdeka' ? 'badge-merdeka' : 'badge-kbc' }}">
                                {{ $paketSoal->curriculum_label }}
                            </span>
                        </div>
                        
                        <div class="mb-2">
                            <small class="text-muted d-block">Total Soal</small>
                            <span class="fw-bold">{{ $paketSoal->total_soal }}</span>
                        </div>
                        
                        <div class="mb-2">
                            <small class="text-muted d-block">Durasi</small>
                            <span class="fw-bold">{{ $paketSoal->duration_minutes ? $paketSoal->duration_minutes . ' menit' : 'Tidak terbatas' }}</span>
                        </div>
                        
                        <div class="mb-2">
                            <small class="text-muted d-block">Status</small>
                            <span class="badge bg-{{ $paketSoal->status_badge }}">
                                {{ $paketSoal->status_label }}
                            </span>
                        </div>
                        
                        <div class="mb-2">
                            <small class="text-muted d-block">Dibuat oleh</small>
                            <span class="fw-bold">{{ $paketSoal->creator->name ?? '-' }}</span>
                        </div>
                        
                        <div class="mb-2">
                            <small class="text-muted d-block">Dibuat pada</small>
                            <span class="fw-bold">{{ $paketSoal->created_at->format('d M Y H:i') }}</span>
                        </div>
                        
                        @if($paketSoal->updated_at && $paketSoal->updated_at != $paketSoal->created_at)
                            <div>
                                <small class="text-muted d-block">Terakhir diubah</small>
                                <span class="fw-bold">{{ $paketSoal->updated_at->format('d M Y H:i') }}</span>
                            </div>
                        @endif
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection