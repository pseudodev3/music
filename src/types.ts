import type { MusicProviderId } from "./music/providerTypes";

export type ListeningTrack = {
  id: string;
  provider: MusicProviderId;
  providerTrackId?: string;
  canonicalId?: string;
  title: string;
  artist: string;
  album: string;
  albumImage?: string;
  externalUrl?: string;
  durationMs: number;
  progressMs: number;
  isPlaying: boolean;
};

export type Listener = {
  id: string;
  name: string;
  initials: string;
  tint: string;
};
