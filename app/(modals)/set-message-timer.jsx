import { View, Text, StyleSheet, Image } from "react-native";
import Colors from "@/constants/Colors";
import { AlphabetList } from "react-native-section-alphabet-list";
import { defaultStyles } from "@/constants/Styles";

const Page = () => {
  return (
    <View style={{ flex: 1, paddingTop: 110, backgroundColor: Colors.background }}>
      <Text>Set Timer</Text>
    </View>
  );
};

export default Page;

const styles = StyleSheet.create({
  listItemContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 50,
    paddingHorizontal: 14,
    backgroundColor: "#fff",
  },
  listItemImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  sectionHeaderContainer: {
    height: 30,
    backgroundColor: Colors.background,
    justifyContent: "center",
    paddingHorizontal: 14,
  },
});
