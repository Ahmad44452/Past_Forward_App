import defaultPfp from "../assets/images/default-pfp.png";
import { View, Image, Text, TouchableOpacity } from "react-native";

const ChatHeaderTitle = ({ userName, setIsProfileModalVisible }) => {
  return (
    <TouchableOpacity
      style={{
        flexDirection: "row",
        width: 220,
        alignItems: "center",
        gap: 10,
        paddingBottom: 4,
      }}
      onPress={() => setIsProfileModalVisible(true)}
    >
      <Image source={defaultPfp} style={{ width: 40, height: 40, borderRadius: 50 }} />
      <Text style={{ fontSize: 16, fontWeight: "500" }}>{userName}</Text>
    </TouchableOpacity>
  );
};

export default ChatHeaderTitle;
