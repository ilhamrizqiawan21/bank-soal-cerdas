<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * Test bahwa halaman utama redirect ke dashboard
     */
    public function test_the_application_redirects_to_dashboard(): void
    {
        $response = $this->get('/');
        $response->assertStatus(302);
        $response->assertRedirect('/dashboard');
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