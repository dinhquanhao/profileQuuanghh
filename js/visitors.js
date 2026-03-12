import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "API_KEY",
    authDomain: "PROJECT.firebaseapp.com",
    projectId: "PROJECT_ID",
    storageBucket: "PROJECT.appspot.com",
    messagingSenderId: "ID",
    appId: "APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const table = document.getElementById("visitorTable");

async function loadVisitors() {

    const querySnapshot = await getDocs(collection(db, "visitors"));

    querySnapshot.forEach(doc => {

        const v = doc.data();

        const row = `
        <tr>
            <td class="ip">${v.ip}</td>
            <td class="city">${v.city}</td>
            <td class="country">${v.country}</td>
            <td class="device">${v.device}</td>
            <td>${v.time}</td>
        </tr>
        `;

        table.insertAdjacentHTML("beforeend", row);
    });
}

loadVisitors();