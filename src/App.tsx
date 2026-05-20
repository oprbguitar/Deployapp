import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { races } from './data/races';
import { SearchBar } from './components/SearchBar';
import { FilterPanel } from './components/FilterPanel';
import { RaceCard } from './components/RaceCard';
import { RaceDetail } from './components/RaceDetail';
import { TechnologyBadge } from './components/TechnologyBadge';
import { Timeline } from './components/Timeline';
import { ConnectionMap } from './components/ConnectionMap';
import { FooterDisclaimer } from './components/FooterDisclaimer';

function RacesPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [series, setSeries] = useState('all');
  const categories = ['all', ...new Set(races.map((item) => item.category))];
  const seriesList = ['all', ...new Set(races.flatMap((item) => item.seriesTags))];

  const filtered = useMemo(
    () =>
      races.filter((race) => {
        const matchesCategory = category === 'all' || race.category === category;
        const matchesSeries = series === 'all' || race.seriesTags.includes(series);
        const haystack = `${race.name} ${race.originPlanet ?? ''} ${race.technologies.join(' ')} ${race.notableEpisodes
          .map((e) => e.title)
          .join(' ')}`.toLowerCase();
        const matchesQuery = haystack.includes(query.toLowerCase());
        return matchesCategory && matchesSeries && matchesQuery;
      }),
    [category, query, series]
  );

  return (
    <section className="section">
      <h2>Razas y civilizaciones</h2>
      <SearchBar value={query} onChange={setQuery} />
      <FilterPanel
        category={category}
        categories={categories}
        series={series}
        seriesList={seriesList}
        onCategory={setCategory}
        onSeries={setSeries}
      />
      <div className="grid">
        {filtered.map((race) => (
          <RaceCard key={race.id} race={race} />
        ))}
      </div>
    </section>
  );
}

export function App() {
  return (
    <div>
      <header className="top">
        <h1>Stargate SG-1 — Dossier Técnico</h1>
        <nav>
          <Link to="/">Inicio</Link>
          <Link to="/races">Razas</Link>
          <Link to="/technologies">Tecnologías</Link>
          <Link to="/episodes">Episodios</Link>
          <Link to="/timeline">Timeline</Link>
          <Link to="/about">About</Link>
        </nav>
      </header>
      <Routes>
        <Route
          path="/"
          element={
            <section className="section">
              <h2>Universo Stargate</h2>
              <p>
                Enciclopedia visual sobre razas, civilizaciones, tecnologías y conflictos conectados entre
                SG-1, Atlantis, Universe y películas derivadas.
              </p>
            </section>
          }
        />
        <Route path="/races" element={<RacesPage />} />
        <Route path="/races/:id" element={<RaceDetail />} />
        <Route
          path="/technologies"
          element={
            <section className="section">
              <h2>Tecnologías clave</h2>
              <div className="badgeRow">
                {[...new Set(races.flatMap((race) => race.technologies))].slice(0, 24).map((tech) => (
                  <TechnologyBadge key={tech} name={tech} />
                ))}
              </div>
            </section>
          }
        />
        <Route
          path="/episodes"
          element={
            <section className="section">
              <h2>Episodios clave</h2>
              <ul className="episodeList">
                {races.flatMap((race) =>
                  race.notableEpisodes.map((episode) => (
                    <li key={`${race.id}-${episode.series}-${episode.season}-${episode.episode}`}>
                      <strong>{race.name}</strong>: {episode.series} S{episode.season}E{episode.episode} —
                      {episode.title}
                    </li>
                  ))
                )}
              </ul>
            </section>
          }
        />
        <Route
          path="/timeline"
          element={
            <section className="section">
              <h2>Línea de tiempo</h2>
              <Timeline />
            </section>
          }
        />
        <Route
          path="/about"
          element={
            <section className="section">
              <h2>Conexiones entre razas</h2>
              <ConnectionMap />
            </section>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <FooterDisclaimer />
    </div>
  );
}
