import { SIM_SETTINGS } from './state.js';
import { renderMaterialList } from './materials.js';

export function updateInputFields(id, val) {
    var el = document.getElementById(id);
    if (el) el.value = parseFloat(val).toFixed(2);
}

export function getFloat(id) {
    var el = document.getElementById(id);
    return el ? (parseFloat(el.value) || 0) : 0;
}

export function setStatus(msg) {
    var el = document.getElementById('statusText');
    if (el) el.innerText = msg;
}

export function showPanel(panelId) {
    // Hide both panels
    document.getElementById('panel-props').style.display = 'none';
    document.getElementById('panel-view').style.display = 'none';

    // Deactivate tabs
    document.querySelectorAll('.i-tab').forEach(t => t.classList.remove('active'));

    // Activate requested panel & tab
    document.getElementById('panel-' + panelId).style.display = 'block';
    event.target.classList.add('active');
}

export function showLeftPanel(panelId) {
    // Hide all left panels
    document.getElementById('panel-scene').style.display = 'none';
    document.getElementById('panel-presets').style.display = 'none';
    document.getElementById('panel-materials').style.display = 'none';

    // Reset Tabs
    document.querySelectorAll('.u-tab').forEach(t => t.classList.remove('active'));

    // Show Target
    var target = document.getElementById('panel-' + panelId);
    target.style.display = (panelId === 'scene') ? 'flex' : 'block';
    event.target.classList.add('active');

    // Refresh material list when switching to materials tab
    if (panelId === 'materials') renderMaterialList();
}

function switchUniverse(univ) {
    document.querySelectorAll('.u-tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    setStatus("Switched to Universe: " + univ.toUpperCase());
}

export function toggleAccordion(id) {
    var el = document.getElementById(id);
    var header = el.previousElementSibling;

    // Simple toggle
    if (el.classList.contains('active')) {
        el.classList.remove('active');
    } else {
        el.classList.add('active');
    }
}

export function openSettings() {
    document.getElementById('setBatches').value = SIM_SETTINGS.batches;
    document.getElementById('setParticles').value = SIM_SETTINGS.particles;
    document.getElementById('setInactive').value = SIM_SETTINGS.inactive;
    document.getElementById('setRunMode').value = SIM_SETTINGS.run_mode;
    document.getElementById('setBoundary').value = SIM_SETTINGS.boundary;
    toggleInactiveField();
    document.getElementById('modal-settings').classList.add('active');
}

export function saveSettings() {
    var batches = parseInt(document.getElementById('setBatches').value) || 50;
    var particles = parseInt(document.getElementById('setParticles').value) || 1000;
    var inactive = parseInt(document.getElementById('setInactive').value) || 10;

    if (batches < 1) { alert('Batches must be at least 1.'); return; }
    if (particles < 1) { alert('Particles must be at least 1.'); return; }

    SIM_SETTINGS.batches = batches;
    SIM_SETTINGS.particles = particles;
    SIM_SETTINGS.inactive = inactive;
    SIM_SETTINGS.run_mode = document.getElementById('setRunMode').value;
    SIM_SETTINGS.boundary = document.getElementById('setBoundary').value;

    closeSettings();
    setStatus('Settings saved: ' + batches + ' batches, ' + particles + ' particles, ' + SIM_SETTINGS.boundary + ' boundary');
}

export function closeSettings() {
    document.getElementById('modal-settings').classList.remove('active');
}

export function toggleInactiveField() {
    var mode = document.getElementById('setRunMode').value;
    document.getElementById('setInactive').disabled = (mode === 'fixed');
}