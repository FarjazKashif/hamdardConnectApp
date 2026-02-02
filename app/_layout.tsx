import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import "../global.css";

if (typeof window !== 'undefined' && !window.setImmediate) {
  window.setImmediate = ((callback: any, ...args: any[]) => 
    setTimeout(callback, 0, ...args)) as any;
}

// SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(root)" options={{ headerShown: false }} />
        {/* <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} /> */}
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}