import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { Checkbox } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialIcons";
import Colors from "../constants/Colors";
import { format } from "date-fns";

const TodoListItem = ({ todo, onToggle, onDelete }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  return (
    <View>
      <TouchableOpacity onPress={toggleModal} style={styles.container}>
        <Checkbox
          status={todo.isCompleted ? "checked" : "unchecked"}
          onPress={() => onToggle(todo)}
          color={Colors.primary}
        />
        <View style={styles.textContainer}>
          <View style={styles.titleContainer}>
            <Text style={[styles.titleText, todo.isCompleted && styles.completedText]}>
              {todo.title}
            </Text>
          </View>
          <Text style={styles.timeText}>{format(todo.time, "hh:mm b - MM.dd.yy")}</Text>
        </View>
        <TouchableOpacity onPress={() => onDelete(todo.id)} style={styles.deleteButton}>
          <Icon name="delete" size={24} color="#ff5252" />
        </TouchableOpacity>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={toggleModal}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.modalTitleContainer}>
              <Text style={styles.modalTitle}>{todo.title}</Text>
              <Icon
                name={todo.isCompleted ? "check-circle" : "schedule"}
                size={24}
                color={todo.isCompleted ? "#4CAF50" : "#FFC107"}
              />
            </View>
            <Text style={styles.modalTime}>{format(todo.time, "hh:mm b - MM.dd.yy")}</Text>
            <Text style={styles.modalDescription}>{todo.description}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={toggleModal}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  textContainer: {
    flex: 1,
    marginLeft: 16,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleText: {
    fontSize: 16,
    color: "#333333",
    fontWeight: "bold",
    flex: 1,
  },
  completedText: {
    textDecorationLine: "line-through",
    color: "#888888",
  },
  timeText: {
    fontSize: 12,
    color: "#666666",
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    paddingTop: 25,
    paddingBottom: 25,
    paddingHorizontal: 20,
    alignItems: "stretch",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "80%",
  },
  modalTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
  },
  modalTime: {
    fontSize: 14,
    color: "#666",
    //  marginBottom: 10,
  },
  modalDescription: {
    fontSize: 16,
    marginTop: 20,
    marginBottom: 35,
  },
  closeButton: {
    backgroundColor: "#ff5252",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 25,
    elevation: 2,
    alignSelf: "center",
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default TodoListItem;
