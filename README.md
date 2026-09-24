# music

A quiet shared-listening room for people hearing the same song at the same time.

## What is in the first build

- A polished Spotify connection screen.
- Spotify OAuth using Authorization Code + PKCE when a client ID is configured.
- A demo path so the UI can be explored before Spotify credentials exist.
- A quiet, ephemeral room with track progress, listener presence, a small wave interaction, and one-line messages.
- A sleeping-room state for when Spotify is connected but nothing is currently playing.
- 10-second now-playing refresh while a real Spotify session is active.

The product rule is intentionally narrow: **the song is the room**. When the song changes, the room should disappear and presence should move with the listener.

## Run

Requires Node 22.13+ for Expo SDK 57.

```bash
npm install
npm start
```

## Spotify setup

1. Create an app in the Spotify developer dashboard.
2. Add `music://spotify` as an allowed redirect URI.
3. Copy `.env.example` to `.env.local`.
4. Set:

```bash
EXPO_PUBLIC_SPOTIFY_CLIENT_ID=your_client_id
```

No Spotify client secret belongs in the mobile app. OAuth uses PKCE.

Without a client ID, **Connect Spotify** intentionally enters demo mode so the complete product flow is still testable.

## Next backend seam

The room UI currently uses local demo listeners. The next infrastructure piece is a presence service keyed by a normalized track identity (preferably ISRC, with Spotify track ID as an initial fallback). That service should handle join/leave heartbeats, ephemeral one-line messages, waves, and automatic room migration when the current song changes.

See `skills.md` for the UI quality bar and reference libraries.
