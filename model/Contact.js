// model/Post.js
import { Model } from "@nozbe/watermelondb";
import { field, text, writer, children } from "@nozbe/watermelondb/decorators";

export default class Contact extends Model {
  static table = "contacts";

  //   static associations = {
  //     messages: { type: "has_many", foreignKey: "contact_id" },
  //   };

  //   @children("messages") messages;

  @text("name") name;
  @text("username") username;
  @text("status") status; // ONLINE | OFFLINE | TYPING
  //   @field("has_unread_messages") hasUnreadMessages;

  //   @writer async addMessage(messageType, messageText, username, messageTime) {
  //     const newMessage = await this.collections.get("messages").create((message) => {
  //       message.contact.set(this);
  //       message.type = messageType;
  //       message.markdown_text = messageText;
  //       message.username = username;
  //       message.message_at = messageTime;
  //     });
  //     return newMessage;
  //   }
}
