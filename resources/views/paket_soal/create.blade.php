@extends('layouts.app')

@section('title', 'Buat Paket Soal')
@section('breadcrumb', 'Buat Paket Soal')
@section('breadcrumb_parent', 'Paket Soal')
@section('breadcrumb_parent_url', '{{ route(\'paket-soal.index\') }}')

@section('content')
<div class="container-fluid">
    <div class="stat-card">
        <h5 class="fw-bold mb-4">Buat Paket Soal Baru</h5>
        
        <form action="{{ route('paket-soal.store') }}" method="POST" id="paketForm">
            @csrf
            
            <!-- Informasi Paket -->
            <div class="row mb-3">
                <div class="col-md-6">
                    <label class="form-label fw-bold">Nama Paket <span class="text-danger">*</span></label>
                    <input type="text" name="name" class="form-control @error('name') is-invalid @enderror" 
                           value="{{ old('name') }}" placeholder="Contoh: UTS Matematika Kelas 9" required>
                    @error('name')
                        <small class="text-danger">{{ $message }}</small>
                    @enderror
                </div>
                <div class="col-md-6">
                    <label class="form-label fw-bold">Durasi (Menit)</label>
                    <input type="number" name="duration_minutes" class="form-control @error('duration_minutes') is-invalid @enderror" 
                           value="{{ old('duration_minutes') }}" placeholder="90" min="1" max="180">
                    @error('duration_minutes')
                        <small class="text-danger">{{ $message }}</small>
                    @enderror
                </div>
            </div>
            
            <div class="row mb-3">
                <div class="col-md-4">
                    <label class="form-label fw-bold">Jenjang <span class="text-danger">*</span></label>
                    <select name="jenjang" class="form-select @error('jenjang') is-invalid @enderror" required>
                        <option value="">Pilih Jenjang</option>
                        <option value="SD" {{ old('jenjang') == 'SD' ? 'selected' : '' }}>SD</option>
                        <option value="SMP" {{ old('jenjang') == 'SMP' ? 'selected' : '' }}>SMP</option>
                        <option value="SMA" {{ old('jenjang') == 'SMA' ? 'selected' : '' }}>SMA</option>
                    </select>
                    @error('jenjang')
                        <small class="text-danger">{{ $message }}</small>
                    @enderror
                </div>
                <div class="col-md-4">
                    <label class="form-label fw-bold">Kurikulum <span class="text-danger">*</span></label>
                    <select name="curriculum" class="form-select @error('curriculum') is-invalid @enderror" required>
                        <option value="">Pilih Kurikulum</option>
                        <option value="merdeka" {{ old('curriculum') == 'merdeka' ? 'selected' : '' }}>Merdeka</option>
                        <option value="kbc" {{ old('curriculum') == 'kbc' ? 'selected' : '' }}>KBC</option>
                        <option value="both" {{ old('curriculum') == 'both' ? 'selected' : '' }}>Merdeka & KBC</option>
                    </select>
                    @error('curriculum')
                        <small class="text-danger">{{ $message }}</small>
                    @enderror
                </div>
                <div class="col-md-4">
                    <label class="form-label fw-bold">Status</label>
                    <select name="status" class="form-select">
                        <option value="draft" {{ old('status') == 'draft' ? 'selected' : '' }}>Draft</option>
                        <option value="published" {{ old('status') == 'published' ? 'selected' : '' }}>Published</option>
                        <option value="archived" {{ old('status') == 'archived' ? 'selected' : '' }}>Archived</option>
                    </select>
                </div>
            </div>
            
            <div class="mb-3">
                <label class="form-label fw-bold">Deskripsi</label>
                <textarea name="description" class="form-control @error('description') is-invalid @enderror" 
                          rows="2" placeholder="Deskripsi paket soal...">{{ old('description') }}</textarea>
                @error('description')
                    <small class="text-danger">{{ $message }}</small>
                @enderror
            </div>
            
            <hr>
            
            <!-- Pilih Soal -->
            <div class="mb-3">
                <label class="form-label fw-bold">Pilih Soal <span class="text-danger">*</span></label>
                <div class="alert alert-info">
                    <i class="fas fa-info-circle me-2"></i> Pilih minimal 1 soal untuk dimasukkan ke paket.
                </div>
                
                <div class="table-responsive">
                    <table class="table table-bordered table-hover">
                        <thead>
                            <tr>
                                <th width="50"><input type="checkbox" id="selectAll"></th>
                                <th>Soal</th>
                                <th width="120">Mapel</th>
                                <th width="100">Level</th>
                                <th width="100">KKO</th>
                                <th width="80">Skor</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($questions as $question)
                                <tr>
                                    <td class="text-center">
                                        <input type="checkbox" name="questions[]" value="{{ $question->id }}" 
                                               class="question-checkbox" data-id="{{ $question->id }}">
                                    </td>
                                    <td>
                                        <div>{{ Str::limit($question->question_text, 100) }}</div>
                                        <small class="text-muted">
                                            <span class="badge {{ $question->curriculum === 'merdeka' ? 'badge-merdeka' : 'badge-kbc' }}">
                                                {{ $question->curriculum_label }}
                                            </span>
                                            <span class="badge badge-{{ strtolower($question->level_c) }}">
                                                {{ $question->level_c }}
                                            </span>
                                            <span class="badge {{ $question->type === 'pg' ? 'bg-primary' : 'bg-secondary' }}">
                                                {{ $question->type_label }}
                                            </span>
                                        </small>
                                    </td>
                                    <td>{{ $question->subject->name ?? '-' }}</td>
                                    <td>
                                        <span class="badge badge-{{ strtolower($question->level_c) }}">
                                            {{ $question->level_c }}
                                        </span>
                                    </td>
                                    <td>{{ $question->kko->verb ?? '-' }}</td>
                                    <td>
                                        <input type="number" name="scores[]" class="form-control form-control-sm" 
                                               value="1" min="1" max="100" style="width:70px">
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="6" class="text-center py-3 text-muted">
                                        Belum ada soal. <a href="{{ route('questions.create') }}">Buat soal</a> terlebih dahulu.
                                    </td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
                @error('questions')
                    <small class="text-danger">{{ $message }}</small>
                @enderror
            </div>
            
            <div class="d-flex gap-2">
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save me-1"></i> Simpan Paket
                </button>
                <a href="{{ route('paket-soal.index') }}" class="btn btn-outline-secondary">
                    <i class="fas fa-times me-1"></i> Batal
                </a>
            </div>
        </form>
    </div>
</div>
@endsection
