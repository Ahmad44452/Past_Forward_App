import { BACKEND_URI } from "../constants/ConnectionStrings";
import { Modal, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Dimensions } from "react-native";
import Colors from "../constants/Colors";
import { useState } from "react";
import Toast from "react-native-toast-message";
import { database } from "../model/database";
import { cancelTodoNotification } from "../notifications/notificationsScheduler";

const DeleteTodoModal = ({ deleteTodoModalVisible, setDeleteTodoModalVisible }) => {
  const [isLoading, setIsLoading] = useState(false);

  const closeModal = () => {
    if (!isLoading) {
      setDeleteTodoModalVisible({ task: null, isVisible: false });
    }
  };

  const deleteTodo = async () => {
    setIsLoading(true);
    try {
      await cancelTodoNotification(deleteTodoModalVisible.task.notificationId);
      await database.write(async () => {
        await deleteTodoModalVisible.task.destroyPermanently();
      });
      Toast.show({
        type: "success",
        text1: "Todo deleted successfully!",
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
    setIsLoading(false);
    setDeleteTodoModalVisible({ task: null, isVisible: false });
  };

  return (
    <Modal
      transparent={true}
      animationType="slide"
      onRequestClose={closeModal}
      visible={deleteTodoModalVisible.isVisible}
    >
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
            Do you really want to delete the task?
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
                <TouchableOpacity style={styles.appButtonContainer} onPress={deleteTodo}>
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

export default DeleteTodoModal;

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
