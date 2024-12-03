// model/Post.js
import { Model } from "@nozbe/watermelondb";
import { field, text, writer, children } from "@nozbe/watermelondb/decorators";

export default class Contact extends Model {
  static table = "contacts";

  @text("name") name;
  @text("username") username;
  @text("status") status; // ONLINE | OFFLINE | TYPING
}
