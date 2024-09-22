import ChatMessageBox from "@/components/ChatMessageBox";
import ReplyMessageBar from "@/components/ReplyMessageBar";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useCallback, useEffect, useRef } from "react";
import { ImageBackground, StyleSheet, TouchableOpacity, View, Modal, Text } from "react-native";
import { xml } from "@xmpp/client";
import * as SecureStore from "expo-secure-store";
import {
  GiftedChat,
  Bubble,
  InputToolbar,
  Send,
  SystemMessage,
  IMessage,
} from "react-native-gifted-chat";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, Stack } from "expo-router";
import XmppClient from "../../../xmpp/client";
import { withObservables } from "@nozbe/watermelondb/react";
import { Q } from "@nozbe/watermelondb";
import { database } from "../../../model/database";
import ChatHeaderTitle from "../../../components/ChatHeaderTitle";
import SetMessageTimerModal from "../../../components/SetMessageTimerModal";
import ScheduledMessageConfirmationModal from "../../../components/ScheduledMessageConfirmationModal";
import ProfileModal from "../../../components/ProfileModal";
import DatePicker from "react-native-date-picker";
import CustomInputToolbar from "../../../components/CustomInputToolbar";
import AddTodoModal from "../../../components/AddTodoModal";
import * as ImagePicker from "expo-image-picker";

