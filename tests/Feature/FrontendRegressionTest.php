<?php

namespace Tests\Feature;

use Tests\TestCase;

class FrontendRegressionTest extends TestCase
{
    public function test_app_layout_keeps_global_navigation_contract(): void
    {
        $layout = file_get_contents(resource_path('views/layouts/app.blade.php'));

        $this->assertNotFalse($layout);
        $this->assertStringContainsString('aria-label="breadcrumb"', $layout);
        $this->assertStringContainsString('@yield(\'breadcrumb\', \'Halaman\')', $layout);
        $this->assertStringContainsString('id="confirmModal"', $layout);
        $this->assertStringContainsString('id="confirmModalAction"', $layout);
    }

    public function test_frontend_ux_layer_is_loaded_and_contains_accessibility_contracts(): void
    {
        $uxStyles = file_get_contents(resource_path('sass/frontend-ux.scss'));
        $appJs = file_get_contents(resource_path('js/app.js'));

        $this->assertNotFalse($uxStyles);
        $this->assertNotFalse($appJs);
        $this->assertStringContainsString("import '../sass/design-system.scss';", $appJs);
        $this->assertStringContainsString('breadcrumb-wrap', $uxStyles);
        $this->assertStringContainsString('focus-visible', $uxStyles);
        $this->assertStringContainsString('prefers-reduced-motion', $uxStyles);
    }

    public function test_global_confirm_dialog_contract_is_present(): void
    {
        $appJs = file_get_contents(resource_path('js/app.js'));

        $this->assertNotFalse($appJs);
        $this->assertStringContainsString('data-confirm', $appJs);
        $this->assertStringContainsString('window.confirmDialog', $appJs);
        $this->assertStringContainsString('confirmModalAction', $appJs);
    }
}
