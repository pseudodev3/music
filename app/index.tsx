import { useMemo, useState } from "react";
import {
  ActivityIndicator,
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
import { router } from "expo-router";
import { AmbientBackdrop } from "../src/components/AmbientBackdrop";
import { PresenceCluster } from "../src/components/PresenceCluster";
import { useMusic } from "../src/context/MusicContext";
import { DEMO_LISTENERS } from "../src/data/demo";
import type { MusicProviderId } from "../src/music/providerTypes";
import { palette, radius } from "../src/theme";

export default function ConnectScreen() {
  const { width } = useWindowDimensions();
  const isCompact = width < 480;
  const isNarrow = width < 370;

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
    if (isPlanned) return `${provider.name} · coming soon`;
    if (providerId === "lastfm") return "Continue with Last.fm";
    return `Connect ${provider.name}`;
  }, [isBusy, isPlanned, provider.name, providerId]);

  const chooseProvider = async (id: MusicProviderId) => {
    setMessage(null);
    await Haptics.selectionAsync();
    selectProvider(id);
  };

  const handleConnect = async () => {
    if (isBusy || isPlanned) return;

    if (providerId === "lastfm" && !lastFmUsername.trim()) {
      setMessage("Enter your Last.fm username to continue.");
      return;
    }

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
          ? "Spotify connection isn't open in this beta yet."
          : "Last.fm connection isn't open in this beta yet."
      );
      return;
    }

    if (result === "unavailable") {
      setMessage(`${provider.name} is coming soon.`);
      return;
    }

    if (result === "error") {
      setMessage(`${provider.name} couldn't connect. Try again.`);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <AmbientBackdrop />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.shell,
          width > 760 && styles.shellWide,
          isCompact && styles.shellCompact,
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topbar}>
          <Text style={styles.wordmark}>music</Text>
          <View style={[styles.liveBadge, isNarrow && styles.liveBadgeNarrow]}>
            <View style={styles.liveDot} />
            <Text style={styles.liveBadgeText}>shared presence</Text>
          </View>
        </View>

        <View style={[styles.hero, isCompact && styles.heroCompact]}>
          <Text style={[styles.eyebrow, isCompact && styles.eyebrowCompact]}>
            SAME SONG · SAME MOMENT
          </Text>

          <Text
            style={[
              styles.title,
              width > 760 && styles.titleWide,
              isCompact && styles.titleCompact,
              isNarrow && styles.titleNarrow,
            ]}
          >
            Someone else{"\n"}is here.
          </Text>

          <Text style={[styles.body, isCompact && styles.bodyCompact]}>
            Bring the music app you already use. When someone is hearing the
            same track at the same time, you quietly share a room until the
            song moves on.
          </Text>

          <View
            style={[
              styles.providerSection,
              isCompact && styles.providerSectionCompact,
            ]}
          >
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
                      isCompact && styles.providerRowCompact,
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
                            isCompact && styles.providerNameCompact,
                            selected && styles.providerNameSelected,
                          ]}
                        >
                          {item.name}
                        </Text>
                        <Text style={styles.providerTag}>
                          {item.shortLabel}
                        </Text>
                      </View>

                      <Text
                        style={[
                          styles.providerDetail,
                          isCompact && styles.providerDetailCompact,
                        ]}
                        numberOfLines={1}
                      >
                        {item.detail}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.selectionRing,
                        selected && styles.selectionRingSelected,
                      ]}
                    >
                      {selected ? <View style={styles.selectionDot} /> : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {providerId === "lastfm" ? (
              <View
                style={[
                  styles.lastFmInputWrap,
                  isCompact && styles.lastFmInputWrapCompact,
                ]}
              >
                <Text style={styles.inputLabel}>LAST.FM USERNAME</Text>
                <TextInput
                  value={lastFmUsername}
                  onChangeText={(value) => {
                    setLastFmUsername(value);
                    if (message) setMessage(null);
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="your username"
                  placeholderTextColor={palette.textDim}
                  style={styles.lastFmInput}
                />
                <Text style={styles.bridgeNote}>
                  Already scrobbling? This can bridge whatever service you're
                  listening on.
                </Text>
              </View>
            ) : null}

            {providerId === "spotify" ? (
              <Text style={styles.providerNote}>
                Limited beta. Spotify currently requires Premium for direct
                access.
              </Text>
            ) : null}

            {isPlanned ? (
              <Text style={styles.providerNote}>
                Apple Music support is being built for the native iPhone app.
              </Text>
            ) : null}
          </View>

          {!isCompact ? (
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
          ) : (
            <View style={styles.previewCompact}>
              <View style={styles.previewCompactLine}>
                <View
                  style={[
                    styles.previewCompactDot,
                    { backgroundColor: provider.accent },
                  ]}
                />
                <Text style={styles.previewCompactText}>
                  rooms appear when listeners overlap
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={[styles.actions, isCompact && styles.actionsCompact]}>
          <Pressable
            accessibilityRole="button"
            onPress={handleConnect}
            disabled={isBusy || isPlanned}
            style={({ pressed }) => [
              styles.primaryButton,
              isCompact && styles.primaryButtonCompact,
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
              isCompact && styles.previewButtonCompact,
              pressed && styles.previewButtonPressed,
            ]}
          >
            <Text style={styles.previewButtonText}>See a room first</Text>
            <Text style={styles.previewArrow}>↗</Text>
          </Pressable>

          {message ? <Text style={styles.message}>{message}</Text> : null}

          <Text style={styles.privacy}>
            We only read what's playing. We don't stream or rebroadcast the
            music.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.ink,
  },
  scroll: {
    flex: 1,
  },
  shell: {
    width: "100%",
    maxWidth: 620,
    alignSelf: "center",
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 28,
  },
  shellWide: {
    maxWidth: 760,
    paddingHorizontal: 42,
    paddingTop: 18,
    paddingBottom: 42,
  },
  shellCompact: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 30,
  },
  topbar: {
    minHeight: 48,
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
  liveBadgeNarrow: {
    paddingHorizontal: 9,
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
    paddingTop: 56,
    paddingBottom: 20,
  },
  heroCompact: {
    paddingTop: 28,
    paddingBottom: 12,
  },
  eyebrow: {
    color: palette.mossBright,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.45,
    marginBottom: 14,
  },
  eyebrowCompact: {
    fontSize: 10,
    marginBottom: 12,
  },
  title: {
    color: palette.text,
    fontSize: 48,
    lineHeight: 49,
    letterSpacing: -2.2,
    fontWeight: "650",
  },
  titleWide: {
    fontSize: 62,
    lineHeight: 62,
    letterSpacing: -3.1,
  },
  titleCompact: {
    fontSize: 39,
    lineHeight: 39,
    letterSpacing: -1.7,
  },
  titleNarrow: {
    fontSize: 35,
    lineHeight: 35,
  },
  body: {
    color: palette.textSoft,
    fontSize: 15,
    lineHeight: 23,
    maxWidth: 560,
    marginTop: 16,
  },
  bodyCompact: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 14,
  },
  providerSection: {
    marginTop: 28,
  },
  providerSectionCompact: {
    marginTop: 24,
  },
  sectionLabel: {
    color: palette.textDim,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: 7,
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
  providerRowCompact: {
    minHeight: 52,
    gap: 10,
  },
  providerRowSelected: {
    backgroundColor: "rgba(255,255,255,0.025)",
  },
  providerMark: {
    width: 7,
    height: 7,
    borderRadius: 99,
  },
  providerCopy: {
    flex: 1,
    minWidth: 0,
  },
  providerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  providerName: {
    color: palette.textSoft,
    fontSize: 14,
    fontWeight: "650",
  },
  providerNameCompact: {
    fontSize: 13,
  },
  providerNameSelected: {
    color: palette.text,
  },
  providerTag: {
    color: palette.textDim,
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  providerDetail: {
    color: palette.textDim,
    fontSize: 11,
    marginTop: 3,
  },
  providerDetailCompact: {
    fontSize: 10,
    marginTop: 2,
  },
  selectionRing: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: palette.textDim,
    alignItems: "center",
    justifyContent: "center",
  },
  selectionRingSelected: {
    borderColor: palette.text,
  },
  selectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.text,
  },
  lastFmInputWrap: {
    paddingTop: 14,
  },
  lastFmInputWrapCompact: {
    paddingTop: 12,
  },
  inputLabel: {
    color: palette.textDim,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
  },
  lastFmInput: {
    marginTop: 4,
    minHeight: 40,
    borderBottomWidth: 1,
    borderColor: palette.lineStrong,
    color: palette.text,
    fontSize: 14,
    paddingHorizontal: 0,
  },
  bridgeNote: {
    color: palette.textDim,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 7,
  },
  providerNote: {
    color: palette.textDim,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 9,
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
  previewNote: {
    color: "#11150F",
    fontSize: 14,
    fontWeight: "800",
  },
  previewCompact: {
    marginTop: 18,
    paddingTop: 13,
    borderTopWidth: 1,
    borderColor: palette.line,
  },
  previewCompactLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  previewCompactDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  previewCompactText: {
    color: palette.textDim,
    fontSize: 10,
    letterSpacing: 0.15,
  },
  actions: {
    gap: 10,
    paddingTop: 14,
  },
  actionsCompact: {
    paddingTop: 10,
  },
  primaryButton: {
    minHeight: 56,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  primaryButtonCompact: {
    minHeight: 52,
  },
  primaryButtonPressed: {
    transform: [{ scale: 0.988 }],
    opacity: 0.92,
  },
  primaryButtonDisabled: {
    opacity: 0.42,
  },
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
  previewButtonCompact: {
    minHeight: 46,
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
  message: {
    color: "#D7B2A8",
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
    paddingHorizontal: 12,
  },
  privacy: {
    color: palette.textDim,
    fontSize: 10,
    lineHeight: 15,
    textAlign: "center",
    marginTop: 2,
    paddingHorizontal: 14,
  },
});
