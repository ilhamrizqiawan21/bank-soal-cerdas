<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link rel="icon" type="image/x-icon" href="{{ asset('images/favicon.ico') }}">
    <link rel="icon" type="image/png" sizes="512x512" href="{{ asset('images/android-chrome-512x512.png') }}">
    <title>Bank Soal - @yield('title', 'Dashboard')</title>
    
    <!-- Vite -->
    @vite(['resources/sass/app.scss', 'resources/js/app.js']) 
    
    @stack('styles')
</head>
<body x-data="app()" :class="{'dark': dark}" x-init="init()">
    <!-- Toast Notification -->
<div x-data>
    <template x-for="toast in $store.toast.messages" :key="toast.id">
        <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 9999;">
            <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-header" :class="{
                    'bg-success text-white': toast.type === 'success',
                    'bg-danger text-white': toast.type === 'danger',
                    'bg-warning text-dark': toast.type === 'warning',
                    'bg-info text-white': toast.type === 'info'
                }">
                    <i class="fas me-2" :class="{
                        'fa-check-circle': toast.type === 'success',
                        'fa-exclamation-circle': toast.type === 'danger',
                        'fa-exclamation-triangle': toast.type === 'warning',
                        'fa-info-circle': toast.type === 'info'
                    }"></i>
                    <strong class="me-auto" x-text="toast.type.charAt(0).toUpperCase() + toast.type.slice(1)"></strong>
                    <button type="button" class="btn-close" :class="toast.type === 'warning' ? 'btn-close-dark' : 'btn-close-white'" @click="$store.toast.remove(toast.id)"></button>
                </div>
                <div class="toast-body" x-text="toast.message"></div>
            </div>
        </div>
    </template>
