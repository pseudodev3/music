import type { MusicProviderDescriptor, MusicProviderId } from "./providerTypes";

export const MUSIC_PROVIDERS: MusicProviderDescriptor[] = [
  {
    id: "spotify",
    name: "Spotify",
    shortLabel: "direct",
    status: "available",
    accent: "#1ED760",
    description: "Read your currently playing track directly.",
    detail: "Spotify Web API · Premium currently required",
  },
  {
    id: "lastfm",
    name: "Last.fm",
    shortLabel: "bridge",
    status: "bridge",
    accent: "#D94B44",
    description: "A bridge for services you already scrobble.",
    detail: "Spotify · YouTube · Tidal · Deezer · SoundCloud · more",
  },
  {
    id: "apple-music",
    name: "Apple Music",
    shortLabel: "next",
    status: "planned",
    accent: "#FA4B68",
    description: "Native Apple Music system-player adapter.",
    detail: "iPhone native build · MusicKit",
  },
];

export function getMusicProvider(id: MusicProviderId) {
  return MUSIC_PROVIDERS.find((provider) => provider.id === id) ?? MUSIC_PROVIDERS[0];
}
