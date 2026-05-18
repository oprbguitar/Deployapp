export type CanonStatus = 'canon' | 'inference' | 'fan-theory';

export interface EpisodeRef {
  series: string;
  season: number;
  episode: number;
  title: string;
}

export interface NotableEpisode extends EpisodeRef {
  relevance: string;
}

export interface RaceRecord {
  id: string;
  name: string;
  category: string;
  originPlanet?: string;
  galaxy?: string;
  firstAppearance: EpisodeRef;
  notableEpisodes: NotableEpisode[];
  roleInStory: string;
  cultureAndLifestyle: string;
  biologyOrNature: string;
  politicalStructure?: string;
  technologies: string[];
  allies: string[];
  enemies: string[];
  descendantsOrRelatedGroups: string[];
  connectionToUniverse: string;
  canonStatus: CanonStatus;
  image: {
    src: string;
    alt: string;
    credit?: string;
    license?: string;
    sourceUrl?: string;
  };
  notes: string;
  seriesTags: string[];
}
