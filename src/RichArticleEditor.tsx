'use client';

import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { hasExtendedMarkup, isSafeEditorUrl } from './editor-utils';
import DOMPurify from 'dompurify';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Image } from '@tiptap/extension-image';
import { Table, TableRow, TableHeader, TableCell } from '@tiptap/extension-table';
import { TextAlign } from '@tiptap/extension-text-align';
import { CodeBlock } from '@tiptap/extension-code-block';
import { CharacterCount } from '@tiptap/extension-character-count';
import { Placeholder } from '@tiptap/extension-placeholder';
import { BackgroundColor, Color, FontFamily, FontSize, TextStyle } from '@tiptap/extension-text-style';
import {
  AlignCenter, AlignJustify, AlignLeft, AlignRight, AlertTriangle, Bold, Code, Code2,
  CodeSquare, Columns3, Eraser, Eye, Highlighter,
  Image as ImageIcon, Italic, Link as LinkIcon, List, ListOrdered, Minus, Palette,
  PenLine, Plus, Quote, Redo2, Rows3, Strikethrough, Table as TableIcon,
  Trash2, Underline as UnderlineIcon, Undo2,
} from 'lucide-react';

type ViewMode = 'visual' | 'html' | 'preview';

export type RichArticleEditorTheme = 'edusc' | 'dashboard' | 'light' | 'dark';

export interface RichArticleEditorThemeTokens {
  primary?: string;
  onPrimary?: string;
  background?: string;
  panel?: string;
  muted?: string;
  foreground?: string;
  mutedForeground?: string;
  border?: string;
  input?: string;
  editorSurface?: string;
  editorText?: string;
  editorHeading?: string;
  editorLink?: string;
  previewBackground?: string;
  previewPaper?: string;
  warningBackground?: string;
  warningText?: string;
}

export interface RichArticleEditorProps {
  value: string;
  onChange: (html: string) => void;
  visualValue?: string;
  className?: string;
  placeholder?: string;
  theme?: RichArticleEditorTheme;
  themeTokens?: RichArticleEditorThemeTokens;
}

