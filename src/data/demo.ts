import type { Listener, ListeningTrack } from "../types";

export const DEMO_TRACK: ListeningTrack = {
  id: "demo-nights",
  provider: "spotify",
  title: "Nights",
  artist: "Frank Ocean",
  album: "Blonde",
  durationMs: 307000,
  progressMs: 188000,
  isPlaying: true,
};

export const DEMO_LISTENERS: Listener[] = [
  { id: "you", name: "you", initials: "you", tint: "#BFD2A6" },
  { id: "noa", name: "noa", initials: "n", tint: "#947B70" },
  { id: "milo", name: "milo", initials: "m", tint: "#7C8E78" },
  { id: "syd", name: "syd", initials: "s", tint: "#A28F73" },
  { id: "aria", name: "aria", initials: "a", tint: "#727D8D" },
  { id: "leo", name: "leo", initials: "l", tint: "#8C716C" },
];
