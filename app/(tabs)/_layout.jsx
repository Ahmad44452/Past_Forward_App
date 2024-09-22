import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Tabs, useSegments } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as SecureStore from "expo-secure-store";
import XmppClient from "../../xmpp/client";
import { useEffect } from "react";

const TabsLayout = () => {
  const segments = useSegments();

  useEffect(() => {
    const startClient = async () => {
      let loggedInUser = await SecureStore.getItemAsync("loggedInUser");
      if (loggedInUser) {
        if (XmppClient.client === null) {
          loggedInUser = JSON.parse(loggedInUser);
          XmppClient.initClient(loggedInUser.username, loggedInUser.password);
          //  XmppClient.client.start();
        }

        if (XmppClient.client.status === "offline") {
          console.log("starting xmpp client");
          XmppClient.client.start().catch((err) => console.log(err));
          //    console.log("user offline");
          //    xmppClient.start().catch((err) => console.error(err));
          //  }
        }
      } else {
        console.log("No user logged in");
      }
    };
    startClient();
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarStyle: { backgroundColor: Colors.background },
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveBackgroundColor: Colors.background,
          tabBarActiveBackgroundColor: Colors.background,
          headerStyle: {
            backgroundColor: Colors.background,
          },
          headerShadowVisible: false,
        }}
      >
        <Tabs.Screen
          name="updates"
          options={{
            title: "Updates",
            tabBarIcon: ({ size, color }) => (
              <MaterialIcons name="update" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="calls"
          options={{
            title: "Calls",
            tabBarIcon: ({ size, color }) => (
              <MaterialCommunityIcons name="phone-outline" size={size} color={color} />
            ),
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="chats"
          options={{
            title: "Chats",
            tabBarIcon: ({ size, color }) => (
              <Ionicons name="chatbubbles" size={size} color={color} />
            ),
            headerShown: false,
            tabBarStyle: {
              backgroundColor: Colors.background,
              display: segments[2] === "[id]" ? "none" : "flex",
            },
          }}
        />
        <Tabs.Screen
          name="todo"
          options={{
            title: "Tasks",
            tabBarIcon: ({ size, color }) => (
              <MaterialIcons name="task" size={size} color={color} />
            ),
            headerShown: false,
            tabBarStyle: {
              backgroundColor: Colors.background,
            },
          }}
        />

        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ size, color }) => <Ionicons name="cog" size={size} color={color} />,
            headerShown: false,
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  );
};
export default TabsLayout;
