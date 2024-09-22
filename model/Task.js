// model/Post.js
import { Model } from "@nozbe/watermelondb";
import { text, date, writer, field } from "@nozbe/watermelondb/decorators";

export default class Task extends Model {
  static table = "tasks";

  @text("title") title;
  @text("description") description;
  @date("time") time;
  @field("is_completed") isCompleted;
  @text("notification_id") notificationId;
}
