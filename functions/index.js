const functions = require("firebase-functions");
const admin = require("firebase-admin");
const stripe = require("stripe")("sk_test_oyluHsmvwh807tGsVw8ristF");
// const moment = require("moment");
const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Kolkata");
const nodemailer = require("nodemailer");
const ejs = require("ejs");
const { firebaseConfig } = require("firebase-functions");
const cors = require("cors")({
  origin: true,
});
const mailingDetails = {
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: "patrickphp2@gmail.com",
    pass: "Informatics@123",
  },
};

const testAccountSid = "AC02867768a4ff76032b4c45ed8c7c8b46";
const testAuthToken = "0d292a1bd4bb7ff9be50704ba4ea9e35";
const liveAccountSid = "AC0aab684fa3476ca118cc1390759fd6d2";
const liveAuthToken = "b7c788365cf1387b0ee67f0d1d9d5993";

const twilioNumber = "+12029534688";
const twilioService = "VAc000c44d7d97e4ec29ab055936655883";

const client = require("twilio")(liveAccountSid, liveAuthToken);

const TRIP_STATUS_WAITING = "waiting";
const TRIP_STATUS_GOING = "going";
const TRIP_STATUS_FINISHED = "finished";
const TRIP_STATUS_CANCELED = "canceled";
const PAYMENT_METHOD_CARD = "card";

admin.initializeApp();

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
          "notification_foreground": "true",
        }
      })
      .then((data) => {
        functions.logger.info(data)
        return true;
      })
      .catch((err) => {
        functions.logger.info(err)
        return false;
      });
  }
}

function sendSMS(to, mesage) {
  client.messages
    .create({
      body: mesage,
      from: twilioNumber,
      to: to,
    })
    .then((message) => {
      functions.logger.info(message.sid);
    })
    .catch((err) => functions.logger.error(err));
}

exports.deleteRider = functions.database
  .ref("/passengers/{id}")
  .onDelete(async function (change, context) {
    const id = context.params.id;
    await admin.database().ref("passenger-wallets/" + id).remove();
    await admin.database().ref("passenger-push-notifications/" + id).remove();
    await admin.database().ref("passenger-corporates/" + id).remove();
    await admin.database().ref("passenger-insurances/" + id).remove();
    await admin.database().ref("passenger-admin-donations/" + id).remove();
    await admin.database().ref("passenger-addresses/" + id).remove();
    await admin.database().ref("passenger-cards/" + id).remove();
    await admin.database().ref("passenger-emergency/" + id).remove();
    await admin.database().ref("passenger-subscriptions/" + id).remove();
    await admin.auth().deleteUser(id);
  });

exports.deleteDriver = functions.database
  .ref("/drivers/{id}")
  .onDelete(async function (change, context) {
    const id = context.params.id;
    await admin.database().ref("driver-wallets/" + id).remove();
    await admin.database().ref("driver-push-notifications/" + id).remove();
    await admin.database().ref("driver-cards/" + id).remove();
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
  .ref("/admins/{id}")
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
  .ref("/admins/{id}")
  .onCreate(function (snapshot, context) {
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
  });

exports.updateAdmin = functions.database
  .ref("/admins/{id}")
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
  .ref("/drivers/{id}")
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
  });

exports.updateDriver = functions.database
  .ref("/drivers/{id}")
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
    }
    if (after.password && !user.passwordHash) {
      updateData.password = after.password;
      updateCheck = true;
    }
    if (after.isEmailVerified && !user.emailVerified) {
      updateData.emailVerified = true;
      updateCheck = true;
    }
    if (updateCheck) {
      admin
        .auth()
        .updateUser(key, updateData)
        .then(() => {
          functions.logger.info("Updated: " + key);
          if (after.password) {
            admin
              .database()
              .ref("drivers/" + key + "/password")
              .remove();
          }
        })
        .catch((err) => {
          functions.logger.info(err);
        });
    }
  });

exports.createPassenger = functions.database
  .ref("/passengers/{id}")
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
  });

