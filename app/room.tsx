import { useEffect, useMemo, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { AmbientBackdrop } from "../src/components/AmbientBackdrop";
import { PresenceCluster } from "../src/components/PresenceCluster";
import { useMusic } from "../src/context/MusicContext";
import { DEMO_LISTENERS, DEMO_TRACK } from "../src/data/demo";
import { palette, radius } from "../src/theme";
import type { ListeningTrack } from "../src/types";

function formatTime(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function AlbumArtwork({ track, size }: { track: ListeningTrack; size: number }) {
  if (track.albumImage) {
    return (
      <Image
        source={{ uri: track.albumImage }}
        style={{ width: size, height: size, borderRadius: 28 }}
      />
    );
  }

  return (
    <LinearGradient
      colors={["#9FAF87", "#59654F", "#292E27", "#171917"]}
      locations={[0, 0.34, 0.66, 1]}
      style={[styles.artworkFallback, { width: size, height: size }]}
    >
      <View style={styles.artLineA} />
      <View style={styles.artLineB} />
      <View style={styles.artDisc}>
        <View style={styles.artDiscInner} />
      </View>
      <Text style={styles.artMonogram}>m</Text>
    </LinearGradient>
  );
}

function WaitingForTrack({
  providerName,
  onRefresh,
}: {
  providerName: string;
  onRefresh: () => void;
}) {
  return (
    <View style={styles.waiting}>
      <View style={styles.waitingOrb}>
        <Text style={styles.waitingNote}>♪</Text>
      </View>
      <Text style={styles.waitingTitle}>Nothing is playing yet.</Text>
      <Text style={styles.waitingBody}>
        Start a song through {providerName}, then come back. The room wakes up
        around whatever you're hearing.
      </Text>
      <Pressable onPress={onRefresh} style={styles.refreshButton}>
        <Text style={styles.refreshText}>Check again</Text>
      </Pressable>
    </View>
  );
}

export default function RoomScreen() {
  const params = useLocalSearchParams<{ demo?: string }>();
  const { width } = useWindowDimensions();
  const {
    provider,
    authState,
    track,
    refreshTrack,
    disconnect,
  } = useMusic();

  const [message, setMessage] = useState("");
  const [sentMessage, setSentMessage] = useState<string | null>(null);
  const [waves, setWaves] = useState(2);

  const isDemo = params.demo === "1";
  const activeTrack = isDemo ? DEMO_TRACK : track;
  const artSize = Math.min(width - 56, width > 760 ? 330 : 286);

  useEffect(() => {
    if (isDemo || authState !== "connected") return;

    const timer = setInterval(() => {
      void refreshTrack();
    }, 10000);

    return () => clearInterval(timer);
  }, [authState, isDemo, refreshTrack]);

  const progress = useMemo(() => {
    if (!activeTrack?.durationMs) return 0;
    return Math.min(
      1,
      Math.max(0, activeTrack.progressMs / activeTrack.durationMs)
    );
  }, [activeTrack]);

  const sendMessage = async () => {
    const value = message.trim();
    if (!value) return;
    setSentMessage(value.slice(0, 120));
    setMessage("");
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const wave = async () => {
    setWaves((value) => value + 1);
    await Haptics.selectionAsync();
  };

  const leave = () => {
    if (!isDemo) disconnect();
    router.replace("/");
  };

  if (!activeTrack) {
    return (
      <SafeAreaView style={styles.screen}>
        <AmbientBackdrop />
        <View style={styles.roomShell}>
          <View style={styles.roomTopbar}>
            <Pressable onPress={() => router.back()} style={styles.iconButton}>
              <Text style={styles.backGlyph}>‹</Text>
            </Pressable>
            <Text style={styles.roomLabel}>ROOM ASLEEP</Text>
            <View style={styles.iconButtonSpacer} />
          </View>
          <WaitingForTrack
            providerName={provider.name}
            onRefresh={() => void refreshTrack()}
          />
        </View>
      </SafeAreaView>
    );
  }

  const hasTimeline = activeTrack.durationMs > 0;

  return (
    <SafeAreaView style={styles.screen}>
      <AmbientBackdrop />
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={[styles.roomShell, width > 760 && styles.roomShellWide]}>
          <View style={styles.roomTopbar}>
            <Pressable onPress={() => router.back()} style={styles.iconButton}>
              <Text style={styles.backGlyph}>‹</Text>
            </Pressable>

            <View style={styles.roomStatus}>
              <View
                style={[
                  styles.roomStatusDot,
                  { backgroundColor: isDemo ? palette.mossBright : provider.accent },
                ]}
              />
              <Text style={styles.roomLabel}>
                LISTENING TOGETHER · {isDemo ? "DEMO" : provider.name.toUpperCase()}
              </Text>
            </View>

            <Pressable onPress={leave} hitSlop={10}>
              <Text style={styles.leaveText}>leave</Text>
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.artworkStage}>
              <View
                style={[
                  styles.roomRing,
                  styles.roomRingOuter,
                  {
                    width: artSize + 54,
                    height: artSize + 54,
                    borderRadius: (artSize + 54) / 2,
                  },
                ]}
              />
              <View
                style={[
                  styles.roomRing,
                  styles.roomRingInner,
                  {
                    width: artSize + 26,
                    height: artSize + 26,
                    borderRadius: (artSize + 26) / 2,
                  },
                ]}
              />
              <AlbumArtwork track={activeTrack} size={artSize} />
            </View>

            <View style={styles.trackBlock}>
              <Text numberOfLines={1} style={styles.trackTitle}>
                {activeTrack.title}
              </Text>
              <Text numberOfLines={1} style={styles.trackArtist}>
                {activeTrack.artist}
              </Text>
            </View>

            {hasTimeline ? (
              <View style={styles.progressWrap}>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${progress * 100}%` },
                    ]}
                  />
                </View>
                <View style={styles.progressMeta}>
                  <Text style={styles.progressTime}>
                    {formatTime(activeTrack.progressMs)}
                  </Text>
                  <Text style={styles.progressTime}>
                    -{formatTime(
                      activeTrack.durationMs - activeTrack.progressMs
                    )}
                  </Text>
                </View>
              </View>
            ) : (
              <Text style={styles.bridgeTimeline}>
                live signal · timeline unavailable through this adapter
              </Text>
            )}

            <View style={styles.presenceSection}>
              <PresenceCluster listeners={DEMO_LISTENERS} />
            </View>

            <View style={styles.quietLine}>
              <Text style={styles.quietLabel}>THE ROOM IS QUIET</Text>
              <Text style={styles.quietCopy}>
                You don't have to perform here. A wave or one line is enough.
              </Text>
            </View>

            {sentMessage ? (
              <View style={styles.messageBubble}>
                <Text style={styles.messageText}>“{sentMessage}”</Text>
                <Text style={styles.messageMeta}>you · just now</Text>
              </View>
            ) : null}

            <View style={styles.composerRow}>
              <Pressable
                onPress={wave}
                style={({ pressed }) => [
                  styles.waveButton,
                  pressed && styles.waveButtonPressed,
                ]}
              >
                <Text style={styles.waveGlyph}>◌</Text>
                <Text style={styles.waveText}>wave · {waves}</Text>
              </Pressable>

              <View style={styles.composer}>
                <TextInput
                  value={message}
                  onChangeText={setMessage}
                  onSubmitEditing={() => void sendMessage()}
                  placeholder="say something small…"
                  placeholderTextColor={palette.textDim}
                  maxLength={120}
                  returnKeyType="send"
                  style={styles.input}
                />
                <Pressable
                  onPress={() => void sendMessage()}
                  disabled={!message.trim()}
                  hitSlop={8}
                >
                  <Text
                    style={[
                      styles.send,
                      !message.trim() && styles.sendDisabled,
                    ]}
                  >
                    ↑
                  </Text>
                </Pressable>
              </View>
            </View>

            <Text style={styles.ephemeral}>
              This room disappears when the song changes.
            </Text>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.ink },
  keyboard: { flex: 1 },
  roomShell: {
    flex: 1,
    width: "100%",
    maxWidth: 650,
    alignSelf: "center",
    paddingHorizontal: 20,
  },
  roomShellWide: { maxWidth: 730 },
  roomTopbar: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 19,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: "rgba(18,20,17,0.5)",
  },
  iconButtonSpacer: { width: 38 },
  backGlyph: {
    color: palette.text,
    fontSize: 31,
    lineHeight: 31,
    marginTop: -3,
    fontWeight: "300",
  },
  roomStatus: { flexDirection: "row", alignItems: "center", gap: 7 },
  roomStatusDot: { width: 6, height: 6, borderRadius: 6 },
  roomLabel: {
    color: palette.textSoft,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  leaveText: { color: palette.textDim, fontSize: 12, paddingHorizontal: 4 },
  content: { paddingTop: 24, paddingBottom: 30, alignItems: "stretch" },
  artworkStage: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    marginBottom: 32,
  },
  roomRing: { position: "absolute", borderWidth: 1 },
  roomRingOuter: { borderColor: "rgba(196,214,169,0.075)" },
  roomRingInner: { borderColor: "rgba(196,214,169,0.13)" },
  artworkFallback: {
    borderRadius: 28,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
  },
  artLineA: {
    position: "absolute",
    width: "140%",
    height: 1,
    backgroundColor: "rgba(241,240,233,0.22)",
    transform: [{ rotate: "31deg" }],
  },
  artLineB: {
    position: "absolute",
    width: "120%",
    height: 1,
    backgroundColor: "rgba(241,240,233,0.12)",
    transform: [{ rotate: "-28deg" }],
  },
  artDisc: {
    width: "44%",
    aspectRatio: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(241,240,233,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  artDiscInner: {
    width: "14%",
    aspectRatio: 1,
    borderRadius: 999,
    backgroundColor: "rgba(241,240,233,0.52)",
  },
  artMonogram: {
    position: "absolute",
    bottom: 18,
    left: 20,
    color: "rgba(241,240,233,0.72)",
    fontWeight: "800",
    fontSize: 16,
  },
  trackBlock: { alignItems: "center", paddingHorizontal: 12 },
  trackTitle: {
    color: palette.text,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700",
    letterSpacing: -0.9,
  },
  trackArtist: { color: palette.textSoft, fontSize: 14, marginTop: 4 },
  progressWrap: { marginTop: 24 },
  progressTrack: {
    width: "100%",
    height: 2,
    borderRadius: 99,
    overflow: "hidden",
    backgroundColor: "rgba(241,240,233,0.12)",
  },
  progressFill: {
    height: 2,
    borderRadius: 99,
    backgroundColor: palette.textSoft,
  },
  progressMeta: {
    marginTop: 7,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressTime: {
    color: palette.textDim,
    fontSize: 10,
    fontVariant: ["tabular-nums"],
  },
  bridgeTimeline: {
    color: palette.textDim,
    textAlign: "center",
    fontSize: 10,
    marginTop: 18,
    letterSpacing: 0.2,
  },
  presenceSection: {
    marginTop: 27,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: palette.line,
  },
  quietLine: { paddingTop: 28 },
  quietLabel: {
    color: palette.textDim,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.15,
  },
  quietCopy: {
    color: palette.textSoft,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    maxWidth: 480,
  },
  messageBubble: {
    marginTop: 18,
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderLeftWidth: 1,
    borderLeftColor: "rgba(196,214,169,0.38)",
  },
  messageText: { color: palette.text, fontSize: 14, lineHeight: 20 },
  messageMeta: { color: palette.textDim, fontSize: 10, marginTop: 6 },
  composerRow: {
    marginTop: 22,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  waveButton: {
    minHeight: 46,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: palette.lineStrong,
    backgroundColor: "rgba(20,23,18,0.72)",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  waveButtonPressed: { backgroundColor: "rgba(35,40,31,0.78)" },
  waveGlyph: { color: palette.mossBright, fontSize: 18 },
  waveText: { color: palette.textSoft, fontSize: 12, fontWeight: "650" },
  composer: {
    minHeight: 46,
    flex: 1,
    borderRadius: radius.pill,
    paddingLeft: 16,
    paddingRight: 8,
    borderWidth: 1,
    borderColor: palette.lineStrong,
    backgroundColor: "rgba(20,23,18,0.72)",
    flexDirection: "row",
    alignItems: "center",
  },
  input: { flex: 1, color: palette.text, fontSize: 13, paddingVertical: 0 },
  send: {
    width: 31,
    height: 31,
    borderRadius: 16,
    textAlign: "center",
    lineHeight: 29,
    color: "#11150F",
    backgroundColor: palette.mossBright,
    fontSize: 18,
    fontWeight: "750",
    overflow: "hidden",
  },
  sendDisabled: {
    color: palette.textDim,
    backgroundColor: "rgba(241,240,233,0.08)",
  },
  ephemeral: {
    color: palette.textDim,
    fontSize: 10,
    textAlign: "center",
    marginTop: 20,
  },
  waiting: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 26,
  },
  waitingOrb: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 1,
    borderColor: palette.lineStrong,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  waitingNote: { color: palette.mossBright, fontSize: 27 },
  waitingTitle: {
    color: palette.text,
    fontSize: 25,
    fontWeight: "700",
    letterSpacing: -0.7,
  },
  waitingBody: {
    color: palette.textSoft,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 21,
    maxWidth: 360,
    marginTop: 10,
  },
  refreshButton: {
    marginTop: 22,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: palette.lineStrong,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  refreshText: { color: palette.text, fontSize: 12, fontWeight: "650" },
});
