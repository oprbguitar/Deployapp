const state = { files: [], selected: new Set(), activeIndex: null, focusMode: false };
const $ = (id) => document.getElementById(id);
const supported = {
  Flowchart: ['.mmd', '.mermaid', '.puml', '.drawio', '.vsdx', '.md'],
  Class: ['.puml', '.mmd', '.mermaid', '.md'],
  Sequence: ['.puml', '.mmd', '.mermaid', '.md'],
  BPMN: ['.bpmn', '.xml', '.md'],
  C4: ['.puml', '.c4', '.md'],
  Gantt: ['.mpp', '.mmd', '.mermaid', '.puml', '.md']
};

function extensionOf(name) {
  const i = name.lastIndexOf('.');
  return i === -1 ? '' : name.slice(i).toLowerCase();
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function detectKinds(ext) {
  return Object.entries(supported)
    .filter(([, exts]) => exts.includes(ext))
    .map(([kind]) => kind);
}

function isMermaidFile(file) {
  return ['.mmd', '.mermaid'].includes(file.ext);
}

function isMarkdownFile(file) {
  return file.ext === '.md';
}

function parseInline(text) {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

function markdownToHtml(mdText) {
  const lines = mdText.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let inCode = false;
  let codeLines = [];

  const pushParagraph = (line) => out.push(`<p>${parseInline(line)}</p>`);

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];

    if (line.trim().startsWith('```')) {
      if (!inCode) {
        inCode = true;
        codeLines = [];
      } else {
        inCode = false;
        out.push(`<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
      }
      continue;
    }

    if (inCode) {
      codeLines.push(line);
      continue;
    }

    if (!line.trim()) {
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      out.push(`<h${level}>${parseInline(heading[2])}</h${level}>`);
      continue;
    }

    if (line.startsWith('- ') || line.startsWith('* ')) {
      const listItems = [line.slice(2)];
      while (i + 1 < lines.length && (lines[i + 1].startsWith('- ') || lines[i + 1].startsWith('* '))) {
        i += 1;
        listItems.push(lines[i].slice(2));
      }
      out.push(`<ul>${listItems.map((item) => `<li>${parseInline(item)}</li>`).join('')}</ul>`);
      continue;
    }

    if (/^\|.+\|$/.test(line) && i + 1 < lines.length && /^\|?\s*[-:]+[-| :]*\|$/.test(lines[i + 1])) {
      const headerCells = line.split('|').slice(1, -1).map((c) => parseInline(c.trim()));
      i += 1;
      const bodyRows = [];
      while (i + 1 < lines.length && /^\|.+\|$/.test(lines[i + 1])) {
        i += 1;
        const row = lines[i].split('|').slice(1, -1).map((c) => parseInline(c.trim()));
        bodyRows.push(`<tr>${row.map((c) => `<td>${c}</td>`).join('')}</tr>`);
      }
      out.push(`<table><thead><tr>${headerCells.map((c) => `<th>${c}</th>`).join('')}</tr></thead><tbody>${bodyRows.join('')}</tbody></table>`);
      continue;
    }

    pushParagraph(line);
  }

  return out.join('\n');
}

function mermaidRemoteUrl(definition) {
  const encoded = btoa(unescape(encodeURIComponent(definition)));
  return `https://mermaid.ink/img/${encoded}`;
}

function renderLivePreview(file) {
  const live = $('livePreview');
  if (!file) {
    live.innerHTML = '';
    return;
  }

  if (isMarkdownFile(file)) {
    live.innerHTML = markdownToHtml(file.text);
    return;
  }

  if (isMermaidFile(file) || file.text.trim().startsWith('flowchart') || file.text.includes('graph ')) {
    live.innerHTML = `<img alt="Render Mermaid" src="${mermaidRemoteUrl(file.text)}" />`;
    return;
  }

  live.innerHTML = `<pre><code>${escapeHtml(file.text)}</code></pre>`;
}

function renderList() {
  const ul = $('fileList');
  ul.textContent = '';
  state.files.forEach((f, idx) => {
    const li = document.createElement('li');
    const left = document.createElement('span');
    const right = document.createElement('span');
    left.textContent = f.name;
    right.textContent = state.selected.has(idx) ? '✓' : '';
    li.append(left, right);
    if (state.activeIndex === idx) li.classList.add('active');
    li.onclick = () => {
      state.activeIndex = idx;
      state.selected.add(idx);
      showActiveEditor();
      renderList();
      renderPreview();
    };
    ul.appendChild(li);
  });
}

function renderPreview() {
  const grid = $('previewGrid');
  grid.textContent = '';
  const template = document.getElementById('previewTemplate');
  const selected = [...state.selected].map((i) => state.files[i]).filter(Boolean);
  selected.forEach((f) => {
    const node = template.content.firstElementChild.cloneNode(true);
    node.querySelector('h4').textContent = f.name;
    node.querySelector('.meta').textContent = `Tipo detectado: ${f.kinds.join(', ') || 'desconocido'} · ${f.size} bytes`;

    const renderHost = node.querySelector('.render');
    const pre = node.querySelector('pre');

    if (isMarkdownFile(f)) {
      renderHost.innerHTML = `<article class="markdown-preview">${markdownToHtml(f.text)}</article>`;
      pre.textContent = '';
      pre.classList.add('hidden');
    } else if (isMermaidFile(f) || f.text.trim().startsWith('flowchart') || f.text.includes('graph ')) {
      renderHost.innerHTML = `<img alt="Render Mermaid de ${escapeHtml(f.name)}" src="${mermaidRemoteUrl(f.text)}" />`;
      pre.textContent = f.text.slice(0, 2000);
      pre.classList.remove('hidden');
    } else {
      renderHost.textContent = '';
      pre.textContent = f.text.slice(0, 4000);
      pre.classList.remove('hidden');
    }

    grid.appendChild(node);
  });

  renderLivePreview(state.files[state.activeIndex]);
}

function showActiveEditor() {
  const editorArea = $('editorArea');
  const emptyState = $('emptyState');
  const active = state.files[state.activeIndex];

  if (!active) {
    editorArea.classList.add('hidden');
    emptyState.classList.remove('hidden');
    renderLivePreview(null);
    return;
  }

  editorArea.classList.remove('hidden');
  emptyState.classList.add('hidden');
  $('editor').value = active.text;
  renderLivePreview(active);
}

async function addFiles(fileList) {
  for (const file of fileList) {
    const text = await file.text();
    const ext = extensionOf(file.name);
    state.files.push({ name: file.name, ext, kinds: detectKinds(ext), text, size: file.size });
  }
  if (state.activeIndex === null && state.files.length > 0) state.activeIndex = 0;
  if (state.activeIndex !== null) state.selected.add(state.activeIndex);
  renderList();
  showActiveEditor();
  renderPreview();
}

$('fileInput').addEventListener('change', (e) => addFiles(e.target.files));
$('editor').addEventListener('input', (e) => {
  const active = state.files[state.activeIndex];
  if (!active) return;
  active.text = e.target.value;
  active.size = new Blob([e.target.value]).size;
  renderPreview();
  renderList();
});

$('toggleFocus').onclick = () => {
  state.focusMode = !state.focusMode;
  document.body.classList.toggle('focus-mode', state.focusMode);
  $('toggleFocus').textContent = state.focusMode ? 'Vista normal' : 'Vista extendida';
};

const drop = $('dropZone');
['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => {
  e.preventDefault();
  drop.classList.add('dragover');
}));
['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => {
  e.preventDefault();
  drop.classList.remove('dragover');
}));
drop.addEventListener('drop', (e) => addFiles(e.dataTransfer.files));

