@extends('layouts.app')

@section('title', 'Edit Ujian')
@section('breadcrumb', 'Edit Ujian')

@section('content')
<div class="container-fluid">
    <div class="stat-card">
        <h5 class="fw-bold mb-4">Edit Ujian</h5>
        
        <form action="{{ route('ujian.update', $ujian) }}" method="POST">
            @csrf
            @method('PUT')
            
            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label fw-bold">Judul Ujian <span class="text-danger">*</span></label>
                        <input type="text" name="title" class="form-control @error('title') is-invalid @enderror" 
                               value="{{ old('title', $ujian->title) }}" required>
                        @error('title')
                            <small class="text-danger">{{ $message }}</small>
                        @enderror
                    </div>
                    
                    <div class="mb-3">
                        <label class="form-label fw-bold">Paket Soal</label>
                        <select name="paket_soal_id" class="form-select" disabled>
                            <option value="{{ $ujian->paket_soal_id }}">
                                {{ $ujian->paketSoal->name ?? '-' }} ({{ $ujian->total_soal }} soal)
                            </option>
                        </select>
                        <small class="text-muted">Paket soal tidak dapat diubah setelah ujian dibuat</small>
                    </div>
                    
                    <div class="mb-3">
                        <label class="form-label fw-bold">Siswa</label>
                        <select name="siswa_id" class="form-select" disabled>
                            <option value="{{ $ujian->siswa_id }}">
                                {{ $ujian->siswa->name ?? '-' }}
                            </option>
                        </select>
                        <small class="text-muted">Siswa tidak dapat diubah setelah ujian dibuat</small>
                    </div>
                </div>
                
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label fw-bold">Durasi (Menit)</label>
                        <input type="number" name="duration_minutes" class="form-control @error('duration_minutes') is-invalid @enderror" 
                               value="{{ old('duration_minutes', $ujian->duration_minutes) }}" min="1" max="180">
                        @error('duration_minutes')
                            <small class="text-danger">{{ $message }}</small>
                        @enderror
                    </div>
                    
                    <div class="mb-3">
                        <label class="form-label fw-bold">Status</label>
                        <select name="status" class="form-select @error('status') is-invalid @enderror">
                            <option value="draft" {{ old('status', $ujian->status) == 'draft' ? 'selected' : '' }}>Draft</option>
                            <option value="active" {{ old('status', $ujian->status) == 'active' ? 'selected' : '' }}>Aktif</option>
                            <option value="finished" {{ old('status', $ujian->status) == 'finished' ? 'selected' : '' }}>Selesai</option>
                            <option value="expired" {{ old('status', $ujian->status) == 'expired' ? 'selected' : '' }}>Kadaluarsa</option>
                        </select>
                        @error('status')
                            <small class="text-danger">{{ $message }}</small>
                        @enderror
                    </div>
                    
                    <div class="mb-3">
                        <label class="form-label fw-bold">Deskripsi</label>
                        <textarea name="description" class="form-control @error('description') is-invalid @enderror" 
                                  rows="2">{{ old('description', $ujian->description) }}</textarea>
                        @error('description')
                            <small class="text-danger">{{ $message }}</small>
                        @enderror
                    </div>
                </div>
            </div>
            
            <hr>
            
            <div class="d-flex gap-2">
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save me-1"></i> Update Ujian
                </button>
                <a href="{{ route('ujian.index') }}" class="btn btn-outline-secondary">
                    <i class="fas fa-times me-1"></i> Batal
                </a>
            </div>
        </form>
    </div>
</div>
@endsection