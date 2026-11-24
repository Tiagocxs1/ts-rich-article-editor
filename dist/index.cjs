"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  RichArticleEditor: () => RichArticleEditor,
  getEditorTextStats: () => getEditorTextStats,
  hasExtendedMarkup: () => hasExtendedMarkup,
  isSafeEditorUrl: () => isSafeEditorUrl
});
module.exports = __toCommonJS(index_exports);

// src/RichArticleEditor.tsx
var import_react = require("react");

// src/editor-utils.ts
var EXTENDED_MARKUP = /<!--\s*(?:wp:|\/wp:)|\[(?:et_pb_|vc_|fusion_)\w*|\bdata-[\w-]+\s*=|<(?:div|iframe|script|style|svg|video|audio|figure|picture|source|template|object|embed)\b|\b(?:class|style)\s*=/i;
function hasExtendedMarkup(html) {
  return EXTENDED_MARKUP.test(html ?? "");
}
function isSafeEditorUrl(value, kind = "link") {
  const candidate = String(value ?? "").trim().replace(/[\u0000-\u001f\u007f]/g, "");
  if (!candidate || candidate.startsWith("//")) return false;
  if (/^(https?:|mailto:|tel:)/i.test(candidate)) {
    try {
      const parsed = new URL(candidate);
      if (kind === "image") return parsed.protocol === "https:" || parsed.protocol === "http:";
      return ["http:", "https:", "mailto:", "tel:"].includes(parsed.protocol);
    } catch {
      return false;
    }
  }
  return candidate.startsWith("/") || candidate.startsWith("#") || candidate.startsWith("./");
}
function getEditorTextStats(html) {
  const plain = String(html ?? "").replace(/<[^>]*>/g, " ").replace(/&nbsp;|&#160;/gi, " ").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/\s+/g, " ").trim();
  return {
    words: plain ? plain.split(" ").length : 0,
    characters: plain.length
  };
}

// src/RichArticleEditor.tsx
var import_dompurify = __toESM(require("dompurify"), 1);
var import_react2 = require("@tiptap/react");
var import_starter_kit = __toESM(require("@tiptap/starter-kit"), 1);
var import_extension_image = require("@tiptap/extension-image");
var import_extension_table = require("@tiptap/extension-table");
var import_extension_text_align = require("@tiptap/extension-text-align");
var import_extension_code_block = require("@tiptap/extension-code-block");
var import_extension_character_count = require("@tiptap/extension-character-count");
var import_extension_placeholder = require("@tiptap/extension-placeholder");
var import_extension_text_style = require("@tiptap/extension-text-style");
var import_lucide_react = require("lucide-react");
var import_jsx_runtime = require("react/jsx-runtime");
function ToolbarButton({
  label,
  onClick,
  active = false,
  disabled = false,
  children
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "button",
    {
      type: "button",
      title: label,
      "aria-label": label,
      "aria-pressed": active,
      disabled,
      onMouseDown: (event) => event.preventDefault(),
      onClick: (event) => {
        event.preventDefault();
        onClick();
      },
      className: "inline-flex h-11 min-w-11 items-center justify-center rounded-md px-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary " + (active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted") + " disabled:cursor-not-allowed disabled:opacity-35",
      children
    }
  );
}
function ToolbarDivider() {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { "aria-hidden": "true", className: "mx-1 h-6 w-px shrink-0 bg-border" });
}
var toolbarSelect = "h-11 rounded-md border border-input bg-background px-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary";
var modeOptions = [
  { value: "visual", label: "Visual", icon: import_lucide_react.PenLine },
  { value: "html", label: "HTML", icon: import_lucide_react.Code2 },
  { value: "preview", label: "Pr\xE9via", icon: import_lucide_react.Eye }
];
function RichArticleEditor({
  value,
  visualValue,
  onChange,
  className,
  placeholder = "Escreva o conte\xFAdo do artigo aqui\u2026",
  theme = "edusc",
  themeTokens
}) {
  const source = value ?? "";
  const visualSource = visualValue ?? source;
  const [mode, setMode] = (0, import_react.useState)(() => hasExtendedMarkup(source) || visualSource !== source ? "html" : "visual");
  const previousSource = (0, import_react.useRef)(source);
  const [safePreview, setSafePreview] = (0, import_react.useState)("");
  const editorId = (0, import_react.useId)().replace(/:/g, "");
  const containsExtendedMarkup = hasExtendedMarkup(source) || visualSource !== source;
  const tokenVariables = {
    "--tsrae-primary": themeTokens?.primary,
    "--tsrae-on-primary": themeTokens?.onPrimary,
    "--tsrae-background": themeTokens?.background,
    "--tsrae-card": themeTokens?.panel,
    "--tsrae-muted": themeTokens?.muted,
    "--tsrae-foreground": themeTokens?.foreground,
    "--tsrae-muted-foreground": themeTokens?.mutedForeground,
    "--tsrae-border": themeTokens?.border,
    "--tsrae-input": themeTokens?.input,
    "--tsrae-editor-surface": themeTokens?.editorSurface,
    "--tsrae-editor-ink": themeTokens?.editorText,
    "--tsrae-editor-heading": themeTokens?.editorHeading,
    "--tsrae-editor-link": themeTokens?.editorLink,
    "--tsrae-preview-bg": themeTokens?.previewBackground,
    "--tsrae-preview-paper": themeTokens?.previewPaper,
    "--tsrae-warning-bg": themeTokens?.warningBackground,
    "--tsrae-warning-text": themeTokens?.warningText
  };
  const themeStyle = Object.fromEntries(Object.entries(tokenVariables).filter((entry) => Boolean(entry[1])));
  const editor = (0, import_react2.useEditor)({
    immediatelyRender: false,
    extensions: [
      import_starter_kit.default.configure({
        codeBlock: false,
        link: {
          openOnClick: false,
          HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" }
        }
      }),
      import_extension_text_style.TextStyle,
      import_extension_text_style.Color,
      import_extension_text_style.BackgroundColor,
      import_extension_text_style.FontFamily,
      import_extension_text_style.FontSize,
      import_extension_code_block.CodeBlock,
      import_extension_image.Image.configure({ allowBase64: true }),
      import_extension_table.Table.configure({ resizable: true }),
      import_extension_table.TableRow,
      import_extension_table.TableHeader,
      import_extension_table.TableCell,
      import_extension_text_align.TextAlign.configure({ types: ["heading", "paragraph"] }),
      import_extension_character_count.CharacterCount,
      import_extension_placeholder.Placeholder.configure({ placeholder })
    ],
    content: visualSource,
    onUpdate({ editor: currentEditor }) {
      onChange(currentEditor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "tsrae-article-editor-content min-h-[360px] focus:outline-none",
        spellcheck: "true"
      }
    }
  });
  (0, import_react.useEffect)(() => {
    if (!editor || editor.getHTML() === visualSource) return;
    editor.commands.setContent(visualSource, { emitUpdate: false });
  }, [editor, visualSource, mode]);
  (0, import_react.useEffect)(() => {
    if (!previousSource.current.trim() && source.trim() && (hasExtendedMarkup(source) || visualSource !== source)) {
      setMode("html");
    }
    previousSource.current = source;
  }, [source, visualSource]);
  (0, import_react.useEffect)(() => {
    setSafePreview(import_dompurify.default.sanitize(source, { USE_PROFILES: { html: true } }));
  }, [source]);
  const setLink = (0, import_react.useCallback)(() => {
    if (!editor) return;
    const current = editor.getAttributes("link").href;
    const url = window.prompt("Endere\xE7o do link:", current ?? "https://");
    if (url === null) return;
    if (!url.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    const candidate = url.trim();
    if (!isSafeEditorUrl(candidate, "link")) {
      window.alert("Informe um endere\xE7o HTTPS, HTTP, e-mail, telefone ou um caminho interno v\xE1lido.");
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: candidate }).run();
  }, [editor]);
  const insertImage = (0, import_react.useCallback)(() => {
    if (!editor) return;
    const url = window.prompt("URL da imagem (ela ser\xE1 inserida no ponto do cursor):");
    if (!url?.trim()) return;
    const candidate = url.trim();
    if (!isSafeEditorUrl(candidate, "image")) {
      window.alert("Use uma URL HTTPS ou um caminho de imagem do pr\xF3prio site.");
      return;
    }
    const alt = window.prompt("Texto alternativo da imagem (alt):") ?? "";
    editor.chain().focus().setImage({ src: candidate, alt }).run();
  }, [editor]);
  const insertTable = (0, import_react.useCallback)(() => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);
  const plainText = editor?.getText() ?? visualSource.replace(/<[^>]*>/g, " ");
  const wordCount = plainText.trim() ? plainText.trim().split(/\s+/).length : 0;
  const characterCount = plainText.length;
  const textStyle = editor?.getAttributes("textStyle");
  const blockStyle = !editor ? "paragraph" : editor.isActive("heading", { level: 1 }) ? "h1" : editor.isActive("heading", { level: 2 }) ? "h2" : editor.isActive("heading", { level: 3 }) ? "h3" : editor.isActive("blockquote") ? "quote" : editor.isActive("codeBlock") ? "code" : "paragraph";
  const inTable = !!editor?.isActive("table");
  function switchToVisual() {
    if (containsExtendedMarkup && typeof window !== "undefined") {
      const proceed = window.confirm(
        "Este artigo cont\xE9m HTML especial, blocos ou atributos de layout. O modo visual pode normalizar ou remover parte dessa estrutura quando voc\xEA editar. O HTML original continuar\xE1 preservado enquanto voc\xEA n\xE3o alterar o conte\xFAdo visual. Deseja continuar?"
      );
      if (!proceed) return;
    }
    setMode("visual");
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "tsrae-editor tsrae-theme-" + theme + " flex min-h-[520px] min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm " + (className ?? ""), style: themeStyle, "data-theme": theme, "aria-label": "Editor de conte\xFAdo do artigo", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/30 px-3 py-2", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex flex-wrap items-center gap-1 rounded-lg border border-border bg-background p-1", role: "group", "aria-label": "Modo de edi\xE7\xE3o do artigo", children: modeOptions.map((option) => {
        const Icon = option.icon;
        const active = mode === option.value;
        return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          "button",
          {
            type: "button",
            "aria-pressed": active,
            onClick: () => option.value === "visual" ? switchToVisual() : setMode(option.value),
            className: "inline-flex min-h-10 items-center gap-1.5 rounded-md px-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary " + (active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"),
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { size: 15 }),
              " ",
              option.label
            ]
          },
          option.value
        );
      }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "text-xs tabular-nums text-muted-foreground", children: [
        source.length.toLocaleString("pt-BR"),
        " caracteres HTML"
      ] })
    ] }),
    mode === "visual" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      containsExtendedMarkup && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex shrink-0 items-start gap-2 border-b border-amber-300 bg-warning-bg px-3 py-2 text-xs leading-relaxed text-warning-text dark:border-amber-800", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.AlertTriangle, { size: 15, className: "mt-0.5 shrink-0" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Este artigo cont\xE9m blocos, atributos ou elementos especiais. Para preservar a estrutura original, mantenha o modo HTML. A visualiza\xE7\xE3o n\xE3o altera o conte\xFAdo at\xE9 voc\xEA fazer uma edi\xE7\xE3o." })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "shrink-0 border-b border-border bg-muted/20 px-2 py-2", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { role: "toolbar", "aria-label": "Formata\xE7\xE3o do artigo", className: "flex flex-wrap items-center gap-1", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolbarButton, { label: "Desfazer (Ctrl+Z)", onClick: () => editor?.chain().focus().undo().run(), disabled: !editor?.can().undo(), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Undo2, { size: 16 }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolbarButton, { label: "Refazer (Ctrl+Shift+Z)", onClick: () => editor?.chain().focus().redo().run(), disabled: !editor?.can().redo(), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Redo2, { size: 16 }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolbarDivider, {}),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { className: "sr-only", htmlFor: editorId + "-block-style", children: "Estilo do par\xE1grafo" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", { id: editorId + "-block-style", "aria-label": "Estilo do par\xE1grafo", value: blockStyle, onChange: (event) => {
          if (!editor) return;
          const value2 = event.target.value;
          const chain = editor.chain().focus();
          if (value2 === "paragraph") chain.setParagraph().run();
          else if (value2 === "h1") chain.toggleHeading({ level: 1 }).run();
          else if (value2 === "h2") chain.toggleHeading({ level: 2 }).run();
          else if (value2 === "h3") chain.toggleHeading({ level: 3 }).run();
          else if (value2 === "quote") chain.toggleBlockquote().run();
          else if (value2 === "code") chain.toggleCodeBlock().run();
        }, className: toolbarSelect + " w-[132px]", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "paragraph", children: "Par\xE1grafo" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "h1", children: "T\xEDtulo 1" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "h2", children: "T\xEDtulo 2" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "h3", children: "T\xEDtulo 3" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "quote", children: "Cita\xE7\xE3o" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "code", children: "C\xF3digo" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { className: "sr-only", htmlFor: editorId + "-font-family", children: "Fonte" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", { id: editorId + "-font-family", "aria-label": "Fonte", value: textStyle?.fontFamily ?? "", onChange: (event) => {
          if (!editor) return;
          if (event.target.value) editor.chain().focus().setFontFamily(event.target.value).run();
          else editor.chain().focus().unsetFontFamily().run();
        }, className: toolbarSelect + " w-[120px]", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "", children: "Fonte padr\xE3o" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "Arial, sans-serif", children: "Arial" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "Georgia, serif", children: "Georgia" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "'Times New Roman', serif", children: "Times New Roman" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "Verdana, sans-serif", children: "Verdana" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "'Courier New', monospace", children: "Courier New" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { className: "sr-only", htmlFor: editorId + "-font-size", children: "Tamanho da fonte" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", { id: editorId + "-font-size", "aria-label": "Tamanho da fonte", value: textStyle?.fontSize ?? "", onChange: (event) => {
          if (!editor) return;
          if (event.target.value) editor.chain().focus().setFontSize(event.target.value).run();
          else editor.chain().focus().unsetFontSize().run();
        }, className: toolbarSelect + " w-[92px]", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "", children: "Tamanho" }),
          ["12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px", "36px"].map((size) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: size, children: size.replace("px", "") }, size))
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolbarDivider, {}),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolbarButton, { label: "Negrito (Ctrl+B)", active: !!editor?.isActive("bold"), onClick: () => editor?.chain().focus().toggleBold().run(), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Bold, { size: 16 }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolbarButton, { label: "It\xE1lico (Ctrl+I)", active: !!editor?.isActive("italic"), onClick: () => editor?.chain().focus().toggleItalic().run(), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Italic, { size: 16 }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolbarButton, { label: "Sublinhado (Ctrl+U)", active: !!editor?.isActive("underline"), onClick: () => editor?.chain().focus().toggleUnderline().run(), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Underline, { size: 16 }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolbarButton, { label: "Tachado", active: !!editor?.isActive("strike"), onClick: () => editor?.chain().focus().toggleStrike().run(), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Strikethrough, { size: 16 }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolbarButton, { label: "C\xF3digo inline", active: !!editor?.isActive("code"), onClick: () => editor?.chain().focus().toggleCode().run(), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Code, { size: 16 }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolbarDivider, {}),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolbarButton, { label: "Alinhar \xE0 esquerda", active: !!editor?.isActive({ textAlign: "left" }), onClick: () => editor?.chain().focus().setTextAlign("left").run(), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.AlignLeft, { size: 16 }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolbarButton, { label: "Centralizar", active: !!editor?.isActive({ textAlign: "center" }), onClick: () => editor?.chain().focus().setTextAlign("center").run(), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.AlignCenter, { size: 16 }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolbarButton, { label: "Alinhar \xE0 direita", active: !!editor?.isActive({ textAlign: "right" }), onClick: () => editor?.chain().focus().setTextAlign("right").run(), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.AlignRight, { size: 16 }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolbarButton, { label: "Justificar", active: !!editor?.isActive({ textAlign: "justify" }), onClick: () => editor?.chain().focus().setTextAlign("justify").run(), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.AlignJustify, { size: 16 }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolbarDivider, {}),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolbarButton, { label: "Lista com marcadores", active: !!editor?.isActive("bulletList"), onClick: () => editor?.chain().focus().toggleBulletList().run(), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.List, { size: 16 }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolbarButton, { label: "Lista numerada", active: !!editor?.isActive("orderedList"), onClick: () => editor?.chain().focus().toggleOrderedList().run(), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.ListOrdered, { size: 16 }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolbarButton, { label: "Cita\xE7\xE3o em bloco", active: !!editor?.isActive("blockquote"), onClick: () => editor?.chain().focus().toggleBlockquote().run(), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Quote, { size: 16 }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolbarButton, { label: "Bloco de c\xF3digo", active: !!editor?.isActive("codeBlock"), onClick: () => editor?.chain().focus().toggleCodeBlock().run(), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.CodeSquare, { size: 16 }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolbarButton, { label: "Linha horizontal", onClick: () => editor?.chain().focus().setHorizontalRule().run(), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Minus, { size: 16 }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolbarDivider, {}),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolbarButton, { label: "Inserir ou editar link", active: !!editor?.isActive("link"), onClick: setLink, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Link, { size: 16 }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolbarButton, { label: "Inserir imagem por URL", onClick: insertImage, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Image, { size: 16 }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolbarButton, { label: "Inserir tabela 3 \xD7 3", onClick: insertTable, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Table, { size: 16 }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolbarDivider, {}),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { title: "Cor do texto", className: "relative inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-md text-foreground hover:bg-muted", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Palette, { size: 16 }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "input",
            {
              "aria-label": "Cor do texto",
              type: "color",
              value: /^#[0-9a-f]{6}$/i.test(textStyle?.color ?? "") ? textStyle.color : "#10213f",
              className: "absolute inset-0 h-full w-full cursor-pointer opacity-0",
              onChange: (event) => editor?.chain().focus().setColor(event.target.value).run()
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { title: "Real\xE7ar texto", className: "relative inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-md text-foreground hover:bg-muted", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Highlighter, { size: 16 }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "input",
            {
              "aria-label": "Cor de destaque",
              type: "color",
              value: /^#[0-9a-f]{6}$/i.test(textStyle?.backgroundColor ?? "") ? textStyle.backgroundColor : "#facc15",
              className: "absolute inset-0 h-full w-full cursor-pointer opacity-0",
              onChange: (event) => editor?.chain().focus().setBackgroundColor(event.target.value).run()
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolbarButton, { label: "Remover cor do texto", onClick: () => editor?.chain().focus().unsetColor().run(), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-base font-bold", children: "A" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolbarButton, { label: "Remover destaque", onClick: () => editor?.chain().focus().unsetBackgroundColor().run(), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Eraser, { size: 16 }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolbarButton, { label: "Limpar formata\xE7\xE3o da sele\xE7\xE3o", onClick: () => editor?.chain().focus().unsetAllMarks().clearNodes().run(), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Trash2, { size: 16 }) }),
        inTable && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolbarDivider, {}),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ToolbarButton, { label: "Adicionar linha", onClick: () => editor?.chain().focus().addRowAfter().run(), children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Rows3, { size: 16 }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 10 })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ToolbarButton, { label: "Adicionar coluna", onClick: () => editor?.chain().focus().addColumnAfter().run(), children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Columns3, { size: 16 }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 10 })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ToolbarButton, { label: "Excluir linha", onClick: () => editor?.chain().focus().deleteRow().run(), children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Rows3, { size: 16 }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Trash2, { size: 10 })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ToolbarButton, { label: "Excluir coluna", onClick: () => editor?.chain().focus().deleteColumn().run(), children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Columns3, { size: 16 }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Trash2, { size: 10 })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ToolbarButton, { label: "Excluir tabela", onClick: () => editor?.chain().focus().deleteTable().run(), children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Table, { size: 16 }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Trash2, { size: 10 })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "min-h-[420px] flex-1 overflow-y-auto bg-editor-surface px-4 py-5 text-editor-ink sm:px-7", children: editor ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react2.EditorContent, { editor }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-sm text-muted-foreground", children: "Preparando o editor\u2026" }) })
    ] }),
    mode === "html" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex min-h-[420px] flex-1 flex-col bg-slate-950", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex shrink-0 items-center justify-between gap-3 border-b border-slate-700 px-3 py-2 text-xs text-slate-300", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "font-medium", children: "C\xF3digo HTML do artigo" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Tags, classes, tabelas e atributos" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "textarea",
        {
          "aria-label": "C\xF3digo HTML do artigo",
          value: source,
          onChange: (event) => onChange(event.target.value),
          spellCheck: false,
          autoCapitalize: "off",
          autoCorrect: "off",
          className: "min-h-[420px] flex-1 resize-y bg-transparent p-4 font-mono text-base leading-6 text-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-400",
          placeholder: "Cole ou edite o HTML do artigo aqui\u2026"
        }
      )
    ] }),
    mode === "preview" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "min-h-[420px] flex-1 overflow-y-auto bg-preview-bg p-3 sm:p-6", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mx-auto min-h-full max-w-[820px] bg-preview-paper px-5 py-6 shadow-sm sm:px-10 sm:py-9", children: safePreview ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("article", { className: "tsrae-article-preview", dangerouslySetInnerHTML: { __html: safePreview } }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-sm text-slate-400", children: "A pr\xE9via aparecer\xE1 aqui quando houver conte\xFAdo." }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "mx-auto mt-3 max-w-[820px] text-xs text-slate-500", children: "Pr\xE9via sanitizada. Scripts, formul\xE1rios e embeds externos n\xE3o s\xE3o executados nesta janela." })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
        wordCount.toLocaleString("pt-BR"),
        " ",
        wordCount === 1 ? "palavra" : "palavras",
        " \xB7 ",
        characterCount.toLocaleString("pt-BR"),
        " caracteres de texto"
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Atalhos: Ctrl+B negrito \xB7 Ctrl+I it\xE1lico \xB7 Ctrl+Z desfazer" })
    ] })
  ] });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  RichArticleEditor,
  getEditorTextStats,
  hasExtendedMarkup,
  isSafeEditorUrl
});
