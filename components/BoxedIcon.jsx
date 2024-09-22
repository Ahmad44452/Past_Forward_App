import { Ionicons } from "@expo/vector-icons";
import { View, Text } from "react-native";

const BoxedIcon = ({ name, backgroundColor }) => {
  return (
    <View style={{ backgroundColor, padding: 4, borderRadius: 6 }}>
      <Ionicons name={name} size={22} color={"#fff"} />
    </View>
  );
};
export default BoxedIcon;
