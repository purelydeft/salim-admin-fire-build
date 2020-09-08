const functions = require("firebase-functions");
const admin = require("firebase-admin");
const stripe = require("stripe")("sk_test_oyluHsmvwh807tGsVw8ristF");
const moment = require("moment");
const nodemailer = require("nodemailer");
const ejs = require("ejs");
// const cors = require("cors")({
//   origin: true
// });

const transporter = nodemailer.createTransport({
  name: "Wrap Speed Taxi",
  host: "mail.wrapspeedtaxi.com",
  port: 465,
  secure: true,
  auth: {
    user: "noreply@wrapspeedtaxi.com",
    pass: ".K~AsjE7}wPC",
  },
});

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
        .ref("passengers")
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
        .ref("drivers")
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
        .ref("passengers")
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
        .ref("drivers")
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
        .ref("passengers")
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
        .ref("drivers")
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
        .ref("passengers")
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
        .ref("drivers")
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
        .ref("passengers")
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
        .ref("drivers")
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
        .ref("passengers")
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
        .ref("drivers")
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
      })
      .then((data) => {
        //console.log(data);
        return true;
      })
      .catch((err) => {
        //console.log(err)
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
      functions.logger.info(message.sid)
    }).catch(err => functions.logger.error(err));
}

exports.deleteRider = functions.database
  .ref("/passengers/{id}")
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

