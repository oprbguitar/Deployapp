import { races } from '../data/races';

export function ConnectionMap() {
  return (
    <div className="connectionMap">
      {races.slice(0, 10).map((race) => (
        <div key={race.id}>
          <h4>{race.name}</h4>
          <p>↔ {race.allies.join(', ') || 'Sin alianzas declaradas'}</p>
        </div>
      ))}
    </div>
  );
}
