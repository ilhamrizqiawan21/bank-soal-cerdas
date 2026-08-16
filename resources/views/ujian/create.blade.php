@extends('layouts.app')

@section('title', 'Buat Ujian')
@section('breadcrumb', 'Buat Ujian')

@section('content')
<div class="container-fluid">
    <div class="stat-card">
        <h5 class="fw-bold mb-4">Buat Ujian Baru</h5>
        
        <form action="{{ route('ujian.store') }}" method="POST">
            @csrf
            
            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label fw-bold">Judul Ujian <span class="text-danger">*</span></label>
                        <input type="text" name="title" class="form-control @error('title') is-invalid @enderror" 
                               value="{{ old('title') }}" placeholder="Contoh: UTS Matematika Kelas 9" required>
                        @error('title')
                            <small class="text-danger">{{ $message }}</small>
                        @enderror
                    </div>
                    
                    <div class="mb-3">
                        <label class="form-label fw-bold">Paket Soal <span class="text-danger">*</span></label>
                        <select name="paket_soal_id" class="form-select @error('paket_soal_id') is-invalid @enderror" required>
                            <option value="">Pilih Paket Soal</option>
                            @foreach($paketSoal as $paket)
                                <option value="{{ $paket->id }}" {{ old('paket_soal_id') == $paket->id ? 'selected' : '' }}>
                                    {{ $paket->name }} ({{ $paket->total_soal }} soal)
                                </option>
                            @endforeach
                        </select>
                        @error('paket_soal_id')
                            <small class="text-danger">{{ $message }}</small>
                        @enderror
                    </div>
                    
                    <div class="mb-3">
                        <label class="form-label fw-bold">Siswa <span class="text-danger">*</span></label>
                        <select name="siswa_id" class="form-select @error('siswa_id') is-invalid @enderror" required>
                            <option value="">Pilih Siswa</option>
                            @foreach($siswa as $s)
                                <option value="{{ $s->id }}" {{ old('siswa_id') == $s->id ? 'selected' : '' }}>
                                    {{ $s->name }} ({{ $s->email }})
                                </option>
                            @endforeach
                        </select>
                        @error('siswa_id')
                            <small class="text-danger">{{ $message }}</small>
                        @enderror
                    </div>
                </div>
                
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label fw-bold">Durasi (Menit)</label>
                        <input type="number" name="duration_minutes" class="form-control @error('duration_minutes') is-invalid @enderror" 
                               value="{{ old('duration_minutes') }}" placeholder="90" min="1" max="180">
                        <small class="text-muted">Kosongkan untuk mengikuti durasi paket soal</small>
                        @error('duration_minutes')
                            <small class="text-danger">{{ $message }}</small>
                        @enderror
                    </div>
                    
                    <div class="mb-3">
                        <label class="form-label fw-bold">Deskripsi</label>
                        <textarea name="description" class="form-control @error('description') is-invalid @enderror" 
                                  rows="3">{{ old('description') }}</textarea>
                        @error('description')
                            <small class="text-danger">{{ $message }}</small>
                        @enderror
                    </div>
                </div>
            </div>
            
            <hr>
            
            <div class="d-flex gap-2">
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save me-1"></i> Simpan Ujian
                </button>
                <a href="{{ route('ujian.index') }}" class="btn btn-outline-secondary">
                    <i class="fas fa-times me-1"></i> Batal
                </a>
            </div>
        </form>
    </div>
</div>
@endsection