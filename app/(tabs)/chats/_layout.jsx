import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Link, Stack, useRouter } from "expo-router";
import { TouchableOpacity, View, Text, Image } from "react-native";
import PastForwardLogo from "../../../assets/images/PastForwardLogo.png";
import ChatHeaderTitle from "../../../components/ChatHeaderTitle";

const Layout = () => {
  const router = useRouter();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Past Forward",
          headerTitleStyle: { fontFamily: "Helvetica", fontWeight: "900" },
          headerLargeTitle: true,
          headerTransparent: true,
          headerBlurEffect: "regular",
          headerLeft: () => (
            <View>
              <Image
                source={PastForwardLogo}
                resizeMode="contain"
                style={{ height: "100%", width: 30, marginRight: 5 }}
              />
            </View>
          ),
          headerRight: () => (
            <View style={{ flexDirection: "row", gap: 30 }}>
              {/* <TouchableOpacity onPress={() => router.push("/(modals)/new-chat")}>
                <Ionicons name="add-circle" color={Colors.primary} size={30} />
              </TouchableOpacity> */}
            </View>
          ),
          headerStyle: {
            backgroundColor: "#fff",
          },
          headerSearchBarOptions: {
            placeholder: "Search",
          },
        }}
      />

      <Stack.Screen
        name="[id]"
        options={{
          title: "",
          headerBackTitleVisible: false,
          headerTitle: () => <ChatHeaderTitle name={"Sample User"} />,
          headerRight: () => (
            <View style={{ flexDirection: "row", gap: 30 }}>
              <TouchableOpacity>
                <Ionicons name="videocam-outline" color={Colors.primary} size={30} />
              </TouchableOpacity>
              <TouchableOpacity>
                <Ionicons name="call-outline" color={Colors.primary} size={30} />
              </TouchableOpacity>
            </View>
          ),
          headerStyle: {
            backgroundColor: Colors.background,
          },
        }}
      />
    </Stack>
  );
};
export default Layout;
