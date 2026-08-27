<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * Test bahwa halaman utama redirect ke React app.
     */
    public function test_the_application_redirects_to_react_app(): void
    {
        $response = $this->get('/');
        $response->assertStatus(302);
        $response->assertRedirect('/app');
    }

    /**
     * Test bahwa guest tidak bisa akses dashboard
     */
    public function test_guest_cannot_access_dashboard(): void
    {
        $response = $this->get('/dashboard');
        $response->assertRedirect('/login');
    }
}
