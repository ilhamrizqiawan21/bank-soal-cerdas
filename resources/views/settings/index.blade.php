@extends('layouts.app')

@section('title', 'Pengaturan')
@section('breadcrumb', 'Pengaturan')

@section('content')
<div class="container-fluid">
    <div class="row">
        <!-- Profil -->
        <div class="col-md-6 mb-4">
            <div class="stat-card">
                <h5 class="fw-bold mb-4">Profil</h5>
                
                @if(session('success'))
                    <div class="alert alert-success alert-dismissible fade show">
                        {{ session('success') }}
                        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                    </div>
                @endif
                
                <form action="{{ route('settings.profile') }}" method="POST">
                    @csrf
                    @method('PUT')
                    
                    <div class="mb-3">
                        <label class="form-label fw-bold">Nama</label>
                        <input type="text" name="name" class="form-control @error('name') is-invalid @enderror" 
                               value="{{ old('name', $user->name) }}" required>
                        @error('name')
                            <small class="text-danger">{{ $message }}</small>
                        @enderror
                    </div>
                    
                    <div class="mb-3">
                        <label class="form-label fw-bold">Email</label>
                        <input type="email" name="email" class="form-control @error('email') is-invalid @enderror" 
                               value="{{ old('email', $user->email) }}" required>
                        @error('email')
                            <small class="text-danger">{{ $message }}</small>
                        @enderror
                    </div>
                    
                    <div class="mb-3">
                        <label class="form-label fw-bold">Role</label>
                        <input type="text" class="form-control" value="{{ ucfirst($user->role) }}" disabled>
                        <small class="text-muted">Role tidak dapat diubah di pengaturan ini.</small>
                    </div>
                    
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save me-1"></i> Update Profil
                    </button>
                </form>
            </div>
        </div>
        
        <!-- Password -->
        <div class="col-md-6 mb-4">
            <div class="stat-card">
                <h5 class="fw-bold mb-4">Ubah Password</h5>
                
                <form action="{{ route('settings.password') }}" method="POST">
                    @csrf
                    @method('PUT')
                    
                    <div class="mb-3">
                        <label class="form-label fw-bold">Password Saat Ini</label>
                        <input type="password" name="current_password" class="form-control @error('current_password') is-invalid @enderror" required>
                        @error('current_password')
                            <small class="text-danger">{{ $message }}</small>
                        @enderror
                    </div>
                    
                    <div class="mb-3">
                        <label class="form-label fw-bold">Password Baru</label>
                        <input type="password" name="password" class="form-control @error('password') is-invalid @enderror" required>
                        @error('password')
                            <small class="text-danger">{{ $message }}</small>
                        @enderror
                    </div>
                    
                    <div class="mb-3">
                        <label class="form-label fw-bold">Konfirmasi Password Baru</label>
                        <input type="password" name="password_confirmation" class="form-control" required>
                    </div>
                    
                    <button type="submit" class="btn btn-warning">
                        <i class="fas fa-key me-1"></i> Ubah Password
                    </button>
                </form>
            </div>
        </div>
        
        <!-- Informasi Sistem -->
        <div class="col-12">
            <div class="stat-card">
                <h5 class="fw-bold mb-4">Informasi Sistem</h5>
                <div class="row">
                    <div class="col-md-3 mb-2">
                        <small class="text-muted d-block">Aplikasi</small>
                        <span class="fw-bold">Bank Soal Cerdas</span>
                    </div>
                    <div class="col-md-3 mb-2">
                        <small class="text-muted d-block">Versi</small>
                        <span class="fw-bold">1.0.0</span>
                    </div>
                    <div class="col-md-3 mb-2">
                        <small class="text-muted d-block">Laravel</small>
                        <span class="fw-bold">{{ app()->version() }}</span>
                    </div>
                    <div class="col-md-3 mb-2">
                        <small class="text-muted d-block">PHP</small>
                        <span class="fw-bold">{{ phpversion() }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection