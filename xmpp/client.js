import { client, xml } from "@xmpp/client";
import { EJABBBERD_URI } from "../constants/ConnectionStrings";
import debug from "@xmpp/debug";
import { database } from "../model/database";
import { Q } from "@nozbe/watermelondb";
import { randomUUID } from "expo-crypto";
import queue from "react-native-job-queue";
import { Worker } from "react-native-job-queue";
import parse from "@xmpp/xml/lib/parse";
import { saveBase64File } from "../fileSystem/saveBase64File";

queue.configure({
  concurrency: 1,
});

queue.addWorker(
  new Worker(
    "handleMessageWorker",
    async (payload) => {
      return new Promise(async (resolve) => {
        const stanza = parse(payload.stanza);

        if (stanza.attrs.type === "chat") {
          let messageSender = await database
            .get("contacts")
            .query(Q.where("username", stanza.attrs.from))
            .fetch();

          if (messageSender.length === 0) {
            await database.write(async () => {
              messageSender = await database.get("contacts").create((contact) => {
                contact.name = stanza.attrs.from.slice(0, -22);
                contact.username = stanza.attrs.from;
                contact.status = "OFFLINE";
              });
              // messageSender here is same as the messageSender from query before this function
            });

            await XmppClient.client.send(
              xml("presence", {
                type: "subscribe",
                to: stanza.attrs.from,
                from: `${XmppClient.client.jid._local}@${XmppClient.client.jid._domain}/${XmppClient.client.jid._resource}`,
              })
            );
          } else {
            messageSender = messageSender[0];
          }

          let fileInfo = {
            isFile: false,
            type: null,
            filePath: "",
            base64: "",
            extension: "",
          };

          if (stanza.getChildText("image")) {
            const receivedFile = JSON.parse(stanza.getChildText("image"));
            fileInfo.isFile = true;
            fileInfo.type = "image";
            fileInfo.filePath = await saveBase64File(receivedFile.base64, receivedFile.extension);
          } else if (stanza.getChildText("video")) {
            const receivedFile = JSON.parse(stanza.getChildText("video"));
            fileInfo.isFile = true;
            fileInfo.type = "video";
            fileInfo.filePath = await saveBase64File(receivedFile.base64, receivedFile.extension);
          }

          await database.write(async () => {
            senderDb = await database.get("messages").create((message) => {
              message._raw.id = stanza.attrs.id;
              message.from = stanza.attrs.from;
              message.to = stanza.attrs.to;
              message.audience = "CHAT"; // CHAT | GROUP
              message.type = fileInfo.type || "PLAIN"; // PLAIN | IMG | VIDEO
              if (fileInfo.isFile) {
                message.media = fileInfo.filePath;
              }
              message.markdownText = stanza.getChildText("body") || "";
              message.status = "RECEIVED"; // PENDING | SENT | RECEIVED
              message.isRead = false;
              message.messageAt = new Date();
              message.isScheduled = false;
            });

            // send msg to message listener in opened
            XmppClient.client.emit("usermessage", {
              type: "chat",
              msg: senderDb,
            });

            //  const message = xml(
            //    "message",
            //    { type: "chat", to: username, id: dbMessage.id },
            //    xml("body", {}, msg.text)
            //  );

            const message = xml(
              "message",
              {
                to: stanza.attrs.from,
              },
              xml("received", { id: stanza.attrs.id })
            );
            XmppClient.client.send(message);

            // senderDb here is same as the senderDb from query before this function
            console.log(`Sender db new message: `, senderDb);
          });
        } else if (stanza.getChild("received")) {
          const receivedId = stanza.getChild("received").attrs.id;
          const msgToUpdate = await database.get("messages").find(receivedId);
          if (msgToUpdate) {
            XmppClient.client.emit("usermessage", {
              type: "deliveryReceipt",
              msg: msgToUpdate,
            });
            await database.write(async () => {
              await msgToUpdate.update((msg) => {
                msg.isScheduled = false;
                msg.status = "RECEIVED";
              });
            });
          }
        } else if (stanza.getChild("scheduledSent")) {
          const receivedId = stanza.getChild("scheduledSent").attrs.id;
          const msgToUpdate = await database.get("messages").find(receivedId);
          console.log("msgtoupdate ", msgToUpdate);
          if (msgToUpdate) {
            // send scheduled message to opened conversation
            XmppClient.client.emit("usermessage", {
              type: "scheduledSent",
              msg: msgToUpdate,
            });
            await database.write(async () => {
              await msgToUpdate.update((msg) => {
                msg.isScheduled = false;
                msg.status = "SENT";
                msg.messageAt = new Date();
              });
            });
          }
        }
        resolve();
      });
    },
    { concurrency: 1 }
  )
);
// const xmppClient = client({
//   service: EJABBBERD_URI,
//   domain: "localhost",
//   username: "admin1",
//   password: "admin",
// });

const XmppClient = {
  client: null,
  initClient: function (username, password) {
    const xmppclient = client({
      service: EJABBBERD_URI,
      domain: "localhost",
      username: username,
      password: password,
      resource: "PastForward",
    });
    this.client = xmppclient;
    debug(xmppclient, true);
    xmppclient.on("stanza", this.stanzaReceived.bind(this));
    xmppclient.on("online", this.clientOnline.bind(this));
  },
  stanzaReceived: async function (stanza) {
    const xmppClient = this.client;

    if (stanza.is("message")) {
      console.log("Message Received. Adding to queue");
      console.log(stanza.toString());
      queue.addJob(
        "handleMessageWorker",
        {
          stanza: stanza.toString(),
        },
        {},
        true
      );
      // const sender = stanza.attrs.from.slice(0, -22);
      // console.log(`Message from ${sender}`);
      // check if the user exists in the local db
    }

    if (
      stanza.is("presence") &&
      stanza.attrs.type === "subscribe"
      //   && stanza.attrs.from.includes("@localhost/PastForward")
    ) {
      await xmppClient.send(
        xml("presence", {
          type: "subscribed",
          to: stanza.attrs.from,
          from: `${xmppClient.jid._local}@${xmppClient.jid._domain}/${xmppClient.jid._resource}`,
        })
      );

      await xmppClient.send(
        xml("presence", {
          type: "subscribe",
          to: stanza.attrs.from,
          from: `${xmppClient.jid._local}@${xmppClient.jid._domain}/${xmppClient.jid._resource}`,
        })
      );
    }
  },
  clientOnline: async function (address) {
    const client = this.client;
    if (client) {
      client.send(xml("presence")).then(async () => {
        console.log("Presence sent");
        //   const message = xml(
        //     "message",
        //     { type: "chat", to: address },
        //     xml("body", {}, "hello world")
        //   );
        //   await client.send(message);
      });

      // client
      //   .send(xml("iq", { type: "get", id: randomUUID() }, [xml("vCard", { xmlns: "vcard-temp" })]))
      //   .then(async (res) => {
      //     console.log("Vcard res", res);
      //     //   const message = xml(
      //     //     "message",
      //     //     { type: "chat", to: address },
      //     //     xml("body", {}, "hello world")
      //     //   );
      //     //   await client.send(message);
      //   });
    }

    // console.log(address);
    // Sends a chat message to itself
    // await xmppClient.send(message);
  },
};

// class XmppClient {
//   static client = null;

//   static initClient(username, password) {
//     this.client = client({
//       service: EJABBBERD_URI,
//       domain: "localhost",
//       username: username,
//       password: password,
//     });
//   }

//   static getClient() {
//     return this.client;
//   }
// }

export default XmppClient;
