const state = { files: [], selected: new Set() };
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

function detectKinds(ext) {
  return Object.entries(supported)
    .filter(([, exts]) => exts.includes(ext))
    .map(([kind]) => kind);
}

function renderList() {
  const ul = $('fileList');
  ul.textContent = '';
  state.files.forEach((f, idx) => {
    const li = document.createElement('li');
    li.textContent = `${f.name} (${f.ext || 'sin extensión'})`;
    if (state.selected.has(idx)) li.classList.add('active');
    li.onclick = () => {
      if (state.selected.has(idx)) state.selected.delete(idx); else state.selected.add(idx);
      renderList(); renderPreview();
    };
    ul.appendChild(li);
  });
}

function renderPreview() {
  const grid = $('previewGrid');
  grid.textContent = '';
  const template = document.getElementById('previewTemplate');
  const selected = [...state.selected].map(i => state.files[i]);
  selected.forEach((f) => {
    const node = template.content.firstElementChild.cloneNode(true);
    node.querySelector('h3').textContent = f.name;
    node.querySelector('.meta').textContent = `Tipo detectado: ${f.kinds.join(', ') || 'desconocido'} · ${f.size} bytes`;
    node.querySelector('pre').textContent = f.text.slice(0, 6000);
    grid.appendChild(node);
  });
}

async function addFiles(fileList) {
  for (const file of fileList) {
    const text = await file.text();
    const ext = extensionOf(file.name);
    state.files.push({ name: file.name, ext, kinds: detectKinds(ext), text, size: file.size });
    state.selected.add(state.files.length - 1);
  }
  renderList(); renderPreview();
}

$('fileInput').addEventListener('change', (e) => addFiles(e.target.files));

const drop = $('dropZone');
['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => {
  e.preventDefault(); drop.classList.add('dragover');
}));
['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => {
  e.preventDefault(); drop.classList.remove('dragover');
}));
drop.addEventListener('drop', (e) => addFiles(e.dataTransfer.files));

$('saveWorkspace').onclick = async () => {
  await chrome.storage.local.set({ workspace: state.files });
  alert('Workspace guardado localmente.');
};
$('loadWorkspace').onclick = async () => {
  const { workspace = [] } = await chrome.storage.local.get('workspace');
  state.files = workspace; state.selected = new Set(workspace.map((_, i) => i));
  renderList(); renderPreview();
};

$('downloadJson').onclick = () => {
  const selected = [...state.selected].map((i) => state.files[i]);
  const blob = new Blob([JSON.stringify(selected, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'deployapp-workspace.json';
  a.click();
  URL.revokeObjectURL(a.href);
};

$('downloadImage').onclick = async () => {
  const data = [...state.selected].map((i) => state.files[i]).map((f) => `${f.name}\n${f.kinds.join(', ')}\n${f.text.slice(0, 400)}\n\n`).join('');
  const canvas = document.createElement('canvas');
  canvas.width = 1200; canvas.height = 800;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#111'; ctx.font = '16px monospace';
  data.split('\n').slice(0, 45).forEach((line, i) => ctx.fillText(line.slice(0, 120), 20, 30 + i * 17));
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
    const width = Math.max(240, Math.min(window.innerWidth - 240, m.clientX));
    layout.style.gridTemplateColumns = `${width}px 6px 1fr`;
  };
  const onUp = () => {
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
  };
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
});
