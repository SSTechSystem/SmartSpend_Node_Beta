const fcm_admin = require("firebase-admin");
const serviceAccount = require("../../common_service/uploads/live-chat.json");

let isAppInitialized = false;

const sendFCMNotification = async (
  registrationId,
  title,
  body,
  dataPayload
) => {
  try {
    // Initialize Firebase app if not already initialized
    if (!fcm_admin.apps.length) {
      fcm_admin.initializeApp({
        credential: fcm_admin.credential.cert(serviceAccount),
      });
      isAppInitialized = true;
    }
    // // Define the message payload
    // const message = {
    //   token: registrationId,
    //   notification: {
    //     title: title,
    //     body: body,
    //   },
    //   data: dataPayload,
    // };
    // console.log("message----", message);
    // // Define message options
    // const options = { priority: "high" };

    // // Send the message using sendToDevice
    // // const response = await fcm_admin.messaging().sendToDevice([registrationId], message, options);
    // const response = await fcm_admin.messaging().send(message);
    // console.log("Successfully sent message:", response);


    const customSound = "notification.wav";

    // Create the multicast message object
    const multicastMessage = {
      tokens: registrationId, // Specify the registration tokens
      notification: {
        title: title,
        body: body,
      },
      data: dataPayload,
      android: {
        priority: "high", // Set the priority to high for Android
        notification: {
          sound: customSound, // Android-specific sound configuration
        },
      },
      apns: {
        payload: {
          aps: {
            'content-available': 1, // Required for silent notifications or data messages
            'apns-priority': '10', // Set the priority to high for iOS (10 is the highest priority)
            sound: customSound,
          },
        },
      },
    };
    const response = await fcm_admin.messaging().sendEachForMulticast(multicastMessage);

    // Check for failures
    if (response.failureCount > 0) {
      console.error("Failed to send some messages:", response.results);
    }
    return response;
  } catch (error) {
    console.error("Error sending notification:", error.message);
    throw error;
  }
};

exports.sendPushNotification = async ({
  title,
  body,
  receiverId,
  senderId,
  message_id,
  created_at,
}) => {
  try {
    // Use a static token for testing
    const staticToken =
      // "fVMt3WeVYUUHsBF1EFMkxR:APA91bG2XO8osVAgvYfds5HGAaV7pK83TKwOAWkioXJ4JteC_IC_7D6qwVIQ73dkQJ2xveB9p_kwebUEEMMNUDMECVeZFtjiSBGF0nMNVM254ummvAvR90xkgYU5E_EzRbCxohY5HYf7";
      ["cPrerf4KOEYCr8y1kDA5-H:APA91bGEH0wzefE-mVYKX4EJQ1V09ehh6-tExpu7v_lYCkqgGEfR8yfjUJodbMjq_3lJvg1SRQmzMxQgS9Pjv05SGmqjNJ2QIqeXBiTGjNRrGZsNd-WG1-G9FpGKaRuldLmfmbGKIlXe"];

    const customData = {
      msg_type: "chat",
      chat_info: JSON.stringify({
        body: body,
        senderId: String(senderId),
        receiverId: String(receiverId),
        message_id: String(message_id),
        media_path: "",
        status: "1",
        created_at: "",
        media_type: "0",
      }),
    };

    await sendFCMNotification(staticToken, title, body, customData);

    const response = {
      body: body,
      senderId: senderId,
      receiverId: receiverId,
      message_id: message_id,
      media_path: "",
      created_at: created_at,
      media_type: 0,
      msg_type: "text",
    };

    return response;
  } catch (error) {
    console.error("Error in sending push notification:", error.message);
    return { success: false, message: "Error in sending push notification" };
  }
};

//Function----send push notification----
// exports.sendFCMNotification = async (registrationTokens, title, data, booking) => {
//   try {

//     if (!fcm_admin.apps.length) {
//       fcm_admin_app = fcm_admin.initializeApp({
//         credential: fcm_admin.credential.cert(serviceAccount),
//       });
//       isAppInitialized = true;
//     }

//     // Convert numeric values to strings in the booking object
//     const bookingAsString = Object.keys(booking).reduce((acc, key) => {
//       acc[key] = String(booking[key]);
//       return acc;
//     }, {});
//     const customSound = "notification.wav";

//     // Create the multicast message object
//     const multicastMessage = {
//       tokens: registrationTokens, // Specify the registration tokens
//       notification: {
//         title: title,
//         body: data,
//       },
//       data: bookingAsString,
//       android: {
//         priority: "high", // Set the priority to high for Android
//         notification: {
//           sound: customSound, // Android-specific sound configuration
//         },
//       },
//       apns: {
//         payload: {
//           aps: {
//             'content-available': 1, // Required for silent notifications or data messages
//             'apns-priority': '10', // Set the priority to high for iOS (10 is the highest priority)
//             sound: customSound,
//           },
//         },
//       },
//     };
//     const response = await fcm_admin.messaging().sendEachForMulticast(multicastMessage);
//     console.log('Successfully sent message to multiple devices:', response);

//     // Check for failures
//     if (response.failureCount > 0) {
//       // console.error('Failed to send some messages:', response.results);rs
//     }
//     return response;
//   } catch (error) {
//     console.error("Error sending Android notification:", error.message);
//   }
// };