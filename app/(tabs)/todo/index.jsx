import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import NothingImage from "../../../assets/images/nothing.png";
import TodoListItem from "../../../components/TodoListItem";
import Colors from "../../../constants/Colors";
import AddTodoModal from "../../../components/AddTodoModal";
import { useState } from "react";
import { withObservables } from "@nozbe/watermelondb/react";
import { database } from "../../../model/database";
import DeleteTodoModal from "../../../components/DeleteTodoModal";

const Page = ({ tasks }) => {
  const headerHeight = useHeaderHeight();
  const [isAddTodoModalVisible, setIsAddTodoModalVisible] = useState(false);
  const [deleteTodoModalVisible, setDeleteTodoModalVisible] = useState({
    task: null,
    isVisible: false,
  });

  const onToggle = async (todo) => {
    await database.write(async () => {
      await todo.update((task) => {
        task.isCompleted = !todo.isCompleted;
      });
    });
  };

  return (
    <View
      style={[
        styles.container,
        {
          marginTop: headerHeight,
        },
      ]}
    >
      <DeleteTodoModal
        deleteTodoModalVisible={deleteTodoModalVisible}
        setDeleteTodoModalVisible={setDeleteTodoModalVisible}
      />
      {tasks.length > 0 ? (
        <FlatList
          data={tasks}
          renderItem={({ item }) => {
            return (
              <TodoListItem
                todo={item}
                onToggle={onToggle}
                onDelete={() => setDeleteTodoModalVisible({ task: item, isVisible: true })}
              />
            );
          }}
        />
      ) : (
        <View style={{ justifyContent: "center", alignItems: "center", flex: 1 }}>
          <Image
            source={NothingImage}
            style={{ width: 200, height: 200, marginBottom: 20, resizeMode: "contain" }}
          />
          <Text style={{ fontSize: 13, color: "#000", fontWeight: "bold" }}>NICE!</Text>
          <Text style={{ fontSize: 13, color: "#737373", fontWeight: "500" }}>
            Nothing is scheduled.
          </Text>
        </View>
      )}
      <TouchableOpacity style={styles.plusButton} onPress={() => setIsAddTodoModalVisible(true)}>
        <Text style={styles.plusButton.plus}>+</Text>
      </TouchableOpacity>
      <AddTodoModal visible={isAddTodoModalVisible} setVisible={setIsAddTodoModalVisible} />
    </View>
  );
};

const enhance = withObservables([], ({}) => ({
  tasks: database.get("tasks").query().observeWithColumns(["is_completed"]),
}));

const EnhancedPage = enhance(Page);

export default EnhancedPage;

const styles = StyleSheet.create({
  title: {
    fontSize: 34,
    fontWeight: "bold",
    marginBottom: 35,
    marginTop: 10,
  },
  pic: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignSelf: "flex-end",
  },
  container: {
    flex: 1,
    //  paddingHorizontal: 15,
  },
  plusButton: {
    backgroundColor: Colors.primary,
    position: "absolute",
    bottom: 15,
    right: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    borderRadius: 13,
    plus: {
      fontSize: 40,
      color: "#fff",
      paddingHorizontal: 15,
      paddintTop: 0,
      paddingBottom: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
  },
});
