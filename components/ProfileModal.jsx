import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
} from "react-native";
import { withObservables } from "@nozbe/watermelondb/react";
import { database } from "../model/database";
import { Q } from "@nozbe/watermelondb";
import { useState } from "react";
import DeleteScheduledMessageConfirmationModal from "./DeleteScheduledMessageConfirmationModal";
import Toast from "react-native-toast-message";
import toastConfig from "../configs/toastConfig";

// const DATA = [
//   {
//     id: 1,
//     title: "Scheduled message 1",
//     scheduledTime: "2024-02-01",
//   },
//   {
//     id: 2,
//     title: "Scheduled message 2",
//     scheduledTime: "2024-02-01",
//   },
//   {
//     id: 3,
//     title: "Scheduled message 3",
//     scheduledTime: "2024-02-01",
//   },
//   {
//     id: 4,
//     title: "Scheduled message 4",
//     scheduledTime: "2024-02-01",
//   },
// ];

const ProfileModal = ({ setIsProfileModalVisible, scheduledMessages }) => {
  const [deleteScheduleModalVisible, setDeleteScheduleModalVisible] = useState({
    msgId: "",
    modalVisible: false,
  });

  return (
    <Modal style={styles.container} animationType="slide">
      {deleteScheduleModalVisible.modalVisible ? (
        <DeleteScheduledMessageConfirmationModal
          deleteScheduleModalVisible={deleteScheduleModalVisible}
          setDeleteScheduleModalVisible={setDeleteScheduleModalVisible}
        />
      ) : null}

      <View style={styles.header}>
        <Text style={styles.headerText}>Scheduled Messages</Text>
        <TouchableOpacity onPress={() => setIsProfileModalVisible(false)}>
          <Ionicons name="close" color="#dc3545" size={30} />
        </TouchableOpacity>
      </View>

      <View>
        <FlatList
          data={scheduledMessages}
          renderItem={({ item }) => {
            return (
              <View style={styles.listItemContainer}>
                <View style={styles.listItemTextContainer}>
                  <Text style={styles.listItemTitle}>
                    {item.markdownText.split("\n")[0].length > 40
                      ? `${item.markdownText.split("\n")[0].substring(0, 40)}...`
                      : `${item.markdownText.split("\n")[0]}${
                          item.markdownText.split("\n").length > 1 ? "..." : ""
                        }`}
                  </Text>
                  <Text style={styles.listItemTime}>
                    {format(item.messageAt, "hh:mm b - MM.dd.yy")}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.listItemDeleteButton}
                  onPress={() =>
                    setDeleteScheduleModalVisible({ msgId: item.id, modalVisible: true })
                  }
                >
                  <MaterialIcons name="delete-outline" color="#dc3545" size={30} />
                </TouchableOpacity>
              </View>
            );
          }}
          keyExtractor={(item) => item.id}
        />
      </View>

      <Toast config={toastConfig} />
    </Modal>
  );
};

const enhance = withObservables([], ({ username, loggedInUser }) => ({
  scheduledMessages: database
    .get("messages")
    .query(
      Q.sortBy("message_at", Q.desc),
      Q.or(
        Q.and(
          Q.where("from", `${loggedInUser}`),
          Q.where("to", username),
          Q.where("audience", "CHAT"),
          Q.where("is_scheduled", true)
        )
      )
    )
    .observe(),
}));

const EnhancedProfileModal = enhance(ProfileModal);

export default EnhancedProfileModal;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "red",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 3,
    marginHorizontal: 6,
    borderBottomColor: "rgba(0,0,0,0.25)",
    borderBottomWidth: 1,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "500",
  },
  listItemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  listItemTextContainer: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  listItemTime: {
    fontSize: 12,
    color: "#888",
  },
  listItemDeleteButton: {
    //  backgroundColor: "#ff3b30",
    //  padding: 10,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
