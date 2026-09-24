import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { palette } from "../theme";

export function AmbientBackdrop() {
  const drift = useRef(new Animated.Value(0)).current;
  const breathe = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const driftLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, {
          toValue: 1,
          duration: 9000,
          useNativeDriver: true,
        }),
        Animated.timing(drift, {
          toValue: 0,
          duration: 9000,
          useNativeDriver: true,
        }),
      ])
    );

    const breatheLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, {
          toValue: 1,
          duration: 5200,
          useNativeDriver: true,
        }),
        Animated.timing(breathe, {
          toValue: 0,
          duration: 5200,
          useNativeDriver: true,
        }),
      ])
    );

    driftLoop.start();
    breatheLoop.start();

    return () => {
      driftLoop.stop();
      breatheLoop.stop();
    };
  }, [breathe, drift]);

  const translateX = drift.interpolate({
    inputRange: [0, 1],
    outputRange: [-18, 18],
  });

  const translateY = drift.interpolate({
    inputRange: [0, 1],
    outputRange: [10, -12],
  });

  const opacity = breathe.interpolate({
    inputRange: [0, 1],
    outputRange: [0.18, 0.34],
  });

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={["#11150F", palette.ink, "#0C0D0B"]}
        locations={[0, 0.48, 1]}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View
        style={[
          styles.glow,
          styles.glowA,
          { opacity, transform: [{ translateX }, { translateY }] },
        ]}
      />

      <Animated.View
        style={[
          styles.glow,
          styles.glowB,
          {
            opacity: breathe.interpolate({
              inputRange: [0, 1],
              outputRange: [0.12, 0.24],
            }),
            transform: [
              {
                translateX: drift.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, -20],
                }),
              },
            ],
          },
        ]}
      />

      <LinearGradient
        colors={["rgba(9,10,9,0)", "rgba(9,10,9,0.68)", palette.ink]}
        locations={[0.2, 0.72, 1]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  glow: {
    position: "absolute",
    borderRadius: 999,
  },
  glowA: {
    width: 330,
    height: 330,
    top: 70,
    left: -155,
    backgroundColor: "#556648",
  },
  glowB: {
    width: 300,
    height: 300,
    right: -170,
    bottom: 80,
    backgroundColor: "#715144",
  },
});
