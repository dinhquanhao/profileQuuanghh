import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyXXXX",
    authDomain: "myproject.firebaseapp.com",
    projectId: "myproject",
    storageBucket: "myproject.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123:web:xxxx"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function trackVisitor() {
    try {

        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();

        const visitor = {
            ip: data.ip,
            city: data.city,
            country: data.country_name,
            device: navigator.userAgent,
            page: window.location.href,
            referrer: document.referrer,
            time: new Date().toLocaleString()
        };

        await addDoc(collection(db, "visitors"), visitor);

        console.log("Visitor saved:", visitor);

    } catch (err) {
        console.log("Tracking error:", err);
    }
}

trackVisitor();