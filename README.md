# Dock Líquida — GitHub Pages

Versão estática completa, sem comunidade, painel administrativo, banco ou backend. Mantém o visual Liquid Glass, capturas do app, animações, FAQ, sininho de novidades, versões finais, Beta, changelogs e contadores de downloads.

## Publicar sem terminal

1. Extraia o ZIP.
2. Envie TODO o conteúdo para a raiz de `jlian-dev/dock-liquida-site`, incluindo a pasta `assets`, substituindo os arquivos existentes. Não envie o ZIP fechado e não crie uma pasta intermediária.
3. Remova do repositório os arquivos e pastas antigos listados abaixo. Enviar um ZIP extraído por cima NÃO apaga arquivos que ficaram de fora do pacote.
4. Em Settings → Pages, selecione Deploy from a branch, branch `main`, pasta `/(root)` e Save.
5. Aguarde o workflow de Pages terminar com sucesso. O endereço é `https://jlian-dev.github.io/dock-liquida-site/`.

Se o GitHub não enviar `.nojekyll` por estar oculto, crie um arquivo vazio com esse nome em Add file → Create new file. O site não depende de Node, npm, build ou variáveis de ambiente.

## Remover do repositório antigo

Pastas: `api/`, `server/`, `tests/`.

Arquivos: `admin.html`, `admin.js`, `comunidade.html`, `community.js`, `community-backend.js`, `community-config.js`, `vercel.json`, `CONFIGURAR-VERCEL.md`, `package.json`, `package-lock.json`, `build.mjs`, `dev-server.mjs`.

Não exclua o repositório. Preserve as configurações do GitHub Pages e os arquivos deste pacote. Se tiver uma pasta `dist` antiga, ela também deixa de ser usada: a publicação agora lê a raiz.

## Atualizações automáticas

Versões, notas e contadores usam a API pública de Releases de `jlian-dev/wallpaper-dockglass`. O sininho apresenta as 20 releases finais ou betas numeradas mais recentes com APK. A consulta acontece ao abrir o site e no botão Atualizar dos downloads. Marcar como lidas guarda a leitura apenas neste navegador. A API GitHub possui limites de acesso; falhas mostram uma mensagem para tentar novamente.

Betas precisam estar marcadas como Pre-release e terminar em `-beta1`, `-beta2` etc. Também é aceito `-beta(1)` literal. Drafts e betas sem número não entram na aba.

## Hospedagem anterior

Este pacote não exclui sua conta ou seus recursos Vercel, Neon e Blob. Confirme que o Pages publicou com sucesso antes de encerrar a hospedagem anterior. Ele também não resolve por si só a falha de fila do GitHub Pages que apareceu nos logs.

## Verificação

Conferidos os links e arquivos locais, os pontos de montagem do FAQ, novidades e listas de releases, ausência de chamadas ao backend da comunidade e sintaxe JavaScript. Os recursos FAQ e novidades foram testados na prévia na atualização anterior; esta preparação remove os links e a pergunta da comunidade e mantém o restante.
