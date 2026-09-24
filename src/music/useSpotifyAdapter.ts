import { useCallback, useMemo, useState } from "react";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import type { ListeningTrack } from "../types";
import type {
  MusicConnectResult,
  MusicProviderAdapter,
} from "./providerTypes";

WebBrowser.maybeCompleteAuthSession();

const SPOTIFY_CLIENT_ID = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID?.trim() ?? "";

const discovery: AuthSession.DiscoveryDocument = {
  authorizationEndpoint: "https://accounts.spotify.com/authorize",
  tokenEndpoint: "https://accounts.spotify.com/api/token",
};

const redirectUri = AuthSession.makeRedirectUri({
  scheme: "music",
  path: "spotify",
});

type SpotifyCurrentlyPlayingResponse = {
  is_playing?: boolean;
  progress_ms?: number | null;
  item?: {
    type?: string;
    id?: string;
    name?: string;
    duration_ms?: number;
    external_urls?: { spotify?: string };
    artists?: Array<{ name?: string }>;
    album?: {
      name?: string;
      images?: Array<{ url?: string; width?: number; height?: number }>;
    };
    external_ids?: {
      isrc?: string;
    };
  } | null;
};

async function fetchCurrentTrack(token: string): Promise<ListeningTrack | null> {
  const response = await fetch(
    "https://api.spotify.com/v1/me/player/currently-playing",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (response.status === 204) return null;
  if (!response.ok) {
    throw new Error(
      `Spotify currently-playing request failed: ${response.status}`
    );
  }

  const data = (await response.json()) as SpotifyCurrentlyPlayingResponse;
  const item = data.item;

  if (!item || item.type !== "track" || !item.id || !item.name) return null;

  const image = item.album?.images
    ?.filter((candidate) => Boolean(candidate.url))
    .sort((a, b) => (b.width ?? 0) - (a.width ?? 0))[0]?.url;

  return {
    id: item.id,
    provider: "spotify",
    providerTrackId: item.id,
    canonicalId: item.external_ids?.isrc || undefined,
    title: item.name,
    artist:
      item.artists?.map((artist) => artist.name).filter(Boolean).join(", ") ||
      "Unknown artist",
    album: item.album?.name || "Unknown album",
    albumImage: image,
    externalUrl: item.external_urls?.spotify,
    durationMs: item.duration_ms ?? 0,
    progressMs: data.progress_ms ?? 0,
    isPlaying: Boolean(data.is_playing),
  };
}

export function useSpotifyAdapter(): MusicProviderAdapter {
  const [authState, setAuthState] =
    useState<MusicProviderAdapter["authState"]>("idle");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [track, setTrack] = useState<ListeningTrack | null>(null);

  const [request, , promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: SPOTIFY_CLIENT_ID || "unconfigured-client",
      scopes: ["user-read-currently-playing", "user-read-playback-state"],
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true,
      redirectUri,
    },
    discovery
  );

  const refreshTrack = useCallback(async () => {
    if (!accessToken) return null;

    try {
      const nextTrack = await fetchCurrentTrack(accessToken);
      setTrack(nextTrack);
      return nextTrack;
    } catch {
      setAuthState("error");
      return null;
    }
  }, [accessToken]);

  const connect = useCallback(async (): Promise<MusicConnectResult> => {
    if (!SPOTIFY_CLIENT_ID) return "unconfigured";
    if (!request) return "error";

    setAuthState("connecting");

    try {
      const result = await promptAsync();

      if (result.type !== "success") {
        setAuthState("idle");
        return "cancelled";
      }

      const code = result.params.code;
      if (!code || !request.codeVerifier) {
        setAuthState("error");
        return "error";
      }

      const token = await AuthSession.exchangeCodeAsync(
        {
          clientId: SPOTIFY_CLIENT_ID,
          code,
          redirectUri,
          extraParams: {
            code_verifier: request.codeVerifier,
          },
        },
        discovery
      );

      setAccessToken(token.accessToken);
      setAuthState("connected");

      try {
        setTrack(await fetchCurrentTrack(token.accessToken));
      } catch {
        setTrack(null);
      }

      return "connected";
    } catch {
      setAuthState("error");
      return "error";
    }
  }, [promptAsync, request]);

  const disconnect = useCallback(() => {
    setAccessToken(null);
    setTrack(null);
    setAuthState("idle");
  }, []);

  return useMemo(
    () => ({
      id: "spotify" as const,
      authState,
      isConfigured: Boolean(SPOTIFY_CLIENT_ID),
      track,
      connect,
      disconnect,
      refreshTrack,
    }),
    [authState, connect, disconnect, refreshTrack, track]
  );
}
