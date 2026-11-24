# TS Digitais — Rich Article Editor

Um único editor React/TipTap para os sites da TS Digitais. A biblioteca centraliza **funcionalidade e comportamento**; cada projeto consumidor mantém identidade visual, formulário, permissões e persistência.

## O que é compartilhado

- Editor visual TipTap com formatação, alinhamento, listas, citações e código.
- Fontes, tamanhos, cores de texto e realce.
- Links e imagens com validação de URL.
- Tabelas: inserir, acrescentar/remover linhas e colunas e excluir tabela.
- Desfazer/refazer e contagem de palavras/caracteres.
- Modos Visual, HTML e Prévia sanitizada.
- Identificação de HTML complexo e aviso antes de editar conteúdo potencialmente normalizado pelo modo visual.
- Acessibilidade por teclado, foco visível e controles de toque adequados.

## Instalação nos sites

O repositório é público e a instalação usa GitHub; não exige uma conta npm paga:

```bash
npm install "github:Tiagocxs1/ts-rich-article-editor#v1.0.0"
```

A dependência equivalente no `package.json` é:

```json
{
  "dependencies": {
    "@ts-digitais/rich-article-editor": "github:Tiagocxs1/ts-rich-article-editor#v1.0.0"
  }
}
```

O pacote inclui o `dist/` compilado no repositório, portanto a instalação não precisa de token npm, nem de script de compilação na hospedagem.

## Uso React

Carregue a folha de estilos uma vez no layout global do site:

```tsx
import '@ts-digitais/rich-article-editor/styles.css';
```

Use o mesmo componente em qualquer formulário:

```tsx
import { RichArticleEditor } from '@ts-digitais/rich-article-editor';

<RichArticleEditor
  value={html}
  onChange={setHtml}
  theme="edusc"
  placeholder="Escreva o artigo…"
/>
```

O componente não salva por conta própria. O site controla o conteúdo e continua responsável por validar permissões, enviar o HTML ao endpoint e confirmar o salvamento.

Para formulários HTML tradicionais, mantenha um campo hidden controlado pelo mesmo estado:

```tsx
<input type="hidden" name="content" value={html} />
<RichArticleEditor value={html} onChange={setHtml} theme="edusc" />
```

## Temas

- `theme="edusc"`: canvas claro, papel branco e superfícies neutras.
- `theme="dashboard"`: superfícies escuras e acento dourado.
- `theme="light"` / `theme="dark"`: aliases para projetos futuros.

Qualquer site pode fornecer `themeTokens` sem alterar a lógica. Tokens disponíveis: `primary`, `onPrimary`, `background`, `panel`, `muted`, `foreground`, `mutedForeground`, `border`, `input`, `editorSurface`, `editorText`, `editorHeading`, `editorLink`, `previewBackground`, `previewPaper`, `warningBackground` e `warningText`.

## Versionamento e distribuição

1. A alteração funcional é feita **neste repositório**.
2. CI executa typecheck, testes e build.
3. Uma versão SemVer é publicada como tag imutável, por exemplo `v1.1.0`.
4. Os repositórios consumidores recebem PR de atualização da dependência via Dependabot.
5. Cada PR executa build/testes próprios. Depois da revisão, o projeto consumidor decide quando promover a versão para produção.

Isso evita cópias divergentes e também evita alterar silenciosamente todos os sites com uma publicação do pacote. Uma atualização central gera atualizações rastreáveis em cada consumidor.

## Desenvolvimento local

```bash
npm install
npm run check
```

O build gera JavaScript ESM/CommonJS, declarações TypeScript e `dist/styles.css`. O diretório `dist/` é versionado intencionalmente para permitir instalação direta via GitHub.

## Segurança e limites

- O preview HTML é sanitizado com DOMPurify. Isso não substitui sanitização e validação no servidor que persiste/publica o artigo.
- Links e imagens passam por validação de esquema; a política de domínios permitidos pode ser reforçada pelo site consumidor.
- Não execute HTML submetido por usuários como aplicação. Scripts, formulários e embeds não são habilitados pelo preview.
- HTML complexo pode não ser representado integralmente pelo editor visual. Nesses casos, o modo HTML é a opção de preservação; confirme antes de converter para Visual.
- Autorização, RLS, publicação, upload de mídia e persistência continuam sob controle de cada site.

## Licença

MIT. Veja `LICENSE`.
