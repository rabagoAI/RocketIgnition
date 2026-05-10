export interface SpaceDevsLaunch {
  id: string;
  name: string;
  status: {
    id: number;
    name: string;
    abbrev: string;
    description: string;
  };
  net: string; // ISO 8601
  window_start: string;
  window_end: string;
  mission: {
    id: number;
    name: string;
    description: string | null;
    type: string;
    orbit: { name: string; abbrev: string } | null;
  } | null;
  rocket: {
    id: number;
    configuration: {
      id: number;
      name: string;
      family: string;
      full_name: string;
      manufacturer: { name: string; abbrev: string };
    };
  };
  launch_service_provider: {
    id: number;
    name: string;
    abbrev: string;
    type: string;
  };
  pad: {
    id: number;
    name: string;
    location: {
      name: string;
      country_code: string;
      longitude: string;
      latitude: string;
    };
    map_url: string | null;
  };
  image: string | null;
  vidURLs: { url: string; title: string; description: string }[];
  webcastLive: boolean;
  probability: number | null;
  holdreason: string | null;
  failreason: string | null;
  hashtag: string | null;
  program: { name: string; description: string }[];
}

export interface SpaceDevsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: SpaceDevsLaunch[];
}

export type LaunchStatusAbbrev = 'Go' | 'TBD' | 'Hold' | 'Success' | 'Failure' | 'In Flight';
