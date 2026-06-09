// =========================================================
// OEE DASHBOARD CONTROLLER (INDUSTRIAL GRADE)
// Integrates with: Firebase Realtime DB + Chart.js
// =========================================================

// --- 1. SETUP CHART.JS (DYNAMIC AXIS) ---
let timeLabels = []; 

function createGradient(ctx, colorStart, colorEnd) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, colorStart);
    gradient.addColorStop(1, colorEnd);
    return gradient;
}

const commonOptions = {
    responsive: true, maintainAspectRatio: false, animation: false,
    interaction: { mode: 'index', intersect: false },
    scales: {
        y: { 
            beginAtZero: true, max: 120,
            ticks: { color: '#94a3b8', font: { size: 10 }, callback: v => v + '%' }, 
            grid: { color: '#2d333d', borderDash: [5, 5] } 
        },
        x: { 
            grid: { display: true, color: (ctx) => (timeLabels[ctx.index]?.endsWith(':00')) ? '#2d333d' : 'transparent' }, 
            ticks: { color: '#94a3b8', maxTicksLimit: 12, maxRotation: 0, callback: (v, i) => timeLabels[i]?.endsWith(':00') ? timeLabels[i] : '' } 
        }
    },
    plugins: { legend: { labels: { color: '#fff', usePointStyle: true }, position: 'top', align: 'end' } },
    elements: { point: { radius: 0, hitRadius: 20, hoverRadius: 6 }, line: { borderWidth: 2, tension: 0.3 } }
};

const ctx1 = document.getElementById('chart-metrics-combined').getContext('2d');
const gradientAvail = createGradient(ctx1, 'rgba(0, 210, 255, 0.3)', 'rgba(0, 210, 255, 0.0)');
const gradientPerf = createGradient(ctx1, 'rgba(255, 179, 0, 0.3)', 'rgba(255, 179, 0, 0.0)');
const gradientQual = createGradient(ctx1, 'rgba(255, 61, 0, 0.3)', 'rgba(255, 61, 0, 0.0)');

const chart1 = new Chart(ctx1, { type: 'line', data: { labels: [], datasets: [ 
    { label: 'Avail', borderColor: '#00d2ff', backgroundColor: gradientAvail, data: [], fill: true, spanGaps: true, order: 10 }, 
    { label: 'Perf', borderColor: '#ffb300', backgroundColor: gradientPerf, data: [], fill: true, spanGaps: true, order: 5 }, 
    { label: 'Qual', borderColor: '#ff3d00', backgroundColor: gradientQual, data: [], fill: true, spanGaps: true, borderWidth: 3, borderDash: [6, 4], order: 0 } 
] }, options: commonOptions });

const ctx2 = document.getElementById('chart-oee-only').getContext('2d');
const gradientOEE = createGradient(ctx2, 'rgba(0, 230, 118, 0.4)', 'rgba(0, 230, 118, 0.0)');
const chart2 = new Chart(ctx2, { type: 'line', data: { labels: [], datasets: [ 
    { label: 'OEE Score', borderColor: '#00e676', backgroundColor: gradientOEE, data: [], fill: true, spanGaps: true } 
] }, options: commonOptions });

// --- 2. CONFIG & CHART GENERATOR ---
const refConfig = db.ref("config_mesin");

function generateTimeLabels(startStr, endStr) {
    const labels = [];
    const [sH, sM] = startStr.split(':').map(Number);
    const [eH, eM] = endStr.split(':').map(Number);
    
    let currentH = sH;
    let currentM = 0; 
    let safety = 0;
    
    while(safety < 1440) {
        const timeStr = `${String(currentH).padStart(2,'0')}:${String(currentM).padStart(2,'0')}`;
        labels.push(timeStr);
        
        if (currentH === eH && currentM >= eM) break;
        
        currentM++;
        if(currentM >= 60) {
            currentM = 0;
            currentH++;
            if(currentH >= 24) currentH = 0;
        }
        safety++;
    }
    return labels;
}

