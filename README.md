# music

A quiet shared-listening room for people hearing the same song at the same time.

The product rule is intentionally narrow: **the song is the room**. The app does not stream audio. It reads a listener's now-playing metadata, resolves a shared track identity, and moves presence as the song changes.

## Provider adapter layer

The app is no longer Spotify-shaped internally. The room consumes a provider-neutral `ListeningTrack`, and provider adapters are responsible for supplying now-playing state.

Current provider catalog:

| Provider | State | Approach |
| --- | --- | --- |
| Spotify | Direct adapter | OAuth + Web API currently-playing |
| Last.fm | Bridge adapter | Reads Last.fm's `nowplaying=true` signal for a user's scrobbles |
| Apple Music | Planned native adapter | iOS MusicKit / system music player |

The Last.fm route matters because Last.fm can track listening from multiple services, including Spotify, YouTube, Tidal, Deezer and SoundCloud. It gives us a practical bridge instead of writing a brittle unofficial scraper for every music app.

YouTube Music does not currently expose an official general-purpose "what is this user playing right now?" API, so it is not presented as a fake direct integration.

## Spotify note — September 2026

Spotify's current Web API documentation says Premium is required to use the Web API. Development Mode also requires the app owner to have an active Premium subscription and is limited to a small allowlist of authorized users.

That means a Spotify Free account should not be treated as a supported direct-Web-API path for this prototype.

A user who already scrobbles Spotify into Last.fm can try the Last.fm bridge instead; that path reads Last.fm's now-playing signal rather than using this app's Spotify Web API client.

## What is in the current build

- Provider-neutral music adapter contract.
- Provider picker on the connection screen.
- Spotify Authorization Code + PKCE adapter.
- Last.fm now-playing bridge adapter.
- Apple Music native-adapter slot, clearly marked as not implemented yet.
- Quiet ephemeral listening room.
- Track progress when the provider supplies it.
- Graceful live-signal state for adapters such as Last.fm that do not provide playback position.
- Listener presence, a small wave interaction, and one-line messages.
- Sleeping-room state when no current track is visible.
- 10-second now-playing refresh while a provider session is active.

## Run

Requires Node 22.13+ for Expo SDK 57.

```bash
npm install
npm start
```

## Environment

Copy `.env.example` to `.env.local` and configure the adapters you want.

```bash
EXPO_PUBLIC_SPOTIFY_CLIENT_ID=
EXPO_PUBLIC_LASTFM_API_KEY=
```

No Spotify client secret belongs in the mobile app. Spotify OAuth uses PKCE.

## Spotify setup

1. Use a Spotify Premium account for the developer app.
2. Create an app in the Spotify developer dashboard.
3. Add the native `music://spotify` redirect URI.
4. For the web build, add the exact HTTPS redirect URI produced by the deployed site.
5. Set `EXPO_PUBLIC_SPOTIFY_CLIENT_ID`.

## Last.fm setup

1. Create a Last.fm API account/key.
2. Set `EXPO_PUBLIC_LASTFM_API_KEY`.
3. In the app, select **Last.fm** and enter the Last.fm username whose now-playing state should be read.
4. Make sure that account is already scrobbling from the music service being used.

## Next backend seam

The room UI still uses local demo listeners. The next infrastructure piece is a presence service keyed by normalized track identity.

Matching priority should be:

1. ISRC when an adapter supplies it.
2. MusicBrainz recording ID when available.
3. Provider-specific IDs.
4. A normalized artist + title fallback with conservative collision handling.

The presence service should handle join/leave heartbeats, ephemeral one-line messages, waves, and automatic room migration when the current song changes.

See `skills.md` for the UI quality bar and reference libraries.
