import { Link, useParams } from 'react-router-dom';
import { races } from '../data/races';
import { TechnologyBadge } from './TechnologyBadge';
import { EpisodeList } from './EpisodeList';

export function RaceDetail() {
  const { id } = useParams();
  const race = races.find((item) => item.id === id);

  if (!race) {
    return (
      <section className="section">
        <h2>Ficha no encontrada</h2>
        <Link to="/races">Volver a razas</Link>
      </section>
    );
  }

  return (
    <section className="section detail">
      <h2>{race.name}</h2>
      <p className="muted">Estado canónico: {race.canonStatus}</p>
      <p>{race.notes}</p>
      <h3>Biología / Naturaleza</h3>
      <p>{race.biologyOrNature}</p>
      <h3>Cultura</h3>
      <p>{race.cultureAndLifestyle}</p>
      <h3>Tecnología</h3>
      <div className="badgeRow">
        {race.technologies.map((tech) => (
          <TechnologyBadge key={tech} name={tech} />
        ))}
      </div>
      <h3>Episodios</h3>
      <EpisodeList episodes={race.notableEpisodes} />
      <h3>Conexiones</h3>
      <p>
        Aliados: {race.allies.join(', ') || 'N/D'} · Enemigos: {race.enemies.join(', ') || 'N/D'} ·
        Relacionados: {race.descendantsOrRelatedGroups.join(', ') || 'N/D'}
      </p>
      <p>{race.connectionToUniverse}</p>
    </section>
  );
}
