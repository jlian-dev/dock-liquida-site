// Renderização local de Markdown básico, sem inserir HTML vindo das releases.
(() => {
  function inline(parent, source, base) {
    const pattern = /\[([^\]]+)\]\(([^\s)]+)\)|\*\*([^*]+)\*\*|`([^`]+)`/g;
    let cursor = 0;
    for (const match of source.matchAll(pattern)) {
      parent.append(document.createTextNode(source.slice(cursor, match.index)));
      let node;
      if (match[1]) {
        try {
          const url = new URL(match[2], base);
          if (!['https:', 'http:'].includes(url.protocol)) throw new Error('Protocolo não permitido');
          node = document.createElement('a');
          node.href = url.href;
          node.target = '_blank';
          node.rel = 'noopener noreferrer';
          node.textContent = match[1];
        } catch { node = document.createTextNode(match[1]); }
      } else {
        node = document.createElement(match[3] ? 'strong' : 'code');
        node.textContent = match[3] || match[4];
      }
      parent.append(node);
      cursor = match.index + match[0].length;
    }
    parent.append(document.createTextNode(source.slice(cursor)));
  }
  window.renderDockMarkdown = (source, base) => {
    const fragment = document.createDocumentFragment();
    let list = null, code = null;
    for (const line of String(source || '').replace(/\r\n?/g, '\n').split('\n')) {
      if (/^\s*```/.test(line)) {
        if (code) code = null;
        else { const pre = document.createElement('pre'); code = document.createElement('code'); pre.append(code); fragment.append(pre); }
        list = null;
        continue;
      }
      if (code) { code.append(document.createTextNode(line + '\n')); continue; }
      if (!line.trim()) { list = null; continue; }
      const heading = line.match(/^\s{0,3}#{1,6}\s+(.+)/);
      const bullet = line.match(/^\s*(?:[-*+]\s+|\d+[.)]\s+)(.*)/);
      let node;
      if (heading) { list = null; node = document.createElement('h4'); inline(node, heading[1], base); fragment.append(node); }
      else if (bullet) {
        const type = /^\s*\d/.test(line) ? 'ol' : 'ul';
        if (!list || list.tagName.toLowerCase() !== type) { list = document.createElement(type); fragment.append(list); }
        node = document.createElement('li'); inline(node, bullet[1], base); list.append(node);
      } else { list = null; node = document.createElement('p'); inline(node, line, base); fragment.append(node); }
    }
    return fragment;
  };
})();
