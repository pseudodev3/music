import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import type { Listener } from "../types";
import { palette } from "../theme";

type Props = {
  listeners: Listener[];
  compact?: boolean;
};

export function PresenceCluster({ listeners, compact = false }: Props) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <View style={styles.stack}>
        {listeners.slice(0, compact ? 4 : 6).map((listener, index) => (
          <View
            key={listener.id}
            style={[
              styles.avatar,
              compact && styles.avatarCompact,
              {
                marginLeft: index === 0 ? 0 : compact ? -8 : -10,
                zIndex: listeners.length - index,
                backgroundColor: listener.tint,
              },
            ]}
          >
            <Text style={[styles.initials, compact && styles.initialsCompact]}>
              {listener.initials}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.presenceText}>
        <View style={styles.liveRow}>
          <Animated.View
            style={[
              styles.liveDotHalo,
              {
                opacity: pulse.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.35, 0],
                }),
                transform: [
                  {
                    scale: pulse.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 2.2],
                    }),
                  },
                ],
              },
            ]}
          />
          <View style={styles.liveDot} />
          <Text style={styles.count}>{listeners.length} here</Text>
        </View>
        {!compact ? (
          <Text style={styles.subtle}>No stage. No host. Just the song.</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  wrapCompact: {
    gap: 11,
  },
  stack: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: palette.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarCompact: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  initials: {
    color: "#151815",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "lowercase",
  },
  initialsCompact: {
    fontSize: 10,
  },
  presenceText: {
    flexShrink: 1,
  },
  liveRow: {
    minHeight: 20,
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  liveDotHalo: {
    position: "absolute",
    width: 7,
    height: 7,
    borderRadius: 99,
    backgroundColor: palette.mossBright,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 99,
    backgroundColor: palette.mossBright,
    marginRight: 8,
  },
  count: {
    color: palette.text,
    fontSize: 13,
    fontWeight: "650",
    letterSpacing: 0.1,
  },
  subtle: {
    color: palette.textDim,
    fontSize: 12,
    marginTop: 2,
  },
});
