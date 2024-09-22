import AppleStyleSwipeableRow from "@/components/AppleStyleSwipeableRow";
import Colors from "@/constants/Colors";
import { format } from "date-fns";
import { Link, useRouter } from "expo-router";
import { FC, useEffect, useState } from "react";
import { View, Text, Image, TouchableHighlight } from "react-native";
import defaultPfp from "../assets/images/default-pfp.png";
import * as SecureStore from "expo-secure-store";
import { database } from "../model/database";
import XmppClient from "../xmpp/client";
import { Q } from "@nozbe/watermelondb";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { withObservables } from "@nozbe/watermelondb/react";
import { useIsFocused } from "@react-navigation/native";

const ChatRow = ({
  id,
  from,
  date,
  img,
  msg,
  username,
  read,
  unreadCount,
  isNew,
  lastMessageArr,
  setSearchText,
}) => {
  const [lastMessage, setLastMessage] = useState({ text: "", time: 0, isRead: true });
  const router = useRouter();

  useEffect(() => {
    if (lastMessageArr.length > 0) {
      setLastMessage({
        text: lastMessageArr[0].markdownText,
        time: lastMessageArr[0].messageAt,
        isRead: lastMessageArr[0].isRead,
      });
    }
  }, [lastMessageArr]);

  //   useEffect(() => {
  //     (async () => {
  //       let loggedInUser = await SecureStore.getItemAsync("loggedInUser");
  //       if (loggedInUser) {
  //         loggedInUser = `${JSON.parse(loggedInUser).username}@localhost/PastForward`;

  //         const prevMessages = await database
  //           .get("messages")
  //           .query(
  //             Q.sortBy("message_at", Q.desc),
  //             Q.take(1),
  //             Q.or(
  //               Q.and(
  //                 Q.where("from", username),
  //                 Q.where("to", `${loggedInUser}`),
  //                 Q.where("audience", "CHAT")
  //               ),
  //               Q.and(
  //                 Q.where("from", `${loggedInUser}`),
  //                 Q.where("to", username),
  //                 Q.where("audience", "CHAT")
  //               )
  //             )
  //           )
  //           .observe();

  //         if (prevMessages.length > 0) {
  //           setLastMessage({
  //             text: prevMessages[0].markdownText,
  //             time: prevMessages[0].messageAt,
  //             isRead: prevMessages[0].isRead,
  //           });
  //         }
  //       }
  //     })();
  //   }, []);

  const handlePress = async () => {
    if (isNew) {
      let messageSender;
      await database.write(async () => {
        messageSender = await database.get("contacts").create((contact) => {
          contact.name = from;
          contact.username = username;
          contact.status = "OFFLINE";
        });
        // messageSender here is same as the messageSender from query before this function
      });
      setSearchText("");
      router.push({
        pathname: `/(tabs)/chats/${messageSender.id}`,
        params: { username: messageSender.username, name: messageSender.name },
      });
    } else {
      router.push({
        pathname: `/(tabs)/chats/${id}`,
        params: { username: username, name: from },
      });
    }
  };

  return (
    <AppleStyleSwipeableRow>
      <TouchableHighlight
        activeOpacity={0.8}
        underlayColor={Colors.lightGray}
        onPress={handlePress}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
            paddingVertical: 10,
          }}
        >
          <Image
            source={img ? { uri: img } : defaultPfp}
            style={{ width: 50, height: 50, borderRadius: 50 }}
          />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>{from}</Text>
            <Text
              style={{
                fontSize: 16,
                color: Colors.gray,
                fontWeight: lastMessage.isRead ? "normal" : "bold",
              }}
            >
              {lastMessage.text.split("\n")[0].length > 40
                ? `${lastMessage.text.split("\n")[0].substring(0, 40)}...`
                : `${lastMessage.text.split("\n")[0]}${
                    lastMessage.text.split("\n").length > 1 ? "..." : ""
                  }`}
            </Text>
          </View>
          <View
            style={{
              gap: 5,
              alignSelf: "flex-start",
              marginTop: 5,
            }}
          >
            <Text
              style={{
                color: Colors.gray,
              }}
            >
              {lastMessage.time === 0 ? "" : format(lastMessage.time, "hh:mm b - MM.dd.yy")}
            </Text>
            {!lastMessage.isRead ? (
              <FontAwesome
                name="circle"
                style={{ textAlign: "center" }}
                size={12}
                color={Colors.primary}
              />
            ) : null}
          </View>
        </View>
      </TouchableHighlight>
    </AppleStyleSwipeableRow>
  );
};

const enhance = withObservables([], ({ username }) => {
  let loggedInUser = `${
    JSON.parse(SecureStore.getItem("loggedInUser")).username
  }@localhost/PastForward`;

  return {
    lastMessageArr: database
      .get("messages")
      .query(
        Q.sortBy("message_at", Q.desc),
        Q.take(1),
        Q.or(
          Q.and(
            Q.where("from", username),
            Q.where("to", `${loggedInUser}`),
            Q.where("audience", "CHAT"),
            Q.where("is_scheduled", false)
          ),
          Q.and(
            Q.where("from", `${loggedInUser}`),
            Q.where("to", username),
            Q.where("audience", "CHAT"),
            Q.where("is_scheduled", false)
          )
        )
      )
      .observeWithColumns(["is_read"]),
  };
});

const EnhancedChatRow = enhance(ChatRow);

export default EnhancedChatRow;
