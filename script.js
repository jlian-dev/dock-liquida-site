// APKs finais e uma aba separada para pré-releases beta numeradas.
const repo = 'jlian-dev/wallpaper-dockglass';
const api = `https://api.github.com/repos/${repo}/releases?per_page=100`;
const title = document.getElementById('release-title');
const description = document.getElementById('release-description');
const list = document.getElementById('release-list');
const refresh = document.getElementById('refresh-releases');
const betaTitle = document.getElementById('beta-title');
const betaDescription = document.getElementById('beta-description');
const betaList = document.getElementById('beta-list');
const betaCount = document.getElementById('beta-count');
// Aceita -beta1 ou -beta(1), sempre no final da tag. Não aceita -beta sem número.
const numberedBeta = release => /-beta(?:[0-9]+|\([0-9]+\))$/i.test(release.tag_name || '');
document.getElementById('year').textContent = new Date().getFullYear();
const formatSize = bytes => `${(bytes / 1048576).toFixed(1).replace('.', ',')} MB`;
const validApk = (a, beta = false) => /\.apk$/i.test(a.name) && !/(debug|unsigned|unaligned)/i.test(a.name) && (beta || !/beta/i.test(a.name)) && a.browser_download_url;
function item(tag, className, value) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (value != null) el.textContent = value;
  return el;
}
function drawRelease(release, index, beta = false) {
  const row = item('article', index === 0 ? 'apk-row is-latest' : 'apk-row');
  const details = item('div', 'apk-details');
  if (index === 0) details.append(item('span', 'latest-badge', beta ? 'BETA MAIS RECENTE' : 'MAIS RECENTE'));
  details.append(item('strong', 'apk-version', release.name || release.tag_name || 'Versão estável'));
  const published = release.published_at ? new Date(release.published_at).toLocaleDateString('pt-BR') : 'Data não informada';
  details.append(item('small', 'apk-meta', `${release.tag_name || ''} · ${published}`));
  const assets = release.assets.filter(apk => validApk(apk, beta));
  const buttons = item('div', 'apk-downloads');
  for (const apk of assets) {
    const a = item('a', 'apk-download');
    a.href = apk.browser_download_url;
    a.setAttribute('download', apk.name);
    a.setAttribute('aria-label', `Baixar ${apk.name}, ${formatSize(apk.size || 0)}`);
    a.title = `Baixar ${apk.name}`;
    a.innerHTML = '<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M5 17v3h14v-3"/></svg>';
    const label = item('span', '', assets.length > 1 ? apk.name : 'Baixar APK');
    const size = item('small', '', formatSize(apk.size || 0));
    a.append(label, size);
    const option = item('div', 'apk-option');
    const count = apk.download_count;
    const counter = item('small', 'apk-count',
      Number.isSafeInteger(count) && count >= 0
        ? `${count.toLocaleString('pt-BR')} ${count === 1 ? 'download' : 'downloads'}`
        : 'Contagem indisponível');
    counter.title = 'Total deste APK registrado pelo GitHub, incluindo downloads pelo site e pelo GitHub. Não representa pessoas únicas.';
    option.append(a, counter);
    buttons.append(option);
  }
  const main = item('div', 'apk-release-main');
  main.append(details, buttons);
  const notes = item('details', 'release-notes');
  const summary = item('summary');
  summary.append(item('span', '', `Notas da versão ${release.tag_name || ''}`), item('span', 'notes-chevron', '+'));
  const content = item('div', 'notes-content');
  const body = typeof release.body === 'string' ? release.body.trim() : '';
  if (body) content.append(window.renderDockMarkdown(body, release.html_url || `https://github.com/${repo}/releases/`));
  else content.append(item('p', 'notes-empty', 'Nenhuma nota foi publicada para esta versão.'));
  const original = item('a', 'notes-original', 'Ver release no GitHub ↗');
  original.href = release.html_url || `https://github.com/${repo}/releases`;
  original.target = '_blank';
  original.rel = 'noopener noreferrer';
  content.append(original);
  notes.append(summary, content);
  row.append(main, notes);
  return row;
}
// Central de novidades: usa as mesmas releases dos downloads, sem nova consulta.
const newsBell = document.getElementById('news-bell');
const newsDialog = document.getElementById('news-dialog');
const newsBadge = document.getElementById('news-badge');
const newsList = document.getElementById('news-list');
const newsStatus = document.getElementById('news-status');
const newsRead = document.getElementById('news-read');
const newsStorageKey = 'dock-news-read-v1';
let newsEntries = [], seenNews = new Set();
try {
  const stored = JSON.parse(localStorage.getItem(newsStorageKey) || '[]');
  if (Array.isArray(stored)) seenNews = new Set(stored.filter(value => typeof value === 'string'));
} catch { /* Sem armazenamento, a leitura permanece apenas nesta visita. */ }
const newsKey = release => `${release.id || release.tag_name}:${release.updated_at || release.published_at || ''}`;
function updateNewsBadge() {
  const unread = newsEntries.filter(release => !seenNews.has(newsKey(release))).length;
  newsBadge.hidden = unread === 0;
  newsBadge.textContent = unread > 9 ? '9+' : String(unread);
  newsBell.setAttribute('aria-label', unread ? `Abrir novidades, ${unread} não lidas` : 'Abrir novidades');
  newsStatus.textContent = unread ? `${unread} novidade${unread === 1 ? '' : 's'} não lida${unread === 1 ? '' : 's'}.` : newsEntries.length ? 'Você está em dia.' : 'Nenhuma novidade publicada ainda.';
  newsRead.disabled = unread === 0;
}
function drawNews(releases) {
  newsEntries = releases.filter(r => !r.draft && (!r.prerelease || numberedBeta(r)) && r.assets?.some(apk => validApk(apk, Boolean(r.prerelease))))
    .sort((a,b) => Date.parse(b.published_at || b.created_at || 0) - Date.parse(a.published_at || a.created_at || 0)).slice(0,20);
  newsList.replaceChildren();
  for (const release of newsEntries) {
    const entry = item('article', 'news-entry');
    entry.dataset.newsKey = newsKey(release);
    entry.classList.toggle('is-unread', !seenNews.has(newsKey(release)));
    const meta = item('p', 'news-meta', release.prerelease ? 'BETA · EM TESTE' : 'VERSÃO FINAL');
    const heading = item('h3', '', release.tag_name || release.name || 'Nova versão');
    const date = item('time', 'news-date', release.published_at ? new Date(release.published_at).toLocaleDateString('pt-BR') : 'Data não informada');
    if (release.published_at) date.dateTime = release.published_at;
    const notes = item('details', 'news-notes');
    notes.append(item('summary', '', 'O que mudou nesta versão?'));
    const text = item('div', 'notes-content');
    const body = typeof release.body === 'string' ? release.body.trim() : '';
    if (body) text.append(window.renderDockMarkdown(body, release.html_url || `https://github.com/${repo}/releases`));
    else text.append(item('p', '', 'As notas desta versão ainda não foram publicadas.'));
    notes.append(text);
    const link = item('a', 'news-release-link', 'Ver versão e downloads ↗');
    link.href = release.html_url || `https://github.com/${repo}/releases`;
    link.target = '_blank'; link.rel = 'noopener noreferrer';
    entry.append(meta, heading, date, notes, link); newsList.append(entry);
  }
  newsList.setAttribute('aria-busy', 'false'); updateNewsBadge();
}
newsBell.addEventListener('click', () => newsDialog.showModal());
document.getElementById('news-close').addEventListener('click', () => newsDialog.close());
newsDialog.addEventListener('click', event => { if (event.target === newsDialog) { const box = newsDialog.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) newsDialog.close(); } });
newsRead.addEventListener('click', () => {
  for (const release of newsEntries) seenNews.add(newsKey(release));
  try { localStorage.setItem(newsStorageKey, JSON.stringify([...seenNews].slice(-300))); } catch {}
  newsList.querySelectorAll('.news-entry').forEach(entry => entry.classList.remove('is-unread'));
  updateNewsBadge();
});
async function loadReleases() {
  refresh.disabled = true;
  newsList.setAttribute('aria-busy', 'true');
  newsRead.disabled = true;
  newsStatus.textContent = 'Buscando novidades…';
  title.textContent = 'Carregando versões finais…';
  description.textContent = 'Consultando o GitHub Releases';
  betaTitle.textContent = 'Carregando versões beta…';
  betaDescription.textContent = 'Consultando as pré-releases com beta numerada.';
  betaCount.textContent = '…';
  list.replaceChildren(); betaList.replaceChildren();
  try {
    const releases = [];
    let page = 1;
    for (;;) {
      const response = await fetch(`${api}&page=${page}`, { headers: {Accept:'application/vnd.github+json'} });
      if (!response.ok) throw new Error(`GitHub API: ${response.status}`);
      const batch = await response.json();
      if (!Array.isArray(batch)) throw new Error('Resposta inválida');
      releases.push(...batch);
      if (!response.headers.get('Link')?.includes('rel="next"')) break;
      page += 1;
    }
    drawNews(releases);
    const newestFirst = (a, b) => Date.parse(b.published_at || b.created_at || 0) - Date.parse(a.published_at || a.created_at || 0);
    const stable = releases.filter(r => !r.draft && !r.prerelease && !numberedBeta(r) && r.assets?.some(apk => validApk(apk))).sort(newestFirst);
    const betas = releases.filter(r => !r.draft && r.prerelease && numberedBeta(r) && r.assets?.some(apk => validApk(apk, true))).sort(newestFirst);
    title.textContent = stable.length ? 'APKs disponíveis' : 'Nenhum APK final disponível';
    description.textContent = stable.length ? `${stable.length} versão(ões) final(is) encontrada(s). Toque no botão para baixar.` : 'Nenhuma release final com APK foi encontrada.';
    stable.forEach((r, index) => list.append(drawRelease(r, index)));
    betaTitle.textContent = betas.length ? 'APKs beta disponíveis' : 'Nenhuma beta numerada disponível';
    betaDescription.textContent = betas.length ? `${betas.length} pré-release(s) com beta numerada encontrada(s).` : 'As pré-releases aparecerão aqui quando a tag terminar em -beta1, -beta2 e assim por diante, com um APK publicado.';
    betaCount.textContent = String(betas.length);
    betas.forEach((r, index) => betaList.append(drawRelease(r, index, true)));
  } catch (e) {
    title.textContent = 'Não foi possível carregar os APKs';
    description.textContent = 'Verifique a conexão e tente atualizar a lista.';
    betaTitle.textContent = 'Não foi possível carregar as betas';
    betaDescription.textContent = 'Use Atualizar na lista de versões para tentar novamente.';
    betaCount.textContent = '—';
    newsList.setAttribute('aria-busy', 'false');
    newsStatus.textContent = newsEntries.length ? 'Não foi possível atualizar. Exibindo a última consulta desta visita.' : 'Não foi possível carregar as novidades. Tente Atualizar na seção Downloads.';
    newsRead.disabled = !newsEntries.some(release => !seenNews.has(newsKey(release)));
    console.warn(e);
  } finally { refresh.disabled = false; }
}
refresh.addEventListener('click', loadReleases);
loadReleases();

