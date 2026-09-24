import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { AmbientBackdrop } from "../src/components/AmbientBackdrop";
import { PresenceCluster } from "../src/components/PresenceCluster";
import { DEMO_LISTENERS } from "../src/data/demo";
import { useSpotify } from "../src/context/SpotifyContext";
import { palette, radius } from "../src/theme";

export default function ConnectScreen() {
  const { width } = useWindowDimensions();
  const { authState, connect } = useSpotify();
  const [message, setMessage] = useState<string | null>(null);
  const isBusy = authState === "connecting";

  const handleConnect = async () => {
    if (isBusy) return;
    setMessage(null);
    await Haptics.selectionAsync();

    const result = await connect();

    if (result === "connected") {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push("/room");
      return;
    }

    if (result === "demo") {
      router.push({ pathname: "/room", params: { demo: "1" } });
      return;
    }

    if (result === "error") {
      setMessage("Spotify could not connect. Try again.");
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <AmbientBackdrop />

      <View style={[styles.shell, width > 760 && styles.shellWide]}>
        <View style={styles.topbar}>
          <Text style={styles.wordmark}>music</Text>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveBadgeText}>shared presence</Text>
          </View>
        </View>

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>SAME SONG · SAME MOMENT</Text>
          <Text style={[styles.title, width > 760 && styles.titleWide]}>
            Someone else{"\n"}is here.
          </Text>
          <Text style={styles.body}>
            Connect Spotify. When someone is hearing the same track at the same
            time, you quietly share a room until the song moves on.
          </Text>

          <View style={styles.preview}>
            <View style={styles.previewArt}>
              <View style={styles.previewRingOuter} />
              <View style={styles.previewRingInner} />
              <View style={styles.previewCore}>
                <Text style={styles.previewNote}>♪</Text>
              </View>
            </View>
            <PresenceCluster listeners={DEMO_LISTENERS} compact />
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={handleConnect}
            disabled={isBusy}
            style={({ pressed }) => [
              styles.spotifyButton,
              pressed && styles.spotifyButtonPressed,
              isBusy && styles.spotifyButtonBusy,
            ]}
          >
            {isBusy ? (
              <ActivityIndicator color="#07110A" />
            ) : (
              <View style={styles.spotifyGlyph}>
                <View style={styles.spotifyWave} />
                <View style={[styles.spotifyWave, styles.spotifyWaveMid]} />
                <View style={[styles.spotifyWave, styles.spotifyWaveShort]} />
              </View>
            )}
            <Text style={styles.spotifyButtonText}>
              {isBusy ? "Opening Spotify…" : "Connect Spotify"}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push({ pathname: "/room", params: { demo: "1" } })}
            style={({ pressed }) => [
              styles.previewButton,
              pressed && styles.previewButtonPressed,
            ]}
          >
            <Text style={styles.previewButtonText}>See a room first</Text>
            <Text style={styles.previewArrow}>↗</Text>
          </Pressable>

          {message ? <Text style={styles.error}>{message}</Text> : null}

          <Text style={styles.privacy}>
            We only read what’s playing. Nothing is posted to Spotify.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.ink,
  },
  shell: {
    flex: 1,
    alignSelf: "center",
    width: "100%",
    maxWidth: 620,
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 18,
  },
  shellWide: {
    maxWidth: 760,
    paddingHorizontal: 42,
  },
  topbar: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  wordmark: {
    color: palette.text,
    fontSize: 18,
    fontWeight: "750",
    letterSpacing: -0.4,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: "rgba(18,21,17,0.64)",
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 6,
    backgroundColor: palette.mossBright,
  },
  liveBadgeText: {
    color: palette.textSoft,
    fontSize: 11,
    letterSpacing: 0.2,
  },
  hero: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: 26,
  },
  eyebrow: {
    color: palette.mossBright,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.45,
    marginBottom: 17,
  },
  title: {
    color: palette.text,
    fontSize: 50,
    lineHeight: 51,
    letterSpacing: -2.2,
    fontWeight: "650",
  },
  titleWide: {
    fontSize: 64,
    lineHeight: 64,
    letterSpacing: -3.1,
  },
  body: {
    color: palette.textSoft,
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 520,
    marginTop: 20,
  },
  preview: {
    marginTop: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: palette.line,
    paddingVertical: 20,
  },
  previewArt: {
    width: 66,
    height: 66,
    alignItems: "center",
    justifyContent: "center",
  },
  previewRingOuter: {
    position: "absolute",
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "rgba(196,214,169,0.16)",
  },
  previewRingInner: {
    position: "absolute",
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(196,214,169,0.25)",
  },
  previewCore: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.moss,
  },
  previewNote: {
    color: "#11150F",
    fontSize: 16,
    fontWeight: "800",
  },
  actions: {
    gap: 10,
  },
  spotifyButton: {
    minHeight: 56,
    borderRadius: radius.md,
    backgroundColor: palette.spotify,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  spotifyButtonPressed: {
    transform: [{ scale: 0.988 }],
    opacity: 0.92,
  },
  spotifyButtonBusy: {
    opacity: 0.72,
  },
  spotifyButtonText: {
    color: "#07110A",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: -0.1,
  },
  spotifyGlyph: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#07110A",
    justifyContent: "center",
    paddingHorizontal: 4,
    gap: 2,
  },
  spotifyWave: {
    height: 1.5,
    borderRadius: 99,
    backgroundColor: palette.spotify,
    width: 14,
    alignSelf: "center",
  },
  spotifyWaveMid: {
    width: 11,
  },
  spotifyWaveShort: {
    width: 8,
  },
  previewButton: {
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.lineStrong,
    backgroundColor: "rgba(20,23,18,0.70)",
    paddingHorizontal: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  previewButtonPressed: {
    backgroundColor: "rgba(31,35,28,0.76)",
  },
  previewButtonText: {
    color: palette.textSoft,
    fontSize: 14,
    fontWeight: "600",
  },
  previewArrow: {
    color: palette.textDim,
    fontSize: 16,
  },
  error: {
    color: "#D7A69C",
    fontSize: 12,
    textAlign: "center",
  },
  privacy: {
    color: palette.textDim,
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
    marginTop: 4,
  },
});
