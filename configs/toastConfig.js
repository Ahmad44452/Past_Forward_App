import { BaseToast, ErrorToast } from "react-native-toast-message";
import Colors from "../constants/Colors";

export default {
  success: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: Colors.primary }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 17,
        fontWeight: "600",
      }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      text1Style={{
        fontSize: 17,
        fontWeight: "600",
      }}
      text2Style={{
        color: "#000",
        fontWeight: "600",
      }}
    />
  ),
};
