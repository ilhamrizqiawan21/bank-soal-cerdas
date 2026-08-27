<?php

namespace Tests\Unit;

use App\Models\Question;
use App\Models\QuestionEssayRubric;
use App\Models\QuestionMatchingPair;
use App\Models\QuestionPgOption;
use App\Support\HtmlSanitizer;
use PHPUnit\Framework\TestCase;

class HtmlSanitizerTest extends TestCase
{
    public function test_script_tag_is_removed_with_children(): void
    {
        $clean = HtmlSanitizer::clean('<p>Soal aman</p><script>alert(1)</script>');

        $this->assertStringNotContainsString('script', $clean);
        $this->assertStringNotContainsString('alert', $clean);
        $this->assertStringContainsString('<p>Soal aman</p>', $clean);
    }

    public function test_event_handler_attributes_are_stripped(): void
    {
        $clean = HtmlSanitizer::clean('<p onclick="alert(1)" onmouseover="steal()">Teks</p>');

        $this->assertSame('<p>Teks</p>', $clean);
    }

    public function test_javascript_href_is_removed_but_safe_link_kept(): void
    {
        $dirty = '<a href="javascript:alert(1)">x</a><a href="https://kemdikbud.go.id">y</a>';
        $clean = HtmlSanitizer::clean($dirty);

        $this->assertStringNotContainsString('javascript:', strtolower($clean));
        $this->assertStringContainsString('href="https://kemdikbud.go.id"', $clean);
    }

    public function test_svg_and_math_vectors_are_dropped(): void
    {
        foreach (['<svg><circle onload="alert(1)"/></svg>', '<math><mtext></mtext></math>'] as $payload) {
            $clean = HtmlSanitizer::clean($payload);
            $this->assertFalse(preg_match('/<(svg|math)\b/i', $clean) === 1, $clean);
        }
    }

    public function test_comments_are_removed(): void
    {
        $clean = HtmlSanitizer::clean('<p>a</p><!-- --><script>x</script>--><p>b</p>');

        $this->assertStringNotContainsString('<!--', $clean);
    }

    public function test_safe_rich_text_is_preserved(): void
    {
        $html = '<p><strong>Rumus</strong>: <em>x</em><br><img src="https://contoh.id/a.png" alt="g" onerror="alert(1)">'
            .'<table><tr><td colspan="2">1</td></tr></table></p>';

        $clean = HtmlSanitizer::clean($html);

        $this->assertStringContainsString('<strong>Rumus</strong>', $clean);
        $this->assertStringContainsString('src="https://contoh.id/a.png"', $clean);
        $this->assertStringContainsString('colspan="2"', $clean);
        $this->assertStringNotContainsString('onerror', $clean);
    }

    public function test_plain_text_is_escaped(): void
    {
        $clean = HtmlSanitizer::clean('5 < 10 & 10 > 5');

        $this->assertSame('5 &lt; 10 &amp; 10 &gt; 5', $clean);
    }

    public function test_question_model_mutator_sanitizes_on_set(): void
    {
        $question = new Question(['question_text' => '<p>Soal</p><script>alert(1)</script>']);

        $this->assertStringNotContainsString('<script', (string) $question->question_text);
        $this->assertStringContainsString('<p>Soal</p>', (string) $question->question_text);
    }

    public function test_null_indicator_text_stays_null(): void
    {
        $question = new Question(['indicator_text' => null]);

        $this->assertNull($question->indicator_text);
    }

    public function test_question_detail_models_sanitize_on_set(): void
    {
        $option = new QuestionPgOption(['option_text' => '<img src=x onerror="alert(1)">Opsi']);
        $rubric = new QuestionEssayRubric(['rubric_text' => '<p onclick="alert(1)">Rubrik</p>']);
        $pair = new QuestionMatchingPair([
            'left_text' => '<svg><script>alert(1)</script></svg><strong>Kiri</strong>',
            'right_text' => '<a href="javascript:alert(1)">Kanan</a>',
        ]);

        $this->assertStringNotContainsString('onerror', (string) $option->option_text);
        $this->assertStringNotContainsString('onclick', (string) $rubric->rubric_text);
        $this->assertStringContainsString('<p>Rubrik</p>', (string) $rubric->rubric_text);
        $this->assertStringNotContainsString('<svg', (string) $pair->left_text);
        $this->assertStringContainsString('<strong>Kiri</strong>', (string) $pair->left_text);
        $this->assertStringNotContainsString('javascript:', (string) $pair->right_text);
    }
}
