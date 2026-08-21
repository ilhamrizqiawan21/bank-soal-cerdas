@extends('layouts.app')

@section('title', 'Tambah Mata Pelajaran')
@section('breadcrumb', 'Tambah Mata Pelajaran')
@section('breadcrumb_parent', 'Mata Pelajaran')
@section('breadcrumb_parent_url', route('subjects.index'))

@section('content')
<div class="container-fluid">
    <div class="stat-card">
        <h5 class="fw-bold mb-4">Tambah Mata Pelajaran</h5>
        <form action="{{ route('subjects.store') }}" method="POST">
            @csrf
            <div class="mb-3">
                <label class="form-label fw-bold">Nama Mata Pelajaran <span class="text-danger">*</span></label>
                <input type="text" name="name" value="{{ old('name') }}" class="form-control @error('name') is-invalid @enderror" required maxlength="255" placeholder="Contoh: Matematika">
                @error('name')<div class="invalid-feedback">{{ $message }}</div>@enderror
            </div>
            <div class="mb-4">
                <label class="form-label fw-bold">Kode</label>
                <input type="text" name="code" value="{{ old('code') }}" class="form-control @error('code') is-invalid @enderror" maxlength="10" placeholder="Contoh: MTK">
                @error('code')<div class="invalid-feedback">{{ $message }}</div>@enderror
            </div>
            <button type="submit" class="btn btn-primary"><i class="fas fa-save me-1"></i> Simpan</button>
            <a href="{{ route('subjects.index') }}" class="btn btn-outline-secondary">Batal</a>
        </form>
    </div>
</div>
@endsection
