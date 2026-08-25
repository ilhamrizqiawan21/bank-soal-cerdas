<?php

namespace App\Support;

use DOMAttr;
use DOMDocument;
use DOMElement;
use DOMNode;
use Throwable;

/**
 * Allowlist-based HTML sanitizer for rich-text question bodies.
 *
 * Strategy: parse with DOMDocument, walk the tree post-order, keep only
 * allowlisted elements/attributes, hard-remove active-content subtrees
 * (script/svg/math/iframe/...), unwrap unknown-but-benign tags, and validate
 * URL schemes. This closes stored-XSS via shared/imported question text.
 */
class HtmlSanitizer
{
    /** Elements whose entire subtree must be dropped. */
    private const HARD_REMOVE = [
        'script', 'style', 'iframe', 'object', 'embed', 'template', 'noscript',
        'noembed', 'svg', 'math', 'form', 'input', 'button', 'select', 'textarea',
        'option', 'link', 'meta', 'base', 'frame', 'frameset', 'applet', 'audio',
        'video', 'source', 'track', 'canvas', 'map', 'area', 'dialog', 'marquee',
        'slot', 'portal', 'plaintext', 'xmp', 'listing',
    ];

    /** Elements kept verbatim (attributes still filtered). */
    private const ALLOWED = [
        'p', 'br', 'hr', 'b', 'strong', 'i', 'em', 'u', 's', 'strike', 'del',
        'ins', 'sub', 'sup', 'span', 'div', 'blockquote', 'pre', 'code', 'kbd',
        'samp', 'var', 'cite', 'q', 'abbr', 'mark', 'small', 'big', 'h1', 'h2',
        'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'table', 'thead', 'tbody',
        'tfoot', 'tr', 'td', 'th', 'caption', 'figure', 'figcaption', 'a', 'img',
        'font', 'center',
    ];

    /** Globally permitted attributes. */
    private const GLOBAL_ATTRS = ['title'];

    private const TAG_ATTRS = [
        'a' => ['href', 'target'],
        'img' => ['src', 'alt', 'width', 'height'],
        'ol' => ['start', 'type'],
        'ul' => ['type'],
        'td' => ['colspan', 'rowspan'],
        'th' => ['colspan', 'rowspan'],
        'font' => ['color', 'size', 'face'],
        'table' => ['border', 'cellpadding', 'cellspacing'],
    ];

    public static function clean(?string $html): string
    {
        $html = trim((string) $html);

        if ($html === '') {
            return '';
        }

        // Plain text without any markup passes through escaped-safe path.
        if (!str_contains($html, '<')) {
            return htmlspecialchars($html, ENT_QUOTES, 'UTF-8');
        }

        $dom = new DOMDocument();
        libxml_use_internal_errors(true);
        try {
            $wrapped = '<?xml encoding="utf-8"?><body>' . $html . '</body>';
            $ok = $dom->loadHTML(
                $wrapped,
                LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD | LIBXML_NONET | LIBXML_NOWARNING | LIBXML_NOERROR
            );
        } catch (Throwable) {
            $ok = false;
        } finally {
            foreach (libxml_get_errors() as $error) {
                unset($error);
            }
            libxml_clear_errors();
            libxml_use_internal_errors(false);
        }

        if (!$ok) {
            return htmlspecialchars(strip_tags($html), ENT_QUOTES, 'UTF-8');
        }

        $body = $dom->getElementsByTagName('body')->item(0);

        if ($body === null) {
            return '';
        }

        foreach (iterator_to_array($body->childNodes) ?: [] as $node) {
            self::sanitizeNode($node);
        }

        $inner = '';
        foreach ($body->childNodes as $node) {
            $inner .= $dom->saveHTML($node);
        }

        // Final belt-and-suspenders pass against serializer-level mXSS remnants.
        if (preg_match('/<\s*(script|iframe|object|embed|svg|math)\b/i', $inner)) {
            return htmlspecialchars(strip_tags($html), ENT_QUOTES, 'UTF-8');
        }

        return $inner;
    }

    private static function sanitizeNode(DOMNode $node): void
    {
        if ($node->nodeType === XML_COMMENT_NODE || $node->nodeType === XML_PI_NODE) {
            $node->parentNode?->removeChild($node);

            return;
        }

        if ($node->nodeType !== XML_ELEMENT_NODE) {
            return;
        }

        /** @var DOMElement $element */
        $element = $node;

        foreach (iterator_to_array($element->childNodes) ?: [] as $child) {
            self::sanitizeNode($child);
        }

        $tag = strtolower($element->tagName);

        if (in_array($tag, self::HARD_REMOVE, true)) {
            $element->remove();

            return;
        }

        if (!in_array($tag, self::ALLOWED, true)) {
            $parent = $element->parentNode;

            if ($parent === null) {
                return;
            }

            foreach (iterator_to_array($element->childNodes) ?: [] as $child) {
                $parent->insertBefore($child, $element);
            }

            $parent->removeChild($element);

            return;
        }

        self::filterAttributes($element, $tag);
    }

    private static function filterAttributes(DOMElement $element, string $tag): void
    {
        $allowed = array_merge(self::GLOBAL_ATTRS, self::TAG_ATTRS[$tag] ?? []);

        /** @var DOMAttr $attribute */
        foreach (iterator_to_array($element->attributes) ?: [] as $attribute) {
            $name = strtolower($attribute->name);

            $keep = in_array($name, $allowed, true)
                && !str_starts_with($name, 'on');

            if (!$keep) {
                $element->removeAttribute($attribute->name);

                continue;
            }

            if (in_array($name, ['href', 'src'], true)) {
                if (!self::isSafeUrl($attribute->value, $tag === 'img' && $name === 'src')) {
                    $element->removeAttribute($attribute->name);
                }
            }
        }
    }

    private static function isSafeUrl(string $url, bool $isImageSrc): bool
    {
        $trimmed = trim(str_replace(["\0", "\t", "\n", "\r", ' ', '&#'], '', $url));

        if ($trimmed === '' || str_contains(strtolower($trimmed), 'javascript:') || str_contains(strtolower($trimmed), 'vbscript:')) {
            return false;
        }

        if (preg_match('/^(https?:|mailto:|tel:|\/|\#|\.\/|\?)/i', $trimmed)) {
            return true;
        }

        if ($isImageSrc && preg_match('/^data:image\/(png|jpe?g|gif|webp);base64,[a-z0-9+\/=]+$/i', $trimmed)) {
            return true;
        }

        // Scheme-less relative paths (e.g. "images/foo.png").
        return !preg_match('/^[a-z][a-z0-9+.\-]*:/i', $trimmed);
    }
}
