const functions = require("firebase-functions");
const admin = require("firebase-admin");

const stripe = require("stripe")("sk_test_oyluHsmvwh807tGsVw8ristF");

const TRIP_STATUS_WAITING = "waiting";
const TRIP_STATUS_GOING = "going";
const TRIP_STATUS_FINISHED = "finished";
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
    functions.logger.info({ data: original, key });
    admin
      .auth()
      .createUser({
        uid: key,
        email: original.email,
        password: original.password,
      })
      .then(() => {
        console.log("Created: " + key);
        return false;
      })
      .catch((err) => {
        console.log(err);
        return false;
      });
  });

exports.updateAdmin = functions.database
  .ref("/admins/{id}")
  .onUpdate(function (snapshot, context) {
    const key = context.params.id;
    const before = snapshot.before.val();
    const after = snapshot.after.val();
    if (after.email != before.email) {
      admin
        .auth()
        .updateUser(key, {
          email: original.email,
        })
        .then(() => {
          console.log("Updated: " + key);
          return false;
        })
        .catch((err) => {
          console.log(err);
          return false;
        });
    }
  });

exports.createDriver = functions.database
  .ref("/drivers/{id}")
  .onCreate(function (snapshot, context) {
    const key = context.params.id;
    const original = snapshot.val();
    // functions.logger.info({data : original, key});
    admin
      .auth()
      .createUser({
        uid: key,
        email: original.email,
        password: original.password,
      })
      .then(() => {
        console.log("Created: " + key);
        return false;
      })
      .catch((err) => {
        console.log(err);
        return false;
      });
  });

exports.updateDriver = functions.database
  .ref("/drivers/{id}")
  .onUpdate(function (snapshot, context) {
    const key = context.params.id;
    const before = snapshot.before.val();
    const after = snapshot.after.val();
    if (after.email != before.email) {
      admin
        .auth()
        .updateUser(key, {
          email: original.email,
        })
        .then(() => {
          console.log("Updated: " + key);
          return false;
        })
        .catch((err) => {
          console.log(err);
          return false;
        });
    }
  });

exports.createPassenger = functions.database
  .ref("/passengers/{id}")
  .onCreate(function (snapshot, context) {
    const key = context.params.id;
    const original = snapshot.val();
    // functions.logger.info({data : original, key});
    admin
      .auth()
      .createUser({
        uid: key,
        email: original.email,
        password: original.password,
      })
      .then(() => {
        console.log("Created: " + key);
        return false;
      })
      .catch((err) => {
        console.log(err);
        return false;
      });
  });

exports.updatePassenger = functions.database
  .ref("/passengers/{id}")
  .onUpdate(function (snapshot, context) {
    const key = context.params.id;
    const before = snapshot.before.val();
    const after = snapshot.after.val();
    if (after.email != before.email) {
      admin
        .auth()
        .updateUser(key, {
          email: original.email,
        })
        .then(() => {
          console.log("Updated: " + key);
          return false;
        })
        .catch((err) => {
          console.log(err);
          return false;
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
