// Initialize Leaflet Workspace Layout
const map = L.map('map').setView([5.6506, -0.1870], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// PRODUCTION LIVE GOOGLE DEPLOYMENT WEB APP URL
const GOOGLE_SHEET_API_URL = "https://script.google.com/macros/s/AKfycbzKfjMQjoXFfb7GG8n5SJtIGw97RTqAltlliMPZsbSnAE5zgjq-bZqG2MsUdIxjjrKV/exec";

// Global State Layout Trackers
let userCoords = null;
let activeMarker = null;
let localMediaStream = null;

// DOM Layout View Selectors
const navItems = document.querySelectorAll('.nav-item');
const screens = document.querySelectorAll('.app-screen');

const reportBtn = document.getElementById('report-btn');
const shortcutReportBtn = document.getElementById('shortcut-report-btn');
const reportModal = document.getElementById('report-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const gpsStatus = document.getElementById('gps-status');
const issueForm = document.getElementById('issue-form');
const urgencyInput = document.getElementById('urgency-level');

// Camera DOM Targets
const videoFeed = document.getElementById('camera-feed');
const captureCanvas = document.getElementById('captured-canvas-frame');
const imagePreview = document.getElementById('image-preview');
const startCamBtn = document.getElementById('start-camera-btn');
const snapPhotoBtn = document.getElementById('snap-photo-btn');

// Community Chat DOM Targets
const chatForm = document.getElementById('chat-input-form');
const chatUsername = document.getElementById('chat-username');
const chatMessageBody = document.getElementById('chat-message-body');
const chatMessagesContainer = document.getElementById('chat-messages-container');

// NATIVE VIEW SCREEN ROUTER
navItems.forEach(item => {
    item.addEventListener('click', function() {
        navItems.forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');

        const targetScreen = this.getAttribute('data-screen');
        screens.forEach(screen => screen.classList.add('hidden'));
        document.getElementById(targetScreen).classList.remove('hidden');

        if (targetScreen === 'screen-map') {
            setTimeout(() => { map.invalidateSize(); }, 50);
        }
    });
});

// Launch Report Workflow
const triggerReportWorkflow = () => {
    reportModal.classList.remove('hidden');
    fetchLocation();
};

reportBtn.addEventListener('click', triggerReportWorkflow);
shortcutReportBtn.addEventListener('click', triggerReportWorkflow);

// Dismiss Modal & Shutdown active hardware camera stream cleanly
closeModalBtn.addEventListener('click', () => {
    reportModal.classList.add('hidden');
    stopCameraHardware();
    if (activeMarker) {
        map.removeLayer(activeMarker);
        activeMarker = null;
    }
});

// FEATURE 1: HARDWARE NATIVE CAMERA INITIALIZATION SYSTEM
startCamBtn.addEventListener('click', async () => {
    try {
        // Request access to video capture hardware devices (facing environment preferred for phones)
        localMediaStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
            audio: false
        });
        
        videoFeed.srcObject = localMediaStream;
        videoFeed.classList.remove('hidden');
        snapPhotoBtn.classList.remove('hidden');
        startCamBtn.classList.add('hidden');
        imagePreview.classList.add('hidden');
    } catch (err) {
        alert("Camera initialization failed. Check device canvas permissions.");
        console.error(err);
    }
});

// Capture Canvas Frame Snapshot Matrix
snapPhotoBtn.addEventListener('click', () => {
    const context = captureCanvas.getContext('2d');
    captureCanvas.width = videoFeed.videoWidth;
    captureCanvas.height = videoFeed.videoHeight;
    
    // Write image frame matrix coordinates directly to context canvas matrix
    context.drawImage(videoFeed, 0, 0, captureCanvas.width, captureCanvas.height);
    
    // Export raw pixel context matrix data into Base64 web data rendering URL string
    const base64DataUrl = captureCanvas.toDataURL('image/jpeg');
    
    imagePreview.src = base64DataUrl;
    imagePreview.classList.remove('hidden');
    
    stopCameraHardware();
});

function stopCameraHardware() {
    if (localMediaStream) {
        localMediaStream.getTracks().forEach(track => track.stop());
    }
    videoFeed.classList.add('hidden');
    snapPhotoBtn.classList.add('hidden');
    startCamBtn.classList.remove('hidden');
}

