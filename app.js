/**
 * Crisis Relief Coordinator - V3.1 Core
 * ES6 Class-based Architecture with Persistence & Multi-Page Support
 */

class DataManager {
    constructor() {
        this.incidents = this.load('incidents') || this.getDefaultIncidents();
        this.resources = this.load('resources') || this.getDefaultResources();
        this.volunteers = this.load('volunteers') || this.getDefaultVolunteers();
    }

    save() {
        localStorage.setItem('crc_incidents', JSON.stringify(this.incidents));
        localStorage.setItem('crc_resources', JSON.stringify(this.resources));
        localStorage.setItem('crc_volunteers', JSON.stringify(this.volunteers));
    }

    load(key) {
        const data = localStorage.getItem(`crc_${key}`);
        return data ? JSON.parse(data) : null;
    }

    getDefaultIncidents() {
        return [
            { id: 17192834, coords: [40.7128, -74.0060], type: 'Fire', severity: 'high', time: '2 mins ago', reporter: { name: 'John Doe', avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=random', contact: '+1 555-0101', role: 'Civilian', trust: 85 }, description: 'Large structural fire at the old warehouse. Smoke visible from 5 blocks away.' },
            { id: 17192835, coords: [40.7200, -74.0100], type: 'Medical', severity: 'medium', time: '15 mins ago', reporter: { name: 'Alice Smith', avatar: 'https://ui-avatars.com/api/?name=Alice+Smith&background=random', contact: '+1 555-0102', role: 'Medic', trust: 98 }, description: 'Multiple injuries reported following a vehicle collision. Two passengers require immediate extraction.' }
        ];
    }

    getDefaultResources() {
        return [
            { id: 1, name: 'Bottled Water', category: 'Hydration', quantity: 2400, unit: 'Liters', status: 'Adequate' },
            { id: 2, name: 'MRE Packs', category: 'Food', quantity: 150, unit: 'Box', status: 'Low' },
            { id: 3, name: 'First Aid Kits', category: 'Medical', quantity: 500, unit: 'Kits', status: 'Surplus' },
            { id: 4, name: 'Blankets', category: 'Shelter', quantity: 800, unit: 'Pcs', status: 'Adequate' },
            { id: 5, name: 'Generators', category: 'Power', quantity: 5, unit: 'Units', status: 'Critical' },
            { id: 6, name: 'Flashlights', category: 'Equipment', quantity: 200, unit: 'Pcs', status: 'Adequate' }
        ];
    }

    getDefaultVolunteers() {
        return [
            { id: 1, name: 'Sarah Jenkins', role: 'Paramedic', status: 'Busy', location: 'Sector 4', avatar: 'https://ui-avatars.com/api/?name=Sarah+Jenkins&background=random' },
            { id: 2, name: 'Mike Ross', role: 'Logistics', status: 'Online', location: 'Base Alpha', avatar: 'https://ui-avatars.com/api/?name=Mike+Ross&background=random' },
            { id: 3, name: 'David Kim', role: 'Search & Rescue', status: 'Offline', location: '-', avatar: 'https://ui-avatars.com/api/?name=David+Kim&background=random' },
            { id: 4, name: 'Elena Rodriguez', role: 'Medical', status: 'Online', location: 'Mobile Unit 2', avatar: 'https://ui-avatars.com/api/?name=Elena+Rodriguez&background=random' },
            { id: 5, name: 'Tom Hardy', role: 'Driver', status: 'Busy', location: 'Route 9', avatar: 'https://ui-avatars.com/api/?name=Tom+Hardy&background=random' }
        ];
    }
}

class MapManager {
    constructor(dataManager) {
        this.data = dataManager;
        this.miniMap = null;
        this.fullMap = null;
        this.markers = [];
        this.tileLayers = {
            dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
            street: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        };
    }

    init() {
        const center = [40.7128, -74.0060];

        if (document.getElementById('mini-map')) {
            this.miniMap = L.map('mini-map', { zoomControl: false, dragging: false, scrollWheelZoom: false }).setView(center, 12);
            L.tileLayer(this.tileLayers.dark).addTo(this.miniMap);
            this.renderMarkers(this.miniMap);
        }

        if (document.getElementById('full-map')) {
            window.fullMap = L.map('full-map').setView(center, 13);
            this.fullMap = window.fullMap;
            L.tileLayer(this.tileLayers.dark).addTo(this.fullMap);
            this.renderMarkers(this.fullMap);
        }
    }

    renderMarkers(map) {
        this.markers.forEach(m => map.removeLayer(m));
        this.markers = [];

        this.data.incidents.forEach(incident => {
            let color = '#3b82f6';
            if (incident.severity === 'high') color = '#ef4444';
            if (incident.severity === 'medium') color = '#f59e0b';

            const marker = L.circleMarker(incident.coords, {
                radius: 8, fillColor: color, color: '#fff', weight: 2, opacity: 1, fillOpacity: 0.8
            }).addTo(map);

            marker.bindPopup(`
                <div style="font-family: 'Outfit', sans-serif;">
                    <strong style="color: ${color}; text-transform: uppercase; font-size: 0.8rem;">${incident.severity} Priority</strong>
                    <h3 style="margin: 4px 0; font-size: 1rem;">${incident.type}</h3>
                    <p style="font-size: 0.85rem; margin-bottom: 8px;">${incident.description ? incident.description.substring(0, 50) + '...' : 'No details.'}</p>
                    <a href="incident.html?id=${incident.id}" class="btn-primary" style="display:inline-block; text-decoration:none; padding: 4px 12px; font-size: 0.8rem; color: #fff; background: var(--accent-primary); border-radius: 4px;">View Details</a>
                </div>
            `);

            this.markers.push(marker);
        });
    }

    flyToIncident(coords) {
        if (this.fullMap) this.fullMap.flyTo(coords, 15);
        if (this.miniMap) this.miniMap.setView(coords, 13);
    }

    toggleLayer(type) {
        // Placeholder for V3 features
    }
}

class UIManager {
    constructor(dataManager) {
        this.data = dataManager;
    }

    init() {
        this.renderResources();
        this.renderVolunteers();
        this.renderAlertFeed();
        this.setupNavigation();
    }

    renderResources() {
        const grid = document.getElementById('resource-grid');
        if (!grid) return;
        grid.innerHTML = this.data.resources.map(item => this.createResourceCard(item)).join('');
    }

    createResourceCard(item) {
        let statusClass = 'status-ok', borderClass = 'resource-status-ok';
        if (item.status === 'Low' || item.status === 'Critical') { statusClass = 'status-low'; borderClass = 'resource-status-low'; }
        if (item.status === 'Surplus') { statusClass = 'status-surplus'; borderClass = 'resource-status-surplus'; }

        return `
        <div class="resource-card glass-panel ${borderClass}">
            <div class="res-header"><span class="res-category">${item.category}</span></div>
            <h3 class="res-name">${item.name}</h3>
            <div class="res-details">
                <div class="res-qty-box"><div class="res-quantity">${item.quantity.toLocaleString()}</div><div class="res-unit">${item.unit}</div></div>
                <span class="res-status-badge ${statusClass}">${item.status}</span>
            </div>
        </div>`;
    }

    renderVolunteers() {
        const grid = document.getElementById('volunteer-grid');
        if (!grid) return;
        grid.innerHTML = this.data.volunteers.map(vol => {
            let statusColor = vol.status === 'Busy' ? 'var(--status-warning)' : (vol.status === 'Offline' ? 'var(--text-secondary)' : 'var(--status-success)');
            return `
            <div class="resource-card glass-panel" style="display: flex; align-items: center; gap: 1rem;">
                <img src="${vol.avatar}" class="avatar-img" style="border-color: ${statusColor}">
                <div style="flex: 1;"><h4 style="font-size: 1rem;">${vol.name}</h4><p style="font-size: 0.8rem; color: #94a3b8;">${vol.role}</p></div>
                <div style="text-align: right;"><span style="font-size: 0.8rem; color: ${statusColor};">${vol.status}</span></div>
            </div>`;
        }).join('');
    }

    renderAlertFeed() {
        const list = document.querySelector('.alert-list');
        if (!list) return;
        list.innerHTML = this.data.incidents.slice(0, 10).map(inc => `
            <li class="alert-item ${inc.severity === 'high' ? 'high-priority' : 'medium-priority'}" onclick="window.location.href='incident.html?id=${inc.id}'" style="cursor: pointer;">
                <div class="alert-icon"><i class="fa-solid fa-triangle-exclamation"></i></div>
                <div class="alert-content">
                    <h4>${inc.type} Reported</h4>
                    <span class="time">${inc.time}</span>
                    <p style="font-size: 0.8rem; color: #94a3b8; margin-top:2px;">Reported by: ${inc.reporter ? inc.reporter.name : 'Unknown'}</p>
                </div>
            </li>
        `).join('');

        // Update Count
        const countEl = document.getElementById('total-crises');
        if (countEl) countEl.innerText = this.data.incidents.length;
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-links li a, .view-all');
        const sections = document.querySelectorAll('.view-section');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);

                document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
                if (link.parentElement.tagName === 'LI') link.parentElement.classList.add('active');

                sections.forEach(s => {
                    s.classList.remove('active');
                    if (s.id === targetId) s.classList.add('active');
                });

                if (targetId === 'map' && window.fullMap) setTimeout(() => window.fullMap.invalidateSize(), 100);
            });
        });
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `<i class="fa-solid fa-circle-info"></i><span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => toast.style.transform = 'translateX(0)', 10);
        setTimeout(() => { toast.style.transform = 'translateX(120%)'; setTimeout(() => toast.remove(), 300); }, 3500);
    }
}

class SimulationManager {
    constructor(dataManager, uiManager, mapManager) {
        this.data = dataManager;
        this.ui = uiManager;
        this.map = mapManager;
    }

    triggerRandomIncident() {
        const types = ['Fire', 'Medical', 'Flood', 'Structure Fail'];
        const type = types[Math.floor(Math.random() * types.length)];
        const names = ['Michael Barnes', 'Sarah Connor', 'Rick Deckard', 'Ellen Ripley', 'John Wick'];
        const roles = ['Civilian', 'Police Officer', 'Grid Worker', 'Medic'];

        const newIncident = {
            id: Date.now(),
            coords: [40.7 + (Math.random() - 0.5) * 0.1, -74.0 + (Math.random() - 0.5) * 0.1],
            type: type,
            severity: Math.random() > 0.5 ? 'high' : 'medium',
            time: 'Just now',
            reporter: {
                name: names[Math.floor(Math.random() * names.length)],
                avatar: `https://ui-avatars.com/api/?name=${Math.ceil(Math.random() * 10)}&background=random`,
                contact: `+1 555-0${Math.floor(100 + Math.random() * 900)}`,
                role: roles[Math.floor(Math.random() * roles.length)],
                trust: Math.floor(80 + Math.random() * 20)
            },
            description: `Emergency reported at Sector ${Math.floor(Math.random() * 9)}. Witness claims ${type.toLowerCase()} is expanding rapidly. Immediate assistance requested.`
        };

        this.data.incidents.unshift(newIncident);
        this.data.save(); // Persist

        this.map.renderMarkers(this.map.fullMap || this.map.miniMap);
        this.ui.renderAlertFeed();
        this.ui.showToast(`New ${type} Incident reported by ${newIncident.reporter.name}`, 'alert');
        if (window.app && window.app.updateCharts) window.app.updateCharts();
    }

    startAutoSimulation() {
        setInterval(() => { if (Math.random() > 0.85) this.triggerRandomIncident(); }, 15000);
    }
}

