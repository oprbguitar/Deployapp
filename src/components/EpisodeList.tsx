import type { NotableEpisode } from '../types/race';

export function EpisodeList({ episodes }: { episodes: NotableEpisode[] }) {
  return (
    <ul className="episodeList">
      {episodes.map((episode) => (
        <li key={`${episode.series}-${episode.season}-${episode.episode}-${episode.title}`}>
          <strong>
            {episode.series} S{episode.season}E{episode.episode} — {episode.title}
          </strong>
          <p>{episode.relevance}</p>
        </li>
      ))}
    </ul>
  );
}
