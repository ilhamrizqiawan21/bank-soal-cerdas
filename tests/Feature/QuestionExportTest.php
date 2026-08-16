<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class QuestionExportTest extends TestCase
{
    use RefreshDatabase;

    public function test_question_export_route_is_accessible_for_authenticated_user(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('questions.export'))
            ->assertOk();
    }
}
