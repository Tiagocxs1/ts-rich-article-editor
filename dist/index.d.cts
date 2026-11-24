import * as react from 'react';

type RichArticleEditorTheme = 'edusc' | 'dashboard' | 'light' | 'dark';
interface RichArticleEditorThemeTokens {
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
interface RichArticleEditorProps {
    value: string;
    onChange: (html: string) => void;
    visualValue?: string;
    className?: string;
    placeholder?: string;
    theme?: RichArticleEditorTheme;
    themeTokens?: RichArticleEditorThemeTokens;
}
declare function RichArticleEditor({ value, visualValue, onChange, className, placeholder, theme, themeTokens, }: RichArticleEditorProps): react.JSX.Element;

declare function hasExtendedMarkup(html: string): boolean;
declare function isSafeEditorUrl(value: string, kind?: 'link' | 'image'): boolean;
declare function getEditorTextStats(html: string): {
    words: number;
    characters: number;
};

export { RichArticleEditor, type RichArticleEditorProps, type RichArticleEditorTheme, type RichArticleEditorThemeTokens, getEditorTextStats, hasExtendedMarkup, isSafeEditorUrl };
