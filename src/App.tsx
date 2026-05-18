import { Link, Route, Routes } from 'react-router-dom';
import { races } from './data/races';
import { useMemo, useState } from 'react';

export function App() {
  const [q, setQ] = useState(''); const [type, setType] = useState('all'); const [series, setSeries] = useState('all');
  const filtered = useMemo(()=>races.filter(r=> (type==='all'||r.category===type) && (series==='all'||r.seriesTags.includes(series)) && JSON.stringify(r).toLowerCase().includes(q.toLowerCase())),[q,type,series]);
  const types = ['all', ...new Set(races.map(r=>r.category))]; const seriesTags = ['all', ...new Set(races.flatMap(r=>r.seriesTags))];
  return <div><header className='top'><h1>Stargate Dossier Técnico</h1><nav>{['/','/races','/technologies','/episodes','/timeline','/about'].map(p=><Link key={p} to={p}>{p==='/'?'inicio':p.slice(1)}</Link>)}</nav></header>
  <Routes>
    <Route path='/' element={<section className='section'><h2>Universo SG-1</h2><p>Guía estática sobre razas, civilizaciones y tecnologías con vínculos a Atlantis, Universe y películas.</p></section>} />
    <Route path='/races' element={<section className='section'><h2>Razas y civilizaciones</h2><input placeholder='Buscar por nombre, episodio, planeta o tecnología' value={q} onChange={e=>setQ(e.target.value)}/><div><select value={type} onChange={e=>setType(e.target.value)}>{types.map(t=><option key={t}>{t}</option>)}</select><select value={series} onChange={e=>setSeries(e.target.value)}>{seriesTags.map(s=><option key={s}>{s}</option>)}</select></div><div className='grid'>{filtered.map(r=><article key={r.id} className='card'><img src={r.image.src} alt={r.image.alt}/><h3>{r.name}</h3><p>{r.category} · {r.firstAppearance.series} S{r.firstAppearance.season}E{r.firstAppearance.episode}</p><p>{r.roleInStory}</p><details><summary>Detalle</summary><p><b>Biología:</b> {r.biologyOrNature}</p><p><b>Cultura:</b> {r.cultureAndLifestyle}</p><p><b>Tecnologías:</b> {r.technologies.join(', ')}</p></details></article>)}</div></section>} />
    <Route path='/technologies' element={<section className='section'><h2>Tecnologías</h2>{['Stargate','ZPM','Ha’tak','BC-304','Supergate','Nanites'].map(t=><span className='badge' key={t}>{t}</span>)}</section>} />
    <Route path='/episodes' element={<section className='section'><h2>Episodios clave</h2><ul>{races.flatMap(r=>r.notableEpisodes.map(e=><li key={r.id+e.title}>{r.name}: {e.series} S{e.season}E{e.episode} - {e.title}</li>))}</ul></section>} />
    <Route path='/timeline' element={<section className='section'><h2>Línea de tiempo</h2><p>Desde la era Ancient y la alianza de las Cuatro Grandes Razas hasta la guerra Ori y la etapa post-Goa’uld.</p></section>} />
    <Route path='/about' element={<section className='section'><h2>Conexiones</h2><p>SG-1 se conecta con Atlantis por Ancient/Wraith/Asurans y con Universe por Tau’ri + Lucian Alliance.</p></section>} />
  </Routes><footer>Fan project. Stargate and related properties belong to their respective rights holders. Images used only when licensed, authorized, or provided by the site owner.</footer></div>
}