class DetailViewManager {
    constructor(dataManager) {
        this.data = dataManager;
    }

    init() {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        if (!id) return;

        const incident = this.data.incidents.find(i => i.id == id);
        if (!incident) {
            document.getElementById('incident-title').innerText = 'Incident Not Found';
            return;
        }

        // Render Details
        document.getElementById('incident-title').innerText = `${incident.type} #${incident.id.toString().slice(-4)}`;
        document.getElementById('incident-type').innerText = incident.type;
        document.getElementById('incident-severity').innerText = incident.severity.toUpperCase();
        document.getElementById('incident-time').innerText = incident.time;
        document.getElementById('incident-coords').innerText = `${incident.coords[0].toFixed(4)}, ${incident.coords[1].toFixed(4)}`;
        document.getElementById('incident-desc').innerText = incident.description;

        if (incident.reporter) {
            document.getElementById('reporter-name').innerText = incident.reporter.name;
            document.getElementById('reporter-role').innerText = incident.reporter.role;
            document.getElementById('reporter-contact').innerText = incident.reporter.contact;
            document.getElementById('reporter-trust').innerText = `${incident.reporter.trust}%`;
            document.getElementById('reporter-avatar').src = incident.reporter.avatar;
        }

        // Render Detail Map
        setTimeout(() => {
            const map = L.map('detail-map', { zoomControl: false }).setView(incident.coords, 15);
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);
            L.circleMarker(incident.coords, { radius: 12, color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.6 }).addTo(map);
        }, 100);
    }
}

