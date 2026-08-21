@extends('layouts.app')

@section('title', 'Edit Mata Pelajaran')
@section('breadcrumb', 'Edit Mata Pelajaran')
@section('breadcrumb_parent', 'Mata Pelajaran')
@section('breadcrumb_parent_url', route('subjects.index'))

@section('content')
<div class="container-fluid">
    <div class="stat-card">
        <h5 class="fw-bold mb-4">Edit Mata Pelajaran</h5>
        <form action="{{ route('subjects.update', $subject) }}" method="POST">
            @csrf
            @method('PUT')
            <div class="mb-3">
                <label class="form-label fw-bold">Nama Mata Pelajaran <span class="text-danger">*</span></label>
                <input type="text" name="name" value="{{ old('name', $subject->name) }}" class="form-control @error('name') is-invalid @enderror" required maxlength="255">
                @error('name')<div class="invalid-feedback">{{ $message }}</div>@enderror
            </div>
            <div class="mb-4">
                <label class="form-label fw-bold">Kode</label>
                <input type="text" name="code" value="{{ old('code', $subject->code) }}" class="form-control @error('code') is-invalid @enderror" maxlength="10">
                @error('code')<div class="invalid-feedback">{{ $message }}</div>@enderror
            </div>
            <button type="submit" class="btn btn-primary"><i class="fas fa-save me-1"></i> Simpan Perubahan</button>
            <a href="{{ route('subjects.index') }}" class="btn btn-outline-secondary">Batal</a>
        </form>
    </div>
</div>
@endsection
