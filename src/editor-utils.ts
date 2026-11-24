const EXTENDED_MARKUP = /<!--\s*(?:wp:|\/wp:)|\[(?:et_pb_|vc_|fusion_)\w*|\bdata-[\w-]+\s*=|<(?:div|iframe|script|style|svg|video|audio|figure|picture|source|template|object|embed)\b|\b(?:class|style)\s*=/i;

export function hasExtendedMarkup(html: string): boolean {
  return EXTENDED_MARKUP.test(html ?? '');
}

export function isSafeEditorUrl(value: string, kind: 'link' | 'image' = 'link'): boolean {
  const candidate = String(value ?? '').trim().replace(/[\u0000-\u001f\u007f]/g, '');
  if (!candidate || candidate.startsWith('//')) return false;

  if (/^(https?:|mailto:|tel:)/i.test(candidate)) {
    try {
      const parsed = new URL(candidate);
      if (kind === 'image') return parsed.protocol === 'https:' || parsed.protocol === 'http:';
      return ['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  }

  return candidate.startsWith('/') || candidate.startsWith('#') || candidate.startsWith('./');
}

export function getEditorTextStats(html: string): { words: number; characters: number } {
  const plain = String(html ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
  return {
    words: plain ? plain.split(' ').length : 0,
    characters: plain.length
  };
}