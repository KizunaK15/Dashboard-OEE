# 📊 Dashboard OEE (Overall Equipment Effectiveness)

Dashboard OEE merupakan aplikasi pemantauan produksi berbasis web yang dirancang untuk membantu operator dan supervisor memantau performa mesin secara real-time. Sistem menampilkan data produksi secara otomatis sehingga proses evaluasi efektivitas mesin dapat dilakukan lebih cepat dan akurat.

## ✨ Fitur Utama

### 🔴 Pemantauan Real-Time

Pantau kondisi produksi secara langsung. Nilai Availability, Performance, dan Quality akan diperbarui secara otomatis setiap kali data pada database berubah.

### 📈 Grafik Interaktif

Visualisasikan tren produksi harian melalui grafik yang mudah dibaca. Pengguna dapat melihat perubahan performa mesin tanpa harus melakukan analisis manual.

### ☁️ Integrasi Firebase

Sistem terhubung dengan Firebase Realtime Database sehingga data dapat disinkronkan secara otomatis dan ditampilkan secara instan pada dashboard.

### ⚡ Perhitungan OEE Otomatis

Dashboard menghitung metrik OEE secara otomatis berdasarkan data produksi yang masuk, sehingga mengurangi potensi kesalahan perhitungan manual.

---

## 📌 Metrik yang Ditampilkan

### Availability

Menunjukkan persentase waktu operasi mesin dibandingkan dengan waktu produksi yang telah direncanakan.

### Performance

Menunjukkan tingkat kecepatan produksi aktual dibandingkan dengan kecepatan produksi ideal.

### Quality

Menunjukkan persentase produk yang memenuhi standar kualitas dibandingkan total produk yang dihasilkan.

### OEE (Overall Equipment Effectiveness)

Nilai efektivitas mesin yang diperoleh dari kombinasi Availability, Performance, dan Quality.

---

## 🛠️ Teknologi yang Digunakan

* HTML5
* CSS3
* JavaScript
* Firebase Realtime Database
* Chart.js (jika digunakan untuk visualisasi grafik)

---

## 🚀 Instalasi dan Menjalankan Proyek

### 1. Clone Repository

```bash
git clone https://github.com/username/nama-repository.git
```

### 2. Masuk ke Folder Proyek

```bash
cd nama-repository
```

### 3. Buat File Konfigurasi Firebase

Buat file baru dengan nama:

```text
firebaseConfig.js
```

### 4. Tambahkan Konfigurasi Firebase

Masukkan kredensial Firebase Anda ke dalam file tersebut.

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 5. Jalankan Dashboard

Buka file `index.html` menggunakan browser atau jalankan menggunakan web server lokal seperti Live Server pada Visual Studio Code.

---

## 📷 Tampilan Dashboard

Tambahkan screenshot dashboard pada bagian ini untuk memudahkan pengguna memahami fungsi aplikasi.

```text
assets/dashboard-preview.png
```

---

## 🎯 Manfaat Dashboard

* Memantau efektivitas mesin secara real-time.
* Mengurangi proses perhitungan manual OEE.
* Mempermudah identifikasi downtime produksi.
* Membantu pengambilan keputusan berbasis data.
* Menyediakan visualisasi performa mesin yang informatif.

---

## 📄 Lisensi

Proyek ini dikembangkan untuk kebutuhan pembelajaran, penelitian, dan implementasi sistem monitoring produksi berbasis web.
