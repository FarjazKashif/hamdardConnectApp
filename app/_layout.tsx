import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import "../global.css";

if (typeof window !== 'undefined' && !window.setImmediate) {
  window.setImmediate = ((callback: any, ...args: any[]) => 
    setTimeout(callback, 0, ...args)) as any;
}

export const unstable_settings = {
  anchor: 'index',
};

// Set the animation options. This is optional.
SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

export default function RootLayout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        {/* <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} /> */}
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}