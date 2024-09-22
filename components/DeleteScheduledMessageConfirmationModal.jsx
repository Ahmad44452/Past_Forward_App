import { BACKEND_URI } from "../constants/ConnectionStrings";
import { Modal, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import axios from "axios";
import { Dimensions } from "react-native";
import Colors from "../constants/Colors";
import { useState } from "react";
import Toast from "react-native-toast-message";
import { database } from "../model/database";

const DeleteScheduledMessageConfirmationModal = ({
  deleteScheduleModalVisible,
  setDeleteScheduleModalVisible,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const closeModal = () => {
    if (!isLoading) {
      setDeleteScheduleModalVisible({ msgId: "", modalVisible: false });
    }
  };

  const deleteScheduledMessage = async () => {
    setIsLoading(true);
    try {
      console.log("Deleting ", deleteScheduleModalVisible.msgId);
      await axios.post(`${BACKEND_URI}/api/user/unschedulemessage`, {
        id: deleteScheduleModalVisible.msgId,
      });
      const msgToUpdate = await database.get("messages").find(deleteScheduleModalVisible.msgId);
      if (msgToUpdate.isScheduled) {
        await database.write(async () => {
          await msgToUpdate.destroyPermanently();
        });

        Toast.show({
          type: "success",
          text1: "Message unscheduled successfully!",
        });
      } else {
        Toast.show({
          type: "error",
          text2: "Schedule not found",
        });
      }
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
    setIsLoading(false);
    setDeleteScheduleModalVisible({ msgId: "", modalVisible: false });
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
            Do you really want to unschedule this message?
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
                <TouchableOpacity
                  style={styles.appButtonContainer}
                  onPress={deleteScheduledMessage}
                >
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

export default DeleteScheduledMessageConfirmationModal;

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
