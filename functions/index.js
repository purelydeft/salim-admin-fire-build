const functions = require("firebase-functions");
const admin = require("firebase-admin");
const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Kolkata");
const nodemailer = require("nodemailer");
const ejs = require("ejs");
const cors = require("cors")({
  origin: true,
});
const https = require("https");
var pdf = require("html-pdf");
const ADMIN_EMAIL = "complain@gmail.com";

const mailingDetails = {
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: "patrickphp2@gmail.com",
    pass: "Informatics@1234",
  },
};
// warpspeedtaxi
const liveAccountSid = "AC6005dce8d100a79770c8543411205a08";
const liveAuthToken = "d75d71a5757f2bd94402133500557feb";
const twilioNumber = "+19047204493";

// const liveAccountSid = "AC6c5019c7101d3b7aaf83b9dddf28a279";
// const liveAuthToken = "0a335f758759276626a639be5d07226f";
// const twilioNumber = "+13362238736";

const testAccountSid = "ACbbba6ad2e8951f35b48aada1dfc72a2f";
const testAuthToken = "89b2162ddf5f2853ec3ec46eb2e04b1a";

const twilioService = "MG12608acdbaf92ba85c6972bc2fa6a3d7";

const client = require("twilio")(liveAccountSid, liveAuthToken);

const TRIP_STATUS_PENDING = "pending";
const TRIP_STATUS_ACCEPTED = "accepted";
const TRIP_STATUS_WAITING = "waiting";
const TRIP_STATUS_GOING = "going";
const TRIP_STATUS_FINISHED = "finished";
const TRIP_STATUS_CANCELED = "canceled";

/**
 * Uncomment for local testing
 */
// const serviceAccount = require("E:/Projects/Salim/salim-admin-fire-build/functions/wrapspeedtaxi-286206-b824f46fc5fb.json");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://wrapspeedtaxi-286206.firebaseio.com",
//   // storageBucket: "wrapspeedtaxi-286206.appspot.com",
// });

// /**
//  * Uncomment while uploading to production
//  */
admin.initializeApp();

function btoa(str) {
  return Buffer.from(str).toString("base64");
}

function sendMessage(token, title, message) {
  if (token === undefined || token === "" || token === null) {
    return true;
  } else {
    return admin
      .messaging()
      .sendToDevice([token], {
        notification: {
          title: title,
          body: message,
          sound: "default",
        },
        data: {
          notification_foreground: "true",
        },
      })
      .then((data) => {
        functions.logger.info(data);
        return true;
      })
      .catch((err) => {
        functions.logger.info(err);
        return false;
      });
  }
}

function sendSMS(to, mesage) {
  try {
    client.messages
      .create({
        body: mesage,
        from: twilioNumber,
        to: to,
      })
      .then((message) => {
        // functions.logger.info(message);
      })
      .catch((err) => functions.logger.error(err));
  } catch (err) {
    functions.logger.error(err);
  }
}

function sendEmail(emailData, callBack) {
  try {
    const transporter = nodemailer.createTransport(mailingDetails);
    let data = emailData;
    data.from = "patrickphp2@gmail.com";
    transporter.sendMail(data, callBack);
  } catch (err) {
    functions.logger.error("sendMail err: ", err);
  }
}

function calcCrow(lat1, lon1, lat2, lon2) {
  let R = 6371; // km
  let dLat = toRad(lat2 - lat1);
  let dLon = toRad(lon2 - lon1);
  lat1 = toRad(lat1);
  lat2 = toRad(lat2);

  let a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  let d = R * c;

  return d;
}

// Converts numeric degrees to radians
function toRad(value) {
  return (value * Math.PI) / 180;
}
/************************************Live DB Functions*************************************************/

exports.sendPush = functions.database
  .ref("notifications/{notification}")
  .onCreate(function (change, context) {
    const original = change.val();
    if (original.type == "riders") {
      admin
        .database()
        .ref("passenger-push-notifications")
        .once("value", function (snap) {
          snap.forEach((u) => {
            let user = u.val();
            if (user.isPushEnabled) {
              sendMessage(user.pushToken, original.title, original.description);
            } else return false;
          });
        });
    } else if (original.type == "drivers") {
      admin
        .database()
        .ref("driver-push-notifications")
        .once("value", function (snap) {
          snap.forEach((u) => {
            let user = u.val();
            if (user.isPushEnabled) {
              sendMessage(user.pushToken, original.title, original.description);
            } else return false;
          });
        });
    } else if (original.type == "both") {
      admin
        .database()
        .ref("passenger-push-notifications")
        .once("value", function (snap) {
          snap.forEach((u) => {
            let user = u.val();
            if (user.isPushEnabled) {
              sendMessage(user.pushToken, original.title, original.description);
            } else return false;
          });
        });

      admin
        .database()
        .ref("driver-push-notifications")
        .once("value", function (snap) {
          snap.forEach((u) => {
            let user = u.val();
            if (user.isPushEnabled) {
              sendMessage(user.pushToken, original.title, original.description);
            } else return false;
          });
        });
    }
  });

exports.sendPushPromo = functions.database
  .ref("promotions/{promotionId}")
  .onCreate(function (change, context) {
    const original = change.val();
    if (original.type == "riders") {
      admin
        .database()
        .ref("passenger-push-notifications")
        .once("value", function (snap) {
          snap.forEach((u) => {
            let user = u.val();
            if (user.isPushEnabled) {
              sendMessage(user.pushToken, original.title, original.description);
            } else return false;
          });
        });
    } else if (original.type == "drivers") {
      admin
        .database()
        .ref("driver-push-notifications")
        .once("value", function (snap) {
          snap.forEach((u) => {
            let user = u.val();
            if (user.isPushEnabled) {
              sendMessage(user.pushToken, original.title, original.description);
            } else return false;
          });
        });
    } else if (original.type == "both") {
      admin
        .database()
        .ref("passenger-push-notifications")
        .once("value", function (snap) {
          snap.forEach((u) => {
            let user = u.val();
            if (user.isPushEnabled) {
              sendMessage(user.pushToken, original.title, original.description);
            } else return false;
          });
        });

      admin
        .database()
        .ref("driver-push-notifications")
        .once("value", function (snap) {
          snap.forEach((u) => {
            let user = u.val();
            if (user.isPushEnabled) {
              sendMessage(user.pushToken, original.title, original.description);
            } else return false;
          });
        });
    }
  });

exports.sendPushNews = functions.database
  .ref("news/{newsId}")
  .onCreate(function (change, context) {
    const original = change.val();
    if (original.type == "riders") {
      admin
        .database()
        .ref("passenger-push-notifications")
        .once("value", function (snap) {
          snap.forEach((u) => {
            let user = u.val();
            if (user.isPushEnabled) {
              sendMessage(user.pushToken, original.title, original.description);
            } else return false;
          });
        });
    } else if (original.type == "drivers") {
      admin
        .database()
        .ref("driver-push-notifications")
        .once("value", function (snap) {
          snap.forEach((u) => {
            let user = u.val();
            if (user.isPushEnabled) {
              sendMessage(user.pushToken, original.title, original.description);
            } else return false;
          });
        });
    } else if (original.type == "both") {
      admin
        .database()
        .ref("passenger-push-notifications")
        .once("value", function (snap) {
          snap.forEach((u) => {
            let user = u.val();
            if (user.isPushEnabled) {
              sendMessage(user.pushToken, original.title, original.description);
            } else return false;
          });
        });

      admin
        .database()
        .ref("driver-push-notifications")
        .once("value", function (snap) {
          snap.forEach((u) => {
            let user = u.val();
            if (user.isPushEnabled) {
              sendMessage(user.pushToken, original.title, original.description);
            } else return false;
          });
        });
    }
  });

exports.deleteRider = functions.database
  .ref("passengers/{id}")
  .onDelete(async function (change, context) {
    const id = context.params.id;
    await admin
      .database()
      .ref("passenger-wallets/" + id)
      .remove();
    await admin
      .database()
      .ref("passenger-push-notifications/" + id)
      .remove();
    await admin
      .database()
      .ref("passenger-corporates/" + id)
      .remove();
    await admin
      .database()
      .ref("passenger-insurances/" + id)
      .remove();
    await admin
      .database()
      .ref("passenger-admin-donations/" + id)
      .remove();
    await admin
      .database()
      .ref("passenger-addresses/" + id)
      .remove();
    await admin
      .database()
      .ref("passenger-cards/" + id)
      .remove();
    await admin
      .database()
      .ref("passenger-emergency/" + id)
      .remove();
    await admin
      .database()
      .ref("passenger-subscriptions/" + id)
      .remove();
    await admin.auth().deleteUser(id);
  });

exports.deleteDriver = functions.database
  .ref("drivers/{id}")
  .onDelete(async function (change, context) {
    const id = context.params.id;
    await admin
      .database()
      .ref("driver-wallets/" + id)
      .remove();
    await admin
      .database()
      .ref("driver-push-notifications/" + id)
      .remove();
    await admin
      .database()
      .ref("driver-cards/" + id)
      .remove();
    await admin
      .database()
      .ref("driver-emergency/" + id)
      .remove();
    admin
      .auth()
      .deleteUser(id)
      .then(() => {
        console.log("Deleted: " + id);
        return false;
      })
      .catch((err) => {
        console.log(err);
        return false;
      });
  });

exports.deleteAdmin = functions.database
  .ref("admins/{id}")
  .onDelete(function (change, context) {
    const id = context.params.id;
    admin
      .auth()
      .deleteUser(id)
      .then(() => {
        console.log("Deleted: " + id);
        return false;
      })
      .catch((err) => {
        console.log(err);
        return false;
      });
  });

exports.createAdmin = functions.database
  .ref("admins/{id}")
  .onCreate(async function (snapshot, context) {
    const key = context.params.id;
    const original = snapshot.val();
    if (original.createdBy == "admin") {
      admin
        .auth()
        .createUser({
          uid: key,
          email: original.email,
          password: original.password,
        })
        .then(() => {
          admin
            .database()
            .ref("admins/" + key)
            .update({ password: null });
          return false;
        })
        .catch((err) => {
          console.log(err);
          return false;
        });
    }
    // // Send Welcome Email
    // const companyData = (
    //   await admin.database().ref("company-details").once("value")
    // ).val();

    // let emailHeader = (
    //   await admin.database().ref("email-templates/header").once("value")
    // ).val();

    // emailHeader.template = emailHeader.template.replace(
    //   new RegExp("{date}", "g"),
    //   moment().format("Do MMM YYYY hh:mm A")
    // );
    // emailHeader.template = emailHeader.template.replace(
    //   new RegExp("{companyLogo}", "g"),
    //   companyData.logo
    // );
    // emailHeader.template = emailHeader.template.replace(
    //   new RegExp("{companyName}", "g"),
    //   companyData.name.toUpperCase()
    // );

    // let emailBody = (
    //   await admin.database().ref("email-templates/welcome").once("value")
    // ).val();
    // emailBody.template = emailBody.template.replace(
    //   new RegExp("{title}", "g"),
    //   "Welcome User : " + original.name.toUpperCase()
    // );
    // emailBody.template = emailBody.template.replace(
    //   new RegExp("{content}", "g"),
    //   "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
    // );
    // emailBody.template = emailBody.template.replace(
    //   new RegExp("{companyWeb}", "g"),
    //   "https://wrapspeedtaxi.com/"
    // );
    // let emailFooter = (
    //   await admin.database().ref("email-templates/footer").once("value")
    // ).val();

    // let header = ejs.render(emailHeader.template);
    // let body = ejs.render(emailBody.template);
    // let footer = ejs.render(emailFooter.template);

    // let emailData = {
    //   pageTitle: "Welcome To " + companyData.name.toUpperCase(),
    //   header,
    //   body,
    //   footer,
    // };

    // ejs.renderFile(__dirname + "/email.ejs", emailData, function (err, html) {
    //   if (err) {
    //     functions.logger.error(err);
    //   } else {
    //     let callBack = function (err1, info) {
    //       if (err1) {
    //         functions.logger.error(err1);
    //       } else {
    //         functions.logger.info(info);
    //       }
    //     };
    //     sendEmail(
    //       {
    //         to: original.email,
    //         subject: "Welcome To " + companyData.name.toUpperCase(),
    //         html,
    //       },
    //       callBack
    //     );
    //   }
    // });
    // // Send Welcome Email Ends
  });

exports.updateAdmin = functions.database
  .ref("admins/{id}")
  .onUpdate(function (snapshot, context) {
    const key = context.params.id;
    const before = snapshot.before.val();
    const after = snapshot.after.val();
    let updateData;
    let updateCheck = false;
    if (after.email != before.email) {
      updateData.email = after.email;
      updateData.emailVerified = false;
      updateCheck = true;
    }
    // if (after.phoneNumber != before.phoneNumber) {
    //   updateData.phoneNumber = after.phoneNumber;
    //   updateCheck = true;
    // }

    if (updateCheck) {
      admin
        .auth()
        .updateUser(key, updateData)
        .then(() => {
          functions.logger.info("Updated: " + key);
        })
        .catch((err) => {
          functions.logger.info(err);
        });
    }
  });