$('saveWorkspace').onclick = async () => {
  await chrome.storage.local.set({ workspace: state.files });
  alert('Workspace guardado localmente.');
};

$('loadWorkspace').onclick = async () => {
  const { workspace = [] } = await chrome.storage.local.get('workspace');
  state.files = workspace;
  state.activeIndex = workspace.length ? 0 : null;
  state.selected = new Set(workspace.length ? [0] : []);
  renderList();
  showActiveEditor();
  renderPreview();
};

$('downloadJson').onclick = () => {
  const selected = [...state.selected].map((i) => state.files[i]).filter(Boolean);
  const blob = new Blob([JSON.stringify(selected, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'deployapp-workspace.json';
  a.click();
  URL.revokeObjectURL(a.href);
};

$('downloadImage').onclick = () => {
  const active = state.files[state.activeIndex];
  const text = active ? active.text : 'Sin archivo activo';
  const canvas = document.createElement('canvas');
  canvas.width = 1400;
  canvas.height = 900;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#0b0f16';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#dbe7ff';
  ctx.font = '15px monospace';
  text.split('\n').slice(0, 50).forEach((line, i) => ctx.fillText(line.slice(0, 150), 20, 30 + i * 17));
  const a = document.createElement('a');
  a.href = canvas.toDataURL('image/png');
  a.download = 'deployapp-preview.png';
  a.click();
};

const layout = $('layout');
const resizer = $('resizer');
resizer.addEventListener('mousedown', (e) => {
  e.preventDefault();
  const onMove = (m) => {
    const width = Math.max(240, Math.min(window.innerWidth - 340, m.clientX));
    layout.style.gridTemplateColumns = `${width}px 6px 1fr`;
  };
  const onUp = () => {
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
  };
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
});
