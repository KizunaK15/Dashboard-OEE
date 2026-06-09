const firebaseConfig = {
    apiKey: "AIzaSyA45mc59Jy1991QZMbL8cvKBZ4T_FO7_A0", 
    authDomain: "oee-monitoring-f0719.firebaseapp.com",
    databaseURL: "https://oee-monitoring-f0719-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "oee-monitoring-f0719",
    storageBucket: "oee-monitoring-f0719.firebasestorage.app",
    messagingSenderId: "905942966899",
    appId: "1:905942966899:web:ef0e87bc4fceb641f98006"
};

// Initialize Firebase jika belum ada
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Export database reference agar bisa dipakai di script.js
const db = firebase.database();