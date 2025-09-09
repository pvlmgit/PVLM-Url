import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getDatabase, ref, push, onValue } from "firebase/database";
import axios from "axios";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBmWk1YMAp7tX89Hijz3o7_tiM62ZvRvKc",
  authDomain: "pvlm-url.firebaseapp.com",
  databaseURL: "https://pvlm-url-default-rtdb.firebaseio.com",
  projectId: "pvlm-url",
  storageBucket: "pvlm-url.firebasestorage.app",
  messagingSenderId: "568009407938",
  appId: "1:568009407938:web:18f89e80fc691be69dea5b",
  measurementId: "G-9MTJZMNB1K"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const shortenerDiv = document.getElementById("shortener");
const historyList = document.getElementById("history");
const shortenBtn = document.getElementById("shortenBtn");

let currentUser = null;

// Login
loginBtn.addEventListener("click", async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  currentUser = result.user;

  loginBtn.style.display = "none";
  logoutBtn.style.display = "block";
  shortenerDiv.style.display = "block";

  loadHistory();
});

// Logout
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  currentUser = null;
  loginBtn.style.display = "block";
  logoutBtn.style.display = "none";
  shortenerDiv.style.display = "none";
  historyList.innerHTML = "";
});

// Shorten URL with Bitly
shortenBtn.addEventListener("click", async () => {
  const longUrl = document.getElementById("longUrl").value;
  const customAlias = document.getElementById("customAlias").value;

  if (!longUrl) return alert("Enter a URL");

  try {
    const response = await axios.post(
      "https://api-ssl.bitly.com/v4/shorten",
      { long_url: longUrl, domain: "bit.ly", custom_bitlink: customAlias ? `bit.ly/${customAlias}` : undefined },
      { headers: { Authorization: "Bearer 11778e9f5448a0f63cb42da32f38f190a1136c3f", "Content-Type": "application/json" } }
    );

    const shortUrl = response.data.link;

    // Save to Firebase
    if (currentUser) {
      push(ref(db, "history/" + currentUser.uid), { longUrl, shortUrl });
    }

    alert("Short URL: " + shortUrl);
  } catch (err) {
    console.error(err);
    alert("Error shortening URL");
  }
});

// Load history
function loadHistory() {
  const historyRef = ref(db, "history/" + currentUser.uid);
  onValue(historyRef, (snapshot) => {
    historyList.innerHTML = "";
    snapshot.forEach((child) => {
      const item = child.val();
      const li = document.createElement("li");
      li.innerHTML = `<a href="${item.shortUrl}" target="_blank">${item.shortUrl}</a> → ${item.longUrl}`;
      historyList.appendChild(li);
    });
  });
}
