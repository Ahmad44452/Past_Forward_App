import React from "react";
import { View, TouchableOpacity, Keyboard } from "react-native";
import { InputToolbar } from "react-native-gifted-chat";
import { Ionicons } from "@expo/vector-icons";
import { useActionSheet } from "@expo/react-native-action-sheet";
import Colors from "../constants/Colors";

const CustomInputToolbar = (props) => {
  const { showActionSheetWithOptions } = useActionSheet();

  const handleAddPress = () => {
    Keyboard.dismiss();
    const options = ["Create Task", "Cancel"];
    const cancelButtonIndex = 1;
    const destructiveButtonIndex = undefined;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex,
        textStyle: { textAlign: "center", width: "100%" },
        tintColor: Colors.text, // Change this to your text color
        cancelButtonTintColor: "red",
      },
      (selectedIndex) => {
        switch (selectedIndex) {
          case 0:
            props.onPressCreateTask();
            break;
        }
      }
    );
  };

  return (
    <InputToolbar
      {...props}
      containerStyle={{ backgroundColor: Colors.background }}
      renderActions={() => (
        <TouchableOpacity
          onPress={handleAddPress}
          style={{ height: 44, justifyContent: "center", alignItems: "center", left: 5 }}
        >
          <Ionicons name="add" color={Colors.primary} size={28} />
        </TouchableOpacity>
      )}
    />
  );
};

export default CustomInputToolbar;
