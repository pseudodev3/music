import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { MusicProvider } from "../src/context/MusicContext";
import { palette } from "../src/theme";

export default function RootLayout() {
  return (
    <MusicProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: palette.ink },
          animation: "fade",
        }}
      />
    </MusicProvider>
  );
}
