import type { ListeningTrack } from "../types";

export type MusicProviderId = "spotify" | "lastfm" | "apple-music";

export type MusicAuthState =
  | "idle"
  | "connecting"
  | "connected"
  | "demo"
  | "error";

export type MusicConnectResult =
  | "connected"
  | "demo"
  | "cancelled"
  | "unconfigured"
  | "unavailable"
  | "error";

export type MusicProviderStatus = "available" | "bridge" | "planned";

export type MusicProviderDescriptor = {
  id: MusicProviderId;
  name: string;
  shortLabel: string;
  status: MusicProviderStatus;
  accent: string;
  description: string;
  detail: string;
};

export type MusicProviderAdapter = {
  id: MusicProviderId;
  authState: MusicAuthState;
  isConfigured: boolean;
  track: ListeningTrack | null;
  connect: () => Promise<MusicConnectResult>;
  disconnect: () => void;
  refreshTrack: () => Promise<ListeningTrack | null>;
};
