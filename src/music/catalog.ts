import type { MusicProviderDescriptor, MusicProviderId } from "./providerTypes";

export const MUSIC_PROVIDERS: MusicProviderDescriptor[] = [
  {
    id: "spotify",
    name: "Spotify",
    shortLabel: "beta",
    status: "available",
    accent: "#1ED760",
    description: "Read your currently playing track directly.",
    detail: "Premium · direct connection",
  },
  {
    id: "lastfm",
    name: "Last.fm",
    shortLabel: "bridge",
    status: "bridge",
    accent: "#D94B44",
    description: "A bridge for services you already scrobble.",
    detail: "Works with your scrobbled listening",
  },
  {
    id: "apple-music",
    name: "Apple Music",
    shortLabel: "soon",
    status: "planned",
    accent: "#FA4B68",
    description: "Native Apple Music system-player adapter.",
    detail: "Native iPhone support coming soon",
  },
];

export function getMusicProvider(id: MusicProviderId) {
  return MUSIC_PROVIDERS.find((provider) => provider.id === id) ?? MUSIC_PROVIDERS[0];
}