</div>
    <div id="app" class="app-shell">
        <div class="sidebar-backdrop" x-show="sidebarOpen" x-cloak @click="toggleMobileSidebar()" aria-hidden="true"></div>
        <aside class="sidebar" :class="{ 'is-open': sidebarOpen, 'is-collapsed': sidebarCollapsed }">
            <div class="sidebar-header">
                <div class="brand-mark logo-brand-mark">
                    <img src="{{ asset('images/android-chrome-512x512.png') }}" alt="Bank Soal" class="brand-logo">
                </div>
                <div class="brand-text">
                    <span class="brand-name">Bank Soal</span>
                    <small class="brand-subtitle">V. 1.0.0</small>
                </div>
                <button type="button" class="sidebar-toggle-btn" @click="toggleSidebar()" aria-label="Collapse sidebar">
                    <i class="fas fa-chevron-left"></i>
                </button>
            </div>

            <nav class="sidebar-nav">
                <p class="sidebar-section-label">Utama</p>
                <a href="{{ route('dashboard') }}" class="nav-item {{ request()->routeIs('dashboard') ? 'active' : '' }}">
                    <i class="fas fa-chart-pie"></i><span class="nav-label">Dashboard</span>
                </a>
                @if(auth()->user()->role === 'admin' || auth()->user()->role === 'guru')
                    <p class="sidebar-section-label">Konten</p>
                    <a href="{{ route('questions.index') }}" class="nav-item {{ request()->routeIs('questions.*') ? 'active' : '' }}"><i class="fas fa-database"></i><span class="nav-label">Bank Soal</span></a>
                    <a href="{{ route('paket-soal.index') }}" class="nav-item {{ request()->routeIs('paket-soal.*') ? 'active' : '' }}"><i class="fas fa-box"></i><span class="nav-label">Paket Soal</span></a>
                @endif
                @if(auth()->user()->role === 'admin' || auth()->user()->role === 'guru')
                    <p class="sidebar-section-label">Aktivitas</p>
                    <a href="{{ route('analisis.index') }}" class="nav-item {{ request()->routeIs('analisis.*') ? 'active' : '' }}"><i class="fas fa-chart-bar"></i><span class="nav-label">Analisis</span></a>
                    <a href="{{ route('ujian.index') }}" class="nav-item {{ request()->routeIs('ujian.*') ? 'active' : '' }}"><i class="fas fa-file-alt"></i><span class="nav-label">Manajemen Ujian</span></a>
                @endif
                @if(auth()->user()->role === 'siswa')
                    <p class="sidebar-section-label">Aktivitas</p>
                    <a href="{{ route('ujian.daftar') }}" class="nav-item {{ request()->routeIs('ujian.daftar') ? 'active' : '' }}"><i class="fas fa-file-alt"></i><span class="nav-label">Ujian Saya</span></a>
                @endif
                @if(auth()->user()->role === 'admin' || auth()->user()->role === 'guru')
                    <p class="sidebar-section-label">Pengelolaan</p>
                    <a href="{{ route('kategori.index') }}" class="nav-item {{ request()->routeIs('kategori.*') ? 'active' : '' }}"><i class="fas fa-folder"></i><span class="nav-label">Kategori</span></a>
                    <a href="{{ route('tag.index') }}" class="nav-item {{ request()->routeIs('tag.*') ? 'active' : '' }}"><i class="fas fa-tags"></i><span class="nav-label">Tag</span></a>
                    <p class="sidebar-section-label">Kolaborasi</p>
                    <a href="{{ route('share.index') }}" class="nav-item {{ request()->routeIs('share.index') ? 'active' : '' }}"><i class="fas fa-share-alt"></i><span class="nav-label">Kolaborasi</span></a>
                    <a href="{{ route('share.riwayat') }}" class="nav-item {{ request()->routeIs('share.riwayat') ? 'active' : '' }}"><i class="fas fa-history"></i><span class="nav-label">Riwayat Share</span></a>
                @endif
                @if(auth()->user()->role === 'admin')
                    <p class="sidebar-section-label">Administrasi</p>
                    <a href="{{ route('users.index') }}" class="nav-item {{ request()->routeIs('users.*') ? 'active' : '' }}"><i class="fas fa-users"></i><span class="nav-label">Manajemen User</span></a>
                @endif
                <p class="sidebar-section-label sidebar-section-account">Akun</p>
                <a href="{{ route('users.profile') }}" class="nav-item {{ request()->routeIs('users.profile') ? 'active' : '' }}"><i class="fas fa-user"></i><span class="nav-label">Profil</span></a>
            </nav>
        </aside>

        <main class="main-shell" :class="{ 'is-collapsed': sidebarCollapsed }">
            <header class="topbar">
                <div class="topbar-left">
                    <button type="button" class="topbar-toggle" @click="toggleMobileSidebar()" aria-label="Toggle navigation"><i class="fas fa-bars"></i></button>
                    <div class="topbar-context">
                        <nav aria-label="breadcrumb" class="breadcrumb-wrap"><ol class="breadcrumb mb-0"><li class="breadcrumb-item"><a href="{{ route('dashboard') }}">Dashboard</a></li><li class="breadcrumb-item active" aria-current="page">@yield('breadcrumb', 'Halaman')</li></ol></nav>
                        <span class="topbar-page-title">@yield('title', 'Dashboard')</span>
                    </div>
                </div>
                <div class="topbar-actions">
                    <button type="button" class="icon-button" @click="toggleDark()" aria-label="Aktifkan atau nonaktifkan mode gelap" title="Mode gelap"><i class="fas fa-moon"></i></button>
                    @if(in_array(auth()->user()->role, ['admin', 'guru']))
                        <form action="{{ route('questions.index') }}" method="GET" class="search-box"><i class="fas fa-search"></i><input type="text" name="search" value="{{ request('search') }}" placeholder="Cari soal..." aria-label="Cari soal"></form>
                        <div class="dropdown">
                            <button type="button" class="icon-button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Notifikasi" title="Notifikasi"><i class="fas fa-bell"></i>@if($pendingShares->isNotEmpty())<span class="notification-dot"></span>@endif</button>
                            <div class="dropdown-menu dropdown-menu-end p-2" style="width: 340px;"><h6 class="dropdown-header">Undangan Kolaborasi</h6>@forelse($pendingShares as $notif)<div class="d-flex justify-content-between align-items-center gap-2 px-2 py-1"><span class="small flex-grow-1">{{ $notif->message }}</span><form action="{{ $notif->accept }}" method="POST" class="d-inline">@csrf<button type="submit" class="btn btn-sm btn-success" title="Terima"><i class="fas fa-check"></i></button></form><form action="{{ $notif->reject }}" method="POST" class="d-inline">@csrf<button type="submit" class="btn btn-sm btn-danger" title="Tolak"><i class="fas fa-times"></i></button></form></div>@empty<div class="dropdown-item text-muted small">Tidak ada notifikasi.</div>@endforelse</div>
                        </div>
                    @endif
                    @auth
                        @if(auth()->user()->role === 'admin' || auth()->user()->role === 'guru')<a href="{{ route('questions.create') }}" class="btn btn-primary btn-sm btn-add"><i class="fas fa-plus"></i><span>Tambah Soal</span></a>@endif
                        <div class="dropdown user-menu"><button class="btn user-button dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false"><span class="user-avatar">{{ strtoupper(substr(Auth::user()->name, 0, 1)) }}</span><span class="user-name">{{ Auth::user()->name }}</span></button><ul class="dropdown-menu dropdown-menu-end"><li><a class="dropdown-item" href="{{ route('users.profile') }}"><i class="fas fa-user me-2"></i>Profil</a></li><li><hr class="dropdown-divider"></li><li><a class="dropdown-item text-danger" href="{{ route('logout') }}" onclick="event.preventDefault(); document.getElementById('logout-form').submit();"><i class="fas fa-sign-out-alt me-2"></i>Logout</a><form id="logout-form" action="{{ route('logout') }}" method="POST" class="d-none">@csrf</form></li></ul></div>
                    @else
                        <a href="{{ route('login') }}" class="btn btn-outline-primary btn-sm">Login</a><a href="{{ route('register') }}" class="btn btn-primary btn-sm">Register</a>
                    @endauth
                </div>
            </header>
            <div class="page-content">
                @if(session('success'))<script>document.addEventListener('alpine:init',()=>{setTimeout(()=>{window.dispatchEvent(new CustomEvent('toast',{detail:{message:@json(session('success')),type:'success'}}));},100);});</script>@endif
                @if(session('error'))<script>document.addEventListener('alpine:init',()=>{setTimeout(()=>{window.dispatchEvent(new CustomEvent('toast',{detail:{message:@json(session('error')),type:'danger'}}));},100);});</script>@endif
                @if($errors->any())<div class="alert alert-danger alert-dismissible fade show" role="alert"><i class="fas fa-exclamation-circle me-2"></i>@foreach($errors->all() as $error)<div>{{ $error }}</div>@endforeach<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>@endif
                @yield('content')
            </div>
        </main>
    </div>

    <div class="modal fade" id="confirmModal" tabindex="-1" aria-labelledby="confirmModalTitle" aria-hidden="true"><div class="modal-dialog modal-dialog-centered"><div class="modal-content"><div class="modal-header"><h5 class="modal-title" id="confirmModalTitle">Konfirmasi</h5><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div><div class="modal-body"><p class="mb-0" id="confirmModalText">Apakah Anda yakin?</p></div><div class="modal-footer"><button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Batal</button><button type="button" class="btn btn-primary" id="confirmModalAction">Ya, lanjutkan</button></div></div></div></div>

    @stack('scripts')
    <script>
