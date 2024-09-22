import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import Colors from "../constants/Colors";
import DatePicker from "react-native-date-picker";
import Toast from "react-native-toast-message";
import { database } from "../model/database";
import { scheduleTodoNotification } from "../notifications/notificationsScheduler";

const AddTodoModal = ({ visible, setVisible }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleClose = () => {
    setVisible(false);
  };

  const handleSubmit = async () => {
    if (title.trim() === "") {
      alert("Please enter a title for the todo.");
      return;
    }

    const notificationId = await scheduleTodoNotification({ time: time, title: title });

    await database.write(async () => {
      await database.get("tasks").create((task) => {
        task.title = title;
        task.description = description;
        task.isCompleted = false;
        task.time = time;
        task.notificationId = notificationId;
      });
    });

    Toast.show({
      type: "success",
      text1: "Task created successfully ✅",
    });

    resetForm();
    setVisible(false);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setTime(new Date());
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={handleClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Add New Todo</Text>

          <TextInput
            style={styles.input}
            placeholder="Title"
            value={title}
            onChangeText={setTitle}
          />

          <TextInput
            style={[styles.input, styles.descriptionInput]}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <TouchableOpacity style={styles.timeButton} onPress={() => setShowTimePicker(true)}>
            <Icon name="access-time" size={24} color={Colors.primary} />
            <Text style={styles.timeButtonText}>
              {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </Text>
          </TouchableOpacity>

          <DatePicker
            modal
            mode="datetime"
            minimumDate={new Date()}
            open={showTimePicker}
            date={time}
            onConfirm={(date) => {
              setShowTimePicker(false);
              setTime(date);
            }}
            onCancel={() => {
              setShowTimePicker(false);
            }}
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={handleClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.submitButton]} onPress={handleSubmit}>
              <Text style={[styles.buttonText, styles.submitButtonText]}>Add Todo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "90%",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
    width: "100%",
  },
  descriptionInput: {
    height: 80,
    textAlignVertical: "top",
  },
  timeButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  timeButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: Colors.primary,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    backgroundColor: "#ff5252",
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    width: "45%",
  },
  submitButton: {
    backgroundColor: Colors.primary,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  submitButtonText: {
    color: "white",
  },
});

export default AddTodoModal;