exports.createDriver = functions.database
  .ref("drivers/{id}")
  .onCreate(async function (snapshot, context) {
    const key = context.params.id;
    const original = snapshot.val();
    if (original.createdBy == "admin") {
      admin
        .auth()
        .createUser({
          uid: key,
          email: original.email,
          password: original.password,
        })
        .then(() => {
          admin
            .database()
            .ref("drivers/" + key + "/password")
            .remove();
        })
        .catch((err) => {
          console.log(err);
        });
    } else if (
      original.createdBy == "self" &&
      (original.providerId == "google.com" ||
        original.providerId == "facebook.com")
    ) {
      const user = await admin.auth().getUser(key);
      if (original.isEmailVerified && !user.emailVerified) {
        admin
          .auth()
          .updateUser(key, {
            emailVerified: true,
          })
          .then(() => {})
          .catch((err) => {
            console.log(err);
          });
      }
    }

    await admin
      .database()
      .ref("driver-wallets/" + key)
      .set({
        balance: 0,
        isKYC: false,
      });
    await admin
      .database()
      .ref("driver-push-notifications/" + key)
      .set({
        isPushEnabled: true,
      });

    // // Send Registration Mail
    // const companyData = (
    //   await admin.database().ref("company-details").once("value")
    // ).val();

    // let emailHeader = (
    //   await admin.database().ref("email-templates/header").once("value")
    // ).val();

    // emailHeader.template = emailHeader.template.replace(
    //   new RegExp("{date}", "g"),
    //   moment().format("Do MMM YYYY hh:mm A")
    // );
    // emailHeader.template = emailHeader.template.replace(
    //   new RegExp("{companyLogo}", "g"),
    //   companyData.logo
    // );
    // emailHeader.template = emailHeader.template.replace(
    //   new RegExp("{companyName}", "g"),
    //   companyData.name.toUpperCase()
    // );

    // let emailBody = (
    //   await admin.database().ref("email-templates/welcome").once("value")
    // ).val();
    // emailBody.template = emailBody.template.replace(
    //   new RegExp("{title}", "g"),
    //   "Welcome To " + companyData.name.toUpperCase()
    // );
    // emailBody.template = emailBody.template.replace(
    //   new RegExp("{content}", "g"),
    //   "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
    // );
    // emailBody.template = emailBody.template.replace(
    //   new RegExp("{companyWeb}", "g"),
    //   "https://wrapspeedtaxi.com/"
    // );
    // let emailFooter = (
    //   await admin.database().ref("email-templates/footer").once("value")
    // ).val();

    // let header = ejs.render(emailHeader.template);
    // let body = ejs.render(emailBody.template);
    // let footer = ejs.render(emailFooter.template);

    // let emailData = {
    //   pageTitle: "Welcome To " + companyData.name.toUpperCase(),
    //   header,
    //   body,
    //   footer,
    // };

    // ejs.renderFile(__dirname + "/email.ejs", emailData, function (err, html) {
    //   if (err) {
    //     functions.logger.error(err);
    //   } else {
    //     let callBack = function (err1, info) {
    //       if (err1) {
    //         functions.logger.error(err1);
    //       } else {
    //         functions.logger.info(info);
    //       }
    //     };
    //     sendEmail(
    //       {
    //         to: original.email,
    //         subject: "Welcome To " + companyData.name.toUpperCase(),
    //         html,
    //       },
    //       callBack
    //     );
    //   }
    // });
    // // Send Registration Mail Ends
  });

exports.updateDriver = functions.database
  .ref("drivers/{id}")
  .onUpdate(async function (snapshot, context) {
    const key = context.params.id;
    const before = snapshot.before.val();
    const after = snapshot.after.val();
    const user = await admin.auth().getUser(key);
    let updateData = {};
    let updateCheck = false;
    if ((after.name && !before.name) || after.name != before.name) {
      updateData.displayName = after.name;
      updateCheck = true;
    }
    if ((after.email && !before.email) || after.email != before.email) {
      updateData.email = after.email;
      updateData.emailVerified = false;
      updateCheck = true;
    } else if (after.isEmailVerified && !user.emailVerified) {
      updateData.emailVerified = true;
      updateCheck = true;
    }

    if (after.password && !user.passwordHash) {
      updateData.password = after.password;
      updateCheck = true;
    }

    if (after.triggerWithdrawal) {
      admin
        .database()
        .ref("drivers/" + key)
        .update({ triggerWithdrawal: false });
      const businessData = (
        await admin.database().ref("business-management").once("value")
      ).val();
      makeMoneyTransferRequestToAdmin(key, after, businessData);
    }

    if (after.rideRejectionCount >= 3) {
      let companyData = (
        await admin.database().ref("company-details").once("value")
      ).val();
      sendSMS(
        "+91" + companyData.mobile,
        `Driver named ${after.name} has rejected his 3rd consecutive ride!`
      );
    }

    if (after.backToBackRideCount > 0) {
      admin
        .database()
        .ref("purchased-subscriptions")
        .orderByChild("type")
        .equalTo("DRIVER_SUBSCRIPTION")
        .once("value", async function (snapshot) {
          const tmp = snapshot.val();
          let purchasedDriverSubscriptions = [];
          for (const [
            purchasedSubscriptionKey,
            purchasedSubscriptionData,
          ] of Object.entries(tmp)) {
            if (purchasedSubscriptionData.driverId === key) {
              purchasedDriverSubscriptions.push(purchasedSubscriptionData);
            }
          }
          if (purchasedDriverSubscriptions.length > 0) {
            const currentlyPurchasedSubscription =
              purchasedDriverSubscriptions.reverse()[0];
            if (
              after.backToBackRideCount >=
              currentlyPurchasedSubscription.btbRideCount
            ) {
              const walletDetails = (
                await admin
                  .database()
                  .ref("driver-wallets/" + key)
                  .once("value")
              ).val();
              admin
                .database()
                .ref("driver-wallets/" + key)
                .update({
                  balance:
                    walletDetails.balance +
                    currentlyPurchasedSubscription.incentiveAmount,
                });
              admin
                .database()
                .ref("payment-transactions/wallet")
                .push({
                  admin_id: null,
                  type: 1,
                  driver_id: key,
                  amount: currentlyPurchasedSubscription.incentiveAmount,
                  description: `Incentive given on ${after.backToBackRideCount} consecutive rides (${currentlyPurchasedSubscription.name})`,
                  created: Date.now(),
                  tripId: null,
                  transactionType: "INCENTIVE",
                });
              admin
                .database()
                .ref("earnings/incentives")
                .push({
                  driverId: key,
                  amount: currentlyPurchasedSubscription.incentiveAmount,
                  description: `Incentive given on ${after.backToBackRideCount} consecutive rides (${currentlyPurchasedSubscription.name})`,
                  created: Date.now(),
                  earningType: "INCENTIVE",
                });
              admin
                .database()
                .ref("drivers/" + key)
                .update({ backToBackRideCount: 0 });
            }
          }
        });
    }

    if (after.triggerStatementGeneration) {
      generateEarningStatements(key, after);
    }

    if (updateCheck) {
      admin
        .auth()
        .updateUser(key, updateData)
        .then(() => {
          functions.logger.info("Updated: " + key);
          let updatedData = {};
          if (after.password) {
            updatedData.password = null;
          }
          if (!updateData.emailVerified) {
            updatedData.isEmailVerified = false;
          }
          admin
            .database()
            .ref("drivers/" + key)
            .update(updatedData);
        })
        .catch((err) => {
          functions.logger.info(err);
        });
    }
  });

async function generateEarningStatements(driverId, driver) {
  admin
    .database()
    .ref("drivers/" + driverId)
    .update({ triggerStatementGeneration: false });
  let companyData = (
    await admin.database().ref("company-details").once("value")
  ).val();
  let statementRecords = [];
  await admin
    .database()
    .ref("earnings/bonus")
    .orderByChild("driverId")
    .equalTo(driverId)
    .once("value", async function (snapshot) {
      const bonusList = snapshot.val();
      if (bonusList) {
        for (const [bonusKey, bonusData] of Object.entries(bonusList)) {
          if (
            moment(bonusData.created).isAfter(
              moment(driver.statementStartDate)
            ) &&
            moment(bonusData.created).isBefore(moment(driver.statementEndDate))
          ) {
            statementRecords.push(bonusData);
          } else if (
            driver.statementStartDate === 0 &&
            driver.statementEndDate === 0
          ) {
            statementRecords.push(bonusData);
          }
        }
      }
    });

  await admin
    .database()
    .ref("earnings/incentives")
    .orderByChild("driverId")
    .equalTo(driverId)
    .once("value", async function (snapshot) {
      const incentivesList = snapshot.val();
      if (incentivesList) {
        for (const [incentiveKey, incentiveData] of Object.entries(
          incentivesList
        )) {
          if (
            moment(incentiveData.created).isAfter(
              moment(driver.statementStartDate)
            ) &&
            moment(incentiveData.created).isBefore(
              moment(driver.statementEndDate)
            )
          ) {
            statementRecords.push(incentiveData);
          } else if (
            driver.statementStartDate === 0 &&
            driver.statementEndDate === 0
          ) {
            statementRecords.push(incentiveData);
          }
        }
      }
    });

  await admin
    .database()
    .ref("earnings/tips")
    .orderByChild("driverId")
    .equalTo(driverId)
    .once("value", async function (snapshot) {
      const tipsList = snapshot.val();
      if (tipsList) {
        for (const [tipKey, tipData] of Object.entries(tipsList)) {
          if (
            moment(tipData.created).isAfter(
              moment(driver.statementStartDate)
            ) &&
            moment(tipData.created).isBefore(moment(driver.statementEndDate))
          ) {
            statementRecords.push(tipData);
          } else if (
            driver.statementStartDate === 0 &&
            driver.statementEndDate === 0
          ) {
            statementRecords.push(tipData);
          }
        }
      }
    });

  await admin
    .database()
    .ref("earnings/trips")
    .orderByChild("driverId")
    .equalTo(driverId)
    .once("value", async function (snapshot) {
      const tripsList = snapshot.val();
      if (tripsList) {
        for (const [tripKey, tripData] of Object.entries(tripsList)) {
          if (
            moment(tripData.created).isAfter(
              moment(driver.statementStartDate)
            ) &&
            moment(tripData.created).isBefore(moment(driver.statementEndDate))
          ) {
            statementRecords.push(tripData);
          } else if (
            driver.statementStartDate === 0 &&
            driver.statementEndDate === 0
          ) {
            statementRecords.push(tripData);
          }
        }
      }
    });

  functions.logger.log("statementRecords", statementRecords);

  /**
   * Statement Email Data
   */

  // Header
  let commonHeaderTemplate = (
    await admin.database().ref("email-templates/header").once("value")
  ).val();
  commonHeaderTemplate.template = commonHeaderTemplate.template.replace(
    new RegExp("{date}", "g"),
    moment().format("Do MMMM YYYY")
  );
  commonHeaderTemplate.template = commonHeaderTemplate.template.replace(
    new RegExp("{companyLogo}", "g"),
    companyData.logo
  );
  commonHeaderTemplate.template = commonHeaderTemplate.template.replace(
    new RegExp("{companyName}", "g"),
    companyData.name.toUpperCase()
  );

  // Body
  let emailStatement = (
    await admin.database().ref("email-templates/statement-email").once("value")
  ).val();
  emailStatement.template = emailStatement.template.replace(
    new RegExp("{riderName}", "g"),
    driver.name
  );
  emailStatement.template = emailStatement.template.replace(
    new RegExp("{statementStartDate}", "g"),
    moment(driver.statementStartDate).format("Do MMM YYYY")
  );
  emailStatement.template = emailStatement.template.replace(
    new RegExp("{statementEndDate}", "g"),
    moment(driver.statementEndDate).format("Do MMM YYYY")
  );

  // Footer
  let commonFooterTemplate = (
    await admin.database().ref("email-templates/footer").once("value")
  ).val();

  /**
   * Statement PDF Data
   */

  // Body
  let emailStatementPdf = (
    await admin.database().ref("email-templates/statement").once("value")
  ).val();
  emailStatementPdf.template = emailStatementPdf.template.replace(
    new RegExp("{name}", "g"),
    driver.name
  );
  emailStatementPdf.template = emailStatementPdf.template.replace(
    new RegExp("{body}", "g"),
    await makeDataTable(statementRecords)
  );
  emailStatementPdf.template = emailStatementPdf.template.replace(
    new RegExp("{phoneNumber}", "g"),
    driver.phoneNumber
  );
  emailStatementPdf.template = emailStatementPdf.template.replace(
    new RegExp("{email}", "g"),
    driver.email
  );
  emailStatementPdf.template = emailStatementPdf.template.replace(
    new RegExp("{currentYear}", "g"),
    `${new Date().getFullYear()}`
  );

  /**
   * Render Data
   */

  // Statement Email Render Data
  let emailStatementHeader = ejs.render(commonHeaderTemplate.template);
  let emailStatementBody = ejs.render(emailStatement.template);
  let emailStatementFooter = ejs.render(commonFooterTemplate.template);

  // Statement PDF Render Data
  let emailStatementPdfHeader = ejs.render("");
  let emailStatementPdfBody = ejs.render(emailStatementPdf.template);
  let emailStatementPdfFooter = ejs.render("");

  let emailTitle;
  let fileName;
  if (driver.statementStartDate === 0 && driver.statementStartDate === 0) {
    emailTitle = fileName = `Earning till ${moment().format("Do MMM YYYY")}`;
  } else if (
    moment(driver.statementStartDate).isSame(moment(), "d") &&
    moment(driver.statementEndDate).isSame(moment(), "d")
  ) {
    emailTitle = fileName = `Today's Earning`;
  } else {
    emailTitle = `Earning from ${moment(driver.statementStartDate).format(
      "DD/MM/YYYY"
    )} - ${moment(driver.statementEndDate).format("DD/MM/YYYY")}`;
    fileName = `Earning ${moment(driver.statementStartDate).format(
      "DDMMYYYY"
    )}-${moment(driver.statementEndDate).format("DDMMYYYY")}`;
  }

  let statementEmailData = {
    pageTitle: emailTitle,
    header: emailStatementHeader,
    body: emailStatementBody,
    footer: emailStatementFooter,
  };

  let statementPdfData = {
    pageTitle: emailTitle,
    header: emailStatementPdfHeader,
    body: emailStatementPdfBody,
    footer: emailStatementPdfFooter,
  };

  ejs.renderFile(
    __dirname + "/email.ejs",
    statementEmailData,
    function (err, html) {
      if (err) {
        functions.logger.error("if err", err);
        return res.status(200).json({
          status: -1,
          msg: "Unable To Send Statement Via Mail.",
        });
      } else {
        renderPdfHtml(driver, statementPdfData, fileName, html);
      }
    }
  );
}

function renderPdfHtml(driver, statementPdfData, fileName, emailHtml) {
  ejs.renderFile(
    __dirname + "/email.ejs",
    statementPdfData,
    function (err, html) {
      attachments = [];
      if (err) {
        functions.logger.error("err", err);
        return res.status(200).json({
          status: -1,
          msg: "Unable To Send Statement Via Mail.",
        });
      } else {
        pdf
          .create(html, {
            timeout: "200000",
            format: "A4",
            header: {
              height: "15mm",
            },
            footer: {
              height: "15mm",
            },
          })
          .toBuffer(function (error, buffer) {
            if (error) {
              functions.logger.log("error:", error);
            } else {
              attachments.push({
                filename: fileName,
                content: buffer,
                contentType: "application/pdf",
              });
              let callBack = function (err1, info) {
                if (err1) {
                  functions.logger.error(err1);
                  return res.status(200).json({
                    status: -1,
                    msg: "Error occured while sending mail.",
                  });
                } else {
                  functions.logger.info(info);
                  return res.status(200).json({
                    status: 1,
                    msg: "Mail sent successfully.",
                  });
                }
              };
              sendEmail(
                {
                  to: driver.email,
                  bcc: null,
                  subject: statementPdfData.pageTitle,
                  html: emailHtml,
                  attachments,
                },
                callBack
              );
            }
          });
      }
    }
  );
}