const Page = ({ contact, name, username }) => {
  const [isAddTodoModalVisible, setIsAddTodoModalVisible] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const [confirmationModalStatus, setConfirmationModalStatus] = useState({
    isVisible: false,
    messages: [],
  });
  const [date, setDate] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    username: "",
    name: "",
  });

  const mapMessageToGiftedChat = useCallback(
    (message) => ({
      _id: message.id,
      text: message.markdownText,
      createdAt: new Date(message.messageAt),
      user: {
        _id: message.from,
        name: name,
      },
      pending: message.status === "PENDING",
      sent: message.status === "SENT" || message.status === "RECEIVED",
      received: message.status === "RECEIVED",
    }),
    []
  );

  const pickMedia = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      // allowsEditing: true,
      // aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    //  if (!result.canceled) {
    //    setImage(result.assets[0].uri);
    //  }
  };

  const handleUserMessage = useCallback(function ({ type, msg }) {
    if (type === "chat") {
      if (msg.from === username && msg.audience === "CHAT") {
        setMessages((previousMessages) =>
          GiftedChat.append(previousMessages, [mapMessageToGiftedChat(msg)])
        );

        database.write(async () => {
          await msg.update((dbMsg) => {
            dbMsg.isRead = true;
          });
        });
      }
    } else if (type === "deliveryReceipt" && msg.to === username) {
      console.log("DELIVERY RECEIPT RECEIVED");

      setMessages((previousMessages) =>
        previousMessages.map((oldMsg) => {
          return oldMsg._id === msg.id ? { ...oldMsg, received: true } : oldMsg;
        })
      );
    } else if (type === "scheduledSent") {
      if (msg.to === username) {
        console.log("scheduled sent event in opened chat ", msg);
        setMessages((previousMessages) =>
          GiftedChat.append(previousMessages, [
            {
              _id: msg.id,
              text: msg.markdownText,
              createdAt: new Date(),
              user: {
                _id: msg.from,
                name: "",
              },
              pending: false,
              sent: true,
              received: false,
            },
          ])
        );
      }
      // setMessages((previousMessages) => {
      //   previousMessages.push(
      //     mapMessageToGiftedChat({
      //       ...msg,
      //       messageAt: new Date(),
      //     })
      //   );

      //   return previousMessages;
      // });
    }
  });

  useEffect(() => {
    XmppClient.client.on("usermessage", handleUserMessage);

    (async () => {
      let loggedInUser = await SecureStore.getItemAsync("loggedInUser");
      if (loggedInUser) {
        loggedInUser = `${JSON.parse(loggedInUser).username}@localhost/PastForward`;
        setCurrentUser({
          username: loggedInUser,
          name: "",
        });
        const dbMessages = await database
          .get("messages")
          .query(
            Q.sortBy("message_at", Q.desc),
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
          .fetch();

        setMessages(
          dbMessages.map((dbMsg) => {
            if (dbMsg.isRead === false) {
              database.write(async () => {
                await dbMsg.update((msg) => {
                  msg.isRead = true;
                });
              });
            }
            return mapMessageToGiftedChat(dbMsg);
          })
        );
      }
    })();

    return () => {
      XmppClient.client.off("usermessage", handleUserMessage);
    };
  }, []);

  const [text, setText] = useState("");
  const insets = useSafeAreaInsets();

  const [replyMessage, setReplyMessage] = useState(null);
  const swipeableRowRef = useRef(null);

  const updateMessage = useCallback((dbMessage, newStatus) => {
    // newStatus = "SENT" || "RECEIVED"
    database.write(async () => {
      dbMessage.update((msg) => {
        msg.status = newStatus;
      });
    });

    setMessages((prevMessages) =>
      prevMessages.map((message) => {
        if (message._id === dbMessage.id) {
          const updatedMessage = { ...message };
          if (newStatus === "SENT") {
            updatedMessage.pending = false;
            updatedMessage.sent = true;
          } else if (newStatus === "RECEIVED") {
            updatedMessage.pending = false;
            updatedMessage.sent = true;
            updatedMessage.received = true;
          }
          return updatedMessage;
        }

        return message;
      })
    );
  }, []);

  const onSend = useCallback(
    async (messages = []) => {
      if (date) {
        setConfirmationModalStatus({
          isVisible: true,
          messages: messages,
        });
      } else {
        for (const msg of messages) {
          msg.pending = true;
          let dbMessage;
          database
            .write(async () => {
              dbMessage = await database.get("messages").create((message) => {
                message._raw.id = msg._id;
                message.from = msg.user._id;
                message.to = username;
                message.audience = "CHAT"; // CHAT | GROUP
                message.type = "PLAIN"; // PLAIN | IMG | VIDEO
                message.markdownText = msg.text;
                message.status = "PENDING"; // PENDING | SENT | RECEIVED
                message.messageAt = new Date();
                message.isRead = true;
                message.isScheduled = false;
              });
            })
            .then(() => {
              const message = xml(
                "message",
                { type: "chat", to: username, id: dbMessage.id },
                xml("body", {}, msg.text)
              );
              XmppClient.client.send(message).then(() => {
                updateMessage(dbMessage, "SENT");
              });
            });
          // msg._id = dbMessage.id;
        }
        setMessages((previousMessages) => GiftedChat.append(previousMessages, messages));
      }
      return;
    },
    [date]
  );

  //   const renderInputToolbar = (props) => {
  //     return (
  //       <InputToolbar
  //         {...props}
  //         containerStyle={{ backgroundColor: Colors.background }}
  //         renderActions={() => (
  //           <View style={{ height: 44, justifyContent: "center", alignItems: "center", left: 5 }}>
  //             <Ionicons name="add" color={Colors.primary} size={28} />
  //           </View>
  //         )}
  //       />
  //     );
  //   };

  const updateRowRef = useCallback(
    (ref) => {
      if (
        ref &&
        replyMessage &&
        ref.props.children.props.currentMessage?._id === replyMessage._id
      ) {
        swipeableRowRef.current = ref;
      }
    },
    [replyMessage]
  );

  useEffect(() => {
    if (replyMessage && swipeableRowRef.current) {
      swipeableRowRef.current.close();
      swipeableRowRef.current = null;
    }
  }, [replyMessage]);

  return (
    <ImageBackground
      source={require("@/assets/images/pattern.png")}
      style={{
        flex: 1,
        backgroundColor: Colors.background,
        marginBottom: insets.bottom,
      }}
    >
      <AddTodoModal visible={isAddTodoModalVisible} setVisible={setIsAddTodoModalVisible} />
      {isProfileModalVisible ? (
        <ProfileModal
          setIsProfileModalVisible={setIsProfileModalVisible}
          username={username}
          loggedInUser={currentUser.username}
        />
      ) : null}
      {confirmationModalStatus.isVisible ? (
        <ScheduledMessageConfirmationModal
          date={date}
          setDate={setDate}
          confirmationModalStatus={confirmationModalStatus}
          setConfirmationModalStatus={setConfirmationModalStatus}
          username={username}
        />
      ) : null}

      <DatePicker
        modal
        mode="datetime"
        minimumDate={new Date()}
        open={isModalVisible}
        date={date || new Date()}
        onConfirm={(date) => {
          setDate(date);
          setIsModalVisible(false);
        }}
        onCancel={() => {
          setIsModalVisible(false);
          setDate(false);
        }}
      />

      {/* {isModalVisible ? (
        <SetMessageTimerModal setDate={setDate} setIsModalVisible={setIsModalVisible} date={date} />
      ) : null} */}
      <Stack.Screen
        options={{
          headerTitle: () => (
            <ChatHeaderTitle
              setIsProfileModalVisible={setIsProfileModalVisible}
              userName={contact.name}
            />
          ),
        }}
      />
      <GiftedChat
        messages={messages}
        onSend={(messages) => onSend(messages)}
        onInputTextChanged={setText}
        scrollToBottom={true}
        renderUsernameOnMessage={false}
        user={{
          _id: currentUser.username,
          name: currentUser.name,
        }}
        renderSystemMessage={(props) => (
          <SystemMessage {...props} textStyle={{ color: Colors.gray }} />
        )}
        bottomOffset={insets.bottom}
        //   renderAvatar={null}

        maxComposerHeight={100}
        textInputProps={styles.composer}
        renderBubble={(props) => {
          return (
            <Bubble
              {...props}
              textStyle={{
                right: {
                  color: "#fff",
                },
              }}
              wrapperStyle={{
                left: {
                  backgroundColor: "#fff",
                },
                right: {
                  backgroundColor: Colors.primary,
                },
              }}
            />
          );
        }}
        renderSend={(props) => (
          <View
            style={{
              height: 44,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 14,
              paddingHorizontal: 14,
            }}
          >
            {text === "" ? (
              <>
                <Ionicons
                  name="camera-outline"
                  color={Colors.primary}
                  size={28}
                  onPress={pickMedia}
                />
                <Ionicons name="mic-outline" color={Colors.primary} size={28} />
              </>
            ) : null}
            {text !== "" ? (
              <>
                <TouchableOpacity
                  onPress={() => {
                    if (date) {
                      setDate(false);
                    } else {
                      setIsModalVisible(true);
                    }
                  }}
                >
                  {date === false ? (
                    <Ionicons name="time-outline" color={Colors.primary} size={28} />
                  ) : (
                    <Ionicons name="time" color={Colors.primary} size={28} />
                  )}
                </TouchableOpacity>
                <Send
                  {...props}
                  containerStyle={{
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="send" color={Colors.primary} size={28} />
                </Send>
              </>
            ) : null}
          </View>
        )}
        renderInputToolbar={(props) => {
          return (
            <CustomInputToolbar
              {...props}
              onPressCreateTask={() => setIsAddTodoModalVisible(true)}
            />
          );
        }}
        renderChatFooter={() => (
          <ReplyMessageBar clearReply={() => setReplyMessage(null)} message={replyMessage} />
        )}
        onLongPress={(context, message) => setReplyMessage(message)}
        renderMessage={(props) => (
          <ChatMessageBox
            {...props}
            setReplyOnSwipeOpen={setReplyMessage}
            updateRowRef={updateRowRef}
          />
        )}
      />
    </ImageBackground>
  );
};

const enhance = withObservables([], ({ username, name, id }) => {
  return {
    contact: database.get("contacts").findAndObserve(id),
  };
});

const EnhancedPage = enhance(Page);

const PageComponent = () => {
  const { username, name, id } = useLocalSearchParams();

  return <EnhancedPage username={username} name={name} id={id} />;
};

export default PageComponent;

const styles = StyleSheet.create({
  composer: {
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    paddingHorizontal: 10,
    paddingTop: 8,
    fontSize: 16,
    marginVertical: 4,
  },
});
