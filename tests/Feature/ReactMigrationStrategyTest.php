<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReactMigrationStrategyTest extends TestCase
{
    use RefreshDatabase;

    public function test_root_redirects_to_react_spa_entry(): void
    {
        $this->get('/')->assertRedirect(route('spa'));
    }

    public function test_login_redirects_to_react_dashboard_after_authentication(): void
    {
        $user = User::factory()->create([
            'email' => 'guru@example.test',
            'password' => bcrypt('password123'),
            'role' => 'guru',
            'is_active' => true,
        ]);

        $this->post('/login', [
            'email' => $user->email,
            'password' => 'password123',
        ])->assertRedirect('/app/dashboard');
    }

    public function test_react_spa_fallback_serves_nested_app_routes(): void
    {
        $user = User::factory()->create(['role' => 'guru']);

        $this->actingAs($user)
            ->get('/app/questions/create')
            ->assertOk()
            ->assertViewIs('spa');

        $this->actingAs($user)
            ->get('/app/ujian/123/hasil')
            ->assertOk()
            ->assertViewIs('spa');
    }

    public function test_legacy_blade_page_routes_redirect_to_react_spa_routes(): void
    {
        $guru = User::factory()->create(['role' => 'guru']);
        $admin = User::factory()->create(['role' => 'admin']);
        $siswa = User::factory()->create(['role' => 'siswa']);

        foreach ([
            '/dashboard' => '/app/dashboard',
            '/questions' => '/app/questions',
            '/questions/create' => '/app/questions/create',
            '/subjects' => '/app/subjects',
            '/paket-soal' => '/app/paket-soal',
            '/paket-soal/create' => '/app/paket-soal/create',
            '/ujian' => '/app/ujian',
            '/analisis' => '/app/analisis',
            '/kategori' => '/app/kategori',
            '/tag' => '/app/tags',
            '/share' => '/app/share',
            '/share/riwayat' => '/app/share',
            '/profile' => '/app/profile',
            '/settings' => '/app/profile',
        ] as $legacyPath => $reactPath) {
            $this->actingAs($guru)
                ->get($legacyPath)
                ->assertRedirect($reactPath);
        }

        $this->actingAs($admin)
            ->get('/users')
            ->assertRedirect('/app/users');

        $this->actingAs($siswa)
            ->get('/ujian-saya')
            ->assertRedirect('/app/ujian-saya');
    }

    public function test_react_has_url_based_route_contract(): void
    {
        $routes = file_get_contents(base_path('src/lib/appRoutes.ts'));
        $context = file_get_contents(base_path('src/context/AppContext.tsx'));
        $navbar = file_get_contents(base_path('src/components/Navbar.tsx'));

        foreach (['/app/dashboard', '/app/questions', '/app/questions/create', '/app/paket-soal', '/app/ujian', '/app/analisis', '/app/share', '/app/users', '/app/profile'] as $path) {
            $this->assertStringContainsString($path, $routes);
        }

        $this->assertStringContainsString('pathToView(window.location.pathname)', $context);
        $this->assertStringContainsString('window.history.pushState', $context);
        $this->assertStringContainsString("window.addEventListener('popstate'", $context);
        $this->assertStringContainsString('!isBootstrapped()', $navbar);
    }
}