async function makeDataTable(statementRecords) {
  let template = `
  <table id="dataTable" align="center" cellpadding="0" cellspacing="0"
      width="100%" style="border: 1px solid #efefef;">
      <thead>
          <tr>
              <th style="font-size: 14px; line-height: 35px; color: #333333; padding-top: 10px; padding-bottom: 10px; background-color: #f5f5f5; padding-left: 10px; padding-right: 10px;"
                  align="left">Date
              </th>
              <th style="font-size: 14px; line-height: 35px; color: #333333; padding-top: 10px; padding-bottom: 10px; background-color: #f5f5f5; padding-left: 10px; padding-right: 10px;"
                  align="left">Description
              </th>
              <th style="font-size: 14px; line-height: 35px; color: #333333; padding-top: 10px; padding-bottom: 10px; background-color: #f5f5f5; padding-left: 10px; padding-right: 10px;"
                  align="left">Type
              </th>
              <th style="font-size: 14px; line-height: 35px; color: #333333; padding-top: 10px; padding-bottom: 10px; background-color: #f5f5f5; padding-left: 10px; padding-right: 10px;"
                  align="center">Amount
              </th>
          </tr>
      </thead>
    <tbody>`;
  statementRecords.forEach((record) => {
    record.amount = record.amount.toFixed(2);
    record.typeText =
      record.earningType.toLowerCase().charAt(0).toUpperCase() +
      record.earningType.slice(1);
    template += `<tr style="border-bottom: 1px solid #efefef;">
  <td
      style="font-size: 12px; line-height: 22px; color: #726c6c; padding-top: 4px; padding-bottom: 4px; padding-left: 4px; padding-right: 4px;">
      ${moment(record.created).format("Do MMM YYYY hh:mm A")}
  </td>
  <td
      style="font-size: 12px; line-height: 22px; color: #726c6c; padding-top: 4px; padding-bottom: 4px; padding-left: 4px; padding-right: 4px;">
      ${record.description}</td>
  <td
      style="font-size: 12px; line-height: 22px; color: #726c6c; padding-top: 4px; padding-bottom: 4px; padding-left: 4px; padding-right: 4px;">
      ${record.typeText}</td>
  <td style="font-size: 12px; line-height: 22px; color: #726c6c; padding-top: 4px; padding-bottom: 4px; padding-left: 4px; padding-right: 4px;"
      align="center">
      + <span class="amount-credit">$${record.amount}</span></td>
</tr>`;
  });
  template += `</tbody></table>`;
  return template;
}

async function makeMoneyTransferRequestToAdmin(key, driver, businessData) {
  const walletDetails = (
    await admin
      .database()
      .ref("driver-wallets/" + key)
      .once("value")
  ).val();
  const minimumAmount = driver.minimumWalletAmount
    ? parseFloat(driver.minimumWalletAmount)
    : parseFloat(businessData.minAmountInWallet);
  if (
    walletDetails &&
    parseFloat(walletDetails.balance) > parseFloat(minimumAmount)
  ) {
    await admin
      .database()
      .ref("money-withdrawal-request")
      .push({
        driverId: key,
        driverName: driver.name,
        minimumAmountToMaintain: parseFloat(minimumAmount),
        withdrawalAmount: parseFloat(walletDetails.balance - minimumAmount),
        bankDetails: {
          bankName: driver.bankName ? driver.bankName : null,
          accNo: driver.accNo ? driver.accNo : null,
          holderName: driver.holderName ? driver.holderName : null,
          routingNumber: driver.routingNumber ? driver.routingNumber : null,
        },
        status: "pending",
        created: Date.now(),
      });
    admin
      .database()
      .ref("driver-wallets/" + key)
      .update({
        balance:
          parseFloat(walletDetails.balance) -
          parseFloat(walletDetails.balance - minimumAmount),
      });
    admin
      .database()
      .ref("payment-transactions/wallet")
      .push({
        admin_id: null,
        type: 0,
        driver_id: key,
        amount: parseFloat(walletDetails.balance) - parseFloat(minimumAmount),
        description: "Wallet money withdrawal",
        created: Date.now(),
        tripId: null,
        transactionType: "WITHDRAWAL",
      });
  }
}

exports.createPassenger = functions.database
  .ref("passengers/{id}")
  .onCreate(async function (snapshot, context) {
    const key = context.params.id;
    const original = snapshot.val();
    if (original.createdBy == "admin") {
      admin
        .auth()
        .createUser({
          uid: key,
          email: original.email,
          password: original.password,
        })
        .then(() => {
          admin
            .database()
            .ref("passengers/" + key + "/password")
            .remove();
        })
        .catch((err) => {
          console.log(err);
        });
    } else if (
      original.createdBy == "self" &&
      (original.providerId == "google.com" ||
        original.providerId == "facebook.com")
    ) {
      const user = await admin.auth().getUser(key);
      if (original.isEmailVerified && !user.emailVerified) {
        admin
          .auth()
          .updateUser(key, {
            emailVerified: true,
          })
          .then(() => {})
          .catch((err) => {
            console.log(err);
          });
      }
    }
    await admin
      .database()
      .ref("passenger-wallets/" + key)
      .set({
        balance: 0,
        isKYC: false,
      });
    await admin
      .database()
      .ref("passenger-push-notifications/" + key)
      .set({
        isPushEnabled: true,
      });
    await admin
      .database()
      .ref("passenger-corporates/" + key)
      .set({
        isCorporate: false,
      });
    await admin
      .database()
      .ref("passenger-insurances/" + key)
      .set({
        isRideSecured: true,
      });
    await admin
      .database()
      .ref("passenger-admin-donations/" + key)
      .set({
        isDonateAdmin: false,
      });

    // // Send Welcome Email
    // const companyData = (
    //   await admin.database().ref("company-details").once("value")
    // ).val();

    // let emailHeader = (
    //   await admin.database().ref("email-templates/header").once("value")
    // ).val();

    // emailHeader.template = emailHeader.template.replace(
    //   new RegExp("{date}", "g"),
    //   moment().format("Do MMM YYYY hh:mm A")
    // );
    // emailHeader.template = emailHeader.template.replace(
    //   new RegExp("{companyLogo}", "g"),
    //   companyData.logo
    // );
    // emailHeader.template = emailHeader.template.replace(
    //   new RegExp("{companyName}", "g"),
    //   companyData.name.toUpperCase()
    // );

    // let emailBody = (
    //   await admin.database().ref("email-templates/welcome").once("value")
    // ).val();
    // emailBody.template = emailBody.template.replace(
    //   new RegExp("{title}", "g"),
    //   "Welcome To " + companyData.name.toUpperCase()
    // );
    // emailBody.template = emailBody.template.replace(
    //   new RegExp("{content}", "g"),
    //   "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
    // );
    // emailBody.template = emailBody.template.replace(
    //   new RegExp("{companyWeb}", "g"),
    //   "https://wrapspeedtaxi.com/"
    // );
    // let emailFooter = (
    //   await admin.database().ref("email-templates/footer").once("value")
    // ).val();

    // let header = ejs.render(emailHeader.template);
    // let body = ejs.render(emailBody.template);
    // let footer = ejs.render(emailFooter.template);

    // let emailData = {
    //   pageTitle: "Welcome To " + companyData.name.toUpperCase(),
    //   header,
    //   body,
    //   footer,
    // };

    // ejs.renderFile(__dirname + "/email.ejs", emailData, function (err, html) {
    //   if (err) {
    //     functions.logger.error(err);
    //   } else {
    //     let callBack = function (err1, info) {
    //       if (err1) {
    //         functions.logger.error(err1);
    //       } else {
    //         functions.logger.info(info);
    //       }
    //     };
    //     sendEmail(
    //       {
    //         to: original.email,
    //         subject: "Welcome To " + companyData.name.toUpperCase(),
    //         html,
    //       },
    //       callBack
    //     );
    //   }
    // });
    // // Send Welcome Email Ends
  });

exports.updatePassenger = functions.database
  .ref("passengers/{id}")
  .onUpdate(async function (snapshot, context) {
    const key = context.params.id;
    const before = snapshot.before.val();
    const after = snapshot.after.val();
    const user = await admin.auth().getUser(key);
    let updateData = {};
    let updateCheck = false;
    if ((after.name && !before.name) || after.name != before.name) {
      updateData.displayName = after.name;
      updateCheck = true;
    }
    if ((after.email && !before.email) || after.email != before.email) {
      updateData.email = after.email;
      updateData.emailVerified = false;
      updateCheck = true;
    } else if (after.isEmailVerified && !user.emailVerified) {
      updateData.emailVerified = true;
      updateCheck = true;
    }
    if (after.password && !user.passwordHash) {
      updateData.password = after.password;
      updateCheck = true;
    }

    if (updateCheck) {
      admin
        .auth()
        .updateUser(key, updateData)
        .then(() => {
          functions.logger.info("Updated: " + key);
          let updatedData = {};
          if (after.password) {
            updatedData.password = null;
          }
          if (!updateData.emailVerified) {
            updatedData.isEmailVerified = false;
          }
          admin
            .database()
            .ref("passengers/" + key)
            .update(updatedData);
        })
        .catch((err) => {
          functions.logger.info(err);
        });
    }
  });

exports.sendSOSMessage = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Credentials", "true"); // vital
  if (req.method === "OPTIONS") {
    // Send response to OPTIONS requests
    res.set("Access-Control-Allow-Methods", "GET, POST");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.set("Access-Control-Max-Age", "3600");
    res.status(204).send("");
  } else {
    if (req.body.id && req.body.type && req.body.tripId) {
      const tripId = req.body.tripId;
      const type = req.body.type;
      const id = req.body.id;
      if (type == "passenger") {
        const passenger = (
          await admin
            .database()
            .ref("passengers/" + id)
            .once("value")
        ).val();

        let passengerEmergency = (
          await admin
            .database()
            .ref("passenger-emergency/" + id)
            .once("value")
        ).val();

        for (const [key, value] of Object.entries(passengerEmergency)) {
          if (value.mobile) {
            const msg1 =
              "Hello " +
              value.name +
              ", Testing SOS Message For Passenger " +
              passenger.name +
              " With TripId : " +
              tripId;
            sendSMS("+91" + value.mobile, msg1);
          }
        }
      } else {
        const driver = (
          await admin
            .database()
            .ref("drivers/" + id)
            .once("value")
        ).val();

        let driverEmergency = (
          await admin
            .database()
            .ref("driver-emergency/" + id)
            .once("value")
        ).val();

        for (const [key, value] of Object.entries(driverEmergency)) {
          if (value.mobile) {
            const msg1 =
              "Hello " +
              value.name +
              ", Testing SOS Message For Driver " +
              driver.name +
              " With TripId : " +
              tripId;
            sendSMS("+91" + value.mobile, msg1);
          }
        }
      }
      admin
        .database()
        .ref("business-management/")
        .once("value")
        .then((snapshot) => {
          const businessData = snapshot.val();
          if (businessData.sosContact) {
            const typeText = type == "passenger" ? "Passenger " : "Driver";
            const msg3 =
              "Hello Support, Testing SOS Message For " +
              typeText +
              "With TripId : " +
              tripId;
            sendSMS("+91" + businessData.sosContact, msg3);
          }
        });
      return res.status(200).json({
        status: 1,
        msg: "SOS message send successfully.",
      });
    } else {
      return res.status(200).json({
        status: -1,
        msg: "Either Id Or Type Not Found",
      });
    }
  }
});

exports.validateReferralCode = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Credentials", "true"); // vital
  if (req.method === "OPTIONS") {
    // Send response to OPTIONS requests
    res.set("Access-Control-Allow-Methods", "GET, POST");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.set("Access-Control-Max-Age", "3600");
    res.status(204).send("");
  } else {
    if (req.body.code && req.body.id && req.body.type) {
      const code = req.body.code;
      const type = req.body.type;
      const id = req.body.id;

      if (id == code) {
        return res.status(200).json({
          status: -1,
          msg: "You cannot use your own referral code.",
        });
      } else {
        const businessData = (
          await admin.database().ref("business-management").once("value")
        ).val();

        const driverReferrer = (
          await admin
            .database()
            .ref("drivers/" + code)
            .once("value")
        ).val();

        const passengerReferrer = (
          await admin
            .database()
            .ref("passengers/" + code)
            .once("value")
        ).val();

        if (driverReferrer || passengerReferrer) {
          const referredType = passengerReferrer ? "passenger" : "driver";
          const referrer_wallet_table = passengerReferrer
            ? "passenger-wallets"
            : "driver-wallets";

          const refereeTable = type == "passenger" ? "passengers" : "drivers";
          const referee_wallet_table =
            type == "passenger" ? "passenger-wallets" : "driver-wallets";
          const referee_referral_table =
            type == "passenger" ? "passenger-referrals" : "driver-referrals";

          const referee = (
            await admin
              .database()
              .ref(refereeTable + "/" + id)
              .once("value")
          ).val();

          const refereeBalance = (
            await admin
              .database()
              .ref(referee_wallet_table + "/" + id)
              .once("value")
          ).val();

          const refereeBal =
            refereeBalance && refereeBalance.balance
              ? refereeBalance.balance
              : 0;
          await admin
            .database()
            .ref(referee_wallet_table + "/" + id)
            .update({
              balance: refereeBal + businessData.referral.refereeAmount,
            });
          await admin
            .database()
            .ref(referee_referral_table + "/" + id)
            .update({
              referredBy: code,
              referredType: referredType,
            });

          let refereeBalData;
          if (type == "passenger") {
            refereeBalData = {
              passenger_email: referee.email,
              passenger_id: id,
              amount: businessData.referral.refereeAmount,
              created: Date.now(),
              description: "Referral Bonus",
              type: 1,
            };
          } else {
            refereeBalData = {
              driver_email: referee.email,
              driver_id: id,
              amount: businessData.referral.refereeAmount,
              created: Date.now(),
              description: "Referral Bonus",
              type: 1,
            };
          }
          await admin
            .database()
            .ref("payment-transactions/wallet")
            .push(refereeBalData);

          const referrerBalance = (
            await admin
              .database()
              .ref(referrer_wallet_table + "/" + code)
              .once("value")
          ).val();
          const referrerBal =
            referrerBalance && referrerBalance.balance
              ? referrerBalance.balance
              : 0;
          await admin
            .database()
            .ref(referrer_wallet_table + "/" + code)
            .update({
              balance: referrerBal + businessData.referral.referrerAmount,
            });

          let referrerBalData;
          if (driverReferrer) {
            referrerBalData = {
              driver_email: driverReferrer.email,
              driver_id: code,
              amount: businessData.referral.referrerAmount,
              created: Date.now(),
              description: "Referral Bonus",
              type: 1,
            };
          } else {
            referrerBalData = {
              passenger_email: passengerReferrer.email,
              passenger_id: code,
              amount: businessData.referral.referrerAmount,
              created: Date.now(),
              description: "Referral Bonus",
              type: 1,
            };
          }
          await admin
            .database()
            .ref("payment-transactions/wallet")
            .push(referrerBalData);
          return res.status(200).json({
            status: 1,
            msg: "Referral Code Successfully Applied.",
          });
        } else {
          return res.status(200).json({
            status: -1,
            msg: "Invalid Referral Code",
          });
        }
      }
    } else {
      return res.status(200).json({
        status: -1,
        msg: "Either Code, Id Or Type Not Found",
      });
    }
  }
});

