<?php

namespace Tests\Feature;

use Tests\TestCase;

class SystemDeploymentSecurityTest extends TestCase
{
    public function test_production_env_example_uses_safe_defaults(): void
    {
        $env = file_get_contents(base_path('.env.production.example'));

        $this->assertStringContainsString('APP_ENV=production', $env);
        $this->assertStringContainsString('APP_DEBUG=false', $env);
        $this->assertStringContainsString('LOG_LEVEL=warning', $env);
        $this->assertStringContainsString('SESSION_SECURE_COOKIE=true', $env);
        $this->assertStringContainsString('SESSION_SAME_SITE=lax', $env);
    }

    public function test_sensitive_env_files_are_ignored_by_git(): void
    {
        $gitignore = file_get_contents(base_path('.gitignore'));

        $this->assertMatchesRegularExpression('/^\.env$/m', $gitignore);
        $this->assertMatchesRegularExpression('/^\.env\.backup$/m', $gitignore);
        $this->assertMatchesRegularExpression('/^\.env\.production$/m', $gitignore);
        $this->assertMatchesRegularExpression('/^\/docs$/m', $gitignore);
    }

    public function test_root_htaccess_blocks_sensitive_paths_if_document_root_is_wrong(): void
    {
        $htaccess = file_get_contents(base_path('.htaccess'));

        foreach (['\\.env', 'artisan', 'composer\\.(json|lock)', 'storage', 'vendor', 'routes'] as $pattern) {
            $this->assertStringContainsString($pattern, $htaccess);
        }

        $this->assertStringContainsString('RewriteRule ^$ public/ [L]', $htaccess);
        $this->assertStringContainsString('RewriteRule ^(.*)$ public/$1 [L]', $htaccess);
    }

    public function test_debugbar_is_dev_only_dependency(): void
    {
        $composer = json_decode(file_get_contents(base_path('composer.json')), true);

        $this->assertArrayNotHasKey('barryvdh/laravel-debugbar', $composer['require'] ?? []);
        $this->assertArrayHasKey('barryvdh/laravel-debugbar', $composer['require-dev'] ?? []);
    }
}
