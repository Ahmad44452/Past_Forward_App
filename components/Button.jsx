import { StyleSheet, TouchableOpacity, Text } from "react-native";
import Colors from "../constants/Colors";

const Button = (props) => {
  return (
    <TouchableOpacity
      style={{
        ...styles.btn,
        ...props.style,
      }}
      onPress={props.onPress ? props.onPress : null}
      disabled={props.disabled === false || props.disabled === true ? props.disabled : false}
    >
      {props.children}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
    borderWidth: 1,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Button;
