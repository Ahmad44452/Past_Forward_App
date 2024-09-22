import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Link, Stack, useRootNavigationState, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
// import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import * as SecureStore from "expo-secure-store";
import { TouchableOpacity, View, Text, Platform } from "react-native";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import toastConfig from "../configs/toastConfig";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const InitialLayout = () => {
  const segments = useSegments();
  const router = useRouter();
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    Helvetica: require("../assets/fonts/HelveticaNeueMedium.ttf"),
    ...FontAwesome.font,
  });
  const rootNavigationState = useRootNavigationState();

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  //   useEffect(() => {

  //     const inTabsGroup = segments[0] === "(tabs)";

  //     if (
  //       !inTabsGroup &&
  //       loaded
  //     ) {
  //       // router.replace("/(tabs)/chats");
  //     }

  //   }, [
  //     loaded,
  //   ]);

  if (!loaded) {
    return <View />;
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="otp" options={{ headerTitle: "Login", headerBackVisible: true }} />
      <Stack.Screen
        name="verify/[phone]"
        options={{
          title: "Verify Your Phone Number",
          headerShown: true,
          headerBackTitle: "Edit number",
        }}
      />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="(modals)/new-chat"
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
          title: "New Chat",
          headerTransparent: true,
          headerBlurEffect: "regular",
          headerStyle: {
            backgroundColor: Colors.background,
          },
          headerRight: () => (
            <Link href={"/(tabs)/chats"} asChild>
              <TouchableOpacity
                style={{ backgroundColor: Colors.lightGray, borderRadius: 20, padding: 4 }}
              >
                {/* <Text>BaseToast</Text> */}
                <Ionicons name="close" color={Colors.gray} size={30} />
              </TouchableOpacity>
            </Link>
          ),
          headerSearchBarOptions: {
            placeholder: "Search name or number",
            hideWhenScrolling: false,
          },
        }}
      />
    </Stack>
  );
};

const RootLayoutNav = () => {
  return (
    <>
      <InitialLayout />
      <Toast config={toastConfig} />
    </>
  );
};

export default RootLayoutNav;
