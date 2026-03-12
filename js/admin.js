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

async function loadVisitors(){

 const querySnapshot = await getDocs(collection(db,"visitors"));

 const table = document.getElementById("visitorTable");

 querySnapshot.forEach(doc => {

  const v = doc.data();

      table.innerHTML += `
        <tr>
          <td>${v.ip}</td>
          <td>${v.city}</td>
          <td>${v.country}</td>
          <td>${v.page}</td>
          <td>${v.referrer}</td>
          <td>${v.time}</td>
          <td>${v.device}</td>
        </tr>
        `;

 });

}

loadVisitors();