refConfig.on("value", (snapshot) => {
    const conf = snapshot.val();
    if(conf) {
        document.getElementById("disp-jam-kerja").innerText = `${conf.jam_kerja?.mulai} - ${conf.jam_kerja?.selesai}`;
        let jedaStr = "";
        if(conf.jeda) conf.jeda.forEach(j => { jedaStr += `${j.mulai}-${j.selesai} | `; });
        document.getElementById("disp-jeda").innerText = jedaStr.slice(0, -3) || "-";

        if(conf.jam_kerja) {
            timeLabels = generateTimeLabels(conf.jam_kerja.mulai, conf.jam_kerja.selesai);
            chart1.data.labels = timeLabels;
            chart2.data.labels = timeLabels;
            
            const len = timeLabels.length;
            chart1.data.datasets.forEach(ds => ds.data = new Array(len).fill(null));
            chart2.data.datasets.forEach(ds => ds.data = new Array(len).fill(null));
            
            chart1.update();
            chart2.update();
            fetchHistoryData(); 
        }
    }
});

// --- 3. MONITORING LIVE ---
const refMonitor = db.ref("monitoring");
let lastHeartbeatTime = 0;
let lastGood = 0;
let lastRej = 0;
let tProd = null;
let tRej = null;
let serverTimeOffset = 0;

refMonitor.on("value", (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    if (data.last_heartbeat) lastHeartbeatTime = data.last_heartbeat;
    else lastHeartbeatTime = Date.now();
    
    if(data.timestamp) {
        const timeStr = data.timestamp.split(' ')[1];
        document.getElementById("last-update").innerText = "Data: " + timeStr;
        const serverDt = new Date(data.timestamp.replace(' ', 'T'));
        serverTimeOffset = serverDt.getTime() - Date.now();
    }
    
    if(data.config_info) {
        document.getElementById("disp-nama-mesin").innerText = data.config_info.mesin || "-";
        document.getElementById("disp-operator").innerText = "Op: " + (data.config_info.op || "-");
        document.getElementById("cycle-target").innerText = data.config_info.cycle || "0";
        document.getElementById("disp-nama-produk").innerText = data.config_info.produk || "-";
        document.getElementById("disp-target-produk").innerText = data.config_info.target || "0";
    }

    document.getElementById("menit-sekarang").innerText = data.waktu?.berjalan_menit || 0;
    document.getElementById("menit-total").innerText = data.waktu?.plan_menit || 0; 

    const totalGood = data.produksi?.good || 0;
    const totalRej = data.produksi?.reject || 0;

    document.getElementById("count-produksi").innerText = totalGood;
    document.getElementById("count-cacat").innerText = totalRej;

    if (totalGood > lastGood) {
        lastGood = totalGood;
        updateLampStyle("lamp-produksi", "green");
        clearTimeout(tProd);
        tProd = setTimeout(() => updateLampStyle("lamp-produksi", "off"), 300);
    }
    if (totalRej > lastRej) {
        lastRej = totalRej;
        updateLampStyle("lamp-cacat", "red");
        clearTimeout(tRej);
        tRej = setTimeout(() => updateLampStyle("lamp-cacat", "off"), 300);
    }

    const downtimeSekarang = data.waktu?.downtime_detik || 0;
    const lateStartDetik = data.waktu?.late_start_detik || 0;
    const statusKoneksi = (data.mesin?.status_koneksi || "").trim().toUpperCase();
    
    const pureSensorDowntime = Math.max(0, downtimeSekarang - lateStartDetik);

    if(document.getElementById("late-start")) {
        document.getElementById("late-start").innerText = lateStartDetik;
    }

    const isAnyProblem = statusKoneksi.includes("PROBLEM") || statusKoneksi.includes("OFFLINE") || statusKoneksi.includes("ERROR");
    updateLampStyle("lamp-problem", isAnyProblem ? "red" : "off");

    document.getElementById("total-problem").innerText = downtimeSekarang;
    document.getElementById("count-problem").innerText = pureSensorDowntime; 

    const lampSystem = document.getElementById("lamp-onoff");
    if (lampSystem) {
        const labelSystem = lampSystem.nextElementSibling;
        
        if (statusKoneksi.includes("RUN")) {
            updateLampStyle("lamp-onoff", "green");
            labelSystem.innerText = "RUNNING";
            labelSystem.className = "font-bold text-sm text-neon-green";
        } else if (statusKoneksi.includes("OFF-SHIFT") || statusKoneksi.includes("BREAK")) {
            updateLampStyle("lamp-onoff", "off");
            labelSystem.innerText = statusKoneksi;
            labelSystem.className = "font-bold text-sm text-gray-500";
        } else {
            updateLampStyle("lamp-onoff", "red");
            labelSystem.innerText = statusKoneksi;
            labelSystem.className = "font-bold text-sm text-neon-red";
        }
    }

    document.getElementById("val-availability").innerText = (data.oee_kpi?.availability || 0) + "%";
    document.getElementById("val-performance").innerText = (data.oee_kpi?.performance || 0) + "%";
    document.getElementById("val-quality").innerText = (data.oee_kpi?.quality || 0) + "%";
    document.getElementById("val-oee").innerText = (data.oee_kpi?.score || 0) + "%";

    const menitSekarang = parseFloat(data.waktu?.berjalan_menit) || 0;
    const menitTotal = parseFloat(data.waktu?.plan_menit) || 600; 
    const maxDash = 125.6; 
    let offsetVal = maxDash - (Math.min(menitSekarang / menitTotal, 1) * maxDash);
    if (document.getElementById("gauge-progress")) {
        document.getElementById("gauge-progress").style.strokeDashoffset = offsetVal;
    }
});

