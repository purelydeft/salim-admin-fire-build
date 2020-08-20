const functions = require("firebase-functions");
const admin = require("firebase-admin");
const stripe = require("stripe")("sk_test_oyluHsmvwh807tGsVw8ristF");

const testAccountSid = "AC02867768a4ff76032b4c45ed8c7c8b46";
const testAuthToken = "0d292a1bd4bb7ff9be50704ba4ea9e35";
const liveAccountSid = "AC0aab684fa3476ca118cc1390759fd6d2";
const liveAuthToken = "b7c788365cf1387b0ee67f0d1d9d5993";

const twilioNumber = "+12029534688";

const client = require("twilio")(liveAccountSid, liveAuthToken);

const TRIP_STATUS_WAITING = "waiting";
const TRIP_STATUS_GOING = "going";
const TRIP_STATUS_FINISHED = "finished";
const TRIP_STATUS_CANCELED = "canceled";
const PAYMENT_METHOD_CARD = "card";

admin.initializeApp();

exports.sendPush = functions.database
  .ref("notifications/{notification}")
  .onWrite(function (change, context) {
    const original = change.after.val();

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
    .then((message) => functions.logger.info(message.sid));
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
    let updateData ;
    let updateCheck = false;
    if (after.email != before.email) {
      updateData.email = after.email;
      updateData.emailVerified = false;
      updateCheck = true;
    }
    if (after.phoneNumber != before.phoneNumber) {
      updateData.phoneNumber = after.phoneNumber;
      updateCheck = true;
    }
    if(updateCheck) {
      admin
      .auth()
      .updateUser(key, updateCheck)
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
          .ref("drivers/" + key)
          .update({ password: null });
        return false;
      })
      .catch((err) => {
        console.log(err);
        return false;
      });
    }
  });

exports.updateDriver = functions.database
  .ref("/drivers/{id}")
  .onUpdate(function (snapshot, context) {
    const key = context.params.id;
    const before = snapshot.before.val();
    const after = snapshot.after.val();
    let updateData ;
    let updateCheck = false;
    if (after.email != before.email) {
      updateData.email = after.email;
      updateData.emailVerified = false;
      updateCheck = true;
    }
    if (after.phoneNumber != before.phoneNumber) {
      updateData.phoneNumber = after.phoneNumber;
      updateCheck = true;
    }
    if(updateCheck) {
      admin
      .auth()
      .updateUser(key, updateCheck)
      .then(() => {
        functions.logger.info("Updated: " + key);
      })
      .catch((err) => {
        functions.logger.info(err);
      });
    }
  });

exports.createPassenger = functions.database
  .ref("/passengers/{id}")
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
            .ref("passengers/" + key)
            .update({ password: null });
          return false;
        })
        .catch((err) => {
          console.log(err);
          return false;
        });
    }
  });

exports.updatePassenger = functions.database
  .ref("/passengers/{id}")
  .onUpdate(function (snapshot, context) {
    const key = context.params.id;
    const before = snapshot.before.val();
    const after = snapshot.after.val();
    let updateData ;
    let updateCheck = false;
    if (after.email != before.email) {
      updateData.email = after.email;
      updateData.emailVerified = false;
      updateCheck = true;
    }
    if (after.phoneNumber != before.phoneNumber) {
      updateData.phoneNumber = after.phoneNumber;
      updateCheck = true;
    }
    if(updateCheck) {
      admin
      .auth()
      .updateUser(key, updateCheck)
      .then(() => {
        functions.logger.info("Updated: " + key);
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
              if (trip.val().rating != null) {
                stars += parseInt(trip.val().rating);
                count++;
              }
            });
            var rating = stars / count;
            console.log("Rating:" + rating);

            if (rating != "NaN")
              admin
                .database()
                .ref("/drivers/" + original.driverId)
                .update({ rating: rating.toFixed(1) });
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
  .onUpdate(function (snapshot, context) {
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
    } else if (after.status == TRIP_STATUS_GOING) {
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
    } else if (after.status == TRIP_STATUS_FINISHED) {
      admin
        .database()
        .ref("drivers/" + driverId)
        .once("value", function (snapshot) {
          const driver = snapshot.val();
          const msg = "Destination Arrived. Trip Ended : Trip ID : " + key;
          if (driver.isPhoneVerified) {
            sendSMS("+91" + driver.phoneNumber, msg);
          }
        });
      admin
        .database()
        .ref("passengers/" + passengerId)
        .once("value", function (snapshot) {
          const passenger = snapshot.val();
          const msg = "Destination Arrived. Trip Ended : Trip ID : " + key;
          if (passenger.isPhoneVerified) {
            sendSMS("+91" + passenger.phoneNumber, msg);
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

exports.callApi = functions.https.onRequest((req, res) => {
  res.status(200).send("API Hit Successfully");
});

// exports.generateSubscriptionInvoice = functions.database
// .ref("/trips/{tripId}")
// .onUpdate(function (snapshot, context) {
//   const key = context.params.id;
//   const before = snapshot.before.val();
//   const after = snapshot.after.val();

//   console.log(after);
//   console.log(before);
// });