function ToolbarButton({
  label,
  onClick,
  active = false,
  disabled = false,
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={event => event.preventDefault()}
      onClick={event => {
        event.preventDefault();
        onClick();
      }}
      className={
        'inline-flex h-11 min-w-11 items-center justify-center rounded-md px-2 transition-colors ' +
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ' +
        (active ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted') +
        ' disabled:cursor-not-allowed disabled:opacity-35'
      }
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <span aria-hidden="true" className="mx-1 h-6 w-px shrink-0 bg-border" />;
}

const toolbarSelect =
  'h-11 rounded-md border border-input bg-background px-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary';

const modeOptions: { value: ViewMode; label: string; icon: typeof PenLine }[] = [
  { value: 'visual', label: 'Visual', icon: PenLine },
  { value: 'html', label: 'HTML', icon: Code2 },
  { value: 'preview', label: 'Prévia', icon: Eye },
];

export default function RichArticleEditor({
  value,
  visualValue,
  onChange,
  className,
  placeholder = 'Escreva o conteúdo do artigo aqui…',
  theme = 'edusc',
  themeTokens,
}: RichArticleEditorProps) {
  const source = value ?? '';
  const visualSource = visualValue ?? source;
  const [mode, setMode] = useState<ViewMode>(() => hasExtendedMarkup(source) || visualSource !== source ? 'html' : 'visual');
  const previousSource = useRef(source);
  const [safePreview, setSafePreview] = useState('');
  const editorId = useId().replace(/:/g, '');
  const containsExtendedMarkup = hasExtendedMarkup(source) || visualSource !== source;
  const tokenVariables: Record<string, string | undefined> = {
    '--tsrae-primary': themeTokens?.primary,
    '--tsrae-on-primary': themeTokens?.onPrimary,
    '--tsrae-background': themeTokens?.background,
    '--tsrae-card': themeTokens?.panel,
    '--tsrae-muted': themeTokens?.muted,
    '--tsrae-foreground': themeTokens?.foreground,
    '--tsrae-muted-foreground': themeTokens?.mutedForeground,
    '--tsrae-border': themeTokens?.border,
    '--tsrae-input': themeTokens?.input,
    '--tsrae-editor-surface': themeTokens?.editorSurface,
    '--tsrae-editor-ink': themeTokens?.editorText,
    '--tsrae-editor-heading': themeTokens?.editorHeading,
    '--tsrae-editor-link': themeTokens?.editorLink,
    '--tsrae-preview-bg': themeTokens?.previewBackground,
    '--tsrae-preview-paper': themeTokens?.previewPaper,
    '--tsrae-warning-bg': themeTokens?.warningBackground,
    '--tsrae-warning-text': themeTokens?.warningText,
  };
  const themeStyle = Object.fromEntries(Object.entries(tokenVariables).filter((entry): entry is [string, string] => Boolean(entry[1]))) as CSSProperties;

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        link: {
          openOnClick: false,
          HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
        },
      }),
      TextStyle,
      Color,
      BackgroundColor,
      FontFamily,
      FontSize,
      CodeBlock,
      Image.configure({ allowBase64: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      CharacterCount,
      Placeholder.configure({ placeholder }),
    ],
    content: visualSource,
    onUpdate({ editor: currentEditor }) {
      onChange(currentEditor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'tsrae-article-editor-content min-h-[360px] focus:outline-none',
        spellcheck: 'true',
      },
    },
  });

  useEffect(() => {
    if (!editor || editor.getHTML() === visualSource) return;
    editor.commands.setContent(visualSource, { emitUpdate: false });
  }, [editor, visualSource, mode]);

  useEffect(() => {
    if (!previousSource.current.trim() && source.trim() && (hasExtendedMarkup(source) || visualSource !== source)) {
      setMode('html');
    }
    previousSource.current = source;
  }, [source, visualSource]);

  useEffect(() => {
    setSafePreview(DOMPurify.sanitize(source, { USE_PROFILES: { html: true } }));
  }, [source]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const current = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Endereço do link:', current ?? 'https://');
    if (url === null) return;
    if (!url.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    const candidate = url.trim();
    if (!isSafeEditorUrl(candidate, 'link')) {
      window.alert('Informe um endereço HTTPS, HTTP, e-mail, telefone ou um caminho interno válido.');
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: candidate }).run();
  }, [editor]);

  const insertImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('URL da imagem (ela será inserida no ponto do cursor):');
    if (!url?.trim()) return;
    const candidate = url.trim();
    if (!isSafeEditorUrl(candidate, 'image')) {
      window.alert('Use uma URL HTTPS ou um caminho de imagem do próprio site.');
      return;
    }
    const alt = window.prompt('Texto alternativo da imagem (alt):') ?? '';
    editor.chain().focus().setImage({ src: candidate, alt }).run();
  }, [editor]);

  const insertTable = useCallback(() => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  const plainText = editor?.getText() ?? visualSource.replace(/<[^>]*>/g, ' ');
  const wordCount = plainText.trim() ? plainText.trim().split(/\s+/).length : 0;
  const characterCount = plainText.length;
  const textStyle = editor?.getAttributes('textStyle') as {
    fontSize?: string;
    fontFamily?: string;
    color?: string;
    backgroundColor?: string;
  } | undefined;
  const blockStyle = !editor ? 'paragraph'
    : editor.isActive('heading', { level: 1 }) ? 'h1'
    : editor.isActive('heading', { level: 2 }) ? 'h2'
    : editor.isActive('heading', { level: 3 }) ? 'h3'
    : editor.isActive('blockquote') ? 'quote'
    : editor.isActive('codeBlock') ? 'code'
    : 'paragraph';
  const inTable = !!editor?.isActive('table');

  function switchToVisual() {
    if (containsExtendedMarkup && typeof window !== 'undefined') {
      const proceed = window.confirm(
        'Este artigo contém HTML especial, blocos ou atributos de layout. O modo visual pode normalizar ou remover parte dessa estrutura quando você editar. O HTML original continuará preservado enquanto você não alterar o conteúdo visual. Deseja continuar?'
      );
      if (!proceed) return;
    }
    setMode('visual');
  }

  return (
    <section className={'tsrae-editor tsrae-theme-' + theme + ' flex min-h-[520px] min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm ' + (className ?? '')} style={themeStyle} data-theme={theme} aria-label="Editor de conteúdo do artigo">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/30 px-3 py-2">
        <div className="flex flex-wrap items-center gap-1 rounded-lg border border-border bg-background p-1" role="group" aria-label="Modo de edição do artigo">
          {modeOptions.map(option => {
            const Icon = option.icon;
            const active = mode === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() => option.value === 'visual' ? switchToVisual() : setMode(option.value)}
                className={
                  'inline-flex min-h-10 items-center gap-1.5 rounded-md px-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ' +
                  (active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground')
                }
              >
                <Icon size={15} /> {option.label}
              </button>
            );
          })}
        </div>
        <span className="text-xs tabular-nums text-muted-foreground">{source.length.toLocaleString('pt-BR')} caracteres HTML</span>
      </div>

      {mode === 'visual' && (
        <>
          {containsExtendedMarkup && (
            <div className="flex shrink-0 items-start gap-2 border-b border-amber-300 bg-warning-bg px-3 py-2 text-xs leading-relaxed text-warning-text dark:border-amber-800">
              <AlertTriangle size={15} className="mt-0.5 shrink-0" />
              <span>Este artigo contém blocos, atributos ou elementos especiais. Para preservar a estrutura original, mantenha o modo HTML. A visualização não altera o conteúdo até você fazer uma edição.</span>
            </div>
          )}

          <div className="shrink-0 border-b border-border bg-muted/20 px-2 py-2">
            <div role="toolbar" aria-label="Formatação do artigo" className="flex flex-wrap items-center gap-1">
              <ToolbarButton label="Desfazer (Ctrl+Z)" onClick={() => editor?.chain().focus().undo().run()} disabled={!editor?.can().undo()}><Undo2 size={16} /></ToolbarButton>
              <ToolbarButton label="Refazer (Ctrl+Shift+Z)" onClick={() => editor?.chain().focus().redo().run()} disabled={!editor?.can().redo()}><Redo2 size={16} /></ToolbarButton>
              <ToolbarDivider />

              <label className="sr-only" htmlFor={editorId + "-block-style"}>Estilo do parágrafo</label>
              <select id={editorId + "-block-style"} aria-label="Estilo do parágrafo" value={blockStyle} onChange={event => {
                if (!editor) return;
                const value = event.target.value;
                const chain = editor.chain().focus();
                if (value === 'paragraph') chain.setParagraph().run();
                else if (value === 'h1') chain.toggleHeading({ level: 1 }).run();
                else if (value === 'h2') chain.toggleHeading({ level: 2 }).run();
                else if (value === 'h3') chain.toggleHeading({ level: 3 }).run();
                else if (value === 'quote') chain.toggleBlockquote().run();
                else if (value === 'code') chain.toggleCodeBlock().run();
              }} className={toolbarSelect + ' w-[132px]'}>
                <option value="paragraph">Parágrafo</option>
                <option value="h1">Título 1</option>
                <option value="h2">Título 2</option>
                <option value="h3">Título 3</option>
                <option value="quote">Citação</option>
                <option value="code">Código</option>
              </select>

              <label className="sr-only" htmlFor={editorId + "-font-family"}>Fonte</label>
              <select id={editorId + "-font-family"} aria-label="Fonte" value={textStyle?.fontFamily ?? ''} onChange={event => {
                if (!editor) return;
                if (event.target.value) editor.chain().focus().setFontFamily(event.target.value).run();
                else editor.chain().focus().unsetFontFamily().run();
              }} className={toolbarSelect + ' w-[120px]'}>
                <option value="">Fonte padrão</option>
                <option value="Arial, sans-serif">Arial</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="'Times New Roman', serif">Times New Roman</option>
                <option value="Verdana, sans-serif">Verdana</option>
                <option value="'Courier New', monospace">Courier New</option>
              </select>

              <label className="sr-only" htmlFor={editorId + "-font-size"}>Tamanho da fonte</label>
              <select id={editorId + "-font-size"} aria-label="Tamanho da fonte" value={textStyle?.fontSize ?? ''} onChange={event => {
                if (!editor) return;
                if (event.target.value) editor.chain().focus().setFontSize(event.target.value).run();
                else editor.chain().focus().unsetFontSize().run();
              }} className={toolbarSelect + ' w-[92px]'}>
                <option value="">Tamanho</option>
                {['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px'].map(size => <option key={size} value={size}>{size.replace('px', '')}</option>)}
              </select>

              <ToolbarDivider />
              <ToolbarButton label="Negrito (Ctrl+B)" active={!!editor?.isActive('bold')} onClick={() => editor?.chain().focus().toggleBold().run()}><Bold size={16} /></ToolbarButton>
              <ToolbarButton label="Itálico (Ctrl+I)" active={!!editor?.isActive('italic')} onClick={() => editor?.chain().focus().toggleItalic().run()}><Italic size={16} /></ToolbarButton>
              <ToolbarButton label="Sublinhado (Ctrl+U)" active={!!editor?.isActive('underline')} onClick={() => editor?.chain().focus().toggleUnderline().run()}><UnderlineIcon size={16} /></ToolbarButton>
              <ToolbarButton label="Tachado" active={!!editor?.isActive('strike')} onClick={() => editor?.chain().focus().toggleStrike().run()}><Strikethrough size={16} /></ToolbarButton>
              <ToolbarButton label="Código inline" active={!!editor?.isActive('code')} onClick={() => editor?.chain().focus().toggleCode().run()}><Code size={16} /></ToolbarButton>

              <ToolbarDivider />
              <ToolbarButton label="Alinhar à esquerda" active={!!editor?.isActive({ textAlign: 'left' })} onClick={() => editor?.chain().focus().setTextAlign('left').run()}><AlignLeft size={16} /></ToolbarButton>
              <ToolbarButton label="Centralizar" active={!!editor?.isActive({ textAlign: 'center' })} onClick={() => editor?.chain().focus().setTextAlign('center').run()}><AlignCenter size={16} /></ToolbarButton>
              <ToolbarButton label="Alinhar à direita" active={!!editor?.isActive({ textAlign: 'right' })} onClick={() => editor?.chain().focus().setTextAlign('right').run()}><AlignRight size={16} /></ToolbarButton>
              <ToolbarButton label="Justificar" active={!!editor?.isActive({ textAlign: 'justify' })} onClick={() => editor?.chain().focus().setTextAlign('justify').run()}><AlignJustify size={16} /></ToolbarButton>

              <ToolbarDivider />
              <ToolbarButton label="Lista com marcadores" active={!!editor?.isActive('bulletList')} onClick={() => editor?.chain().focus().toggleBulletList().run()}><List size={16} /></ToolbarButton>
              <ToolbarButton label="Lista numerada" active={!!editor?.isActive('orderedList')} onClick={() => editor?.chain().focus().toggleOrderedList().run()}><ListOrdered size={16} /></ToolbarButton>
              <ToolbarButton label="Citação em bloco" active={!!editor?.isActive('blockquote')} onClick={() => editor?.chain().focus().toggleBlockquote().run()}><Quote size={16} /></ToolbarButton>
              <ToolbarButton label="Bloco de código" active={!!editor?.isActive('codeBlock')} onClick={() => editor?.chain().focus().toggleCodeBlock().run()}><CodeSquare size={16} /></ToolbarButton>
              <ToolbarButton label="Linha horizontal" onClick={() => editor?.chain().focus().setHorizontalRule().run()}><Minus size={16} /></ToolbarButton>

              <ToolbarDivider />
              <ToolbarButton label="Inserir ou editar link" active={!!editor?.isActive('link')} onClick={setLink}><LinkIcon size={16} /></ToolbarButton>
              <ToolbarButton label="Inserir imagem por URL" onClick={insertImage}><ImageIcon size={16} /></ToolbarButton>
              <ToolbarButton label="Inserir tabela 3 × 3" onClick={insertTable}><TableIcon size={16} /></ToolbarButton>

              <ToolbarDivider />
              <label title="Cor do texto" className="relative inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-md text-foreground hover:bg-muted">
                <Palette size={16} />
                <input aria-label="Cor do texto" type="color" value={/^#[0-9a-f]{6}$/i.test(textStyle?.color ?? '') ? textStyle!.color! : '#10213f'} className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  onChange={event => editor?.chain().focus().setColor(event.target.value).run()} />
              </label>
              <label title="Realçar texto" className="relative inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-md text-foreground hover:bg-muted">
                <Highlighter size={16} />
                <input aria-label="Cor de destaque" type="color" value={/^#[0-9a-f]{6}$/i.test(textStyle?.backgroundColor ?? '') ? textStyle!.backgroundColor! : '#facc15'} className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  onChange={event => editor?.chain().focus().setBackgroundColor(event.target.value).run()} />
              </label>
              <ToolbarButton label="Remover cor do texto" onClick={() => editor?.chain().focus().unsetColor().run()}><span className="text-base font-bold">A</span></ToolbarButton>
              <ToolbarButton label="Remover destaque" onClick={() => editor?.chain().focus().unsetBackgroundColor().run()}><Eraser size={16} /></ToolbarButton>
              <ToolbarButton label="Limpar formatação da seleção" onClick={() => editor?.chain().focus().unsetAllMarks().clearNodes().run()}><Trash2 size={16} /></ToolbarButton>

              {inTable && <>
                <ToolbarDivider />
                <ToolbarButton label="Adicionar linha" onClick={() => editor?.chain().focus().addRowAfter().run()}><Rows3 size={16} /><Plus size={10} /></ToolbarButton>
                <ToolbarButton label="Adicionar coluna" onClick={() => editor?.chain().focus().addColumnAfter().run()}><Columns3 size={16} /><Plus size={10} /></ToolbarButton>
                <ToolbarButton label="Excluir linha" onClick={() => editor?.chain().focus().deleteRow().run()}><Rows3 size={16} /><Trash2 size={10} /></ToolbarButton>
                <ToolbarButton label="Excluir coluna" onClick={() => editor?.chain().focus().deleteColumn().run()}><Columns3 size={16} /><Trash2 size={10} /></ToolbarButton>
                <ToolbarButton label="Excluir tabela" onClick={() => editor?.chain().focus().deleteTable().run()}><TableIcon size={16} /><Trash2 size={10} /></ToolbarButton>
              </>}
            </div>
          </div>

          <div className="min-h-[420px] flex-1 overflow-y-auto bg-editor-surface px-4 py-5 text-editor-ink sm:px-7">
            {editor ? <EditorContent editor={editor} /> : <p className="text-sm text-muted-foreground">Preparando o editor…</p>}
          </div>
        </>
      )}

      {mode === 'html' && (
        <div className="flex min-h-[420px] flex-1 flex-col bg-slate-950">
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-700 px-3 py-2 text-xs text-slate-300">
            <span className="font-medium">Código HTML do artigo</span>
            <span>Tags, classes, tabelas e atributos</span>
          </div>
          <textarea
            aria-label="Código HTML do artigo"
            value={source}
            onChange={event => onChange(event.target.value)}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            className="min-h-[420px] flex-1 resize-y bg-transparent p-4 font-mono text-base leading-6 text-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-400"
            placeholder="Cole ou edite o HTML do artigo aqui…"
          />
        </div>
      )}

      {mode === 'preview' && (
        <div className="min-h-[420px] flex-1 overflow-y-auto bg-preview-bg p-3 sm:p-6">
          <div className="mx-auto min-h-full max-w-[820px] bg-preview-paper px-5 py-6 shadow-sm sm:px-10 sm:py-9">
            {safePreview ? (
              <article className="tsrae-article-preview" dangerouslySetInnerHTML={{ __html: safePreview }} />
            ) : (
              <p className="text-sm text-slate-400">A prévia aparecerá aqui quando houver conteúdo.</p>
            )}
          </div>
          <p className="mx-auto mt-3 max-w-[820px] text-xs text-slate-500">Prévia sanitizada. Scripts, formulários e embeds externos não são executados nesta janela.</p>
        </div>
      )}

      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
        <span>{wordCount.toLocaleString('pt-BR')} {wordCount === 1 ? 'palavra' : 'palavras'} · {characterCount.toLocaleString('pt-BR')} caracteres de texto</span>
        <span>Atalhos: Ctrl+B negrito · Ctrl+I itálico · Ctrl+Z desfazer</span>
      </div>
    </section>
  );
}