// --- 4. HISTORY CHART FETCHING ---
function fetchHistoryData() {
    const todayDate = new Date();
    const offset = todayDate.getTimezoneOffset(); 
    const localDate = new Date(todayDate.getTime() - (offset*60*1000));
    const dateKey = localDate.toISOString().split('T')[0]; 

    const refHistory = db.ref("history_log/" + dateKey);

    refHistory.on("value", (snapshot) => {
        const histData = snapshot.val();
        if (!timeLabels.length) return; 

        const len = timeLabels.length;
        const dAvail = new Array(len).fill(null);
        const dPerf = new Array(len).fill(null);
        const dQual = new Array(len).fill(null);
        const dOEE = new Array(len).fill(null);

        if (histData) {
            Object.values(histData).forEach(record => {
                if (record.ts) {
                    const timePart = record.ts.split(' ')[1]; 
                    const [h, m] = timePart.split(':');
                    const labelKey = `${h}:${m}`; 
                    
                    const index = timeLabels.indexOf(labelKey);
                    
                    if (index !== -1) {
                        let valAvail = parseFloat(record.availability) || 0;
                        let valPerf = parseFloat(record.performance) || 0;
                        let valQual = parseFloat(record.quality);
                        if (isNaN(valQual)) valQual = 100; 
                        let valOEE = parseFloat(record.oee) || 0;

                        dAvail[index] = valAvail;
                        dPerf[index] = valPerf;
                        dQual[index] = valQual;
                        dOEE[index] = valOEE;
                    }
                }
            });
        }
        
        chart1.data.datasets[0].data = dAvail;
        chart1.data.datasets[1].data = dPerf;
        chart1.data.datasets[2].data = dQual;
        chart2.data.datasets[0].data = dOEE;

        chart1.update();
        chart2.update();
    });
}

// --- 5. MODAL & SETTINGS ---
function toggleModal(id) {
    const modal = document.getElementById(id);
    if (modal.classList.contains('hidden')) {
        modal.classList.remove('hidden'); 
        loadSettings();
    } else {
        modal.classList.add('hidden');
    }
}

function loadSettings() {
    refConfig.once('value').then((snapshot) => {
        const conf = snapshot.val();
        if(conf) {
            document.getElementById("input-nama-mesin").value = conf.nama_mesin || "";
            document.getElementById("input-operator").value = conf.operator || "";
            document.getElementById("input-nama-produk").value = conf.nama_produk || "";
            document.getElementById("input-target-produk").value = conf.target_produk || "";
            document.getElementById("input-cycle").value = conf.cycle_time || 60;
            if(conf.jam_kerja) {
                document.getElementById("input-start").value = conf.jam_kerja.mulai || "07:00";
                document.getElementById("input-end").value = conf.jam_kerja.selesai || "16:00";
            }
            for(let i=1; i<=3; i++) { document.getElementById(`j${i}-s`).value = ""; document.getElementById(`j${i}-e`).value = ""; }
            
            if(conf.jeda && Array.isArray(conf.jeda)) {
                conf.jeda.forEach((j, idx) => {
                    if(idx < 3) {
                        document.getElementById(`j${idx+1}-s`).value = j.mulai;
                        document.getElementById(`j${idx+1}-e`).value = j.selesai;
                    }
                });
            }
        }
    });
}