exports.updatePassenger = functions.database
  .ref("/passengers/{id}")
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
    }
    if (after.password && !user.passwordHash) {
      updateData.password = after.password;
      updateCheck = true;
    }
    if (after.isEmailVerified && !user.emailVerified) {
      updateData.emailVerified = true;
      updateCheck = true;
    }
    if (updateCheck) {
      admin
        .auth()
        .updateUser(key, updateData)
        .then(() => {
          functions.logger.info("Updated: " + key);
          if (after.password) {
            admin
              .database()
              .ref("passengers/" + key + "/password")
              .remove();
          }
        })
        .catch((err) => {
          functions.logger.info(err);
        });
    }
  });

exports.makeReport = functions.database
  .ref("/trips/{tripId}")
  .onWrite(function (change, context) {
    if (!change.before.val()) {
      return false;
    }

    const original = change.after.val();
    const oldStatus = change.before.child("status").val();
    const tripId = context.params.tripId;

    if (
      oldStatus == TRIP_STATUS_WAITING &&
      original.status == TRIP_STATUS_GOING
    ) {
      var fee = parseFloat(original.fee).toFixed(2);

      // process payment
      if (original.paymentMethod == PAYMENT_METHOD_CARD) {
        // update driver balance
        admin
          .database()
          .ref("driver-wallets/" + original.driverId + "/balance")
          .once("value")
          .then(function (snapshot) {
            if (snapshot != null && snapshot != undefined && snapshot != NaN) {
              var snapshotVal = snapshot.val() ? parseFloat(snapshot.val()) : 0;
              var total =
                parseFloat(snapshotVal) + parseFloat(original.commission);
              var tmptotal = parseFloat(total.toFixed(2));
              admin
                .database()
                .ref("driver-wallets/" + original.driverId + "/balance")
                .set(tmptotal);
            }
          });

        // // format currency
        // if (original.currency == "$") {
        //   const currency = "usd";
        //   admin
        //     .database()
        //     .ref("passengers/" + original.passengerId + "/card")
        //     .once("value")
        //     .then(function (snapshot) {
        //       stripe.charges.create(
        //         {
        //           amount: parseInt(fee * 100),
        //           currency: currency,
        //           source: snapshot.val().token,
        //           description: "Charge for tripId: " + context.params.tripId,
        //         },
        //         { idempotency_key: context.params.tripId },
        //         function (err, charge) {
        //           console.log(err);
        //           console.log(charge);
        //           if (err == null) {
        //             console.log("STRIPE CHARGED:" + fee);
        //             admin
        //               .database()
        //               .ref("trips/" + tripId)
        //               .update({
        //                 paymentStatus: "success",
        //                 paymentId: charge.id,
        //               });
        //           } else {
        //             console.log("STRIPE CHARGED FAILED:" + fee);
        //             admin
        //               .database()
        //               .ref("trips/" + tripId)
        //               .update({
        //                 paymentStatus: "failed",
        //               });
        //           }
        //         }
        //       );
        //     });
        // } else {
        //   console.log("Currency " + original.currency + " is not supported");
        // }
      }
    }

    // Apply Rating After Trip completion

    if (
      original.status == TRIP_STATUS_FINISHED &&
      oldStatus == TRIP_STATUS_GOING
    ) {
      admin
        .database()
        .ref("/trips")
        .orderByChild("driverId")
        .equalTo(original.driverId)
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
                .ref("/drivers/" + original.driverId)
                .update({ rating: rating.toFixed(1) });
            } else {
              admin
                .database()
                .ref("/drivers/" + original.driverId)
                .update({ rating: 0 });
            }
          }
        });

      return true;
    } else {
      return false;
    }
  });

