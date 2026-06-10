const ghanaBounds = L.latLngBounds(
    [4.40, -3.55],  
    [11.20, 1.30]   
);

const map = L.map('map', {
    center: [7.9465, -1.0232], 
    zoom: 7,                   
    minZoom: 6,                
    maxZoom: 18,               
    maxBounds: ghanaBounds,    
    maxBoundsViscosity: 1.0    
}).setView([5.6506, -0.1870], 13); 

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    bounds: ghanaBounds        
}).addTo(map);

const GOOGLE_SHEET_API_URL = "https://script.google.com/macros/s/AKfycbzKfjMQjoXFfb7GG8n5SJtIGw97RTqAltlliMPZsbSnAE5zgjq-bZqG2MsUdIxjjrKV/exec";
const IMGBB_API_KEY = "2515df640deee5f3371feb6768ee9d5f"; 

let userCoords = null;          
let activeMarker = null;        
let localMediaStream = null;    
let userLocationCursor = null;  
let hasCenteredInitial = false; 
let districtGeoData = null;     

const navItems = document.querySelectorAll('.nav-item');
const screens = document.querySelectorAll('.app-screen');

const reportBtn = document.getElementById('report-btn');
const shortcutReportBtn = document.getElementById('shortcut-report-btn');
const reportModal = document.getElementById('report-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const gpsStatus = document.getElementById('gps-status');
const issueForm = document.getElementById('issue-form');
const urgencyInput = document.getElementById('urgency-level');

const videoFeed = document.getElementById('camera-feed');
const captureCanvas = document.getElementById('captured-canvas-frame');
const imagePreview = document.getElementById('image-preview');
const startCamBtn = document.getElementById('start-camera-btn');
const snapPhotoBtn = document.getElementById('snap-photo-btn');

const chatForm = document.getElementById('chat-input-form');
const chatUsername = document.getElementById('chat-username');
const chatMessageBody = document.getElementById('chat-message-body');
const chatMessagesContainer = document.getElementById('chat-messages-container');

const totalReportsStat = document.getElementById('stat-total-reports');
const resolutionRateStat = document.getElementById('stat-resolution-rate');

navItems.forEach(item => {
    item.addEventListener('click', function() {
        const targetScreen = this.getAttribute('data-screen');
        localStorage.setItem('activeCivicScreen', targetScreen);
        executeScreenTransition(targetScreen);
    });
});

function executeScreenTransition(targetScreen) {
    screens.forEach(screen => screen.classList.add('hidden'));
    
    const activePanel = document.getElementById(targetScreen);
    if (activePanel) activePanel.classList.remove('hidden');

    navItems.forEach(nav => {
        if (nav.getAttribute('data-screen') === targetScreen) {
            nav.classList.add('active');
        } else {
            nav.classList.remove('active');
        }
    });

    if (targetScreen === 'screen-map') {
        setTimeout(() => { 
            map.invalidateSize(); 
            if (userCoords) {
                map.panTo(userCoords);
            }
        }, 50);
    }

    if (targetScreen === 'screen-community') {
        loadLiveCommunityMessages();
    }
}

const savedScreen = localStorage.getItem('activeCivicScreen');
if (savedScreen && document.getElementById(savedScreen)) {
    executeScreenTransition(savedScreen);
}

const triggerReportWorkflow = () => {
    reportModal.classList.remove('hidden');
    if (userCoords) {
        gpsStatus.textContent = `Grid lock: ${userCoords[0].toFixed(4)}, ${userCoords[1].toFixed(4)}`;
    } else {
        gpsStatus.textContent = "Awaiting steady hardware GPS coordinate locks...";
    }
};

reportBtn.addEventListener('click', triggerReportWorkflow);
shortcutReportBtn.addEventListener('click', triggerReportWorkflow);

closeModalBtn.addEventListener('click', () => {
    reportModal.classList.add('hidden');
    stopCameraHardware();
    if (activeMarker) {
        map.removeLayer(activeMarker);
        activeMarker = null;
    }
});

function initLiveLocationWatcher() {
    if (!navigator.geolocation) {
        console.error("Hardware telemetry streams missing from browser context.");
        return;
    }

    const liveCursorIcon = L.divIcon({
        className: 'user-location-dot',
        html: `<div class="radar-ring"></div><div class="core-dot"></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
    });

    const successCallback = (position) => {
        const { latitude, longitude } = position.coords;
        userCoords = [latitude, longitude];

        if (!userLocationCursor) {
            userLocationCursor = L.marker(userCoords, { icon: liveCursorIcon }).addTo(map);
            userLocationCursor.bindPopup("<b>You are here</b>").openPopup();
        } else {
            userLocationCursor.setLatLng(userCoords);
        }

        if (!hasCenteredInitial) {
            const activeTab = localStorage.getItem('activeCivicScreen') || 'screen-home';
            if (activeTab === 'screen-map') {
                map.setView(userCoords, 16);
            }
            hasCenteredInitial = true;
        }

        if (reportModal.classList.contains('hidden') === false) {
            gpsStatus.textContent = `Grid lock: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        }
    };

    const errorCallback = (error) => {
        console.warn("High accuracy timeout. Reverting to network positioning layout...", error);
        if (!hasCenteredInitial) {
            userCoords = [5.6506, -0.1870]; 
            map.setView(userCoords, 14);
            hasCenteredInitial = true;
            if (!userLocationCursor) {
                userLocationCursor = L.marker(userCoords, { icon: liveCursorIcon }).addTo(map);
            }
        }
    };

    navigator.geolocation.watchPosition(successCallback, errorCallback, {
        enableHighAccuracy: true, 
        maximumAge: 3000, 
        timeout: 4000     
    });
}

initLiveLocationWatcher();

startCamBtn.addEventListener('click', async () => {
    try {
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
        alert("Camera initialization failed. Check device canvas configuration permissions.");
        console.error(err);
    }
});

snapPhotoBtn.addEventListener('click', () => {
    const context = captureCanvas.getContext('2d');
    captureCanvas.width = videoFeed.videoWidth;
    captureCanvas.height = videoFeed.videoHeight;
    
    context.drawImage(videoFeed, 0, 0, captureCanvas.width, captureCanvas.height);
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

function detectSubMetroDistrict(coords) {
    if (!coords || !districtGeoData) {
        return "Unknown District Assembly";
    }

    try {
        const turfPoint = turf.point([coords[1], coords[0]]);
        let bestMatch = null;

        for (let feature of districtGeoData.features) {
            const isInside = turf.booleanPointInPolygon(turfPoint, feature);
            
            if (isInside) {
                const districtName = feature.properties.adm2_name || feature.properties.ADM2_EN || "Unknown Assembly";
                const regionName = feature.properties.adm1_name || feature.properties.ADM1_EN || "Ghana";
                
                bestMatch = `${districtName} Assembly (${regionName})`;
                
                if (feature.geometry.type === 'Polygon') {
                    break;
                }
            }
        }

        if (bestMatch) {
            console.log(`Verified Spatial Lock: ${bestMatch}`);
            return bestMatch;
        }

    } catch (spatialError) {
        console.error("GIS spatial geometry intersection query failed:", spatialError);
    }

    return "Border Area Corridor";
}

issueForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const issueType = document.getElementById('issue-type').value;
    const urgency = urgencyInput.value;
    const description = document.getElementById('issue-desc').value;
    const base64ImageString = imagePreview.src;

    if (!userCoords) {
        alert("Still waiting on a clear hardware GPS coordinate lock from your device.");
        return;
    }
    if (!base64ImageString) {
        alert("Please snap a photo of the hazard first to provide evidence.");
        return;
    }

    gpsStatus.textContent = "Generating cloud image link (Quick Sharing)...";
    let remoteImageUrl = "";

    try {
        const rawBase64Data = base64ImageString.split(',')[1];
        const formData = new FormData();
        formData.append("image", rawBase64Data);

        const imgbbResponse = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: "POST",
            body: formData
        });
        const imgbbResult = await imgbbResponse.json();
        remoteImageUrl = imgbbResult.data.url;
        console.log("Cloud image link generated successfully:", remoteImageUrl);

    } catch (uploadError) {
        console.error("Image cloud hosting upload failed:", uploadError);
    }

    const targetedDistrict = detectSubMetroDistrict(userCoords);
    const uniqueReportId = `GH-${Math.floor(1000 + Math.random() * 9000)}`;

    const payload = {
        action: "addReport",
        id: uniqueReportId,
        type: issueType,
        urgency: urgency,
        district: targetedDistrict,
        description: description,
        coordinates: `${userCoords[0]},${userCoords[1]}`,
        imageUrl: remoteImageUrl
    };

    plotLocalMarker(userCoords, issueType, urgency, targetedDistrict, description, remoteImageUrl, uniqueReportId);
    
    reportModal.classList.add('hidden');
    
    showConfirmationToast(`🎉 Hazard logged to ${targetedDistrict}!`);
    
    localStorage.setItem('activeCivicScreen', 'screen-map');
    executeScreenTransition('screen-map');

    try {
        await fetch(GOOGLE_SHEET_API_URL, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        console.log("Telemetry payload logged successfully.");
        syncDashboardTelemetryMetrics();
    } catch (error) {
        console.error("Disruption in central Sheet data pipe:", error);
    }

    issueForm.reset();
    imagePreview.src = "";
    imagePreview.classList.add('hidden');
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
            ${img ? `<img src="${img}" style="width:100%; height:auto; border-radius:6px; margin-bottom:6px; display:block; border:1px solid #ddd;">` : ''}
            <p style="margin:0; font-size:12px; color:#333;">${desc || 'No description attached.'}</p>
            <hr style="border:0; border-top:1px solid #e2e8f0; margin:8px 0;">
            <div style="display:flex; justify-content:between; font-size:10px; color:#64748b;">Status: <strong>Open</strong> | ID: ${id}</div>
        </div>
    `);
}

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const userValue = chatUsername.value.trim();
    const messageValue = chatMessageBody.value.trim();
    
    if(!userValue || !messageValue) return;

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

async function loadLiveCommunityMessages() {
    chatMessagesContainer.innerHTML = `
        <div class="chat-bubble system">
            <p>Welcome to the CivicReporter chat channel. Keep messages brief and civil.</p>
        </div>
    `;

    try {
        const response = await fetch(GOOGLE_SHEET_API_URL);
        const remoteData = await response.json();

        remoteData.messages.forEach(msg => {
            const bubbleElement = document.createElement('div');
            bubbleElement.classList.add('chat-bubble');
            
            const dateObj = new Date(msg.timestamp);
            let dateTimeString = "Live";
            
            if (!isNaN(dateObj)) {
                const dateString = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
                const timeString = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                dateTimeString = `${dateString} @ ${timeString}`;
            }

            bubbleElement.innerHTML = `
                <span>${msg.user} (${dateTimeString})</span>
                <p>${msg.message}</p>
            `;
            chatMessagesContainer.appendChild(bubbleElement);
        });

        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
        
    } catch (error) {
        console.error("Disruption loading live chat data pipeline streams:", error);
    }
}

async function syncDashboardTelemetryMetrics() {
    try {
        const response = await fetch(GOOGLE_SHEET_API_URL);
        const remoteData = await response.json();
        
        const totalReportsCount = remoteData.reports.length;
        totalReportsStat.textContent = totalReportsCount;
        
        const uniqueDistricts = new Set();
        remoteData.reports.forEach(report => {
            if (report.district) {
                uniqueDistricts.add(report.district);
            }
        });
        
        resolutionRateStat.textContent = uniqueDistricts.size;

        renderInsightsLeaderboard(remoteData.reports);
        renderHomeHotspots(remoteData.reports);

        map.eachLayer((layer) => {
            if (layer instanceof L.Marker && layer !== userLocationCursor) {
                map.removeLayer(layer);
            }
        });

        remoteData.reports.forEach(report => {
            if (report.coordinates) {
                const splitCoords = report.coordinates.split(',');
                const lat = parseFloat(splitCoords[0]);
                const lng = parseFloat(splitCoords[1]);
                
                if (!isNaN(lat) && !isNaN(lng)) {
                    plotLocalMarker([lat, lng], report.type, report.urgency, report.district, report.description, report.imageUrl, report.id);
                }
            }
        });
        
    } catch (error) {
        totalReportsStat.textContent = "0";
        resolutionRateStat.textContent = "0";
    }
}

async function loadGisBoundaryData() {
    try {
        const response = await fetch('./data/accra_districts.json');
        districtGeoData = await response.json();
        console.log("HDX Administrative boundaries engine fully loaded into browser context.");
        syncDashboardTelemetryMetrics();
    } catch (error) {
        console.error("Critical failure streaming spatial reference dataset pipelines:", error);
        syncDashboardTelemetryMetrics();
    }
}

function renderInsightsLeaderboard(reports) {
    const leaderboardBody = document.querySelector('.leaderboard-table tbody');
    const welcomeCard = document.querySelector('.welcome-card.data-card');
    if (!leaderboardBody) return;

    const typeLabels = {
        clogged_drain: "🚨 Clogged Gutter / Drain",
        pothole: "🕳️ Pothole",
        broken_pipe: "💧 Burst Water Pipe",
        street_light: "💡 Broken Streetlight"
    };

    const districtCounts = {};
    const typeCounts = {};

    reports.forEach(report => {
        if (report.district) {
            districtCounts[report.district] = (districtCounts[report.district] || 0) + 1;
        }
        if (report.type) {
            typeCounts[report.type] = (typeCounts[report.type] || 0) + 1;
        }
    });

    const sortedDistricts = Object.entries(districtCounts).sort((a, b) => b[1] - a[1]);
    const sortedTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);

    if (welcomeCard) {
        let topHazardString = "No hazards reported yet";
        if (sortedTypes.length > 0) {
            const [topTypeKey, topTypeValue] = sortedTypes[0];
            const cleanLabel = typeLabels[topTypeKey] || topTypeKey;
            topHazardString = `${cleanLabel} (${topTypeValue} active logs)`;
        }

        welcomeCard.innerHTML = `
            <h2>Assembly Performance Leaderboard</h2>
            <p>Data metrics tracking average resolution times for flagged infrastructure updates.</p>
            <div style="margin-top: 15px; padding: 12px; background: rgba(255,255,255,0.15); border-radius: 8px; font-size: 13px;">
                <strong>🔥 Top National Concern:</strong> <span style="font-weight: 700;">${topHazardString}</span>
            </div>
        `;
    }

    leaderboardBody.innerHTML = "";

    if (sortedDistricts.length === 0) {
        leaderboardBody.innerHTML = `
            <tr>
                <td colspan="3" style="text-align:center; color:#64748b; padding: 20px;">No public hazard metrics compiled yet.</td>
            </tr>
        `;
        return;
    }

    sortedDistricts.forEach(([districtName, reportVolume]) => {
        let metricClass = "good-stat"; 
        let thresholdLabel = "Low Volume";

        if (reportVolume >= 10) {
            metricClass = "bad-stat";
            thresholdLabel = "Critical Node";
        } else if (reportVolume >= 5) {
            metricClass = "warn-stat";
            thresholdLabel = "Moderate Risks";
        }

        const tableRow = document.createElement('tr');
        tableRow.innerHTML = `
            <td style="font-weight: 600; color: #1e293b; padding: 12px 8px;">${districtName}</td>
            <td style="text-align: center; font-weight: 700;">${reportVolume}</td>
            <td style="text-align: center; font-weight: 600;"><span class="${metricClass}">${thresholdLabel}</span></td>
        `;
        leaderboardBody.appendChild(tableRow);
    });
}

function renderHomeHotspots(reports) {
    const hotspotContainer = document.getElementById('dynamic-hotspot-container');
    if (!hotspotContainer) return;

    const districtCounts = {};
    reports.forEach(report => {
        if (report.district) {
            districtCounts[report.district] = (districtCounts[report.district] || 0) + 1;
        }
    });

    const topHotspots = Object.entries(districtCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

    if (topHotspots.length === 0) {
        hotspotContainer.innerHTML = `
            <div style="text-align: center; color: #64748b; padding: 20px; font-size: 13px;">
                🟢 All municipal networks stable. No active hazard clusters flagged.
            </div>
        `;
        return;
    }

    hotspotContainer.innerHTML = "";

    topHotspots.forEach(([districtName, count]) => {
        let tagLabel = "Active Node";
        let tagClass = "medium";
        if (count >= 5) {
            tagLabel = "High Risk Zone";
            tagClass = "high";
        }

        const hotspotItem = document.createElement('div');
        hotspotItem.classList.add('hotspot-item', 'collapsible-trigger');
        
        hotspotItem.innerHTML = `
            <div class="hotspot-summary">
                <div>
                    <h4 style="margin: 0; font-size: 14px; color: #1e293b;">${districtName}</h4>
                    <span style="font-size: 11px; color: #64748b; display: inline-block; margin-top: 2px;">${count} unresolved civic flags</span>
                </div>
                <span class="hotspot-tag ${tagClass}">${tagLabel}</span>
            </div>
            <div class="hotspot-details hidden-panel">
                <p>Anomalies detected inside this administrative boundary polygon network.</p>
                <button class="focus-region-btn">Focus Map View</button>
            </div>
        `;

        const summaryBlock = hotspotItem.querySelector('.hotspot-summary');
        summaryBlock.addEventListener('click', () => {
            const detailsPanel = hotspotItem.querySelector('.hotspot-details');
            const isExpanded = hotspotItem.classList.contains('expanded');
            
            document.querySelectorAll('.hotspot-item').forEach(item => {
                item.classList.remove('expanded');
                const panel = item.querySelector('.hotspot-details');
                if(panel) {
                    panel.style.maxHeight = "0px";
                    panel.style.opacity = "0";
                    panel.style.marginTop = "0px";
                }
            });

            if (!isExpanded) {
                hotspotItem.classList.add('expanded');
                detailsPanel.style.maxHeight = "120px";
                detailsPanel.style.opacity = "1";
                detailsPanel.style.marginTop = "12px";
            }
        });

        const focusBtn = hotspotItem.querySelector('.focus-region-btn');
        focusBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            
            if (districtGeoData) {
                const matchedFeature = districtGeoData.features.find(f => {
                    const nameAttr = f.properties.adm2_name || f.properties.ADM2_EN;
                    return nameAttr === districtName.split(" Assembly")[0];
                });

                if (matchedFeature) {
                    const centroid = turf.centroid(matchedFeature);
                    const lng = centroid.geometry.coordinates[0];
                    const lat = centroid.geometry.coordinates[1];

                    map.setView([lat, lng], 14);
                }
            }

            localStorage.setItem('activeCivicScreen', 'screen-map');
            executeScreenTransition('screen-map');
        });

        hotspotContainer.appendChild(hotspotItem);
    });
}

function showConfirmationToast(message) {
    const toast = document.getElementById('toast-notification');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.remove('hidden-toast');

    setTimeout(() => {
        toast.classList.add('hidden-toast');
    }, 3500);
}

loadGisBoundaryData();
