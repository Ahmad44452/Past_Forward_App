// model/Post.js
import { Model } from "@nozbe/watermelondb";
import { text, date, writer, field } from "@nozbe/watermelondb/decorators";

export default class Message extends Model {
  static table = "messages";

  @text("from") from;
  @text("to") to;
  @text("audience") audience; // CHAT | GROUP
  @text("type") type; // PLAIN | IMG | VIDEO
  @text("markdown_text") markdownText;
  @text("status") status; // PENDING | SENT | RECEIVED
  @date("message_at") messageAt;
  @field("is_read") isRead;
  @field("is_scheduled") isScheduled;
}