exports.generateInvoiceMail = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Credentials", "true"); // vital
  if (req.method === "OPTIONS") {
    // Send response to OPTIONS requests
    res.set("Access-Control-Allow-Methods", "GET, POST");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.set("Access-Control-Max-Age", "3600");
    res.status(204).send("");
  } else {
    if (req.body.tripPassengerId && req.body.type) {
      const businessData = (
        await admin.database().ref("business-management").once("value")
      ).val();

      const companyData = (
        await admin.database().ref("company-details").once("value")
      ).val();

      const tripData = (
        await admin
          .database()
          .ref("trip-passengers/" + req.body.tripPassengerId)
          .once("value")
      ).val();
      if (tripData) {
        const vehicleType = (
          await admin
            .database()
            .ref("fleets/" + tripData.vehicleType)
            .once("value")
        ).val();

        const passengerData = (
          await admin
            .database()
            .ref("passengers/" + tripData.passengerId)
            .once("value")
        ).val();

        const driverData = (
          await admin
            .database()
            .ref("drivers/" + tripData.driverId)
            .once("value")
        ).val();

        let splitPayments = [];
        let amount = tripData.fareDetails.finalFare;
        if (tripData.waitingCharges) amount += tripData.waitingCharges;
        let finalFare = amount;

        const splits = (
          await admin
            .database()
            .ref("trip-split-payment/" + req.body.tripPassengerId)
            .once("value")
        ).val();
        if (splits != null) {
          for (const [key, value] of Object.entries(splits)) {
            splitPayments.push(value);
          }
          splitPayments = splitPayments.reverse();
        }

        amount = amount / (splitPayments.length + 1);

        // Header Fixed
        let emailHeader = (
          await admin.database().ref("email-templates/header").once("value")
        ).val();
        emailHeader.template = emailHeader.template.replace(
          new RegExp("{date}", "g"),
          moment(new Date(tripData.pickedUpAt)).format("Do MMMM YYYY")
        );
        emailHeader.template = emailHeader.template.replace(
          new RegExp("{companyLogo}", "g"),
          companyData.logo
        );
        emailHeader.template = emailHeader.template.replace(
          new RegExp("{companyName}", "g"),
          companyData.name.toUpperCase()
        );
        // Header Fixed

        // Split Payment Rows
        let splitRows = "";
        splitPayments.forEach(async (splitPayment) => {
          let splitBody = (
            await admin
              .database()
              .ref("email-templates/invoice-split-payment-row")
              .once("value")
          ).val();
          splitBody.template = splitBody.template.replace(
            new RegExp("{name}", "g"),
            splitPayment.name
          );
          splitBody.template = splitBody.template.replace(
            new RegExp("{phoneNumber}", "g"),
            splitPayment.mobile
          );
          splitBody.template = splitBody.template.replace(
            new RegExp("{currency}", "g"),
            businessData.currency
          );
          splitBody.template = splitBody.template.replace(
            new RegExp("{splittedAmount}", "g"),
            amount.toFixed(2)
          );
          splitRows += splitBody.template;
        });
        // Ends Split Payment Rows

        let emailBody = (
          await admin.database().ref("email-templates/invoice").once("value")
        ).val();

        emailBody.template = emailBody.template.replace(
          new RegExp("{currency}", "g"),
          businessData.currency
        );

        emailBody.template = emailBody.template.replace(
          new RegExp("{finalFare}", "g"),
          finalFare.toFixed(2)
        );

        emailBody.template = emailBody.template.replace(
          new RegExp("{tripId}", "g"),
          req.body.tripPassengerId
        );

        emailBody.template = emailBody.template.replace(
          new RegExp("{riderName}", "g"),
          passengerData.name
        );

        emailBody.template = emailBody.template.replace(
          new RegExp("{riderNumber}", "g"),
          passengerData.phoneNumber
        );

        emailBody.template = emailBody.template.replace(
          new RegExp("{routeMap}", "g"),
          "https://wrapspeedtaxi.com/public/email_images/map.png"
        );

        emailBody.template = emailBody.template.replace(
          new RegExp("{driverProfilePic}", "g"),
          driverData.profilePic ? driverData.profilePic : companyData.logo
        );

        emailBody.template = emailBody.template.replace(
          new RegExp("{driverName}", "g"),
          driverData.name
        );

        emailBody.template = emailBody.template.replace(
          new RegExp("{fleetType}", "g"),
          vehicleType.name
        );

        emailBody.template = emailBody.template.replace(
          new RegExp("{fleetDetail}", "g"),
          driverData.brand + " - " + driverData.model
        );

        emailBody.template = emailBody.template.replace(
          new RegExp("{fromTime}", "g"),
          moment(new Date(tripData.pickedUpAt)).format("hh:mm A")
        );

        emailBody.template = emailBody.template.replace(
          new RegExp("{fromAddress}", "g"),
          tripData.origin.address
        );

        emailBody.template = emailBody.template.replace(
          new RegExp("{endTime}", "g"),
          moment(new Date(tripData.droppedOffAt)).format("hh:mm A")
        );

        emailBody.template = emailBody.template.replace(
          new RegExp("{toAddress}", "g"),
          tripData.destination.address
        );

        emailBody.template = emailBody.template.replace(
          new RegExp("{baseFare}", "g"),
          tripData.fareDetails.baseFare.toFixed(2)
        );

        emailBody.template = emailBody.template.replace(
          new RegExp("{taxFare}", "g"),
          tripData.fareDetails.tax.toFixed(2)
        );

        emailBody.template = emailBody.template.replace(
          new RegExp("{paidBy}", "g"),
          tripData.paymentMethod
        );

        emailBody.template = emailBody.template.replace(
          new RegExp("{splittedAmount}", "g"),
          amount.toFixed(2)
        );

        if (tripData.paymentMethod == "cash") {
          emailBody.template = emailBody.template.replace(
            new RegExp("{paidByImage}", "g"),
            "https://wrapspeedtaxi.com/public/email_images/cash.png"
          );
        } else if (tripData.paymentMethod == "wallet") {
          emailBody.template = emailBody.template.replace(
            new RegExp("{paidByImage}", "g"),
            "https://wrapspeedtaxi.com/public/email_images/wallet.png"
          );
        } else {
          emailBody.template = emailBody.template.replace(
            new RegExp("{paidByImage}", "g"),
            "https://wrapspeedtaxi.com/public/email_images/card.png"
          );
        }

        emailBody.template = emailBody.template.replace(
          new RegExp("{splitRows}", "g"),
          splitRows
        );

        emailBody.template = emailBody.template.replace(
          new RegExp("{companyWeb}", "g"),
          "https://wrapspeedtaxi.com/"
        );

        let emailFooter = (
          await admin.database().ref("email-templates/footer").once("value")
        ).val();

        let header = ejs.render(emailHeader.template);
        let body = ejs.render(emailBody.template);
        let footer = ejs.render(emailFooter.template);

        let emailData = {
          pageTitle: "Invoice For Trip : #" + req.body.tripPassengerId,
          header,
          body,
          footer,
        };
        ejs.renderFile(
          __dirname + "/email.ejs",
          emailData,
          function (err, html) {
            if (err) {
              functions.logger.error(err);
              return res.status(200).json({
                status: -1,
                msg: "Unable To Send Invoice Via Mail.",
              });
            } else {
              let callBack = function (err1, info) {
                if (err1) {
                  functions.logger.error(err1);
                  return res.status(200).json({
                    status: -1,
                    msg: "Error occured while sending mail.",
                  });
                } else {
                  functions.logger.info(info);
                  return res.status(200).json({
                    status: 1,
                    msg: "Mail sent successfully.",
                  });
                }
              };
              sendEmail(
                {
                  to:
                    req.body.type == "passenger"
                      ? passengerData.email
                      : driverData.email,
                  bcc: null,
                  subject: "Invoice For Trip : #" + req.body.tripPassengerId,
                  html,
                },
                callBack
              );
            }
          }
        );
      } else {
        return res.status(200).json({
          status: -1,
          msg: "Trip Data Not Found",
        });
      }
    } else {
      return res.status(200).json({
        status: -1,
        msg: "Either Type Or Trip Id Not Found",
      });
    }
  }
});

exports.scheduledFunction = functions.pubsub
  .schedule("every 2 minutes")
  .onRun((context) => {
    const date = moment();
    admin
      .database()
      .ref("scheduled-trips")
      .once("value", function (snapshot) {
        const schedules = snapshot.val();
        for (const [tripKey, tripData] of Object.entries(schedules)) {
          const scheduleDate = moment(new Date(tripData.departDate));
          if (date.isAfter(scheduleDate)) {
            admin
              .database()
              .ref("trip-passengers/")
              .push({
                ...tripData,
                status: "canceled",
                cancellationReasonText: "No drivers were found for your ride",
              })
              .then(() => {
                admin
                  .database()
                  .ref("scheduled-trips/" + tripKey)
                  .remove();
              });
          }
        }
      });
  });

exports.driverAssignmentCron = functions.pubsub
  .schedule("every 2 minutes")
  .onRun(() => {
    functions.logger.log(
      "cron called !!!",
      moment().format("Do MMM YYYY hh:mm A")
    );
    const options = {
      hostname: "cron.wrapspeedtaxi.com",
      method: "GET",
    };

    const req = https.request(options, (res) => {
      console.log(`statusCode: ${res.statusCode}`);
    });
  });

exports.walletWithdrawalDailyScheduler = functions.pubsub
  .schedule("0 16 * * *")
  .timeZone("Asia/Kolkata")
  .onRun(() => {
    admin
      .database()
      .ref("business-management/")
      .once("value")
      .then((snapshot) => {
        const businessData = snapshot.val();
        admin
          .database()
          .ref("drivers")
          .once("value", async function (snapshot) {
            drivers = snapshot.val();
            for (const [driverKey, driversData] of Object.entries(drivers)) {
              if (driversData.requestFrequency === "daily") {
                makeMoneyTransferRequestToAdmin(
                  driverKey,
                  driversData,
                  businessData
                );
              }
            }
          });
      });
  });
exports.walletWithdrawalWeeklyScheduler = functions.pubsub
  .schedule("0 16 * * 1")
  .timeZone("Asia/Kolkata")
  .onRun(() => {
    admin
      .database()
      .ref("business-management/")
      .once("value")
      .then((snapshot) => {
        const businessData = snapshot.val();
        admin
          .database()
          .ref("drivers")
          .once("value", async function (snapshot) {
            drivers = snapshot.val();
            for (const [driverKey, driversData] of Object.entries(drivers)) {
              if (driversData.requestFrequency === "weekly") {
                makeMoneyTransferRequestToAdmin(
                  driverKey,
                  driversData,
                  businessData
                );
              }
            }
          });
      });
  });

exports.walletWithdrawalMonthlyScheduler = functions.pubsub
  .schedule("0 16 1 * *")
  .timeZone("Asia/Kolkata")
  .onRun(() => {
    admin
      .database()
      .ref("business-management/")
      .once("value")
      .then((snapshot) => {
        const businessData = snapshot.val();
        admin
          .database()
          .ref("drivers")
          .once("value", async function (snapshot) {
            drivers = snapshot.val();
            for (const [driverKey, driversData] of Object.entries(drivers)) {
              if (driversData.requestFrequency === "monthly") {
                makeMoneyTransferRequestToAdmin(
                  driverKey,
                  driversData,
                  businessData
                );
              }
            }
          });
      });
  });

exports.passengerComplaintCreateTrigger = functions.database
  .ref("PASSENGER-raised-complaints/{id}")
  .onCreate(async function (snapshot, context) {
    const id = context.params.id;
    const original = snapshot.val();
    let type = "passengers";
    let userId = original.passengerId;
    const user = (
      await admin
        .database()
        .ref(type + "/" + userId)
        .once("value")
    ).val();
    const admins = await admin
      .database()
      .ref("admins")
      .orderByChild("role_id")
      .equalTo("0")
      .limitToFirst(1)
      .once("value");
    let adminData = {};
    for (const [key, value] of Object.entries(admins)) {
      adminData = value;
    }
    functions.logger.info(adminData);
    const companyData = (
      await admin.database().ref("company-details").once("value")
    ).val();

    let emailHeader = (
      await admin.database().ref("email-templates/header").once("value")
    ).val();

    emailHeader.template = emailHeader.template.replace(
      new RegExp("{date}", "g"),
      moment().format("Do MMM YYYY hh:mm A")
    );
    emailHeader.template = emailHeader.template.replace(
      new RegExp("{companyLogo}", "g"),
      companyData.logo
    );
    emailHeader.template = emailHeader.template.replace(
      new RegExp("{companyName}", "g"),
      companyData.name.toUpperCase()
    );

    let emailBody = (
      await admin.database().ref("email-templates/new-complaint").once("value")
    ).val();
    emailBody.template = emailBody.template.replace(
      new RegExp("{title}", "g"),
      "Complaint Registered"
    );
    let content = "Complaint Registered By ";
    content += "Passenger : ";
    content += user.name.toUpperCase() + "<br/>";
    content += "<b>Subject Of Complaint</b> : " + original.complaintDescription;
    emailBody.template = emailBody.template.replace(
      new RegExp("{content}", "g"),
      content
    );
    emailBody.template = emailBody.template.replace(
      new RegExp("{companyWeb}", "g"),
      "https://wrapspeedtaxi.com/"
    );
    let emailFooter = (
      await admin.database().ref("email-templates/footer").once("value")
    ).val();

    let header = ejs.render(emailHeader.template);
    let body = ejs.render(emailBody.template);
    let footer = ejs.render(emailFooter.template);

    let emailData = {
      pageTitle: "Complaint Registered",
      header,
      body,
      footer,
    };

    ejs.renderFile(__dirname + "/email.ejs", emailData, function (err, html) {
      if (err) {
        functions.logger.error(err);
      } else {
        functions.logger.log("html", html);
        let callBack = function (err1, info) {
          if (err1) {
            functions.logger.error(err1);
          } else {
            functions.logger.info(info);
          }
        };
        sendEmail(
          {
            to: user.email,
            bcc: ADMIN_EMAIL,
            subject: "Complaint Registered",
            html,
          },
          callBack
        );
      }
    });
  });