exports.tripCreateTrigger = functions.database
  .ref("/trips/{tripId}")
  .onCreate(function (snapshot, context) {
    const key = context.params.tripId;
    const original = snapshot.val();
    const driverId = original.driverId;
    const passengerId = original.passengerId;

    admin
      .database()
      .ref("drivers/" + driverId)
      .once("value", function (snapshot) {
        const driver = snapshot.val();
        const msg = "Booking Accepted : Trip ID : " + key;
        if (driver.isPhoneVerified) {
          sendSMS("+91" + driver.phoneNumber, "Driver Sms : " + msg);
        }
        if (driver.isPushEnabled) {
          sendMessage(
            driver.pushToken,
            "Booking Accepted",
            "Driver Notification : " + msg
          );
        }
      });
    admin
      .database()
      .ref("passengers/" + passengerId)
      .once("value", function (snapshot) {
        const passenger = snapshot.val();
        const msg = "Booking Accepted By Driver : Trip ID : " + key;
        const msg1 = "OTP For Ride : " + key + " Is " + original.otp;
        if (passenger.isPhoneVerified) {
          sendSMS("+91" + passenger.phoneNumber, "Passenger Sms : " + msg);
          sendSMS("+91" + passenger.phoneNumber, msg1);
        }
        if (passenger.isPushEnabled) {
          sendMessage(
            passenger.pushToken,
            "Booking Accepted",
            "Passenger Notification : " + msg
          );
        }
      });
  });

