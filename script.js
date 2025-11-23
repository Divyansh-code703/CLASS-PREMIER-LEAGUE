// FIREBASE CONFIG
const firebaseConfig = {
  databaseURL: "https://class-premier-league-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ELEMENTS
const username = document.getElementById("username");
const email = document.getElementById("email");
const password = document.getElementById("password");
const message = document.getElementById("message");

// SIGNUP
document.getElementById("signupBtn").addEventListener("click", function () {
  if (!username.value || !email.value || !password.value) {
    message.innerText = "❌ Fill all fields";
    return;
  }

  firebase.database().ref("users/" + username.value).set({
    username: username.value,
    email: email.value,
    password: password.value
  })
    .then(() => {
      message.innerText = "✔️ Signup Successful!";
    })
    .catch(() => {
      message.innerText = "❌ Signup Failed!";
    });
});

// LOGIN
document.getElementById("loginBtn").addEventListener("click", function () {
  if (!username.value || !password.value) {
    message.innerText = "❌ Enter username & password";
    return;
  }

  firebase.database().ref("users/" + username.value).once("value", (snap) => {
    if (!snap.exists()) {
      message.innerText = "❌ User not found";
      return;
    }

    let data = snap.val();

    if (data.password === password.value) {
      message.innerText = "✔️ Login Successful!";
    } else {
      message.innerText = "❌ Wrong password";
    }
  });
});
