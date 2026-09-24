import { useCallback, useMemo, useState } from "react";
import type { ListeningTrack } from "../types";
import type {
  MusicConnectResult,
  MusicProviderAdapter,
} from "./providerTypes";

const LASTFM_API_KEY = process.env.EXPO_PUBLIC_LASTFM_API_KEY?.trim() ?? "";

type LastFmImage = {
  size?: string;
  "#text"?: string;
};

type LastFmTrack = {
  name?: string;
  mbid?: string;
  url?: string;
  artist?: {
    "#text"?: string;
    mbid?: string;
  };
  album?: {
    "#text"?: string;
    mbid?: string;
  };
  image?: LastFmImage[];
  "@attr"?: {
    nowplaying?: string;
  };
};

type LastFmRecentResponse = {
  recenttracks?: {
    track?: LastFmTrack | LastFmTrack[];
  };
  error?: number;
  message?: string;
};

function pickImage(images?: LastFmImage[]) {
  return [...(images ?? [])]
    .reverse()
    .map((image) => image["#text"])
    .find(Boolean);
}

async function fetchLastFmNowPlaying(
  username: string
): Promise<ListeningTrack | null> {
  const params = new URLSearchParams({
    method: "user.getrecenttracks",
    user: username,
    api_key: LASTFM_API_KEY,
    format: "json",
    limit: "1",
  });

  const response = await fetch(
    `https://ws.audioscrobbler.com/2.0/?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error(`Last.fm request failed: ${response.status}`);
  }

  const data = (await response.json()) as LastFmRecentResponse;
  if (data.error) {
    throw new Error(data.message || "Last.fm returned an error");
  }

  const raw = data.recenttracks?.track;
  const item = Array.isArray(raw) ? raw[0] : raw;

  if (
    !item ||
    item["@attr"]?.nowplaying !== "true" ||
    !item.name ||
    !item.artist?.["#text"]
  ) {
    return null;
  }

  const artist = item.artist["#text"];
  const album = item.album?.["#text"] || "Unknown album";
  const canonicalId =
    item.mbid || item.artist?.mbid
      ? [item.artist?.mbid, item.mbid].filter(Boolean).join(":")
      : undefined;

  return {
    id: item.mbid || `lastfm:${artist}:${item.name}`,
    provider: "lastfm",
    providerTrackId: item.mbid || undefined,
    canonicalId,
    title: item.name,
    artist,
    album,
    albumImage: pickImage(item.image),
    externalUrl: item.url,
    durationMs: 0,
    progressMs: 0,
    isPlaying: true,
  };
}

export function useLastFmAdapter(
  username: string
): MusicProviderAdapter {
  const [authState, setAuthState] =
    useState<MusicProviderAdapter["authState"]>("idle");
  const [track, setTrack] = useState<ListeningTrack | null>(null);

  const refreshTrack = useCallback(async () => {
    const cleanUsername = username.trim();
    if (!LASTFM_API_KEY || !cleanUsername) return null;

    try {
      const nextTrack = await fetchLastFmNowPlaying(cleanUsername);
      setTrack(nextTrack);
      return nextTrack;
    } catch {
      setAuthState("error");
      return null;
    }
  }, [username]);

  const connect = useCallback(async (): Promise<MusicConnectResult> => {
    if (!LASTFM_API_KEY || !username.trim()) return "unconfigured";

    setAuthState("connecting");

    try {
      const current = await fetchLastFmNowPlaying(username.trim());
      setTrack(current);
      setAuthState("connected");
      return "connected";
    } catch {
      setAuthState("error");
      return "error";
    }
  }, [username]);

  const disconnect = useCallback(() => {
    setTrack(null);
    setAuthState("idle");
  }, []);

  return useMemo(
    () => ({
      id: "lastfm" as const,
      authState,
      isConfigured: Boolean(LASTFM_API_KEY && username.trim()),
      track,
      connect,
      disconnect,
      refreshTrack,
    }),
    [authState, connect, disconnect, refreshTrack, track, username]
  );
}
