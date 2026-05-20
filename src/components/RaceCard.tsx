import { Link } from 'react-router-dom';
import type { RaceRecord } from '../types/race';

export function RaceCard({ race }: { race: RaceRecord }) {
  return (
    <article className="raceCard">
      <img src={race.image.src} alt={race.image.alt} loading="lazy" />
      <div className="raceCardBody">
        <h3>{race.name}</h3>
        <p className="muted">{race.category}</p>
        <p>
          Primera aparición: {race.firstAppearance.series} S{race.firstAppearance.season}E
          {race.firstAppearance.episode} ({race.firstAppearance.title})
        </p>
        <p>{race.roleInStory}</p>
        <Link className="detailLink" to={`/races/${race.id}`}>
          Ver ficha técnica
        </Link>
      </div>
    </article>
  );
}
