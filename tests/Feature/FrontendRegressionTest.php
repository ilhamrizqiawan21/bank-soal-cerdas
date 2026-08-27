<?php

namespace Tests\Feature;

use Tests\TestCase;

class FrontendRegressionTest extends TestCase
{
    public function test_legacy_app_layout_has_been_retired(): void
    {
        $this->assertFileDoesNotExist(resource_path('views/layouts/app.blade.php'));
        $this->assertFileDoesNotExist(resource_path('views/dashboard.blade.php'));
        $this->assertFileDoesNotExist(resource_path('views/questions/index.blade.php'));
    }

    public function test_login_page_is_standalone_without_legacy_assets(): void
    {
        $login = file_get_contents(resource_path('views/auth/login.blade.php'));

        $this->assertNotFalse($login);
        $this->assertStringContainsString(':focus-visible', $login);
        $this->assertStringContainsString('password-toggle', $login);
        $this->assertStringNotContainsString('x-data', $login);
        $this->assertStringNotContainsString('legacy.js', $login);
        $this->assertStringNotContainsString('app.scss', $login);
    }

    public function test_vite_only_builds_react_spa_entry_after_blade_retirement(): void
    {
        $viteConfig = file_get_contents(base_path('vite.config.ts'));
        $packageJson = file_get_contents(base_path('package.json'));

        $this->assertNotFalse($viteConfig);
        $this->assertNotFalse($packageJson);
        $this->assertStringContainsString("'src/main.tsx'", $viteConfig);
        $this->assertStringNotContainsString('resources/js/legacy.js', $viteConfig);
        $this->assertStringNotContainsString('resources/sass/app.scss', $viteConfig);
        $this->assertStringNotContainsString('"bootstrap"', $packageJson);
        $this->assertStringNotContainsString('"alpinejs"', $packageJson);
    }
}
