@extends('layouts.app')

@section('title', 'Detail Soal')
@section('breadcrumb', 'Detail Soal')

@section('content')
<div class="container-fluid">
    <div class="stat-card">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h5 class="fw-bold mb-0">Detail Soal</h5>
            <div>
                <a href="{{ route('questions.edit', $question) }}" class="btn btn-warning btn-sm">
                    <i class="fas fa-edit me-1"></i> Edit
                </a>
                <a href="{{ route('questions.index') }}" class="btn btn-secondary btn-sm">
                    <i class="fas fa-arrow-left me-1"></i> Kembali
                </a>
            </div>
        </div>
        
        <div class="row">
            <!-- KOLOM KIRI: Konten Soal -->
            <div class="col-md-8">
                <!-- Teks Soal -->
                <div class="mb-4">
                    <label class="fw-bold text-muted small text-uppercase">Teks Soal</label>
                    <div class="p-3 bg-light rounded mt-1">
                        {{ $question->question_text }}
                    </div>
                </div>
                
                <!-- Jawaban -->
                <div class="mb-4">
                    <label class="fw-bold text-muted small text-uppercase">Jawaban</label>
                    <div class="p-3 bg-light rounded mt-1">
                        @switch($question->type)
                            @case('pg')
                                @foreach($question->pgOptions as $option)
                                    <div class="mb-1">
                                        <strong>{{ $option->label }}.</strong> {{ $option->option_text }}
                                        @if($option->is_correct)
                                            <span class="badge bg-success ms-2"><i class="fas fa-check me-1"></i>Benar</span>
                                        @endif
                                    </div>
                                @endforeach
                                @break
                                
                            @case('uraian')
                                <div class="mb-1">
                                    <strong>Kunci Jawaban / Rubrik:</strong>
                                    <div class="mt-1">{{ $question->essayRubric->rubric_text ?? 'Tidak ada rubrik' }}</div>
                                </div>
                                @break
                                
                            @case('menjodohkan')
                                <table class="table table-sm table-bordered mb-0">
                                    <thead>
                                        <tr>
                                            <th>Pernyataan</th>
                                            <th>Pasangan</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        @foreach($question->matchingPairs as $pair)
                                            <tr>
                                                <td>{{ $pair->left_text }}</td>
                                                <td>{{ $pair->right_text }}</td>
                                            </tr>
                                        @endforeach
                                    </tbody>
                                </table>
                                @break
                                
                            @case('benar_salah')
                                <span class="badge {{ $question->correct_boolean ? 'bg-success' : 'bg-danger' }} p-2 fs-6">
                                    <i class="fas {{ $question->correct_boolean ? 'fa-check' : 'fa-times' }} me-2"></i>
                                    {{ $question->correct_boolean ? 'Benar' : 'Salah' }}
                                </span>
                                @break
                        @endswitch
                    </div>
                </div>
                
                <!-- Indikator Soal -->
                @if($question->indicator_text)
                    <div class="mb-4">
                        <label class="fw-bold text-muted small text-uppercase">Indikator Soal</label>
                        <div class="p-3 bg-light rounded mt-1">
                            {{ $question->indicator_text }}
                        </div>
                    </div>
                @endif
            </div>
            
            <!-- KOLOM KANAN: Informasi Soal -->
            <div class="col-md-4">
                <div class="card bg-light">
                    <div class="card-body">
                        <h6 class="fw-bold mb-3">Informasi Soal</h6>
                        <hr>
                        
                        <div class="mb-2">
                            <small class="text-muted d-block">Mata Pelajaran</small>
                            <span class="fw-bold">{{ $question->subject->name ?? '-' }}</span>
                        </div>
                        
                        <div class="mb-2">
                            <small class="text-muted d-block">Jenjang</small>
                            <span class="fw-bold">{{ $question->jenjang }}</span>
                        </div>
                        
                        <div class="mb-2">
                            <small class="text-muted d-block">Kurikulum</small>
                            <span class="badge {{ $question->curriculum === 'merdeka' ? 'badge-merdeka' : 'badge-kbc' }}">
                                {{ $question->curriculum_label }}
                            </span>
                        </div>
                        
                        <div class="mb-2">
                            <small class="text-muted d-block">Tipe Soal</small>
                            <span class="fw-bold">{{ ucfirst($question->type_label) }}</span>
                        </div>
                        
                        <div class="mb-2">
                            <small class="text-muted d-block">Level Kognitif</small>
                            <div>
                                <span class="badge badge-{{ strtolower($question->level_c) }}">
                                    {{ $question->level_c }}
                                </span>
                                <span class="badge {{ $question->hots_level === 'HOTS' ? 'bg-danger' : 'bg-info' }} text-white">
                                    {{ $question->hots_level }}
                                </span>
                            </div>
                        </div>
                        
                        <div class="mb-2">
                            <small class="text-muted d-block">KKO</small>
                            <span class="fw-bold">{{ $question->kko->verb ?? '-' }}</span>
                            <small class="text-muted">({{ $question->kko->level ?? '-' }})</small>
                        </div>
                        
                        <div class="mb-2">
                            <small class="text-muted d-block">Dibuat oleh</small>
                            <span class="fw-bold">{{ $question->creator->name ?? '-' }}</span>
                        </div>
                        
                        <div class="mb-2">
                            <small class="text-muted d-block">Dibuat pada</small>
                            <span class="fw-bold">{{ $question->created_at->format('d M Y H:i') }}</span>
                        </div>
                        
                        @if($question->updated_at && $question->updated_at != $question->created_at)
                            <div>
                                <small class="text-muted d-block">Terakhir diubah</small>
                                <span class="fw-bold">{{ $question->updated_at->format('d M Y H:i') }}</span>
                            </div>
                        @endif
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