// Revela cada elemento uma vez ao entrar na área visível.
// O conteúdo continua acessível se JavaScript ou animações não estiverem disponíveis.
(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reducedMotion.matches || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      if (!reducedMotion.matches) entry.target.classList.add('scroll-revealed');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0, rootMargin: '0px 0px -24px 0px' });

  document.querySelectorAll(
    '.section-label, .intro > h2, .feature-card, .details-copy, .settings-stage, .downloads-heading, .release-panel, .faq-heading, .faq-list, .closing, footer'
  ).forEach(element => observer.observe(element));
})();

// Destaques do aplicativo no seletor da apresentação.
const featureCaptions = [
  'Vidro líquido. Sua assinatura.',
  'Suas imagens. Tudo no lugar.',
  'Novos visuais. No seu ritmo.'
];
const featureSteps = document.querySelectorAll('[data-feature]');
featureSteps.forEach(button => {
  button.addEventListener('click', () => {
    const index = Number(button.dataset.feature);
    featureSteps.forEach(step => {
      const active = step === button;
      step.classList.toggle('is-active', active);
      step.setAttribute('aria-pressed', String(active));
    });
    document.getElementById('feature-number').textContent = `0${index + 1} / 03`;
    document.getElementById('feature-caption').textContent = featureCaptions[index];
  });
});

// Um painel de downloads, com abas acessíveis por toque e teclado.
const channelTabs = [...document.querySelectorAll('.release-tabs [role="tab"]')];
function selectReleaseChannel(beta, focus = false) {
  channelTabs.forEach((tab, index) => {
    const selected = index === (beta ? 1 : 0);
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    document.getElementById(tab.getAttribute('aria-controls')).hidden = !selected;
    if (selected && focus) tab.focus();
  });
}
channelTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectReleaseChannel(index === 1));
  tab.addEventListener('keydown', event => {
    if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : 1 - index;
    selectReleaseChannel(next === 1, true);
  });
});
function syncReleaseHash() {
  if (location.hash === '#betas') selectReleaseChannel(true);
  else if (location.hash === '#versoes') selectReleaseChannel(false);
}
window.addEventListener('hashchange', syncReleaseHash);
document.querySelectorAll('a[href="#betas"]').forEach(link => link.addEventListener('click', () => selectReleaseChannel(true)));
syncReleaseHash();
