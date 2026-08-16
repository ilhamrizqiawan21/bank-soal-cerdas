<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Bank Soal Cerdas - @yield('title', 'Dashboard')</title>
    
    <!-- Vite -->
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    
    @stack('styles')
</head>
<body x-data="sidebar()" :class="{'sidebar-collapsed': !open}">
    <div id="app">
        <!-- ============ SIDEBAR ============ -->
        <aside class="sidebar" x-show="open" x-transition>
            <div class="p-4">
                <h5 class="text-white fw-bold">Bank Soal Cerdas</h5>
                <hr class="border-secondary">
                <p class="text-white-50 small">v1.0</p>
            </div>
            <nav class="mt-3">
                <a href="{{ route('dashboard') }}" 
                class="nav-link d-flex align-items-center {{ request()->routeIs('dashboard') ? 'active' : '' }}">
                    <i class="fas fa-chart-pie me-3"></i> Dashboard
                </a>
                <a href="{{ route('questions.index') }}" 
                class="nav-link d-flex align-items-center {{ request()->routeIs('questions.*') ? 'active' : '' }}">
                    <i class="fas fa-database me-3"></i> Bank Soal
                </a>
                <a href="{{ route('paket-soal.index') }}" 
                class="nav-link d-flex align-items-center {{ request()->routeIs('paket-soal.*') ? 'active' : '' }}">
                    <i class="fas fa-box me-3"></i> Paket Soal
                </a>
                <a href="{{ route('settings.index') }}" 
                class="nav-link d-flex align-items-center {{ request()->routeIs('settings.*') ? 'active' : '' }}">
                    <i class="fas fa-cog me-3"></i> Pengaturan
                </a>
            </nav>
        </aside>
        
        <!-- ============ MAIN CONTENT ============ -->
        <main class="main-content">
            <!-- ===== HEADER ===== -->
            <header class="header d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                    <!-- Toggle Sidebar (Mobile) -->
                    <button class="btn btn-light btn-sm d-md-none me-2" @click="toggle()">
                        <i class="fas fa-bars"></i>
                    </button>
                    
                    <!-- Breadcrumb -->
                    <nav aria-label="breadcrumb">
                        <ol class="breadcrumb mb-0">
                            <li class="breadcrumb-item">
                                <a href="{{ route('dashboard') }}" class="text-decoration-none">Dashboard</a>
                            </li>
                            <li class="breadcrumb-item active">@yield('breadcrumb', 'Halaman')</li>
                        </ol>
                    </nav>
                </div>
                
                <div class="d-flex align-items-center gap-3">
                    @auth
                        <!-- Tombol Tambah Soal -->
                        <a href="{{ route('questions.create') }}" class="btn btn-primary btn-sm">
                            <i class="fas fa-plus me-1"></i> Tambah Soal
                        </a>
                        
                        <!-- Dropdown User -->
                        <div class="dropdown">
                            <button class="btn btn-link text-dark text-decoration-none dropdown-toggle" 
                                    data-bs-toggle="dropdown" 
                                    aria-expanded="false">
                                <i class="fas fa-user-circle fa-lg"></i>
                                <span class="ms-1 d-none d-sm-inline">{{ Auth::user()->name }}</span>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-end">
                                <li>
                                    <a class="dropdown-item" href="#">
                                        <i class="fas fa-user me-2"></i> Profile
                                    </a>
                                </li>
                                <li><hr class="dropdown-divider"></li>
                                <li>
                                    <a class="dropdown-item text-danger" href="{{ route('logout') }}"
                                       onclick="event.preventDefault(); document.getElementById('logout-form').submit();">
                                        <i class="fas fa-sign-out-alt me-2"></i> Logout
                                    </a>
                                    <form id="logout-form" action="{{ route('logout') }}" method="POST" class="d-none">
                                        @csrf
                                    </form>
                                </li>
                            </ul>
                        </div>
                    @else
                        <a href="{{ route('login') }}" class="btn btn-outline-primary btn-sm">Login</a>
                        <a href="{{ route('register') }}" class="btn btn-primary btn-sm">Register</a>
                    @endauth
                </div>
            </header>
            
            <!-- ===== CONTENT AREA ===== -->
            <div class="p-4">
                <!-- Flash Messages -->
                @if(session('success'))
                    <div class="alert alert-success alert-dismissible fade show" role="alert">
                        <i class="fas fa-check-circle me-2"></i> {{ session('success') }}
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>
                @endif
                
                @if(session('error'))
                    <div class="alert alert-danger alert-dismissible fade show" role="alert">
                        <i class="fas fa-exclamation-circle me-2"></i> {{ session('error') }}
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>
                @endif
                
                @if($errors->any())
                    <div class="alert alert-danger alert-dismissible fade show" role="alert">
                        <i class="fas fa-exclamation-circle me-2"></i> 
                        @foreach($errors->all() as $error)
                            <div>{{ $error }}</div>
                        @endforeach
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>
                @endif
                
                @yield('content')
            </div>
        </main>
    </div>
    
    @stack('scripts')
</body>
</html>