exports.passengerComplaintUpdateTrigger = functions.database
  .ref("PASSENGER-raised-complaints/{id}")
  .onUpdate(async function (snapshot, context) {
    const id = context.params.id;
    const before = snapshot.before.val();
    const after = snapshot.after.val();

    let type = "passengers";
    let userId = after.passengerId;
    const user = (
      await admin
        .database()
        .ref(type + "/" + userId)
        .once("value")
    ).val();
    const admins = await admin
      .database()
      .ref("admins")
      .orderByChild("role_id")
      .equalTo("0")
      .limitToFirst(1)
      .once("value");
    let adminData = {};
    for (const [key, value] of Object.entries(admins)) {
      adminData = value;
    }
    const companyData = (
      await admin.database().ref("company-details").once("value")
    ).val();
    let emailHeader = (
      await admin.database().ref("email-templates/header").once("value")
    ).val();

    emailHeader.template = emailHeader.template.replace(
      new RegExp("{date}", "g"),
      moment().format("Do MMM YYYY hh:mm A")
    );
    emailHeader.template = emailHeader.template.replace(
      new RegExp("{companyLogo}", "g"),
      companyData.logo
    );
    emailHeader.template = emailHeader.template.replace(
      new RegExp("{companyName}", "g"),
      companyData.name.toUpperCase()
    );

    let emailBody;
    if (before.status != after.status) {
      let content = "Complaint Registered By ";
      let title = "";
      if (after.status == "Pending") {
        emailBody = (
          await admin
            .database()
            .ref("email-templates/complaint-processing")
            .once("value")
        ).val();
        title = "Complaint Is Marked Pending";
      } else if (after.status == "Processing") {
        emailBody = (
          await admin
            .database()
            .ref("email-templates/complaint-processing")
            .once("value")
        ).val();
        title = "Complaint Is Marked Under Processing";
      } else {
        emailBody = (
          await admin
            .database()
            .ref("email-templates/complaint-resolved")
            .once("value")
        ).val();
        title = "Complaint Is Marked Resolved";
      }
      content += "Passenger : ";
      content += user.name.toUpperCase() + "<br/>";
      content +=
        "<b>Subject Of Complaint</b> : " +
        original.complaintDescription +
        "<br/>";
      content += title;
      emailBody.template = emailBody.template.replace(
        new RegExp("{title}", "g"),
        title
      );
      emailBody.template = emailBody.template.replace(
        new RegExp("{content}", "g"),
        content
      );
      emailBody.template = emailBody.template.replace(
        new RegExp("{companyWeb}", "g"),
        "https://wrapspeedtaxi.com/"
      );
      let emailFooter = (
        await admin.database().ref("email-templates/footer").once("value")
      ).val();

      let header = ejs.render(emailHeader.template);
      let body = ejs.render(emailBody.template);
      let footer = ejs.render(emailFooter.template);

      let emailData = {
        pageTitle: "Complaint Is Under Processing",
        header,
        body,
        footer,
      };

      ejs.renderFile(__dirname + "/email.ejs", emailData, function (err, html) {
        if (err) {
          functions.logger.error(err);
        } else {
          let callBack = function (err1, info) {
            if (err1) {
              functions.logger.error(err1);
            } else {
              functions.logger.info(info);
            }
          };
          sendEmail(
            {
              to: user.email,
              bcc: ADMIN_EMAIL,
              subject: title,
              html,
            },
            callBack
          );
        }
      });
    }
  });

exports.driverComplaintCreateTrigger = functions.database
  .ref("DRIVER-raised-complaints/{id}")
  .onCreate(async function (snapshot, context) {
    const id = context.params.id;
    const original = snapshot.val();
    let type = "drivers";
    let userId = original.driverId;
    const user = (
      await admin
        .database()
        .ref(type + "/" + userId)
        .once("value")
    ).val();
    const admins = await admin
      .database()
      .ref("admins")
      .orderByChild("role_id")
      .equalTo("0")
      .limitToFirst(1)
      .once("value");
    let adminData = {};
    for (const [key, value] of Object.entries(admins)) {
      adminData = value;
    }
    functions.logger.info(adminData);
    const companyData = (
      await admin.database().ref("company-details").once("value")
    ).val();

    let emailHeader = (
      await admin.database().ref("email-templates/header").once("value")
    ).val();

    emailHeader.template = emailHeader.template.replace(
      new RegExp("{date}", "g"),
      moment().format("Do MMM YYYY hh:mm A")
    );
    emailHeader.template = emailHeader.template.replace(
      new RegExp("{companyLogo}", "g"),
      companyData.logo
    );
    emailHeader.template = emailHeader.template.replace(
      new RegExp("{companyName}", "g"),
      companyData.name.toUpperCase()
    );

    let emailBody = (
      await admin.database().ref("email-templates/new-complaint").once("value")
    ).val();
    emailBody.template = emailBody.template.replace(
      new RegExp("{title}", "g"),
      "Complaint Registered"
    );
    let content = "Complaint Registered By ";
    content += "Driver : ";
    content += user.name.toUpperCase() + "<br/>";
    content += "<b>Subject Of Complaint</b> : " + original.complaintDescription;
    emailBody.template = emailBody.template.replace(
      new RegExp("{content}", "g"),
      content
    );
    emailBody.template = emailBody.template.replace(
      new RegExp("{companyWeb}", "g"),
      "https://wrapspeedtaxi.com/"
    );
    let emailFooter = (
      await admin.database().ref("email-templates/footer").once("value")
    ).val();

    let header = ejs.render(emailHeader.template);
    let body = ejs.render(emailBody.template);
    let footer = ejs.render(emailFooter.template);

    let emailData = {
      pageTitle: "Complaint Registered",
      header,
      body,
      footer,
    };

    ejs.renderFile(__dirname + "/email.ejs", emailData, function (err, html) {
      if (err) {
        functions.logger.error(err);
      } else {
        functions.logger.log("html", html);
        let callBack = function (err1, info) {
          if (err1) {
            functions.logger.error(err1);
          } else {
            functions.logger.info(info);
          }
        };
        sendEmail(
          {
            to: user.email,
            bcc: adminData.email,
            subject: "Complaint Registered",
            html,
          },
          callBack
        );
      }
    });
  });

exports.driverComplaintUpdateTrigger = functions.database
  .ref("DRIVER-raised-complaints/{id}")
  .onUpdate(async function (snapshot, context) {
    const id = context.params.id;
    const before = snapshot.before.val();
    const after = snapshot.after.val();

    let type = "drivers";
    let userId = after.driverId;
    const user = (
      await admin
        .database()
        .ref(type + "/" + userId)
        .once("value")
    ).val();
    const admins = await admin
      .database()
      .ref("admins")
      .orderByChild("role_id")
      .equalTo("0")
      .limitToFirst(1)
      .once("value");
    let adminData = {};
    for (const [key, value] of Object.entries(admins)) {
      adminData = value;
    }
    const companyData = (
      await admin.database().ref("company-details").once("value")
    ).val();
    let emailHeader = (
      await admin.database().ref("email-templates/header").once("value")
    ).val();

    emailHeader.template = emailHeader.template.replace(
      new RegExp("{date}", "g"),
      moment().format("Do MMM YYYY hh:mm A")
    );
    emailHeader.template = emailHeader.template.replace(
      new RegExp("{companyLogo}", "g"),
      companyData.logo
    );
    emailHeader.template = emailHeader.template.replace(
      new RegExp("{companyName}", "g"),
      companyData.name.toUpperCase()
    );

    let emailBody;
    if (before.status != after.status) {
      let content = "Complaint Registered By ";
      let title = "";
      if (after.status == "Pending") {
        emailBody = (
          await admin
            .database()
            .ref("email-templates/complaint-processing")
            .once("value")
        ).val();
        title = "Complaint Is Marked Pending";
      } else if (after.status == "Processing") {
        emailBody = (
          await admin
            .database()
            .ref("email-templates/complaint-processing")
            .once("value")
        ).val();
        title = "Complaint Is Marked Under Processing";
      } else {
        emailBody = (
          await admin
            .database()
            .ref("email-templates/complaint-resolved")
            .once("value")
        ).val();
        title = "Complaint Is Marked Resolved";
      }
      content += "Driver : ";
      content += user.name.toUpperCase() + "<br/>";
      content +=
        "<b>Subject Of Complaint</b> : " +
        original.complaintDescription +
        "<br/>";
      content += title;
      emailBody.template = emailBody.template.replace(
        new RegExp("{title}", "g"),
        title
      );
      emailBody.template = emailBody.template.replace(
        new RegExp("{content}", "g"),
        content
      );
      emailBody.template = emailBody.template.replace(
        new RegExp("{companyWeb}", "g"),
        "https://wrapspeedtaxi.com/"
      );
      let emailFooter = (
        await admin.database().ref("email-templates/footer").once("value")
      ).val();

      let header = ejs.render(emailHeader.template);
      let body = ejs.render(emailBody.template);
      let footer = ejs.render(emailFooter.template);

      let emailData = {
        pageTitle: "Complaint Is Under Processing",
        header,
        body,
        footer,
      };

      ejs.renderFile(__dirname + "/email.ejs", emailData, function (err, html) {
        if (err) {
          functions.logger.error(err);
        } else {
          let callBack = function (err1, info) {
            if (err1) {
              functions.logger.error(err1);
            } else {
              functions.logger.info(info);
            }
          };
          sendEmail(
            {
              to: user.email,
              bcc: adminData.email,
              subject: title,
              html,
            },
            callBack
          );
        }
      });
    }
  });

// exports.complaintCreateTrigger = functions.database
//   .ref("complaints/{id}")
//   .onCreate(async function (snapshot, context) {
//     const id = context.params.id;
//     const original = snapshot.val();
//     let type = original.driverId ? "drivers" : "passengers";
//     let userId = original.driverId ? original.driverId : original.passengerId;
//     const user = (
//       await admin
//         .database()
//         .ref(type + "/" + userId)
//         .once("value")
//     ).val();
//     const admins = await admin
//       .database()
//       .ref("admins")
//       .orderByChild("role_id")
//       .equalTo("0")
//       .limitToFirst(1)
//       .once("value");
//     let adminData = {};
//     for (const [key, value] of Object.entries(admins)) {
//       adminData = value;
//     }
//     functions.logger.info(adminData);
//     const companyData = (
//       await admin.database().ref("company-details").once("value")
//     ).val();

//     let emailHeader = (
//       await admin.database().ref("email-templates/header").once("value")
//     ).val();

//     emailHeader.template = emailHeader.template.replace(
//       new RegExp("{date}", "g"),
//       moment().format("Do MMM YYYY hh:mm A")
//     );
//     emailHeader.template = emailHeader.template.replace(
//       new RegExp("{companyLogo}", "g"),
//       companyData.logo
//     );
//     emailHeader.template = emailHeader.template.replace(
//       new RegExp("{companyName}", "g"),
//       companyData.name.toUpperCase()
//     );

//     let emailBody = (
//       await admin.database().ref("email-templates/new-complaint").once("value")
//     ).val();
//     emailBody.template = emailBody.template.replace(
//       new RegExp("{title}", "g"),
//       "Complaint Registered"
//     );
//     let content = "Complaint Registered By ";
//     content += original.driverId ? "Driver : " : "Passenger : ";
//     content += user.name.toUpperCase() + "<br/>";
//     content += "<b>Subject Of Complaint</b> : " + original.subject;
//     emailBody.template = emailBody.template.replace(
//       new RegExp("{content}", "g"),
//       content
//     );
//     emailBody.template = emailBody.template.replace(
//       new RegExp("{companyWeb}", "g"),
//       "https://wrapspeedtaxi.com/"
//     );
//     let emailFooter = (
//       await admin.database().ref("email-templates/footer").once("value")
//     ).val();

//     let header = ejs.render(emailHeader.template);
//     let body = ejs.render(emailBody.template);
//     let footer = ejs.render(emailFooter.template);

//     let emailData = {
//       pageTitle: "Complaint Registered",
//       header,
//       body,
//       footer,
//     };

//     ejs.renderFile(__dirname + "/email.ejs", emailData, function (err, html) {
//       if (err) {
//         functions.logger.error(err);
//       } else {
//         let callBack = function (err1, info) {
//           if (err1) {
//             functions.logger.error(err1);
//           } else {
//             functions.logger.info(info);
//           }
//         };
//         sendEmail(
//           {
//             to: user.email,
//             bcc: adminData.email,
//             subject: "Complaint Registered",
//             html,
//           },
//           callBack
//         );
//       }
//     });
//   });

// exports.complaintUpdateTrigger = functions.database
//   .ref("complaints/{id}")
//   .onUpdate(async function (snapshot, context) {
//     const id = context.params.id;
//     const before = snapshot.before.val();
//     const after = snapshot.after.val();

//     let type = after.driverId ? "drivers" : "passengers";
//     let userId = after.driverId ? after.driverId : after.passengerId;
//     const user = (
//       await admin
//         .database()
//         .ref(type + "/" + userId)
//         .once("value")
//     ).val();
//     const admins = await admin
//       .database()
//       .ref("admins")
//       .orderByChild("role_id")
//       .equalTo("0")
//       .limitToFirst(1)
//       .once("value");
//     let adminData = {};
//     for (const [key, value] of Object.entries(admins)) {
//       adminData = value;
//     }
//     const companyData = (
//       await admin.database().ref("company-details").once("value")
//     ).val();
//     if (after.status == "1" && before.status != "1") {
//       let emailHeader = (
//         await admin.database().ref("email-templates/header").once("value")
//       ).val();

//       emailHeader.template = emailHeader.template.replace(
//         new RegExp("{date}", "g"),
//         moment().format("Do MMM YYYY hh:mm A")
//       );
//       emailHeader.template = emailHeader.template.replace(
//         new RegExp("{companyLogo}", "g"),
//         companyData.logo
//       );
//       emailHeader.template = emailHeader.template.replace(
//         new RegExp("{companyName}", "g"),
//         companyData.name.toUpperCase()
//       );

//       let emailBody;
//       if (before.status != after.status) {
//         let content = "Complaint Registered By ";
//         let title = "";
//         if (after.status == 0) {
//           emailBody = (
//             await admin
//               .database()
//               .ref("email-templates/complaint-processing")
//               .once("value")
//           ).val();
//           title = "Complaint Is Marked Pending";
//         } else if (after.status == 1) {
//           emailBody = (
//             await admin
//               .database()
//               .ref("email-templates/complaint-processing")
//               .once("value")
//           ).val();
//           title = "Complaint Is Marked Under Processing";
//         } else {
//           emailBody = (
//             await admin
//               .database()
//               .ref("email-templates/complaint-resolved")
//               .once("value")
//           ).val();
//           title = "Complaint Is Marked Resolved";
//         }
//         content += original.driverId ? "Driver : " : "Passenger : ";
//         content += user.name.toUpperCase() + "<br/>";
//         content +=
//           "<b>Subject Of Complaint</b> : " + original.subject + "<br/>";
//         content += title;
//         emailBody.template = emailBody.template.replace(
//           new RegExp("{title}", "g"),
//           title
//         );
//         emailBody.template = emailBody.template.replace(
//           new RegExp("{content}", "g"),
//           content
//         );
//         emailBody.template = emailBody.template.replace(
//           new RegExp("{companyWeb}", "g"),
//           "https://wrapspeedtaxi.com/"
//         );
//         let emailFooter = (
//           await admin.database().ref("email-templates/footer").once("value")
//         ).val();