class App {
    constructor() {
        this.dataManager = new DataManager();
        this.mapManager = new MapManager(this.dataManager);
        this.uiManager = new UIManager(this.dataManager);
        this.simulationManager = new SimulationManager(this.dataManager, this.uiManager, this.mapManager);
        this.detailManager = new DetailViewManager(this.dataManager);
        this.charts = {};
    }

    init() {
        // Check if we are on Dashboard or Detail page
        if (document.getElementById('dashboard')) {
            this.mapManager.init();
            this.uiManager.init();
            this.initCharts();
            this.simulationManager.startAutoSimulation();
        } else if (document.getElementById('detail-map')) {
            this.detailManager.init();
        }
    }

    // ... Charts (same as before) ...
    initCharts() {
        const ctxRes = document.getElementById('resourceChart');
        const ctxTrend = document.getElementById('trendChart');

        if (ctxRes) {
            this.charts.resource = new Chart(ctxRes, {
                type: 'doughnut',
                data: {
                    labels: ['Food', 'Water', 'Medical'],
                    datasets: [{
                        data: [30, 50, 20],
                        backgroundColor: ['#f59e0b', '#3b82f6', '#ef4444'],
                        borderWidth: 0
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
            });
        }

        if (ctxTrend) {
            this.charts.trend = new Chart(ctxTrend, {
                type: 'line',
                data: {
                    labels: ['1h', '45m', '30m', '15m', 'Now'],
                    datasets: [{
                        label: 'Incidents',
                        data: [2, 4, 3, 5, 8],
                        borderColor: '#8b5cf6',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { x: { display: false }, y: { display: false } }
                }
            });
        }
    }

    updateCharts() {
        // Mock update 
        if (this.charts.trend) {
            const data = this.charts.trend.data.datasets[0].data;
            data.shift(); data.push(Math.floor(Math.random() * 10));
            this.charts.trend.update();
        }
    }
}

const app = new App();
document.addEventListener('DOMContentLoaded', () => app.init());
