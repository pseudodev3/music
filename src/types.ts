export type ListeningTrack = {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumImage?: string;
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
