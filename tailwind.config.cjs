/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: {
        primary: 'var(--tsrae-primary)',
        'primary-foreground': 'var(--tsrae-on-primary)',
        background: 'var(--tsrae-background)',
        card: 'var(--tsrae-card)',
        muted: 'var(--tsrae-muted)',
        foreground: 'var(--tsrae-foreground)',
        'muted-foreground': 'var(--tsrae-muted-foreground)',
        border: 'var(--tsrae-border)',
        input: 'var(--tsrae-input)',
        sidebar: 'var(--tsrae-card)',
        'editor-surface': 'var(--tsrae-editor-surface)',
        'editor-ink': 'var(--tsrae-editor-ink)',
        'preview-bg': 'var(--tsrae-preview-bg)',
        'preview-paper': 'var(--tsrae-preview-paper)',
        'warning-bg': 'var(--tsrae-warning-bg)',
        'warning-text': 'var(--tsrae-warning-text)'
      }
    }
  },
  plugins: []
};