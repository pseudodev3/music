import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { MUSIC_PROVIDERS, getMusicProvider } from "../music/catalog";
import type {
  MusicConnectResult,
  MusicProviderDescriptor,
  MusicProviderId,
} from "../music/providerTypes";
import { useLastFmAdapter } from "../music/useLastFmAdapter";
import { useSpotifyAdapter } from "../music/useSpotifyAdapter";
import type { ListeningTrack } from "../types";

type MusicContextValue = {
  providerId: MusicProviderId;
  provider: MusicProviderDescriptor;
  providers: MusicProviderDescriptor[];
  authState: "idle" | "connecting" | "connected" | "demo" | "error";
  isConfigured: boolean;
  track: ListeningTrack | null;
  lastFmUsername: string;
  setLastFmUsername: (value: string) => void;
  selectProvider: (id: MusicProviderId) => void;
  connect: () => Promise<MusicConnectResult>;
  disconnect: () => void;
  refreshTrack: () => Promise<ListeningTrack | null>;
};

const MusicContext = createContext<MusicContextValue | null>(null);

export function MusicProvider({ children }: PropsWithChildren) {
  const [providerId, setProviderId] = useState<MusicProviderId>("spotify");
  const [lastFmUsername, setLastFmUsername] = useState("");

  const spotify = useSpotifyAdapter();
  const lastfm = useLastFmAdapter(lastFmUsername);

  const adapter =
    providerId === "spotify"
      ? spotify
      : providerId === "lastfm"
        ? lastfm
        : null;

  const selectProvider = useCallback(
    (id: MusicProviderId) => {
      if (id !== providerId) {
        adapter?.disconnect();
      }
      setProviderId(id);
    },
    [adapter, providerId]
  );

  const connect = useCallback(async (): Promise<MusicConnectResult> => {
    if (!adapter) return "unavailable";
    return adapter.connect();
  }, [adapter]);

  const disconnect = useCallback(() => {
    adapter?.disconnect();
  }, [adapter]);

  const refreshTrack = useCallback(async () => {
    if (!adapter) return null;
    return adapter.refreshTrack();
  }, [adapter]);

  const value = useMemo<MusicContextValue>(
    () => ({
      providerId,
      provider: getMusicProvider(providerId),
      providers: MUSIC_PROVIDERS,
      authState: adapter?.authState ?? "idle",
      isConfigured: adapter?.isConfigured ?? false,
      track: adapter?.track ?? null,
      lastFmUsername,
      setLastFmUsername,
      selectProvider,
      connect,
      disconnect,
      refreshTrack,
    }),
    [
      adapter?.authState,
      adapter?.isConfigured,
      adapter?.track,
      connect,
      disconnect,
      lastFmUsername,
      providerId,
      refreshTrack,
      selectProvider,
    ]
  );

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
}

export function useMusic() {
  const value = useContext(MusicContext);
  if (!value) {
    throw new Error("useMusic must be used inside MusicProvider");
  }
  return value;
}
