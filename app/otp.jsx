import Colors from "../constants/Colors";
import axios from "axios";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import pastForwardLogo from "../assets/images/PastForwardLogo.png";
import {
  View,
  Text,
  StyleSheet,
  Linking,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  ActivityIndicator,
  TextInput,
  Alert,
  Dimensions,
} from "react-native";
import Button from "../components/Button";
import { BACKEND_URI } from "../constants/ConnectionStrings";
import { useHeaderHeight } from "@react-navigation/elements";
import Toast from "react-native-toast-message";

import * as SecureStore from "expo-secure-store";
// import { isClerkAPIResponseError, useSignIn, useSignUp } from '@clerk/clerk-expo';

const LOGIN_KEYWORD = "Login";
const SIGNUP_KEYWORD = "Sign Up";

const { height: windowHeight } = Dimensions.get("window");

const Page = () => {
  //   const [phoneNumber, setPhoneNumber] = useState("");
  const [requestType, setRequestType] = useState(LOGIN_KEYWORD); // Login || Sign Up
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const keyboardVerticalOffset = Platform.OS === "ios" ? 90 : 0;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const headerHeight = useHeaderHeight();
  //   const { signUp, setActive } = useSignUp();
  //   const { signIn } = useSignIn();

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      if (requestType === LOGIN_KEYWORD) {
        await axios.post(`${BACKEND_URI}/api/user/login`, {
          username,
          password,
        });
      } else {
        await axios.post(`${BACKEND_URI}/api/user/`, {
          username,
          password,
        });
      }
      await SecureStore.setItemAsync(
        "loggedInUser",
        JSON.stringify({ username: username.toLowerCase(), password: password })
      );
      Toast.show({
        type: "success",
        text1: "Logged in successfully 👋",
      });
      router.replace("/(tabs)/chats");
    } catch (err) {
      let toastError;
      if (err?.request?.response) {
        toastError = JSON.parse(err?.request?.response).message;
      } else {
        toastError = err.message;
      }
      Toast.show({
        type: "error",
        text2: toastError,
      });
    }

    setIsLoading(false);
  };

  return (
    <KeyboardAvoidingView
      keyboardVerticalOffset={keyboardVerticalOffset}
      style={{ flex: 1 }}
      behavior="padding"
    >
      {/* {isLoading && (
        <View style={[StyleSheet.absoluteFill, styles.loading]}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={{ fontSize: 18, padding: 10 }}>Sending code...</Text>
        </View>
      )} */}
      <Stack.Screen options={{ headerTitle: requestType }} />
      <ScrollView
        contentContainerStyle={{ ...styles.container, minHeight: windowHeight - headerHeight }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image source={pastForwardLogo} resizeMode="contain" style={styles.logo} />
          <Text style={styles.title}>
            {requestType === LOGIN_KEYWORD ? "Welcome back!" : "Welcome!"}
          </Text>
          <Text style={styles.subtitle}>
            {requestType === LOGIN_KEYWORD
              ? "Hello there! Continue listening to stories from around the world"
              : "Hello there! Start listening to stories from around the world"}
          </Text>

          <View
            style={{
              width: "100%",
              marginBottom: 10,
              marginTop: 25,
            }}
          >
            <TextInput
              placeholder="Username"
              onChangeText={setUsername}
              value={username}
              style={styles.textInput}
            />
            <TextInput
              placeholder="Password"
              onChangeText={setPassword}
              value={password}
              style={{
                ...styles.textInput,
                marginVertical: 10,
              }}
            />
            <Button
              onPress={handleSubmit}
              style={{
                borderRadius: 16,
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={"#fff"} size={30} />
              ) : (
                <Text
                  style={{
                    fontSize: 20,
                    lineHeight: 30,
                    fontWeight: "500",
                    color: "#fff",
                  }}
                >
                  {requestType}
                </Text>
              )}
            </Button>
          </View>
          <View style={{ flexDirection: "row" }}>
            <Text style={styles.area}>
              {requestType === LOGIN_KEYWORD
                ? "Do not have an account?"
                : "Already have an account?"}
            </Text>
            <TouchableOpacity
              style={styles.loginTitle}
              onPress={() =>
                setRequestType((prev) => (prev === LOGIN_KEYWORD ? SIGNUP_KEYWORD : LOGIN_KEYWORD))
              }
            >
              <Text style={styles.loginSubtitle}>
                {"  "}
                {requestType === LOGIN_KEYWORD ? SIGNUP_KEYWORD : LOGIN_KEYWORD}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View>
          <Text style={styles.bottomTitle}>
            By continuing, you agree to the terms of use and{" "}
            <Text
              style={styles.bottomSubtitle}
              onPress={() => console.log("Privacy Policy button pressed")}
            >
              Privacy Policy
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  area: {
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    flexDirection: "column",
    padding: 16,
    backgroundColor: "#fff",
  },
  logo: {
    width: 72,
    height: 72,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "400",
    color: "#000",
    textAlign: "center",
    //  paddingHorizontal: 16,
  },
  loginTitle: {
    fontSize: 14,
    fontWeight: "400",
    color: "#000",
  },
  loginSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
  },
  bottomContainer: {
    //  position: "absolute",
    //  bottom: 32,
    //  right: 0,
    //  left: 0,
    //  width: SIZES.width - 32,
    //  alignItems: "center",
    //  textAlign: "center",
  },
  bottomTitle: {
    fontSize: 12,
    fontWeight: "400",
    color: "#000",
    textAlign: "center",
  },
  bottomSubtitle: {
    fontSize: 12,
    fontWeight: "400",
    color: "#000",
    textDecorationLine: "underline",
  },
  textInput: {
    //  width: SIZES.width - 32,
    fontSize: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderColor: "gray",
    borderWidth: 1,
  },
});

export default Page;
