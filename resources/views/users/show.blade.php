@extends('layouts.app')

@section('title', 'Detail Pengguna')
@section('breadcrumb', 'Detail Pengguna')
@section('breadcrumb_parent', 'Manajemen Pengguna')
@section('breadcrumb_parent_url', '{{ route(\'users.index\') }}')

@section('content')
<div class="container-fluid">
    <div class="stat-card">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h5 class="fw-bold mb-0">Detail Pengguna</h5>
            <div>
                <a href="{{ route('users.edit', $user) }}" class="btn btn-warning btn-sm">
                    <i class="fas fa-edit me-1"></i> Edit
                </a>
                <a href="{{ route('users.index') }}" class="btn btn-secondary btn-sm">
                    <i class="fas fa-arrow-left me-1"></i> Kembali
                </a>
            </div>
        </div>
        
        <div class="row">
            <!-- Profil -->
            <div class="col-md-4">
                <div class="card bg-light">
                    <div class="card-body text-center">
                        @if($user->avatar)
                            <img src="{{ asset('storage/' . $user->avatar) }}" 
                                 alt="{{ $user->name }}" 
                                 class="rounded-circle mb-3" 
                                 width="120" height="120">
                        @else
                            <div class="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" 
                                 style="width:120px;height:120px;font-size:48px;">
                                {{ strtoupper(substr($user->name, 0, 1)) }}
                            </div>
                        @endif
                        <h5 class="fw-bold">{{ $user->name }}</h5>
                        <span class="badge bg-{{ $user->role_badge }} mb-2">
                            {{ $user->role_label }}
                        </span>
                        <span class="badge bg-{{ $user->status_badge }}">
                            {{ $user->status_label }}
                        </span>
                    </div>
                </div>
            </div>
            
            <!-- Informasi -->
            <div class="col-md-8">
                <div class="card">
                    <div class="card-body">
                        <h6 class="fw-bold mb-3">Informasi Pengguna</h6>
                        <hr>
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-2">
                                    <small class="text-muted d-block">Email</small>
                                    <span class="fw-bold">{{ $user->email }}</span>
                                </div>
                                
                                <div class="mb-2">
                                    <small class="text-muted d-block">NIP</small>
                                    <span class="fw-bold">{{ $user->nip ?? '-' }}</span>
                                </div>
                                
                                <div class="mb-2">
                                    <small class="text-muted d-block">No. Telepon</small>
                                    <span class="fw-bold">{{ $user->phone ?? '-' }}</span>
                                </div>
                            </div>
                            
                            <div class="col-md-6">
                                <div class="mb-2">
                                    <small class="text-muted d-block">Jenis Kelamin</small>
                                    <span class="fw-bold">{{ $user->gender_label }}</span>
                                </div>
                                
                                <div class="mb-2">
                                    <small class="text-muted d-block">Tanggal Lahir</small>
                                    <span class="fw-bold">{{ $user->birth_date ? $user->birth_date->format('d M Y') : '-' }}</span>
                                </div>
                                
                                <div class="mb-2">
                                    <small class="text-muted d-block">Terakhir Login</small>
                                    <span class="fw-bold">{{ $user->last_login_at ? $user->last_login_at->format('d M Y H:i') : 'Belum pernah' }}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mt-2">
                            <small class="text-muted d-block">Alamat</small>
                            <span class="fw-bold">{{ $user->address ?? '-' }}</span>
                        </div>
                    </div>
                </div>
                
                <!-- Statistik -->
                <div class="row mt-3">
                    <div class="col-md-6">
                        <div class="card bg-primary text-white">
                            <div class="card-body">
                                <h6 class="text-white-50">Total Soal Dibuat</h6>
                                <h3 class="fw-bold">{{ $user->questions->count() }}</h3>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card bg-success text-white">
                            <div class="card-body">
                                <h6 class="text-white-50">Total Paket Dibuat</h6>
                                <h3 class="fw-bold">{{ $user->paketSoal->count() }}</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection