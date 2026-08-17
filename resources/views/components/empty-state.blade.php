@props([
    'icon' => 'fas fa-inbox',
    'title' => 'Belum ada data',
    'description' => 'Belum ada data yang bisa ditampilkan saat ini.',
    'buttonText' => null,
    'buttonHref' => null,
    'buttonClass' => 'btn btn-primary',
])

<div class="empty-state text-center py-5">
    <div class="empty-state-icon mb-3">
        <i class="{{ $icon }} fa-3x text-muted"></i>
    </div>
    <h6 class="fw-bold mb-2">{{ $title }}</h6>
    <p class="text-muted mb-3">{{ $description }}</p>

    @if($buttonText && $buttonHref)
        <a href="{{ $buttonHref }}" class="{{ $buttonClass }}">
            {{ $buttonText }}
        </a>
    @endif
</div>
