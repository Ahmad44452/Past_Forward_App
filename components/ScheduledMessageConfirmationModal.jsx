import { BACKEND_URI } from "../constants/ConnectionStrings";
import { Modal, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import axios from "axios";
import { Dimensions } from "react-native";
import Colors from "../constants/Colors";
import { useState } from "react";
import Toast from "react-native-toast-message";
import { database } from "../model/database";

const ScheduledMessageConfirmationModal = ({
  date,
  setDate,
  confirmationModalStatus,
  setConfirmationModalStatus,
  username,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const closeModal = () => {
    if (!isLoading) {
      setDate(false);
      setConfirmationModalStatus({
        isVisible: false,
        messages: [],
      });
    }
  };

  const sendScheduledMessage = async () => {
    setIsLoading(true);
    try {
      for (const msg of confirmationModalStatus.messages) {
        await axios.post(`${BACKEND_URI}/api/user/schedulemessage`, {
          id: msg._id,
          message: msg.text,
          from: msg.user._id,
          to: username,
          time: Math.round(date.getTime() / 1000),
        });

        database.write(async () => {
          await database.get("messages").create((message) => {
            message._raw.id = msg._id;
            message.from = msg.user._id;
            message.to = username;
            message.audience = "CHAT"; // CHAT | GROUP
            message.type = "PLAIN"; // PLAIN | IMG | VIDEO
            message.markdownText = msg.text;
            message.status = "PENDING"; // PENDING | SENT | RECEIVED
            message.messageAt = new Date(date);
            message.isRead = true;
            message.isScheduled = true;
          });
        });
      }
      Toast.show({
        type: "success",
        text1: "Message scheduled successfully!",
      });
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
    setDate(false);
    setConfirmationModalStatus({
      isVisible: false,
      messages: [],
    });
    setIsLoading(false);
  };
  return (
    <Modal transparent={true} animationType="slide" onRequestClose={closeModal}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.4)",
        }}
      >
        <View
          style={{
            backgroundColor: "#fff",
            paddingHorizontal: 10,
            paddingVertical: 7,
            borderRadius: 5,
            width: Dimensions.get("window").width - 30,
          }}
        >
          <Text style={{ marginBottom: 15, textAlign: "center" }}>
            Do you want to schedule a message for{" "}
            {date.toLocaleString("en-US", {
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
            ?
          </Text>
          <View style={{ flexDirection: "row", gap: 5 }}>
            {isLoading ? (
              <TouchableOpacity style={styles.appButtonContainer}>
                <ActivityIndicator color={"#fff"} />
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity style={styles.appButtonContainerOutline} onPress={closeModal}>
                  <Text style={styles.appButtonText}>No</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.appButtonContainer} onPress={sendScheduledMessage}>
                  <Text style={styles.appButtonText}>Yes</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ScheduledMessageConfirmationModal;

const styles = StyleSheet.create({
  appButtonContainer: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 3,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  appButtonContainerOutline: {
    flex: 1,
    backgroundColor: "#FF4C4C",
    borderRadius: 3,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  appButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    alignSelf: "center",
    textTransform: "uppercase",
  },
});