// Hardware Precision Telemetry GPS Interceptor 
function fetchLocation() {
    if (!navigator.geolocation) {
        gpsStatus.textContent = "Hardware GPS mapping unavailable.";
        return;
    }
    gpsStatus.textContent = "Locking onto regional telemetry grid...";
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            userCoords = [latitude, longitude];
            gpsStatus.textContent = `Grid lock: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            map.setView(userCoords, 16);
            activeMarker = L.marker(userCoords).addTo(map);
        },
                (error) => { 
            gpsStatus.textContent = "GPS Timeout. Using default Accra coordinates."; 
            userCoords = [5.6506, -0.1870]; // Fallback coordinates so you can still submit!
            map.setView(userCoords, 16);
            activeMarker = L.marker(userCoords).addTo(map);
        },
        { enableHighAccuracy: true }
    );
}

function detectSubMetroDistrict(coords) {
    if (!coords) return "Accra Metropolitan Assembly";
    const lat = coords[0]; const lng = coords[1];
    if (lat > 5.6300 && lat < 5.6800 && lng > -0.2000 && lng < -0.1400) return "Ayawaso West Municipal Assembly";
    if (lat > 5.5300 && lat < 5.5800 && lng > -0.2100 && lng < -0.1600) return "Osu Klottey Sub-Metro District";
    return "Accra Metropolitan Assembly (AMA)";
}

// FEATURE 2: PACKAGING HAUL AND SHIPPING PAYLOAD OVER TO GOOGLE SHEETS
issueForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const issueType = document.getElementById('issue-type').value;
    const urgency = urgencyInput.value;
    const description = document.getElementById('issue-desc').value;
    const base64ImageString = imagePreview.src; // Holds data matrix frame URL string 

    if (!userCoords) {
        alert("Awaiting valid coordinates before packaging payload.");
        return;
    }

    const targetedDistrict = detectSubMetroDistrict(userCoords);
    const uniqueReportId = `GH-${Math.floor(1000 + Math.random() * 9000)}`;

    // Prepare JSON payload object matching Google Sheet headers structural expectations
    const payload = {
        action: "addReport",
        id: uniqueReportId,
        type: issueType,
        urgency: urgency,
        district: targetedDistrict,
        description: description,
        coordinates: `${userCoords[0]},${userCoords[1]}`
    };

    // Plot immediate UI placeholder pin onto interface map locally first for fluidity
    plotLocalMarker(userCoords, issueType, urgency, targetedDistrict, description, base64ImageString, uniqueReportId);
    
    reportModal.classList.add('hidden');
    document.querySelector('[data-screen="screen-map"]').click();

    // Fire asynchronous payload dispatch stream off to Google Deployment Script endpoint
    try {
        await fetch(GOOGLE_SHEET_API_URL, {
            method: "POST",
            mode: "no-cors", // Bypasses browser cross-origin policy complications smoothly
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        console.log("Telemetry payload logged successfully in central Sheet database.");
    } catch (error) {
        console.error("Disruption in central Sheet data pipe:", error);
    }

    // Clean form elements fields
    issueForm.reset();
    imagePreview.src = "";
    imagePreview.classList.add('hidden');
    userCoords = null;
});

function plotLocalMarker(coords, type, urgency, district, desc, img, id) {
    const typeLabels = { clogged_drain: "Clogged Gutter / Drain", pothole: "Pothole", broken_pipe: "Burst Water Pipe", street_light: "Broken Streetlight" };
    let color = urgency === 'high' ? "#e74c3c" : urgency === 'medium' ? "#f1c40f" : "#00875a";

    const customIcon = L.divIcon({
        className: 'custom-pin',
        html: `<div style="background-color: ${color}; width:22px; height:22px; border-radius:50%; border:3px solid white; box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
    });

    const marker = L.marker(coords, { icon: customIcon }).addTo(map);
    marker.bindPopup(`
        <div style="font-family: sans-serif; max-width: 210px;">
            <h4 style="margin:0 0 3px 0;">${typeLabels[type]}</h4>
            <div style="font-size:11px; font-weight:700; color:#475569; margin-bottom:6px;">📍 ${district}</div>
            <span style="display:inline-block; padding:2px 6px; font-size:9px; font-weight:bold; border-radius:4px; color:white; background-color:${color}; margin-bottom:8px; text-transform:uppercase;">${urgency}</span>
            ${img ? `<img src="${img}" style="width:100%; height:auto; border-radius:6px; margin-bottom:6px; display:block;">` : ''}
            <p style="margin:0; font-size:12px; color:#333;">${desc || 'No description attached.'}</p>
            <hr style="border:0; border-top:1px solid #e2e8f0; margin:8px 0;">
            <div style="display:flex; justify-content:between; font-size:10px; color:#64748b;">Status: <strong>Open</strong> | ID: ${id}</div>
        </div>
    `).openPopup();
}

// FEATURE 3: LOCAL INTERACTIVE NEIGHBORHOOD COMMUNITY WIRE CHAT CONTEXT
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const userValue = chatUsername.value.trim();
    const messageValue = chatMessageBody.value.trim();
    
    if(!userValue || !messageValue) return;

    // Append output message container instantly layout template locally
    const bubbleElement = document.createElement('div');
    bubbleElement.classList.add('chat-bubble', 'me');
    bubbleElement.innerHTML = `
        <span>${userValue} (Just Now)</span>
        <p>${messageValue}</p>
    `;
    chatMessagesContainer.appendChild(bubbleElement);
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;

    const chatPayload = {
        action: "addMessage",
        user: userValue,
        message: messageValue
    };

    // Fire chat message transaction to Sheet deployment router
    try {
        await fetch(GOOGLE_SHEET_API_URL, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(chatPayload)
        });
    } catch (err) { 
        console.error("Chat dispatch pipe exception:", err); 
    }

    chatMessageBody.value = "";
});
