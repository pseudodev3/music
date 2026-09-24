import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { AmbientBackdrop } from "../src/components/AmbientBackdrop";
import { PresenceCluster } from "../src/components/PresenceCluster";
import { useMusic } from "../src/context/MusicContext";
import { DEMO_LISTENERS } from "../src/data/demo";
import type { MusicProviderId } from "../src/music/providerTypes";
import { palette, radius } from "../src/theme";

export default function ConnectScreen() {
  const { width } = useWindowDimensions();
  const {
    provider,
    providers,
    providerId,
    authState,
    lastFmUsername,
    setLastFmUsername,
    selectProvider,
    connect,
  } = useMusic();

  const [message, setMessage] = useState<string | null>(null);
  const isBusy = authState === "connecting";
  const isPlanned = provider.status === "planned";

  const primaryLabel = useMemo(() => {
    if (isBusy) return `Connecting ${provider.name}…`;
    if (isPlanned) return `${provider.name} adapter is next`;
    if (providerId === "lastfm") return "Use Last.fm bridge";
    return `Connect ${provider.name}`;
  }, [isBusy, isPlanned, provider.name, providerId]);

  const chooseProvider = async (id: MusicProviderId) => {
    setMessage(null);
    await Haptics.selectionAsync();
    selectProvider(id);
  };

  const handleConnect = async () => {
    if (isBusy || isPlanned) return;
    setMessage(null);
    await Haptics.selectionAsync();

    const result = await connect();

    if (result === "connected") {
      await Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      );
      router.push("/room");
      return;
    }

    if (result === "unconfigured") {
      setMessage(
        providerId === "spotify"
          ? "Spotify needs an app Client ID before it can connect."
          : "Add a Last.fm API key and your Last.fm username first."
      );
      return;
    }

    if (result === "error") {
      setMessage(`${provider.name} could not connect. Try again.`);
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
            Bring the music app you already use. When someone is hearing the
            same track at the same time, you quietly share a room until the
            song moves on.
          </Text>

          <View style={styles.providerSection}>
            <Text style={styles.sectionLabel}>LISTEN THROUGH</Text>
            <View style={styles.providerList}>
              {providers.map((item) => {
                const selected = item.id === providerId;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => void chooseProvider(item.id)}
                    style={[
                      styles.providerRow,
                      selected && styles.providerRowSelected,
                    ]}
                  >
                    <View
                      style={[
                        styles.providerMark,
                        { backgroundColor: item.accent },
                      ]}
                    />
                    <View style={styles.providerCopy}>
                      <View style={styles.providerTitleRow}>
                        <Text
                          style={[
                            styles.providerName,
                            selected && styles.providerNameSelected,
                          ]}
                        >
                          {item.name}
                        </Text>
                        <Text style={styles.providerTag}>
                          {item.shortLabel}
                        </Text>
                      </View>
                      <Text style={styles.providerDetail} numberOfLines={1}>
                        {item.detail}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.providerCheck,
                        selected && styles.providerCheckSelected,
                      ]}
                    >
                      {selected ? "●" : "○"}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {providerId === "lastfm" ? (
              <View style={styles.lastFmInputWrap}>
                <Text style={styles.inputLabel}>LAST.FM USERNAME</Text>
                <TextInput
                  value={lastFmUsername}
                  onChangeText={setLastFmUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="your username"
                  placeholderTextColor={palette.textDim}
                  style={styles.lastFmInput}
                />
                <Text style={styles.bridgeNote}>
                  Last.fm can act as the listening bridge for services you
                  already scrobble there.
                </Text>
              </View>
            ) : null}

            {providerId === "spotify" ? (
              <Text style={styles.providerNote}>
                Spotify's current Web API rules require Premium for developer
                access. The app never controls your playback.
              </Text>
            ) : null}

            {isPlanned ? (
              <Text style={styles.providerNote}>
                Apple Music needs a native iPhone adapter so it can read the
                system Music player's current item. It won't be faked through
                the web build.
              </Text>
            ) : null}
          </View>

          <View style={styles.preview}>
            <View style={styles.previewArt}>
              <View style={styles.previewRingOuter} />
              <View style={styles.previewRingInner} />
              <View
                style={[
                  styles.previewCore,
                  { backgroundColor: provider.accent },
                ]}
              >
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
            disabled={isBusy || isPlanned}
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: provider.accent },
              pressed && !isPlanned && styles.primaryButtonPressed,
              (isBusy || isPlanned) && styles.primaryButtonDisabled,
            ]}
          >
            {isBusy ? <ActivityIndicator color="#0A0B09" /> : null}
            <Text style={styles.primaryButtonText}>{primaryLabel}</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() =>
              router.push({ pathname: "/room", params: { demo: "1" } })
            }
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
            We read now-playing metadata only. We don't stream or rebroadcast
            the music.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.ink },
  shell: {
    flex: 1,
    alignSelf: "center",
    width: "100%",
    maxWidth: 620,
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 18,
  },
  shellWide: { maxWidth: 760, paddingHorizontal: 42 },
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
  hero: { flex: 1, justifyContent: "center", paddingVertical: 20 },
  eyebrow: {
    color: palette.mossBright,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.45,
    marginBottom: 14,
  },
  title: {
    color: palette.text,
    fontSize: 48,
    lineHeight: 49,
    letterSpacing: -2.2,
    fontWeight: "650",
  },
  titleWide: { fontSize: 62, lineHeight: 62, letterSpacing: -3.1 },
  body: {
    color: palette.textSoft,
    fontSize: 15,
    lineHeight: 23,
    maxWidth: 560,
    marginTop: 16,
  },
  providerSection: { marginTop: 28 },
  sectionLabel: {
    color: palette.textDim,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  providerList: {
    borderTopWidth: 1,
    borderColor: palette.line,
  },
  providerRow: {
    minHeight: 58,
    borderBottomWidth: 1,
    borderColor: palette.line,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
    gap: 12,
  },
  providerRowSelected: { backgroundColor: "rgba(255,255,255,0.025)" },
  providerMark: { width: 8, height: 8, borderRadius: 99 },
  providerCopy: { flex: 1, minWidth: 0 },
  providerTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  providerName: {
    color: palette.textSoft,
    fontSize: 14,
    fontWeight: "650",
  },
  providerNameSelected: { color: palette.text },
  providerTag: {
    color: palette.textDim,
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  providerDetail: { color: palette.textDim, fontSize: 11, marginTop: 3 },
  providerCheck: { color: palette.textDim, fontSize: 15 },
  providerCheckSelected: { color: palette.text },
  lastFmInputWrap: {
    paddingTop: 12,
  },
  inputLabel: {
    color: palette.textDim,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
  },
  lastFmInput: {
    marginTop: 7,
    minHeight: 42,
    borderBottomWidth: 1,
    borderColor: palette.lineStrong,
    color: palette.text,
    fontSize: 14,
    paddingHorizontal: 0,
  },
  bridgeNote: {
    color: palette.textDim,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 8,
  },
  providerNote: {
    color: palette.textDim,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 10,
  },
  preview: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: palette.line,
    paddingVertical: 16,
  },
  previewArt: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
  },
  previewRingOuter: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(196,214,169,0.16)",
  },
  previewRingInner: {
    position: "absolute",
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "rgba(196,214,169,0.25)",
  },
  previewCore: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  previewNote: { color: "#11150F", fontSize: 14, fontWeight: "800" },
  actions: { gap: 10 },
  primaryButton: {
    minHeight: 56,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  primaryButtonPressed: { transform: [{ scale: 0.988 }], opacity: 0.92 },
  primaryButtonDisabled: { opacity: 0.42 },
  primaryButtonText: {
    color: "#0A0B09",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: -0.1,
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
  previewButtonPressed: { backgroundColor: "rgba(31,35,28,0.76)" },
  previewButtonText: {
    color: palette.textSoft,
    fontSize: 14,
    fontWeight: "600",
  },
  previewArrow: { color: palette.textDim, fontSize: 16 },
  error: { color: "#D7A69C", fontSize: 12, textAlign: "center" },
  privacy: {
    color: palette.textDim,
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
    marginTop: 4,
  },
});