//         let header = ejs.render(emailHeader.template);
//         let body = ejs.render(emailBody.template);
//         let footer = ejs.render(emailFooter.template);

//         let emailData = {
//           pageTitle: "Complaint Is Under Processing",
//           header,
//           body,
//           footer,
//         };

//         ejs.renderFile(
//           __dirname + "/email.ejs",
//           emailData,
//           function (err, html) {
//             if (err) {
//               functions.logger.error(err);
//             } else {
//               let callBack = function (err1, info) {
//                 if (err1) {
//                   functions.logger.error(err1);
//                 } else {
//                   functions.logger.info(info);
//                 }
//               };
//               sendEmail(
//                 {
//                   to: user.email,
//                   bcc: adminData.email,
//                   subject: title,
//                   html,
//                 },
//                 callBack
//               );
//             }
//           }
//         );
//       }
//     }
//   });

// exports.complaintResponseTrigger = functions.database
//   .ref("complaint-responses/{id}")
//   .onCreate(async function (snapshot, context) {
//     const id = context.params.id;
//     const original = snapshot.val();
//     const complaintData = (
//       await admin
//         .database()
//         .ref("complaints/" + original.complaintId)
//         .once("value")
//     ).val();
//     let type = complaintData.driverId ? "drivers" : "passengers";
//     let userId = complaintData.driverId
//       ? complaintData.driverId
//       : complaintData.passengerId;
//     const user = (
//       await admin
//         .database()
//         .ref(type + "/" + userId)
//         .once("value")
//     ).val();
//     let sender;
//     if (original.adminId) {
//       sender = (
//         await admin
//           .database()
//           .ref("admins" + "/" + original.adminId)
//           .once("value")
//       ).val();
//     } else if (original.driverId) {
//       sender = (
//         await admin
//           .database()
//           .ref("drivers" + "/" + original.driverId)
//           .once("value")
//       ).val();
//     } else {
//       sender = (
//         await admin
//           .database()
//           .ref("passengers" + "/" + original.passengerId)
//           .once("value")
//       ).val();
//     }

//     const admins = await admin
//       .database()
//       .ref("admins")
//       .orderByChild("role_id")
//       .equalTo("0")
//       .limitToFirst(1)
//       .once("value");
//     let adminData;

//     for (const [key, value] of Object.entries(admins)) {
//       adminData = value;
//     }

//     const companyData = (
//       await admin.database().ref("company-details").once("value")
//     ).val();

//     let emailHeader = (
//       await admin.database().ref("email-templates/header").once("value")
//     ).val();

//     emailHeader.template = emailHeader.template.replace(
//       new RegExp("{date}", "g"),
//       moment().format("Do MMM YYYY hh:mm A")
//     );
//     emailHeader.template = emailHeader.template.replace(
//       new RegExp("{companyLogo}", "g"),
//       companyData.logo
//     );
//     emailHeader.template = emailHeader.template.replace(
//       new RegExp("{companyName}", "g"),
//       companyData.name.toUpperCase()
//     );

//     const title = "New Response To Complaint : #" + id;

//     let emailBody = (
//       await admin
//         .database()
//         .ref("email-templates/new-complaint-response")
//         .once("value")
//     ).val();

//     emailBody.template = emailBody.template.replace(
//       new RegExp("{title}", "g"),
//       title
//     );

//     let content = "New Response To Complaint : #" + id + "<br/>";
//     content += "<b>Sent From  : </b> : " + sender.name + "<br/>";
//     content += "<b>Description : </b> : " + original.description + "<br/>";

//     emailBody.template = emailBody.template.replace(
//       new RegExp("{content}", "g"),
//       content
//     );

//     emailBody.template = emailBody.template.replace(
//       new RegExp("{companyWeb}", "g"),
//       "https://wrapspeedtaxi.com/"
//     );

//     let emailFooter = (
//       await admin.database().ref("email-templates/footer").once("value")
//     ).val();

//     let header = ejs.render(emailHeader.template);
//     let body = ejs.render(emailBody.template);
//     let footer = ejs.render(emailFooter.template);

//     let emailData = {
//       pageTitle: title,
//       header,
//       body,
//       footer,
//     };

//     ejs.renderFile(__dirname + "/email.ejs", emailData, function (err, html) {
//       if (err) {
//         functions.logger.error(err);
//       } else {
//         let callBack = function (err1, info) {
//           if (err1) {
//             functions.logger.error(err1);
//           } else {
//             functions.logger.info(info);
//           }
//         };
//         sendEmail(
//           {
//             to: original.adminId ? user.email : adminData.email,
//             subject: title,
//             html,
//           },
//           callBack
//         );
//       }
//     });
//   });

exports.tripPassengerCreateTrigger = functions.database
  .ref("trip-passengers/{tripPassengerId}")
  .onCreate(async function (snapshot, context) {
    const original = snapshot.val();
    const driverId = original.driverId;
    const driver = (
      await admin
        .database()
        .ref("drivers/" + driverId)
        .once("value")
    ).val();
    const driverNotification = (
      await admin
        .database()
        .ref("driver-push-notifications/" + driverId)
        .once("value")
    ).val();
    const msgDriver = "New Ride Available";
    if (driver.alwaysOn) {
      if (driver.isPhoneVerified) {
        sendSMS("+91" + driver.phoneNumber, "Driver Sms : " + msgDriver);
      }
      if (driverNotification.isPushEnabled) {
        sendMessage(
          driverNotification.pushToken,
          "New Ride Available",
          "Driver Notification : " + msgDriver
        );
      }
    }
  });

