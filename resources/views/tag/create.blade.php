@extends('layouts.app')

@section('title', 'Tambah Tag')
@section('breadcrumb', 'Tambah Tag')

@section('content')
<div class="container-fluid">
    <div class="stat-card">
        <h5 class="fw-bold mb-4">Tambah Tag Baru</h5>
        
        <form action="{{ route('tag.store') }}" method="POST">
            @csrf
            
            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label fw-bold">Nama Tag <span class="text-danger">*</span></label>
                        <input type="text" name="name" class="form-control @error('name') is-invalid @enderror" 
                               value="{{ old('name') }}" required>
                        <small class="text-muted">Contoh: Mudah, Sulit, Ujian Nasional, HOTS</small>
                        @error('name')
                            <small class="text-danger">{{ $message }}</small>
                        @enderror
                    </div>
                </div>
                
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label fw-bold">Warna <span class="text-danger">*</span></label>
                        <div class="input-group">
                            <input type="color" name="color" class="form-control @error('color') is-invalid @enderror" 
                                   value="{{ old('color', '#6c757d') }}" style="width: 60px; padding: 5px;">
                            <input type="text" id="colorHex" class="form-control" value="{{ old('color', '#6c757d') }}" readonly>
                        </div>
                        <small class="text-muted">Pilih warna untuk tag</small>
                        @error('color')
                            <small class="text-danger">{{ $message }}</small>
                        @enderror
                    </div>
                </div>
            </div>
            
            <hr>
            
            <div class="d-flex gap-2">
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save me-1"></i> Simpan
                </button>
                <a href="{{ route('tag.index') }}" class="btn btn-outline-secondary">
                    <i class="fas fa-times me-1"></i> Batal
                </a>
            </div>
        </form>
    </div>
</div>
@endsection
