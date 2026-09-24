import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SpotifyProvider } from "../src/context/SpotifyContext";
import { palette } from "../src/theme";

export default function RootLayout() {
  return (
    <SpotifyProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: palette.ink },
          animation: "fade",
        }}
      />
    </SpotifyProvider>
  );
}
