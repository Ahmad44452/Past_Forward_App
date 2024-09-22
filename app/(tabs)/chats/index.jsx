import { View, Text, ActivityIndicator, FlatList } from "react-native";
import chats from "../../../assets/data/chats.json";
import ChatRow from "../../../components/ChatRow";
import { defaultStyles } from "@/constants/Styles";
import { withObservables } from "@nozbe/watermelondb/react";
import { database } from "../../../model/database";
import { useHeaderHeight } from "@react-navigation/elements";
import { useLayoutEffect, useState } from "react";
import { useNavigation } from "expo-router";
import useDebounce from "../../../hooks/UseDebounce";
import Colors from "../../../constants/Colors";
import axios from "axios";
import { BACKEND_URI } from "../../../constants/ConnectionStrings";
import * as SecureStore from "expo-secure-store";

function debounce(func, timeout = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}
const processChange = debounce(async (text, setIsLoading, setFoundUser) => {
  console.log("Calling API", text);
  try {
    await axios.get(`${BACKEND_URI}/api/user?username=${text}`);
    setFoundUser({
      exists: true,
      username: `${text.toLowerCase()}@localhost/PastForward`,
      name: text.toLowerCase(),
    });
    console.log("user exists");
  } catch (err) {
    console.log(err);
    setFoundUser({
      exists: false,
      username: "",
      name: "",
    });
  }

  setIsLoading(false);
}, 1000);

const Page = ({ contacts }) => {
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [foundUser, setFoundUser] = useState({
    exists: false,
    username: "",
    name: "",
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      headerSearchBarOptions: {
        onChangeText: ({ nativeEvent }) => {
          setIsLoading(true);
          let isUserFoundLocally = false;
          for (const con of contacts) {
            if (con.username === `${nativeEvent.text}@localhost/PastForward`) {
              isUserFoundLocally = true;
            }
          }
          const loggedInUser = JSON.parse(SecureStore.getItem("loggedInUser")).username;

          if (!isUserFoundLocally && loggedInUser !== nativeEvent.text) {
            processChange(nativeEvent.text, setIsLoading, setFoundUser);
          } else {
            setFoundUser({
              exists: false,
              username: "",
              name: "",
            });
            setIsLoading(false);
          }
          setSearchText(nativeEvent.text);
        },
      },
    });
  }, [navigation]);

  return (
    <View
      style={{
        marginTop: headerHeight,
        paddingHorizontal: 10,
      }}
      // contentInsetAdjustmentBehavior="automatic"
      // contentContainerStyle={{
      //   paddingBottom: 40,
      //   flex: 1,
      //   backgroundColor: "#fff",
      // }}
    >
      {searchText === "" ? null : (
        <>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "500",
              paddingLeft: 5,
              borderBottomColor: "rgba(0,0,0,0.25)",
              borderBottomWidth: 1,
            }}
          >
            Users
          </Text>
          {isLoading ? (
            <ActivityIndicator size="large" color={Colors.primary} />
          ) : foundUser.exists ? (
            <ChatRow
              from={foundUser.name}
              id={foundUser.username}
              username={foundUser.username}
              isNew={true}
              setSearchText={setSearchText}
            />
          ) : (
            <Text style={{ textAlign: "center", marginVertical: 8 }}>No user found</Text>
          )}
          <Text
            style={{
              fontSize: 20,
              fontWeight: "500",
              paddingLeft: 5,
              borderBottomColor: "rgba(0,0,0,0.25)",
              borderBottomWidth: 1,
            }}
          >
            Contacts
          </Text>
        </>
      )}

      <FlatList
        data={contacts}
        renderItem={({ item }) => (
          <ChatRow
            from={item.name}
            id={item.id}
            msg={"Sample last message"}
            key={item.id}
            date={new Date()}
            username={item.username}
            isNew={false}
            setSearchText={setSearchText}
          />
        )}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={[defaultStyles.separator, { marginLeft: 0 }]} />}
        scrollEnabled={true}
        removeClippedSubviews={true}
      />
    </View>
  );
};

const enhance = withObservables([], ({}) => ({
  contacts: database.get("contacts").query().observe(),
}));

const EnhancedPage = enhance(Page);

export default EnhancedPage;
