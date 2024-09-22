import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, ActivityIndicator, Platform } from "react-native";
import Colors from "@/constants/Colors";
import { useRouter } from "expo-router";
import pastForwardLogo from "@/assets/images/PastForwardLogo.png";
import Button from "../components/Button";
const pastForwardLogoImageUri = Image.resolveAssetSource(pastForwardLogo).uri;
import * as SecureStore from "expo-secure-store";
import * as Notifications from "expo-notifications";
import {
  requestNotificationPermissions,
  configureNotifications,
} from "../notifications/notificationsScheduler";

const WelcomeScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const openLink = () => {
    console.log("Opening privacy policy");
  };

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }
      await requestNotificationPermissions();
      configureNotifications();

      const loggedInUser = await SecureStore.getItemAsync("loggedInUser");
      if (loggedInUser) {
        // user already logged in redirecting
        setIsLoading(false);
        router.replace("/(tabs)/chats");
      } else {
        // no user logged in
        setIsLoading(false);
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={[StyleSheet.absoluteFill, styles.loading]}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={{ fontSize: 18, padding: 10 }}>Loading your chats...</Text>
        </View>
      ) : null}
      <Image resizeMode="center" source={{ uri: pastForwardLogoImageUri }} style={styles.welcome} />
      <Text style={styles.headline}>Welcome to Past Forward</Text>
      <Text style={styles.description}>
        Read our{" "}
        <Text style={styles.link} onPress={openLink}>
          Privacy Policy
        </Text>
        . {'Tap "Agree & Continue" to accept the '}
        <Text style={styles.link} onPress={openLink}>
          Terms of Service
        </Text>
        .
      </Text>
      <Button
        style={styles.button}
        onPress={() => {
          router.push("/otp");
        }}
      >
        <Text style={{ fontSize: 20, lineHeight: 30, fontWeight: "500", color: "#fff" }}>
          Agree & Continue
        </Text>
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  welcome: {
    width: "100%",
    height: 300,
    borderRadius: 60,
    marginBottom: 80,
  },
  headline: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 20,
  },
  description: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 80,
    color: Colors.gray,
  },
  link: {
    color: Colors.primary,
  },
  button: {
    width: "100%",
    alignItems: "center",
    borderRadius: 16,
  },
  buttonText: {
    color: Colors.primary,
    fontSize: 22,
    fontWeight: "500",
  },
  loading: {
    zIndex: 10,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default WelcomeScreen;