exports.tripUpdateTrigger = functions.database
  .ref("/trips/{tripId}")
  .onUpdate(async function (snapshot, context) {
    const key = context.params.tripId;
    const before = snapshot.before.val();
    const after = snapshot.after.val();
    const driverId = after.driverId;
    const passengerId = after.passengerId;

    if (after.status == TRIP_STATUS_WAITING) {
      admin
        .database()
        .ref("drivers/" + driverId)
        .once("value", function (snapshot) {
          const driver = snapshot.val();
          const msg = "Pick Up Available : Trip ID : " + key;
          if (driver.isPhoneVerified) {
            sendSMS("+91" + driver.phoneNumber, "Driver Sms : " + msg);
          }
          if (driver.isPushEnabled) {
            sendMessage(
              driver.pushToken,
              "Pick Up Available",
              "Driver Notification : " + msg
            );
          }
        });
      admin
        .database()
        .ref("passengers/" + passengerId)
        .once("value", function (snapshot) {
          const passenger = snapshot.val();
          const msg = "Driver To Be Arrived Shortly : Trip ID : " + key;
          if (passenger.isPhoneVerified) {
            sendSMS("+91" + passenger.phoneNumber, "Passenger Sms : " + msg);
          }
          if (passenger.isPushEnabled) {
            sendMessage(
              passenger.pushToken,
              "Driver To Be Arrived Shortly",
              "Passenger Notification : " + msg
            );
          }
        });
    } else if (
      after.status == TRIP_STATUS_GOING &&
      before.status == TRIP_STATUS_WAITING
    ) {
      admin
        .database()
        .ref("drivers/" + driverId)
        .once("value", function (snapshot) {
          const driver = snapshot.val();
          const msg = "Destination To Be Arrived Soon : Trip ID : " + key;
          if (driver.isPhoneVerified) {
            sendSMS("+91" + driver.phoneNumber, "Driver Sms : " + msg);
          }
          if (driver.isPushEnabled) {
            sendMessage(
              driver.pushToken,
              "Destination To Be Arrived Soon",
              "Driver Notification : " + msg
            );
          }
        });
      admin
        .database()
        .ref("passengers/" + passengerId)
        .once("value", function (snapshot) {
          const passenger = snapshot.val();
          const msg = "Destination To Be Arrived Soon : Trip ID : " + key;
          if (passenger.isPhoneVerified) {
            sendSMS("+91" + passenger.phoneNumber, "Passenger Sms : " + msg);
          }
          if (passenger.isPushEnabled) {
            sendMessage(
              passenger.pushToken,
              "Destination To Be Arrived Soon",
              "Passenger Notification : " + msg
            );
          }
        });
    } else if (
      after.status == TRIP_STATUS_FINISHED &&
      before.status == TRIP_STATUS_GOING
    ) {
      const msg = "Destination Arrived. Trip Ended : Trip ID : " + key;

      const driverData = (
        await admin
          .database()
          .ref("drivers/" + driverId)
          .once("value")
      ).val();

      if (driverData && driverData.isPhoneVerified) {
        sendSMS("+91" + driverData.phoneNumber, "Driver Sms : " + msg);
      }

      if (driverData && driverData.isPushEnabled) {
        sendMessage(
          driverData.pushToken,
          "Destination Arrived",
          "Driver Notification : " + msg
        );
      }

      const passengerData = (
        await admin
          .database()
          .ref("passengers/" + passengerId)
          .once("value")
      ).val();

      if (passengerData && passengerData.isPhoneVerified) {
        sendSMS("+91" + passengerData.phoneNumber, "Passenger Sms : " + msg);
      }

      if (passengerData && passengerData.isPushEnabled) {
        sendMessage(
          passengerData.pushToken,
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
      let amount  = after.fareDetails.finalFare;
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
      
      amount = amount / (splitPayments.length + 1)

      let emailData = {
        companyWeb: "https://wrapspeedtaxi.com",
        title: "Invoice For Trip : #" + key,
        tripDate: moment(new Date(after.pickedUpAt)).format("Do MMMM YYYY"),
        companyLogo: companyData.logo,
        companyName: companyData.name,
        currency: businessData.currency,
        finalFare: after.fareDetails.finalFare,
        tripId: key,
        routeMap: "https://wrapspeedtaxi.com/public/email_images/map.png",
        riderName: passengerData.name,
        riderNumber: passengerData.phoneNumber,
        driverName: driverData.name,
        driverProfilePic: driverData.profilePic
          ? driverData.profilePic
          : companyData.logo,
        fleetType: vehicleType.name,
        fleetDetail: driverData.brand + " - " + driverData.model,
        fromTime: moment(new Date(after.pickedUpAt)).format("hh:mm A"),
        fromAddress: after.origin.address,
        endTime: moment(new Date(after.droppedOffAt)).format("hh:mm A"),
        toAddress: after.destination.address,
        baseFare: after.fareDetails.baseFare,
        taxFare: after.fareDetails.tax,
        paidBy: after.paymentMethod,
        paidByImage: "https://wrapspeedtaxi.com/public/email_images/cash.png",
        splittedAmount : amount.toFixed(2),
        splitAccounts : splitPayments
      };

      ejs.renderFile(__dirname + "//invoice.ejs", emailData, async function (
        err,
        html
      ) {
        if (err) {
          functions.logger.error(err);
        } else {
          let transporter = nodemailer.createTransport(mailingDetails);
          transporter.sendMail(
            {
              from: "patrickphp2@gmail.com",
              to: passengerData.email,
              bcc: driverData.email,
              subject: "Invoice For Trip : #" + key,
              html,
            },
            function (err1, info) {
              if (err1) {
                functions.logger.error(err1);
                mailer.close();
              } else {
                functions.logger.info(info);
                mailer.close();
              }
            }
          );
        }
      });
    } else if (after.status == TRIP_STATUS_CANCELED) {
      admin
        .database()
        .ref("drivers/" + driverId)
        .once("value", function (snapshot) {
          const driver = snapshot.val();
          const msg = "The Trip Got Canceled. Trip ID : " + key;
          if (driver.isPhoneVerified) {
            sendSMS("+91" + driver.phoneNumber, "Driver SMS" + msg);
          }
          if (driver.isPushEnabled) {
            sendMessage(
              driver.pushToken,
              "Trip Canceled",
              "Driver Notification" + msg
            );
          }
        });
      admin
        .database()
        .ref("passengers/" + passengerId)
        .once("value", function (snapshot) {
          const passenger = snapshot.val();
          const msg = "The Trip Got Canceled. Trip ID : " + key;
          if (passenger.isPhoneVerified) {
            sendSMS("+91" + passenger.phoneNumber, "Passenger SMS" + msg);
          }
          if (passenger.isPushEnabled) {
            sendMessage(
              passenger.pushToken,
              "Trip Canceled",
              "Passenger Notification" + msg
            );
          }
        });
    }
  });

exports.sendSOSMessage = functions.https.onRequest((req, res) => {
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
        admin
          .database()
          .ref("passengers/" + id)
          .once("value")
          .then((snapshot) => {
            const passenger = snapshot.val();
            if (passenger.emergency_mobile) {
              const msg1 =
                "Hello " +
                passenger.emergency_name +
                ", Testing SOS Message For Passenger " +
                passenger.name +
                " With TripId : " +
                tripId;
              sendSMS("+91" + passenger.emergency_mobile, msg1);
            }
          });
      } else {
        admin
          .database()
          .ref("drivers/" + id)
          .once("value")
          .then((snapshot) => {
            const driver = snapshot.val();
            if (driver.emergency_mobile) {
              const msg2 =
                "Hello " +
                driver.emergency_name +
                ", Testing SOS Message For Driver " +
                driver.name +
                " With TripId : " +
                tripId;
              sendSMS("+91" + driver.emergency_mobile, msg2);
            }
          });
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
          const referralTable = passengerReferrer ? "passengers" : "drivers";
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
              .ref(refereeTable + "/" + code)
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
            .ref("wallet-transactions")
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
            .ref("wallet-transactions")
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
    if (req.body.tripId && req.body.type) {
      const businessData = (
        await admin.database().ref("business-management").once("value")
      ).val();

      const companyData = (
        await admin.database().ref("company-details").once("value")
      ).val();

      const tripData = (
        await admin
          .database()
          .ref("trips/" + req.body.tripId)
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
        let amount  = tripData.fareDetails.finalFare;
        const splits = (
          await admin
            .database()
            .ref("trip-split-payment/" + req.body.tripId)
            .once("value")
        ).val();
        if (splits != null) {
          for (const [key, value] of Object.entries(splits)) {
            splitPayments.push(value);
          }
          splitPayments = splitPayments.reverse();
        } 
        
        amount = amount / (splitPayments.length + 1)

        let emailData = {
          companyWeb: "https://wrapspeedtaxi.com",
          title: "Invoice For Trip : #" + req.body.tripId,
          tripDate: moment(new Date(tripData.pickedUpAt)).format(
            "Do MMMM YYYY"
          ),
          companyLogo: companyData.logo,
          companyName: companyData.name,
          currency: businessData.currency,
          finalFare: tripData.fareDetails.finalFare,
          tripId: req.body.tripId,
          routeMap: "https://wrapspeedtaxi.com/public/email_images/map.png",
          riderName: passengerData.name,
          riderNumber: passengerData.phoneNumber,
          driverName: driverData.name,
          driverProfilePic: driverData.profilePic
            ? driverData.profilePic
            : companyData.logo,
          fleetType: vehicleType.name,
          fleetDetail: driverData.brand + " - " + driverData.model,
          fromTime: moment(new Date(tripData.pickedUpAt)).format("hh:mm A"),
          fromAddress: tripData.origin.address,
          endTime: moment(new Date(tripData.droppedOffAt)).format("hh:mm A"),
          toAddress: tripData.destination.address,
          baseFare: tripData.fareDetails.baseFare,
          taxFare: tripData.fareDetails.tax,
          paidBy: tripData.paymentMethod,
          paidByImage: "https://wrapspeedtaxi.com/public/email_images/cash.png",
          splittedAmount : amount.toFixed(2),
          splitAccounts : splitPayments
        };
        functions.logger.info(emailData);

        ejs.renderFile(__dirname + "/invoice.ejs", emailData, function (
          err,
          html
        ) {
          if (err) {
            functions.logger.error(err);
            return res.status(200).json({
              status: -1,
              msg: "Unable To Send Invoice Via Mail.",
            });
          } else {
            let transporter = nodemailer.createTransport(mailingDetails);
            transporter.sendMail(
              {
                from: "patrickphp2@gmail.com",
                to:
                  req.body.type == "passenger"
                    ? passengerData.email
                    : driverData.email,
                subject: "Invoice For Trip : #" + req.body.tripId,
                html,
              },
              function (err1, info) {
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
              }
            );
          }
        });
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
  .schedule("every 15 minutes")
  .onRun((context) => {
    const date = moment();
    admin
      .database()
      .ref("scheduled-trips")
      .once("value", function (snapshot) {
        const schedules = snapshot.val();
        for (const [passengerId, trips] of Object.entries(schedules)) {
          let expiredTrips = [];
          for (const [tripKey, tripData] of Object.entries(trips)) {
            const scheduleDate = moment(new Date(tripData.departDate));
            if (date.isAfter(scheduleDate)) {
              tripData.key = tripKey;
              expiredTrips.push(tripData);
            }
          }
          expiredTrips.forEach((element) => {
            admin
              .database()
              .ref("scheduled-trips/" + passengerId + "/" + element.key)
              .remove()
              .then(() => {});
          });
        }
      });
  });