exports.tripPassengerUpdateTrigger = functions.database
  .ref("trip-passengers/{tripPassengerId}")
  .onUpdate(async function (snapshot, context) {
    const key = context.params.tripPassengerId;
    const before = snapshot.before.val();
    const after = snapshot.after.val();
    const driverId = after.driverId;
    const passengerId = after.passengerId;
    const driver = (
      await admin
        .database()
        .ref("drivers/" + driverId)
        .once("value")
    ).val();
    const driverNotification = (
      await admin
        .database()
        .ref("driver-push-notifications/" + driverId)
        .once("value")
    ).val();
    const passenger = (
      await admin
        .database()
        .ref("passengers/" + passengerId)
        .once("value")
    ).val();
    const passengerNotification = (
      await admin
        .database()
        .ref("passenger-push-notifications/" + passengerId)
        .once("value")
    ).val();

    const companyData = (
      await admin.database().ref("company-details").once("value")
    ).val();

    const vehicleType = (
      await admin
        .database()
        .ref("fleets/" + after.vehicleType)
        .once("value")
    ).val();

    if (
      before.status == TRIP_STATUS_PENDING &&
      after.status == TRIP_STATUS_ACCEPTED
    ) {
      const msgDriver = "Booking Accepted : Trip ID : " + key;
      if (driver.isPhoneVerified) {
        sendSMS("+91" + driver.phoneNumber, "Driver Sms : " + msgDriver);
      }
      if (driverNotification && driverNotification.isPushEnabled) {
        sendMessage(
          driverNotification.pushToken,
          "Booking Accepted",
          "Driver Notification : " + msgDriver
        );
      }

      const msgPassenger = "Booking Accepted By Driver : Trip ID : " + key;
      const msg1Passenger = "OTP For Ride : " + key + " Is " + after.otp;
      if (passenger.isPhoneVerified) {
        sendSMS(
          "+91" + passenger.phoneNumber,
          "Passenger Sms : " + msgPassenger
        );
        sendSMS("+91" + passenger.phoneNumber, msg1Passenger);
      }
      if (passengerNotification && passengerNotification.isPushEnabled) {
        sendMessage(
          passengerNotification.pushToken,
          "Booking Accepted",
          "Passenger Notification : " + msgPassenger
        );
      }
      if (after.tripType == 4) {
        sendSMS(
          "+91" + after.deliveryDetails.mobile,
          `Track your delivery on this link https://tracking.warpspeedtaxi.com/#/tripPassenger/${key}`
        );
      }

      let passengerEmergency = (
        await admin
          .database()
          .ref("passenger-emergency/" + passengerId)
          .orderByChild("alwaysShared")
          .equalTo(true)
          .once("value")
      ).val();

      for (const [key1, value] of Object.entries(passengerEmergency)) {
        if (value.mobile && value.alwaysShared) {
          const msg1 =
            "Track My Trip Details Via https://tracking.wrapspeedtaxi.com/#/tripPassenger/" +
            encodeURIComponent(btoa(key));
          sendSMS("+91" + value.mobile, msg1);
        }
      }

      let driverEmergency = (
        await admin
          .database()
          .ref("driver-emergency/" + driverId)
          .orderByChild("alwaysShared")
          .equalTo(true)
          .once("value")
      ).val();

      for (const [key1, value] of Object.entries(driverEmergency)) {
        if (value.mobile && value.alwaysShared) {
          const msg1 =
            "Track My Trip Details Via https://tracking.wrapspeedtaxi.com/#/trip/" +
            encodeURIComponent(btoa(after.tripId));
          sendSMS("+91" + value.mobile, msg1);
        }
      }

      // Send Ride Accepted Email
      let emailHeader = (
        await admin.database().ref("email-templates/header").once("value")
      ).val();

      emailHeader.template = emailHeader.template.replace(
        new RegExp("{date}", "g"),
        moment(after.departDate).format("Do MMM YYYY hh:mm A")
      );
      emailHeader.template = emailHeader.template.replace(
        new RegExp("{companyLogo}", "g"),
        companyData.logo
      );
      emailHeader.template = emailHeader.template.replace(
        new RegExp("{companyName}", "g"),
        companyData.name.toUpperCase()
      );

      let emailBody = (
        await admin.database().ref("email-templates/ride-offer").once("value")
      ).val();

      emailBody.template = emailBody.template.replace(
        new RegExp("{title}", "g"),
        "Ride Accepted"
      );
      emailBody.template = emailBody.template.replace(
        new RegExp("{routeMap}", "g"),
        "https://wrapspeedtaxi.com/public/email_images/map.png"
      );
      emailBody.template = emailBody.template.replace(
        new RegExp("{driverName}", "g"),
        driver.name
      );
      emailBody.template = emailBody.template.replace(
        new RegExp("{driverPic}", "g"),
        driver.profilePic ? driver.profilePic : companyData.logo
      );
      emailBody.template = emailBody.template.replace(
        new RegExp("{fleetType}", "g"),
        vehicleType.name
      );
      emailBody.template = emailBody.template.replace(
        new RegExp("{fleetDetail}", "g"),
        driver.brand + " - " + driver.model
      );
      emailBody.template = emailBody.template.replace(
        new RegExp("{fromAddress}", "g"),
        after.origin.address
      );
      emailBody.template = emailBody.template.replace(
        new RegExp("{toAddress}", "g"),
        after.destination.address
      );
      emailBody.template = emailBody.template.replace(
        new RegExp("{companyWeb}", "g"),
        "https://wrapspeedtaxi.com/"
      );

      let emailFooter = (
        await admin.database().ref("email-templates/footer").once("value")
      ).val();

      let header = ejs.render(emailHeader.template);
      let body = ejs.render(emailBody.template);
      let footer = ejs.render(emailFooter.template);

      let emailData = {
        pageTitle: "Ride Accepted",
        header,
        body,
        footer,
      };

      ejs.renderFile(__dirname + "/email.ejs", emailData, function (err, html) {
        if (err) {
          functions.logger.error(err);
        } else {
          let callBack = function (err1, info) {
            if (err1) {
              functions.logger.error(err1);
            } else {
              functions.logger.info(info);
            }
          };
          sendEmail(
            {
              to: passenger.email,
              bcc: driver.email,
              subject: "Ride Accepted",
              html,
            },
            callBack
          );
        }
      });
      // Send Ride Accepted Email Ends
    } else if (
      after.status == TRIP_STATUS_WAITING &&
      before.status == TRIP_STATUS_ACCEPTED
    ) {
      const msg = "Pick Up Available : Trip ID : " + key;
      if (driver.isPhoneVerified) {
        sendSMS("+91" + driver.phoneNumber, "Driver Sms : " + msg);
      }
      if (driverNotification && driverNotification.isPushEnabled) {
        sendMessage(
          driverNotification.pushToken,
          "Pick Up Available",
          "Driver Notification : " + msg
        );
      }
      const msg1 = "Driver To Be Arrived Shortly : Trip ID : " + key;
      if (passenger.isPhoneVerified) {
        sendSMS("+91" + passenger.phoneNumber, "Passenger Sms : " + msg1);
      }
      if (passengerNotification && passengerNotification.isPushEnabled) {
        sendMessage(
          passengerNotification.pushToken,
          "Driver To Be Arrived Shortly",
          "Passenger Notification : " + msg1
        );
      }

      if (after.tripType == 1) {
        setTimeout(async () => {
          let initialStatus = after.status;
          const record = (
            await admin
              .database()
              .ref("trip-passengers/" + key)
              .once("value")
          ).val();

          if (initialStatus == record.status) {
            await admin
              .database()
              .ref("trip-passengers/" + key)
              .update({
                status: TRIP_STATUS_CANCELED,
                modified: Date.now(),
              });
          }
        }, 600000);
      }
    } else if (
      after.status == TRIP_STATUS_GOING &&
      before.status == TRIP_STATUS_WAITING
    ) {
      const msg = "Destination To Be Arrived Soon : Trip ID : " + key;
      if (driver.isPhoneVerified) {
        sendSMS("+91" + driver.phoneNumber, "Driver Sms : " + msg);
      }
      if (driverNotification && driverNotification.isPushEnabled) {
        sendMessage(
          driverNotification.pushToken,
          "Destination To Be Arrived Soon",
          "Driver Notification : " + msg
        );
      }
      const msg1 = "Destination To Be Arrived Soon : Trip ID : " + key;
      if (passenger.isPhoneVerified) {
        sendSMS("+91" + passenger.phoneNumber, "Passenger Sms : " + msg1);
      }
      if (passengerNotification && passengerNotification.isPushEnabled) {
        sendMessage(
          passengerNotification.pushToken,
          "Destination To Be Arrived Soon",
          "Passenger Notification : " + msg1
        );
      }
    } else if (
      after.status == TRIP_STATUS_FINISHED &&
      before.status == TRIP_STATUS_GOING
    ) {
      admin
        .database()
        .ref("trip-passengers")
        .orderByChild("driverId")
        .equalTo(after.driverId)
        .once("value", function (snap) {
          var stars = 0;
          var count = 0;
          if (snap != null) {
            snap.forEach(function (trip) {
              if (
                trip.val().passengerRating &&
                trip.val().passengerRating.rating != null
              ) {
                stars += parseInt(trip.val().passengerRating.rating);
                count++;
              }
            });
            var rating = stars / count;
            console.log("Rating:" + rating);

            if (!isNaN(rating)) {
              admin
                .database()
                .ref("drivers/" + original.driverId)
                .update({ rating: rating.toFixed(1) });
            } else {
              admin
                .database()
                .ref("drivers/" + original.driverId)
                .update({ rating: 0 });
            }
          }
        });

      const msg = "Destination Arrived. Trip Ended : Trip ID : " + key;

      if (driver.isPhoneVerified) {
        sendSMS("+91" + driver.phoneNumber, "Driver Sms : " + msg);
      }
      if (driverNotification && driverNotification.isPushEnabled) {
        sendMessage(
          driverNotification.pushToken,
          "Destination Arrived",
          "Driver Notification : " + msg
        );
      }

      if (passenger.isPhoneVerified) {
        sendSMS("+91" + passenger.phoneNumber, "Passenger Sms : " + msg);
      }

      if (passengerNotification && passengerNotification.isPushEnabled) {
        sendMessage(
          passengerNotification.pushToken,
          "Destination Arrived",
          "Passenger Notification : " + msg
        );
      }

      const businessData = (
        await admin.database().ref("business-management").once("value")
      ).val();

      const companyData = (
        await admin.database().ref("company-details").once("value")
      ).val();

      const vehicleType = (
        await admin
          .database()
          .ref("fleets/" + after.vehicleType)
          .once("value")
      ).val();

      let splitPayments = [];
      let amount = after.fareDetails.finalFare;
      if (after.waitingCharges) amount += after.waitingCharges;
      let finalFare = amount;
      const splits = (
        await admin
          .database()
          .ref("trip-split-payment/" + key)
          .once("value")
      ).val();
      if (splits != null) {
        for (const [key, value] of Object.entries(splits)) {
          splitPayments.push(value);
        }
        splitPayments = splitPayments.reverse();
      }

      amount = amount / (splitPayments.length + 1);

      // Header Fixed
      let emailHeader = (
        await admin.database().ref("email-templates/header").once("value")
      ).val();
      emailHeader.template = emailHeader.template.replace(
        new RegExp("{date}", "g"),
        moment(new Date(after.pickedUpAt)).format("Do MMMM YYYY")
      );
      emailHeader.template = emailHeader.template.replace(
        new RegExp("{companyLogo}", "g"),
        companyData.logo
      );
      emailHeader.template = emailHeader.template.replace(
        new RegExp("{companyName}", "g"),
        companyData.name.toUpperCase()
      );
      // Header Fixed

      // Split Payment Rows
      let splitRows = "";
      splitPayments.forEach(async (splitPayment) => {
        let splitBody = (
          await admin
            .database()
            .ref("email-templates/invoice-split-payment-row")
            .once("value")
        ).val();
        splitBody.template = splitBody.template.replace(
          new RegExp("{name}", "g"),
          splitPayment.name
        );
        splitBody.template = splitBody.template.replace(
          new RegExp("{phoneNumber}", "g"),
          splitPayment.mobile
        );
        splitBody.template = splitBody.template.replace(
          new RegExp("{currency}", "g"),
          businessData.currency
        );
        splitBody.template = splitBody.template.replace(
          new RegExp("{splittedAmount}", "g"),
          amount.toFixed(2)
        );
        splitRows += splitBody.template;
      });
      // Ends Split Payment Rows

      let emailBody = (
        await admin.database().ref("email-templates/invoice").once("value")
      ).val();

      emailBody.template = emailBody.template.replace(
        new RegExp("{currency}", "g"),
        businessData.currency
      );

      emailBody.template = emailBody.template.replace(
        new RegExp("{finalFare}", "g"),
        finalFare.toFixed(2)
      );

      emailBody.template = emailBody.template.replace(
        new RegExp("{tripId}", "g"),
        key
      );

      emailBody.template = emailBody.template.replace(
        new RegExp("{riderName}", "g"),
        passenger.name
      );

      emailBody.template = emailBody.template.replace(
        new RegExp("{riderNumber}", "g"),
        passenger.phoneNumber
      );

      emailBody.template = emailBody.template.replace(
        new RegExp("{routeMap}", "g"),
        "https://wrapspeedtaxi.com/public/email_images/map.png"
      );

      emailBody.template = emailBody.template.replace(
        new RegExp("{driverProfilePic}", "g"),
        driver.profilePic ? driver.profilePic : companyData.logo
      );

      emailBody.template = emailBody.template.replace(
        new RegExp("{driverName}", "g"),
        driver.name
      );

      emailBody.template = emailBody.template.replace(
        new RegExp("{fleetType}", "g"),
        vehicleType.name
      );

      emailBody.template = emailBody.template.replace(
        new RegExp("{fleetDetail}", "g"),
        driver.brand + " - " + driver.model
      );

      emailBody.template = emailBody.template.replace(
        new RegExp("{fromTime}", "g"),
        moment(new Date(after.pickedUpAt)).format("hh:mm A")
      );

      emailBody.template = emailBody.template.replace(
        new RegExp("{fromAddress}", "g"),
        after.origin.address
      );

      emailBody.template = emailBody.template.replace(
        new RegExp("{endTime}", "g"),
        moment(new Date(after.droppedOffAt)).format("hh:mm A")
      );

      emailBody.template = emailBody.template.replace(
        new RegExp("{toAddress}", "g"),
        after.destination.address
      );

      emailBody.template = emailBody.template.replace(
        new RegExp("{baseFare}", "g"),
        after.fareDetails.baseFare.toFixed(2)
      );

      emailBody.template = emailBody.template.replace(
        new RegExp("{taxFare}", "g"),
        after.fareDetails.tax.toFixed(2)
      );

      emailBody.template = emailBody.template.replace(
        new RegExp("{paidBy}", "g"),
        after.paymentMethod
      );

      emailBody.template = emailBody.template.replace(
        new RegExp("{splittedAmount}", "g"),
        amount.toFixed(2)
      );

      if (after.paymentMethod == "cash") {
        emailBody.template = emailBody.template.replace(
          new RegExp("{paidByImage}", "g"),
          "https://wrapspeedtaxi.com/public/email_images/cash.png"
        );
      } else if (after.paymentMethod == "wallet") {
        emailBody.template = emailBody.template.replace(
          new RegExp("{paidByImage}", "g"),
          "https://wrapspeedtaxi.com/public/email_images/wallet.png"
        );
      } else {
        emailBody.template = emailBody.template.replace(
          new RegExp("{paidByImage}", "g"),
          "https://wrapspeedtaxi.com/public/email_images/card.png"
        );
      }

      emailBody.template = emailBody.template.replace(
        new RegExp("{splitRows}", "g"),
        splitRows
      );

      emailBody.template = emailBody.template.replace(
        new RegExp("{companyWeb}", "g"),
        "https://wrapspeedtaxi.com/"
      );

      let emailFooter = (
        await admin.database().ref("email-templates/footer").once("value")
      ).val();

      let header = ejs.render(emailHeader.template);
      let body = ejs.render(emailBody.template);
      let footer = ejs.render(emailFooter.template);

      let emailData = {
        pageTitle: "Invoice For Trip : #" + key,
        header,
        body,
        footer,
      };

      ejs.renderFile(
        __dirname + "/email.ejs",
        emailData,
        async function (err, html) {
          if (err) {
            functions.logger.error(err);
          } else {
            functions.logger.log("INVOICE HTML", html);
            let callBack = function (err1, info) {
              if (err1) {
                functions.logger.error(err1);
                mailer.close();
              } else {
                functions.logger.info(info);
                mailer.close();
              }
            };
            admin
              .database()
              .ref("trip-passengers/" + key)
              .update({
                invoiceTemplate: html,
              });
            sendEmail(
              {
                to: passenger.email,
                bcc: driver.email,
                subject: "Invoice For Trip : #" + key,
                html,
              },
              callBack
            );
          }
        }
      );

      if (after.paymentMethod != "cash") {
        let walletDetails = (
          await admin
            .database()
            .ref("driver-wallets/" + driverId)
            .once("value")
        ).val();
        let balance = 0;
        if (walletDetails && walletDetails.balance) {
          balance = walletDetails.balance;
        }
        balance += after.fareDetails.commission;
        admin
          .database()
          .ref("driver-wallets/" + driverId)
          .update({ balance: parseFloat(balance) });
        admin
          .database()
          .ref("payment-transactions/wallet")
          .push({
            amount: parseFloat(after.fareDetails.commission.toFixed(2)),
            description: "Cashless Ride Completed",
            driver_id: driverId,
            driver_email: driver.email,
            type: 1,
            created: Date.now(),
          });
        admin
          .database()
          .ref("earnings/trips")
          .push({
            driverId: driverId,
            driverName: driver.name,
            description: "Cashless ride earning",
            amount: parseFloat(
              (after.fareDetails.baseFare + after.waitingCharges).toFixed(2)
            ),
            finalFare: parseFloat(after.fareDetails.finalFare.toFixed(2)),
            amountToDeposit: parseFloat(
              (
                after.fareDetails.commission +
                after.fareDetails.tax +
                after.fareDetails.donationAdmin +
                after.fareDetails.rideInsurance
              ).toFixed(2)
            ),
            tax: parseFloat(after.fareDetails.tax.toFixed(2)),
            commission: parseFloat(after.fareDetails.commission.toFixed(2)),
            waitingCharges: parseFloat(after.waitingCharges.toFixed(2)),
            rideInsurance: parseFloat(
              after.fareDetails.waitingCharges.toFixed(2)
            ),
            donationAdmin: parseFloat(
              after.fareDetails.donationAdmin.toFixed(2)
            ),
            created: Date.now(),
            earningType: "TRIP",
            tripId: key,
            tripType: "CASHLESS",
            vehicleType: after.vehicleType,
          });
      } else {
        let walletDetails = (
          await admin
            .database()
            .ref("driver-wallets/" + driverId)
            .once("value")
        ).val();
        let balance = 0;
        if (walletDetails && walletDetails.balance) {
          balance = walletDetails.balance;
        }

        balance -= finalFare - after.fareDetails.commission;

        admin
          .database()
          .ref("driver-wallets/" + driverId)
          .update({ balance: parseFloat(balance) });
        admin
          .database()
          .ref("payment-transactions/wallet")
          .push({
            amount: parseFloat(
              (finalFare - after.fareDetails.commission).toFixed(2)
            ),
            description: "Cash Ride Completed",
            driver_id: driverId,
            driver_email: driver.email,
            type: 0,
            created: Date.now(),
          });
        admin
          .database()
          .ref("earnings/trips")
          .push({
            driverId: driverId,
            driverName: driver.name,
            description: "Cash ride earning",
            finalFare: parseFloat(after.fareDetails.finalFare.toFixed(2)),
            amount: parseFloat(
              (after.fareDetails.baseFare + after.waitingCharges).toFixed(2)
            ),
            amountToDeposit: parseFloat(
              (
                after.fareDetails.commission +
                after.fareDetails.tax +
                after.fareDetails.donationAdmin +
                after.fareDetails.rideInsurance
              ).toFixed(2)
            ),
            tax: parseFloat(after.fareDetails.tax.toFixed(2)),
            commission: parseFloat(after.fareDetails.commission.toFixed(2)),
            waitingCharges: parseFloat(after.waitingCharges.toFixed(2)),
            rideInsurance: parseFloat(
              after.fareDetails.rideInsurance.toFixed(2)
            ),
            donationAdmin: parseFloat(
              after.fareDetails.donationAdmin.toFixed(2)
            ),
            created: Date.now(),
            earningType: "TRIP",
            tripId: key,
            tripType: "CASH",
            vehicleType: after.vehicleType,
          });
      }
    } else if (after.status == TRIP_STATUS_CANCELED) {
      const msg = "The Trip Got Canceled. Trip ID : " + key;
      if (driver.isPhoneVerified) {
        sendSMS("+91" + driver.phoneNumber, "Driver SMS" + msg);
      }
      if (driverNotification && driverNotification.isPushEnabled) {
        sendMessage(
          driverNotification.pushToken,
          "Trip Canceled",
          "Driver Notification" + msg
        );
      }
      if (passenger.isPhoneVerified) {
        sendSMS("+91" + passenger.phoneNumber, "Passenger SMS" + msg);
      }
      if (passengerNotification && passengerNotification.isPushEnabled) {
        sendMessage(
          passengerNotification.pushToken,
          "Trip Canceled",
          "Passenger Notification" + msg
        );
      }

      // Cancelled Trip Mail
      const companyData = (
        await admin.database().ref("company-details").once("value")
      ).val();

      const vehicleType = (
        await admin
          .database()
          .ref("fleets/" + after.vehicleType)
          .once("value")
      ).val();

      let emailHeader = (
        await admin.database().ref("email-templates/header").once("value")
      ).val();

      emailHeader.template = emailHeader.template.replace(
        new RegExp("{date}", "g"),
        moment(after.departDate).format("Do MMM YYYY hh:mm A")
      );
      emailHeader.template = emailHeader.template.replace(
        new RegExp("{companyLogo}", "g"),
        companyData.logo
      );
      emailHeader.template = emailHeader.template.replace(
        new RegExp("{companyName}", "g"),
        companyData.name.toUpperCase()
      );

      let emailBody = (
        await admin.database().ref("email-templates/ride-offer").once("value")
      ).val();

      emailBody.template = emailBody.template.replace(
        new RegExp("{title}", "g"),
        "Ride Cancelled"
      );
      emailBody.template = emailBody.template.replace(
        new RegExp("{routeMap}", "g"),
        "https://wrapspeedtaxi.com/public/email_images/map.png"
      );
      emailBody.template = emailBody.template.replace(
        new RegExp("{driverName}", "g"),
        driver.name
      );
      emailBody.template = emailBody.template.replace(
        new RegExp("{driverPic}", "g"),
        driver.profilePic ? driver.profilePic : companyData.logo
      );
      emailBody.template = emailBody.template.replace(
        new RegExp("{fleetType}", "g"),
        vehicleType.name
      );
      emailBody.template = emailBody.template.replace(
        new RegExp("{fleetDetail}", "g"),
        driver.brand + " - " + driver.model
      );
      emailBody.template = emailBody.template.replace(
        new RegExp("{fromAddress}", "g"),
        after.origin.address
      );
      emailBody.template = emailBody.template.replace(
        new RegExp("{toAddress}", "g"),
        after.destination.address
      );
      emailBody.template = emailBody.template.replace(
        new RegExp("{companyWeb}", "g"),
        "https://wrapspeedtaxi.com/"
      );

      let emailFooter = (
        await admin.database().ref("email-templates/footer").once("value")
      ).val();

      let header = ejs.render(emailHeader.template);
      let body = ejs.render(emailBody.template);
      let footer = ejs.render(emailFooter.template);

      let emailData = {
        pageTitle: "Ride Cancelled",
        header,
        body,
        footer,
      };

      ejs.renderFile(__dirname + "/email.ejs", emailData, function (err, html) {
        if (err) {
          functions.logger.error(err);
        } else {
          let callBack = function (err1, info) {
            if (err1) {
              functions.logger.error(err1);
            } else {
              functions.logger.info(info);
            }
          };
          sendEmail(
            {
              to: passenger.email,
              bcc: driver.email,
              subject: "Ride Cancelled",
              html,
            },
            callBack
          );
        }
      });
      // Cancelled Trip Mail Ends
    }
  });

