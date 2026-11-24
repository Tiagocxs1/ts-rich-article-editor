import { describe, expect, it } from 'vitest';
import { getEditorTextStats, hasExtendedMarkup, isSafeEditorUrl } from '../src/editor-utils';

describe('hasExtendedMarkup', () => {
  it('detects WordPress blocks, layout attributes and page builders', () => {
    expect(hasExtendedMarkup('<!-- wp:paragraph --><p>Texto</p><!-- /wp:paragraph -->')).toBe(true);
    expect(hasExtendedMarkup('<div class="builder-row" data-id="12">Conteúdo</div>')).toBe(true);
    expect(hasExtendedMarkup('[et_pb_section]Conteúdo[/et_pb_section]')).toBe(true);
  });

  it('does not flag ordinary article markup', () => {
    expect(hasExtendedMarkup('<h2>Seção</h2><p>Texto <strong>importante</strong>.</p>')).toBe(false);
    expect(hasExtendedMarkup('Texto simples sem marcação.')).toBe(false);
  });
});

describe('isSafeEditorUrl', () => {
  it('accepts safe web, mail, phone and internal links', () => {
    for (const value of ['https://example.com', 'http://example.com', 'mailto:editor@example.com', 'tel:+5511999999999', '/artigos/guia', '#referencias', './imagem.jpg']) {
      expect(isSafeEditorUrl(value, 'link')).toBe(true);
    }
  });

  it('rejects script schemes, protocol-relative and control-character URLs', () => {
    for (const value of ['javascript:alert(1)', 'data:text/html,hello', '//evil.example', '  ', 'java\nscript:alert(1)']) {
      expect(isSafeEditorUrl(value, 'link')).toBe(false);
    }
  });

  it('allows HTTP(S) images only', () => {
    expect(isSafeEditorUrl('https://cdn.example/image.webp', 'image')).toBe(true);
    expect(isSafeEditorUrl('/images/cover.webp', 'image')).toBe(true);
    expect(isSafeEditorUrl('mailto:image@example.com', 'image')).toBe(false);
    expect(isSafeEditorUrl('data:image/svg+xml,<svg/>', 'image')).toBe(false);
  });
});

describe('getEditorTextStats', () => {
  it('counts visible words and characters without counting tags', () => {
    expect(getEditorTextStats('<h2>Um título</h2><p>Texto <strong>bem formatado</strong></p>'))
      .toEqual({ words: 5, characters: 29 });
  });

  it('handles empty content', () => {
    expect(getEditorTextStats('')).toEqual({ words: 0, characters: 0 });
  });
});