exports.deleteDriver = functions.database
  .ref("/drivers/{id}")
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
          return false;
        })
        .catch((err) => {
          console.log(err);
          return false;
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
            return false;
          });
      }
    }
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
          return false;
        })
        .catch((err) => {
          console.log(err);
          return false;
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
            return false;
          });
      }
    }
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
          .ref("drivers/" + original.driverId + "/balance")
          .once("value")
          .then(function (snapshot) {
            if (snapshot != null && snapshot != undefined && snapshot != NaN) {
              var snapshotVal = snapshot.val() ? parseFloat(snapshot.val()) : 0;
              var total =
                parseFloat(snapshotVal) + parseFloat(original.commission);
              var tmptotal = total.toFixed(2);
              admin
                .database()
                .ref("drivers/" + original.driverId + "/balance")
                .set(tmptotal);
            }
          });

        // format currency
        if (original.currency == "$") {
          const currency = "usd";
          admin
            .database()
            .ref("passengers/" + original.passengerId + "/card")
            .once("value")
            .then(function (snapshot) {
              stripe.charges.create(
                {
                  amount: parseInt(fee * 100),
                  currency: currency,
                  source: snapshot.val().token,
                  description: "Charge for tripId: " + context.params.tripId,
                },
                { idempotency_key: context.params.tripId },
                function (err, charge) {
                  console.log(err);
                  console.log(charge);
                  if (err == null) {
                    console.log("STRIPE CHARGED:" + fee);
                    admin
                      .database()
                      .ref("trips/" + tripId)
                      .update({
                        paymentStatus: "success",
                        paymentId: charge.id,
                      });
                  } else {
                    console.log("STRIPE CHARGED FAILED:" + fee);
                    admin
                      .database()
                      .ref("trips/" + tripId)
                      .update({
                        paymentStatus: "failed",
                      });
                  }
                }
              );
            });
        } else {
          console.log("Currency " + original.currency + " is not supported");
        }
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

            if (rating != "NaN") {
              admin
                .database()
                .ref("/drivers/" + original.driverId)
                .update({ rating: rating.toFixed(1) });
            } else {
              admin
                .database()
                .ref("/drivers/" + original.driverId)
                .update({ rating: 1 });
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
          sendSMS("+91" + driver.phoneNumber, msg);
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
          sendSMS("+91" + passenger.phoneNumber, msg);
          sendSMS("+91" + passenger.phoneNumber, msg1);
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

    functions.logger.info(before);
    functions.logger.info(after);

    if (after.status == TRIP_STATUS_WAITING) {
      admin
        .database()
        .ref("drivers/" + driverId)
        .once("value", function (snapshot) {
          const driver = snapshot.val();
          const msg = "Pick Up Available : Trip ID : " + key;
          if (driver.isPhoneVerified) {
            sendSMS("+91" + driver.phoneNumber, msg);
          }
        });
      admin
        .database()
        .ref("passengers/" + passengerId)
        .once("value", function (snapshot) {
          const passenger = snapshot.val();
          const msg = "Driver To Be Arrived Shortly : Trip ID : " + key;
          if (passenger.isPhoneVerified) {
            sendSMS("+91" + passenger.phoneNumber, msg);
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
            sendSMS("+91" + driver.phoneNumber, msg);
          }
        });
      admin
        .database()
        .ref("passengers/" + passengerId)
        .once("value", function (snapshot) {
          const passenger = snapshot.val();
          const msg = "Destination To Be Arrived Soon : Trip ID : " + key;
          if (passenger.isPhoneVerified) {
            sendSMS("+91" + passenger.phoneNumber, msg);
          }
        });
    } else if (
      after.status == TRIP_STATUS_FINISHED &&
      before.status == TRIP_STATUS_GOING
    ) {

      const msg = "Destination Arrived. Trip Ended : Trip ID : " + key;
     
      const driverData = (
        await admin.database().ref("drivers/" + driverId).once("value")
      ).val();
      
      if(driverData && driverData.isPhoneVerified) {
        sendSMS("+91" + driverData.phoneNumber, msg);
      }

      const passengerData = (
        await admin.database().ref("passengers/" + passengerId).once("value")
      ).val();
      
      if(passengerData && passengerData.isPhoneVerified) {
        sendSMS("+91" + passengerData.phoneNumber, msg);
      }
      
      const businessData = (
        await admin.database().ref("business-management").once("value")
      ).val();
      
      const companyData = (
        await admin.database().ref("company-details").once("value")
      ).val(); 
      
      const vehicleType = (
        await admin.database().ref("fleets/" + after.vehicleType).once("value")
      ).val();
      
      let emailData = {
        companyWeb : "https://wrapspeedtaxi.com",
        title : "Invoice For Trip : #" + key,
        tripDate  : moment(new Date(after.pickedUpAt)).format("Do MMMM YYYY"),
        companyLogo  :  companyData.logo,
        companyName  : companyData.name,
        currency : businessData.currency,
        finalFare  : after.fareDetails.finalFare,
        tripId  : key,
        routeMap  : companyData.logo,
        riderName   : passengerData.name,
        driverName    : driverData.name,
        driverProfilePic : driverData.profilePic ? driverData.profilePic : companyData.logo,
        fleetType  : vehicleType.name,
        fleetDetail : driverData.brand + " - " + driverData.model,
        fromTime  : moment(new Date(after.pickedUpAt)).format("hh:mm A"),
        fromAddress  : after.origin.address,
        endTime  : moment(new Date(after.droppedOffAt)).format("hh:mm A"),
        toAddress   : after.destination.address,
        baseFare  : after.fareDetails.baseFare,
        taxFare   : after.fareDetails.tax,
        paidBy  : after.paymentMethod,
        paidByImage  : "images/cash.png"
      }

      ejs.renderFile(__dirname + "//invoice.ejs", emailData , async function (
        err,
        html
      ) {
        if (err) {
          functions.logger.error(err)
        } else {
          transporter.sendMail({
            from: "noreply@wrapspeedtaxi.com",
            to: passengerData.email,
            bcc : driverData.email,
            subject: "Invoice For Trip : #" + key, 
            html,
          }, function (err1, info) {
            if (err1) {
              functions.logger.error(err1)
            } else {
              functions.logger.info(info)
            }
          });
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
            sendSMS("+91" + driver.phoneNumber, msg);
          }
        });
      admin
        .database()
        .ref("passengers/" + passengerId)
        .once("value", function (snapshot) {
          const passenger = snapshot.val();
          const msg = "The Trip Got Canceled. Trip ID : " + key;
          if (passenger.isPhoneVerified) {
            sendSMS("+91" + passenger.phoneNumber, msg);
          }
        });
    }
  });

