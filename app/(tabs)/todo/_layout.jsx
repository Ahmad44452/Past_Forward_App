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
          title: "Tasks",
          headerTitleStyle: { fontFamily: "Helvetica", fontWeight: "900" },
          headerLargeTitle: true,
          headerTransparent: true,
          headerBlurEffect: "regular",
          headerLeft: () => (
            <TouchableOpacity>
              <Image
                source={PastForwardLogo}
                resizeMode="contain"
                style={{ height: "100%", width: 30, marginRight: 5 }}
              />
            </TouchableOpacity>
          ),
          headerStyle: {
            backgroundColor: "#fff",
          },
        }}
      />
    </Stack>
  );
};
export default Layout;