document.addEventListener('alpine:init', () => {
    Alpine.data('app', () => ({
        dark: false,
        sidebarOpen: window.innerWidth > 768,
        sidebarCollapsed: false,
        init() {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) { this.dark = savedTheme === 'dark'; } else { this.dark = window.matchMedia('(prefers-color-scheme: dark)').matches; }
            this.applyTheme();
            const savedCollapsed = localStorage.getItem('sidebar-collapsed');
            if (savedCollapsed !== null) { this.sidebarCollapsed = savedCollapsed === 'true'; }
            const syncSidebarState = () => { if (window.innerWidth > 768) { this.sidebarOpen = true; } else { this.sidebarOpen = false; this.sidebarCollapsed = false; } };
            syncSidebarState();
            window.addEventListener('resize', syncSidebarState);
        },
        applyTheme() { document.documentElement.setAttribute('data-bs-theme', this.dark ? 'dark' : 'light'); localStorage.setItem('theme', this.dark ? 'dark' : 'light'); },
        toggleDark() { this.dark = !this.dark; this.applyTheme(); },
        toggleSidebar() { if (window.innerWidth <= 768) { this.toggleMobileSidebar(); return; } this.sidebarCollapsed = !this.sidebarCollapsed; this.sidebarOpen = true; localStorage.setItem('sidebar-collapsed', String(this.sidebarCollapsed)); },
        toggleMobileSidebar() { this.sidebarOpen = !this.sidebarOpen; if (this.sidebarOpen) { this.sidebarCollapsed = false; } }
    }));
});
</script>
</body>
</html>