// exports.sendOTP = functions.https.onRequest((req, res) => {
//   res.set("Access-Control-Allow-Origin", "*");
//   res.set("Access-Control-Allow-Credentials", "true"); // vital
//   if (req.method === "OPTIONS") {
//     // Send response to OPTIONS requests
//     res.set("Access-Control-Allow-Methods", "GET, POST");
//     res.set("Access-Control-Allow-Headers", "Content-Type");
//     res.set("Access-Control-Max-Age", "3600");
//     res.status(204).send("");
//   } else {
//     if (req.body.mobile) {
//       client.verify
//         .services(twilioService)
//         .verifications.create({ to: "+91" + req.body.mobile, channel: "sms" })
//         .then((verification) => {
//           if (verification.status == "pending" && !verification.valid) {
//             res.status(200).json({
//               status: 1,
//               msg: "Otp Sent On Mobile Number +91" + req.body.mobile,
//             });
//           } else {
//             res.status(200).json({
//               status: -1,
//               msg: "Unable To Send OTP On Mobile Number +91" + req.body.mobile,
//             });
//           }
//         })
//         .catch((error) => {
//           res.status(200).json({
//             status: -1,
//             msg: "Unable To Send OTP On Mobile Number +91" + req.body.mobile,
//           });
//         });
//     } else {
//       res.status(200).json({
//         status: -1,
//         msg: "Mobile Number Not Found",
//       });
//     }
//   }
// });