function saveConfig() {
    const namaMesin = document.getElementById("input-nama-mesin").value;
    const operator = document.getElementById("input-operator").value;
    const namaProduk = document.getElementById("input-nama-produk").value;
    const targetProduk = parseFloat(document.getElementById("input-target-produk").value) || 0;
    const cycleTime = parseFloat(document.getElementById("input-cycle").value) || 60;
    const jamKerja = { mulai: document.getElementById("input-start").value, selesai: document.getElementById("input-end").value };
    
    const jedaArr = [];
    for(let i=1; i<=3; i++) {
        const s = document.getElementById(`j${i}-s`).value;
        const e = document.getElementById(`j${i}-e`).value;
        if(s && e) jedaArr.push({ mulai: s, selesai: e });
    }
    
    const newConfig = { 
        nama_mesin: namaMesin, operator: operator, 
        nama_produk: namaProduk, target_produk: targetProduk,
        cycle_time: cycleTime, jam_kerja: jamKerja, jeda: jedaArr 
    };

    if(confirm("Simpan konfigurasi ke Mesin?")) {
        refConfig.set(newConfig).then(() => { alert("Konfigurasi Terkirim ke Orange Pi"); toggleModal('settingsModal'); });
    }
}

// --- 6. UTILS & HELPERS ---
function updateLampStyle(id, state) {
    const el = document.getElementById(id);
    if(!el) return;
    
    el.classList.remove("bg-neon-green", "border-neon-green", "lamp-glow-green", "bg-neon-red", "border-neon-red", "lamp-glow-red", "bg-dark-border", "border-gray-700");
    el.classList.add("border-2", "transition-all", "duration-300"); 

    if (state === "green") {
        el.classList.add("bg-neon-green", "border-neon-green", "lamp-glow-green");
    } else if (state === "red") {
        el.classList.add("bg-neon-red", "border-neon-red", "lamp-glow-red");
    } else {
        el.classList.add("bg-dark-border", "border-gray-700"); 
    }
}

function checkConnectionStatus() {
    const statusEl = document.getElementById("system-status");
    if(!statusEl) return;
    
    if (Date.now() - lastHeartbeatTime > 70000) { 
        statusEl.innerText = "OFFLINE"; 
        statusEl.className = "px-3 py-1 rounded-full text-xs font-bold border border-neon-red text-neon-red bg-neon-red/10";
    } else {
        statusEl.innerText = "ONLINE"; 
        statusEl.className = "px-3 py-1 rounded-full text-xs font-bold border border-neon-green text-neon-green bg-neon-green/10";
    }
}
setInterval(checkConnectionStatus, 5000);

function startLiveClock() {
    const updateClock = () => {
        const now = new Date(Date.now() + serverTimeOffset);
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        const ss = String(now.getSeconds()).padStart(2, '0');
        const clockEl = document.getElementById("live-clock");
        if (clockEl) clockEl.innerText = `${hh}:${mm}:${ss}`;
    };
    setInterval(updateClock, 1000);
    updateClock();
}
startLiveClock();

// ==========================================
// 7. FITUR RESET SHIFT (DANGER ZONE)
// ==========================================
function triggerResetShift() {
    const step1 = confirm("PERINGATAN KERAS\n\nApakah Anda yakin ingin MERESET SEMUA DATA SHIFT INI\n\n1 Produksi kembali ke 0\n2 Downtime kembali ke 0\n3 OEE kembali ke 0%\n4 Late Start dihitung ulang dari awal");
    
    if (step1) {
        const step2 = confirm("Yakin Data yang sudah dihapus tidak bisa dikembalikan");
        if (step2) {
            db.ref("control/force_reset").set(true)
            .then(() => {
                alert("PERINTAH RESET DIKIRIM\n\nSistem akan kembali ke 0 dalam 5 detik");
                toggleModal('settingsModal'); 
                
                setTimeout(() => {
                    db.ref("control/force_reset").set(false);
                }, 5000);
            })
            .catch((error) => {
                alert("Gagal mengirim perintah " + error.message);
            });
        }
    }
}