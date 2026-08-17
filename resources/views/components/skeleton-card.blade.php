@props(['count' => 4, 'cols' => 4])

<div class="row g-3 mb-4">
    @for($i = 0; $i < $count; $i++)
        <div class="col-md-3">
            <div class="stat-card skeleton-card">
                <div class="d-flex justify-content-between align-items-center">
                    <div style="flex: 1;">
                        <div class="skeleton skeleton-text" style="width: 60%;"></div>
                        <div class="skeleton skeleton-text skeleton-text-lg" style="width: 40%;"></div>
                        <div class="skeleton skeleton-text skeleton-text-sm"></div>
                    </div>
                    <div class="skeleton skeleton-circle"></div>
                </div>
            </div>
        </div>
    @endfor
</div>