exports.tripPassengerSharingUpdateTrigger = functions.database
  .ref("trip-passengers/{tripPassengerId}")
  .onUpdate(async function (snapshot, context) {
    const before = snapshot.before.val();
    const after = snapshot.after.val();
    const driverLocation = (
      await admin
        .database()
        .ref("driver-locations/" + after.driverId)
        .once("value")
    ).val();

    const tripData = (
      await admin
        .database()
        .ref("trips/" + after.tripId)
        .once("value")
    ).val();

    if (after.status != before.status) {
      let trips = [];
      admin
        .database()
        .ref("trip-passengers")
        .orderByChild("tripId")
        .equalTo(after.tripId)
        .once("value", function (snaps) {
          if (snaps) {
            snaps.forEach(function (snap) {
              let trip = { key: snap.key, ...snap.val() };
              if (trip.status == TRIP_STATUS_ACCEPTED) {
                trips.push({
                  key: trip.key,
                  seats: trip.seats,
                  distance:
                    calcCrow(
                      driverLocation.lat,
                      driverLocation.lng,
                      trip.origin.lat,
                      trip.origin.lon
                    ) + trip.distance.distance,
                });
              } else if (trip.status == TRIP_STATUS_WAITING) {
                trips.push({
                  key: trip.key,
                  seats: trip.seats,
                  distance: calcCrow(
                    driverLocation.lat,
                    driverLocation.lng,
                    trip.origin.lat,
                    trip.origin.lon
                  ),
                });
              } else if (trip.status == TRIP_STATUS_GOING) {
                trips.push({
                  key: trip.key,
                  seats: trip.seats,
                  distance: calcCrow(
                    driverLocation.lat,
                    driverLocation.lng,
                    trip.destination.lat,
                    trip.destination.lon
                  ),
                });
              }
            });
            if (trips.length > 0) {
              trips = trips.sort((a, b) => a.distance - b.distance);
              let seatsOccupied = 0;
              trips.forEach(function (trip) {
                seatsOccupied += trip.seats;
              });
              let seats = tripData.totalSeats - seatsOccupied;
              admin
                .database()
                .ref("trips/" + after.tripId)
                .update({ isCurrent: trips[0].key, availableSeats: seats });
            } else {
              admin
                .database()
                .ref("trips/" + after.tripId)
                .update({ status: TRIP_STATUS_FINISHED });
            }
          } else {
            admin
              .database()
              .ref("trips/" + after.tripId)
              .update({ status: TRIP_STATUS_FINISHED });
          }
        });
    }
  });

exports.dirverUpdateTrigger = functions.database
  .ref("driver/{id}")
  .onCreate(async function (snapshot, context) {
    const id = context.params.id;
    const original = snapshot.val();
    let type = original.driverId ? "drivers" : "passengers";
    let userId = original.driverId ? original.driverId : original.passengerId;
    const user = (
      await admin
        .database()
        .ref(type + "/" + userId)
        .once("value")
    ).val();
    const admins = await admin
      .database()
      .ref("admins")
      .orderByChild("role_id")
      .equalTo("0")
      .limitToFirst(1)
      .once("value");
    let adminData = {};
    for (const [key, value] of Object.entries(admins)) {
      adminData = value;
    }
    functions.logger.info(adminData);
    const companyData = (
      await admin.database().ref("company-details").once("value")
    ).val();

    let emailHeader = (
      await admin.database().ref("email-templates/header").once("value")
    ).val();

    emailHeader.template = emailHeader.template.replace(
      new RegExp("{date}", "g"),
      moment().format("Do MMM YYYY hh:mm A")
    );
    emailHeader.template = emailHeader.template.replace(
      new RegExp("{companyLogo}", "g"),
      companyData.logo
    );
    emailHeader.template = emailHeader.template.replace(
      new RegExp("{companyName}", "g"),
      companyData.name.toUpperCase()
    );

    let emailBody = (
      await admin.database().ref("email-templates/new-complaint").once("value")
    ).val();
    emailBody.template = emailBody.template.replace(
      new RegExp("{title}", "g"),
      "Complaint Registered"
    );
    let content = "Complaint Registered By ";
    content += original.driverId ? "Driver : " : "Passenger : ";
    content += user.name.toUpperCase() + "<br/>";
    content += "<b>Subject Of Complaint</b> : " + original.subject;
    emailBody.template = emailBody.template.replace(
      new RegExp("{content}", "g"),
      content
    );
    emailBody.template = emailBody.template.replace(
      new RegExp("{companyWeb}", "g"),
      "https://wrapspeedtaxi.com/"
    );
    let emailFooter = (
      await admin.database().ref("email-templates/footer").once("value")
    ).val();

    let header = ejs.render(emailHeader.template);
    let body = ejs.render(emailBody.template);
    let footer = ejs.render(emailFooter.template);

    let emailData = {
      pageTitle: "Complaint Registered",
      header,
      body,
      footer,
    };

    ejs.renderFile(__dirname + "/email.ejs", emailData, function (err, html) {
      if (err) {
        functions.logger.error(err);
      } else {
        let callBack = function (err1, info) {
          if (err1) {
            functions.logger.error(err1);
          } else {
            functions.logger.info(info);
          }
        };
        sendEmail(
          {
            to: user.email,
            bcc: adminData.email,
            subject: "Complaint Registered",
            html,
          },
          callBack
        );
      }
    });
  });

exports.highDemandAreaNotificationUpdateTrigger = functions.database
  .ref("high-demand-areas/{id}")
  .onUpdate(function (snapshot, context) {
    const areaId = context.params.id;
    const area = snapshot.after.val();
    if (area.sendNotification && area.active) {
      admin
        .database()
        .ref("drivers")
        .once("value", async function (snapshot) {
          drivers = snapshot.val();
          for (const [driverKey, driversData] of Object.entries(drivers)) {
            const driverNotification = (
              await admin
                .database()
                .ref("driver-push-notifications/" + driverKey)
                .once("value")
            ).val();
            const msgDriver = `${area.address} is notified as a high demand area!`;
            if (driversData.alwaysOn) {
              if (driverNotification.isPushEnabled) {
                sendMessage(
                  driverNotification.pushToken,
                  "High Demand Alert!",
                  "Driver Notification: " + msgDriver
                );
              }
            }
          }
          admin
            .database()
            .ref("high-demand-areas/" + areaId)
            .update({ sendNotification: false });
        });
    }
  });

exports.highDemandAreaNotificationCreateTrigger = functions.database
  .ref("high-demand-areas/{id}")
  .onCreate(function (snapshot, context) {
    const areaId = context.params.id;
    const area = snapshot.val();
    if (area.sendNotification) {
      admin
        .database()
        .ref("drivers")
        .once("value", async function (snapshot) {
          drivers = snapshot.val();
          for (const [driverKey, driversData] of Object.entries(drivers)) {
            const driverNotification = (
              await admin
                .database()
                .ref("driver-push-notifications/" + driverKey)
                .once("value")
            ).val();
            const msgDriver = `${area.address} is notified as a high demand area!`;
            if (driversData.alwaysOn) {
              if (driverNotification.isPushEnabled) {
                sendMessage(
                  driverNotification.pushToken,
                  "High Demand Alert!",
                  "Driver Notification: " + msgDriver
                );
              }
            }
          }
          admin
            .database()
            .ref("high-demand-areas/" + areaId)
            .update({ sendNotification: false });
        });
    }
  });

exports.onDriverLocationDelete = functions.database
  .ref("driver-locations/{id}")
  .onDelete(async function (change, context) {
    const id = context.params.id;
    const deletedLocation = change._data;
    const driver = (
      await admin
        .database()
        .ref("drivers/" + id)
        .once("value")
    ).val();
    const duration = moment.duration(
      moment(deletedLocation.last_active).diff(
        moment(deletedLocation.first_active)
      )
    );
    let onlineTime = 0;
    if (driver.hasOwnProperty("onlineHours")) {
      onlineTime = Number(driver.onlineHours) + Number(duration);
    } else {
      onlineTime = Number(duration);
    }
    admin
      .database()
      .ref("drivers/" + id)
      .update({
        onlineHours: onlineTime,
      });
    admin.database().ref(`driver-login-history/${id}`).push({
      action: 0,
      description: "Logged Out",
      created: Date.now(),
      driverId: id,
      driverName: deletedLocation.name,
      lat: deletedLocation.lat,
      lng: deletedLocation.lng,
      workTiming: deletedLocation.workTiming,
      vehicleType: deletedLocation.vehicleType,
    });
  });

exports.onDriverLocationCreate = functions.database
  .ref("driver-locations/{id}")
  .onCreate(function (snapshot, context) {
    const driverId = context.params.id;
    const location = snapshot.val();
    admin.database().ref(`driver-login-history/${driverId}`).push({
      action: 1,
      description: "Logged In",
      created: Date.now(),
      driverId,
      driverName: location.name,
      lat: location.lat,
      lng: location.lng,
      workTiming: location.workTiming,
      vehicleType: location.vehicleType,
    });
  });

exports.onDriverLocationUpdate = functions.database
  .ref("driver-locations/{id}")
  .onUpdate(async function (snapshot, context) {
    const id = context.params.id;
    const before = snapshot.before.val();
    const after = snapshot.after.val();
    let todayOnlineTime = 0;
    const duration = moment
      .duration(moment(after.last_active).diff(moment(before.last_active)))
      .asMilliseconds();
    const driverLogins = (
      await admin
        .database()
        .ref(`drivers-logins/${id}/${moment().format("DD-MM-YYYY")}`)
        .once("value")
    ).val();
    functions.logger.log(
      "driverLogins",
      moment().format("DD-MM-YYYY-HH-mm-ss"),
      driverLogins
    );
    if (driverLogins) {
      if (driverLogins.hasOwnProperty("onlineHours")) {
        todayOnlineTime = Number(driverLogins.onlineHours) + Number(duration);
      } else {
        todayOnlineTime = Number(duration);
      }
      admin
        .database()
        .ref(`drivers-logins/${id}/${moment().format("DD-MM-YYYY")}`)
        .update({
          onlineHours: todayOnlineTime,
          lastUpdated: Date.now(),
          driverId: id,
          driverName: after.name,
        });
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      admin
        .database()
        .ref(`drivers-logins/${id}/${moment().format("DD-MM-YYYY")}`)
        .update({
          onlineHours: duration,
          lastUpdated: today.getTime(),
          driverId: id,
          driverName: after.name,
        });
    }
  });

// exports.driverBookingLogCreateTrigger = functions.database
//   .ref("driver-booking-log/{driverId}/{date}")
//   .onCreate(async function (snapshot, context) {
//     const log = snapshot.val();
//     const driverId = context.params.driverId;
//     const date = context.params.date;
//     functions.logger.log("log", log);
//     functions.logger.log("driverId", driverId);
//     functions.logger.log("date", date);
//     admin
//       .database()
//       .ref("rewards")
//       .once("value", async function (snapshot) {
//         const rewards = snapshot.val();
//         for (const [rewardKey, rewardData] of Object.entries(rewards)) {
//           if (
//             log.bookingCount >= rewardData.minBooking &&
//             log.bookingCount <= rewardData.maxBooking
//           ) {
//             const walletDetails = (
//               await admin
//                 .database()
//                 .ref("driver-wallets/" + driverId)
//                 .once("value")
//             ).val();
//             admin
//               .database()
//               .ref("driver-wallets/" + driverId)
//               .update({
//                 balance: walletDetails.balance + rewardData.reward,
//               });
//             admin.database().ref("payment-transactions/wallet").push({
//               admin_id: null,
//               type: 1,
//               driver_id: driverId,
//               amount: rewardData.reward,
//               description: "Rewarded for ride counts today",
//               created: Date.now(),
//               tripId: null,
//               transactionType: "INCENTIVE",
//               isReward: true,
//             });
//             admin.database().ref("earnings/incentives").push({
//               driverId: driverId,
//               amount: rewardData.reward,
//               description: "Rewarded for ride counts today",
//               created: Date.now(),
//               earningType: "INCENTIVE",
//               isReward: true,
//             });
//           }
//         }
//       });
//   });

exports.driverBookingLogUpdateTrigger = functions.database
  .ref("driver-booking-log/{driverId}/{date}")
  .onUpdate(async function (snapshot, context) {
    const log = snapshot.after.val();
    const driverId = context.params.driverId;
    const date = context.params.date;
    functions.logger.log("log", log);
    functions.logger.log("driverId", driverId);
    functions.logger.log("date", date);
    admin
      .database()
      .ref("rewards")
      .once("value", async function (snapshot) {
        const rewards = snapshot.val();
        for (const [rewardKey, rewardData] of Object.entries(rewards)) {
          if (
            log.bookingCount >= rewardData.minBooking &&
            log.bookingCount <= rewardData.maxBooking
          ) {
            const walletDetails = (
              await admin
                .database()
                .ref("driver-wallets/" + driverId)
                .once("value")
            ).val();
            admin
              .database()
              .ref("driver-wallets/" + driverId)
              .update({
                balance: walletDetails.balance + rewardData.reward,
              });
            admin.database().ref("payment-transactions/wallet").push({
              admin_id: null,
              type: 1,
              driver_id: driverId,
              amount: rewardData.reward,
              description: "Rewarded for ride counts today",
              created: Date.now(),
              tripId: null,
              transactionType: "INCENTIVE",
              isReward: true,
            });
            admin.database().ref("earnings/incentives").push({
              driverId: driverId,
              amount: rewardData.reward,
              description: "Rewarded for ride counts today",
              created: Date.now(),
              earningType: "INCENTIVE",
              isReward: true,
            });
          }
        }
      });
  });

/************************************End Live DB Functions*************************************************/
/************************************Testing DB Functions*************************************************/
/************************************End Testing Functions*************************************************/
