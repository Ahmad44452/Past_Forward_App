import { appSchema, tableSchema } from "@nozbe/watermelondb";

export default appSchema({
  version: 1,
  tables: [
    // We'll add tableSchemas here later
    tableSchema({
      name: "contacts",
      columns: [
        { name: "name", type: "string" },
        { name: "username", type: "string" },
        { name: "status", type: "string" }, // ONLINE | OFFLINE | TYPING
        //   { name: "has_unread_messages", type: "boolean" },
      ],
    }),
    tableSchema({
      name: "messages",
      columns: [
        { name: "from", type: "string" },
        { name: "to", type: "string" },
        { name: "audience", type: "string" }, // CHAT | GROUP
        { name: "type", type: "string" }, // PLAIN | IMG | VIDEO
        { name: "status", type: "string" }, // PENDING | SENT | RECEIVED
        { name: "markdown_text", type: "string" },
        { name: "message_at", type: "number" },
        { name: "is_read", type: "boolean" },
        { name: "is_scheduled", type: "boolean" },
      ],
    }),
    tableSchema({
      name: "tasks",
      columns: [
        { name: "title", type: "string" },
        { name: "description", type: "string" },
        { name: "notification_id", type: "string" },
        { name: "time", type: "number" },
        { name: "is_completed", type: "boolean" },
      ],
    }),
  ],
});