// exports.verifyOTP = functions.https.onRequest((req, res) => {
//   res.set("Access-Control-Allow-Origin", "*");
//   res.set("Access-Control-Allow-Credentials", "true"); // vital
//   if (req.method === "OPTIONS") {
//     // Send response to OPTIONS requests
//     res.set("Access-Control-Allow-Methods", "GET, POST");
//     res.set("Access-Control-Allow-Headers", "Content-Type");
//     res.set("Access-Control-Max-Age", "3600");
//     res.status(204).send("");
//   } else {
//     if (req.body.mobile && req.body.otp) {
//       client.verify
//         .services(twilioService)
//         .verificationChecks.create({
//           to: "+91" + req.body.mobile,
//           code: req.body.otp,
//         })
//         .then((verification) => {
//           if (verification.status == "approved" && verification.valid) {
//             res.status(200).json({
//               status: 1,
//               msg: "Otp Verified For Mobile Number +91" + req.body.mobile,
//             });
//           } else {
//             res.status(200).json({
//               status: -1,
//               msg: "Invalid OTP",
//             });
//           }
//         })
//         .catch((error) => {
//           functions.logger.error(error);
//           res.status(200).json({
//             status: -1,
//             msg: "Unable To Verify OTP For Mobile Number +91" + req.body.mobile,
//           });
//         });
//     } else {
//       res.status(200).json({
//         status: -1,
//         msg: "Either Mobile Number Or OTP Not Found",
//       });
//     }
//   }
// });

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

        let referee;

        if (type == "passenger") {
          referee = (
            await admin
              .database()
              .ref("passengers/" + id)
              .once("value")
          ).val();
        } else {
          referee = (
            await admin
              .database()
              .ref("drivers/" + id)
              .once("value")
          ).val();
        }

        if (driverReferrer) {
          let referrerBal = driverReferrer.balance ? driverReferrer.balance : 0;
          await admin
            .database()
            .ref("drivers/" + code)
            .update({
              balance: referrerBal + businessData.referral.referrerAmount,
            });
          const referrerBalData = {
            driver_email: driverReferrer.email,
            driver_id: code,
            amount: businessData.referral.referrerAmount,
            created: Date.now(),
            description: "Referral Bonus",
            type: 1,
          };
          await admin
            .database()
            .ref("wallet-transactions")
            .push(referrerBalData);

          let refereeBal = referee.balance ? referee.balance : 0;
          if (type == "passenger") {
            await admin
              .database()
              .ref("passengers/" + id)
              .update({
                balance: refereeBal + businessData.referral.refereeAmount,
                referredBy: code,
                referredType: "driver",
              });
            const refereeBalData = {
              passenger_email: referee.email,
              passenger_id: id,
              amount: businessData.referral.refereeAmount,
              created: Date.now(),
              description: "Referral Bonus",
              type: 1,
            };
            await admin
              .database()
              .ref("wallet-transactions")
              .push(refereeBalData);
          } else {
            await admin
              .database()
              .ref("passengers/" + id)
              .update({
                balance: refereeBal + businessData.referral.refereeAmount,
                referredBy: code,
                referredType: "driver",
              });
            const refereeBalData = {
              driver_email: referee.email,
              driver_id: id,
              amount: businessData.referral.refereeAmount,
              created: Date.now(),
              description: "Referral Bonus",
              type: 1,
            };
            await admin
              .database()
              .ref("wallet-transactions")
              .push(refereeBalData);
          }
          return res.status(200).json({
            status: 1,
            msg: "Referral Code Successfully Applied.",
          });
        } else if (passengerReferrer) {
          let referrerBal = passengerReferrer.balance
            ? passengerReferrer.balance
            : 0;
          await admin
            .database()
            .ref("passengers/" + code)
            .update({
              balance: referrerBal + businessData.referral.referrerAmount,
            });
          const referrerBalData = {
            passenger_email: passengerReferrer.email,
            passenger_id: code,
            amount: businessData.referral.referrerAmount,
            created: Date.now(),
            description: "Referral Bonus",
            type: 1,
          };
          await admin
            .database()
            .ref("wallet-transactions")
            .push(referrerBalData);

          let refereeBal = referee.balance ? referee.balance : 0;
          if (type == "passenger") {
            await admin
              .database()
              .ref("passengers/" + id)
              .update({
                balance: refereeBal + businessData.referral.refereeAmount,
                referredBy: code,
                referredType: "passenger",
              });
            const refereeBalData = {
              passenger_email: referee.email,
              passenger_id: id,
              amount: businessData.referral.refereeAmount,
              created: Date.now(),
              description: "Referral Bonus",
              type: 1,
            };
            await admin
              .database()
              .ref("wallet-transactions")
              .push(refereeBalData);
          } else {
            await admin
              .database()
              .ref("passengers/" + id)
              .update({
                balance: refereeBal + businessData.referral.refereeAmount,
                referredBy: code,
                referredType: "driver",
              });
            const refereeBalData = {
              driver_email: referee.email,
              driver_id: id,
              amount: businessData.referral.refereeAmount,
              created: Date.now(),
              description: "Referral Bonus",
              type: 1,
            };
            await admin
              .database()
              .ref("wallet-transactions")
              .push(refereeBalData);
          }
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

exports.generateInvoice = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Credentials", "true"); // vital
  if (req.method === "OPTIONS") {
    // Send response to OPTIONS requests
    res.set("Access-Control-Allow-Methods", "GET, POST");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.set("Access-Control-Max-Age", "3600");
    res.status(204).send("");
  } else {
    // ejs.renderFile(__dirname + "//invoice1.ejs", {} , async function (
    //     err,
    //     html
    //   ) {
    //     if (err) {
    //       functions.logger.error(err)
    //       return res.status(200).json({
    //         message : 'Error Occurred Rendering'
    //       })
    //     } else {
          
    //     }
    //   });
    const mailer = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // upgrade later with STARTTLS
      auth: {
        user: "devwrapspeedtaxi@gmail.com",
        pass: "developer@123"
      }
    });
    mailer.verify().then(data => {
      functions.logger.info(data)
      mailer.sendMail({
        from: "devwrapspeedtaxi@gmail.com",
        to: "kr.kalpit@gmail.com",
        subject: "Invoice For Trip : #",
        html : "<h1>Kalpit</h1>",
      }, function (err1, info) {
        if (err1) {
          functions.logger.error(err1)
          mailer.close();
          return res.status(200).json({
            message : 'Error Occurred Sending Mail'
          })
        } else {
          functions.logger.info(info)
          mailer.close();
          return res.status(200).json({
            message : 'Mail Sent'
          })
        }
      });
    }).catch(err =>  {
      functions.logger.error(err)
      return res.status(200).json({
        message : 'Verify Failed'
      })
    })
    
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
