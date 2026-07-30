// js/main.js
import { initMaterialDropdown, renderMaterialList, newMaterial, saveMaterial, deleteMaterial, addCompositionRow } from './materials.js';
import { addShape, addGroup, clearScene, deleteCurrent } from './scene.js';
import { exportJSON } from './export.js';
import { openSettings, saveSettings, closeSettings, showPanel, showLeftPanel, toggleAccordion, toggleInactiveField } from './ui.js';
import { setCamera, zoomCamera, toggleAxes } from './camera.js';
import { updatePresetInputs, createGridPreset, updateHexInputs, createHexPreset, updateCircularInputs, createCircularLatticePreset, createPOLARISPreset, createRBMKPreset } from './presets.js';
import { recenterView } from './scene.js'; // or wherever recenterView resides
import { updatePos, updateRotation, updateDims, updateName, updateMaterial } from './scene.js';
import { toggleTreeGroup } from './scene.js';

// Expose functions required by inline HTML event handlers
window.addShape = addShape;
window.addGroup = addGroup;
window.clearScene = clearScene;
window.deleteCurrent = deleteCurrent;
window.exportJSON = exportJSON;

window.openSettings = openSettings;
window.saveSettings = saveSettings;
window.closeSettings = closeSettings;
window.showPanel = showPanel;
window.showLeftPanel = showLeftPanel;
window.toggleAccordion = toggleAccordion;
window.toggleInactiveField = toggleInactiveField;

window.newMaterial = newMaterial;
window.saveMaterial = saveMaterial;
window.deleteMaterial = deleteMaterial;

window.setCamera = setCamera;
window.zoomCamera = zoomCamera;
window.toggleAxes = toggleAxes;
window.recenterView = recenterView;

window.updatePresetInputs = updatePresetInputs;
window.createGridPreset = createGridPreset;
window.updateHexInputs = updateHexInputs;
window.createHexPreset = createHexPreset;
window.updateCircularInputs = updateCircularInputs;
window.createCircularLatticePreset = createCircularLatticePreset;
window.createPOLARISPreset = createPOLARISPreset;
window.createRBMKPreset = createRBMKPreset;

window.updatePos = updatePos;
window.updateRotation = updateRotation;
window.updateDims = updateDims;
window.updateName = updateName;
window.updateMaterial = updateMaterial;
window.addCompositionRow = addCompositionRow;

window.toggleTreeGroup = toggleTreeGroup;

// ... existing window assignments above ...
window.addCompositionRow = addCompositionRow;
window.toggleTreeGroup = toggleTreeGroup;

function toggleExportMenu() {
    document.getElementById('exportDropdown').classList.toggle('show');
}

window.addEventListener('click', function(event) {
    if (!event.target.closest('.export-module')) {
        const dropdown = document.getElementById('exportDropdown');
        if (dropdown && dropdown.classList.contains('show')) {
            dropdown.classList.remove('show');
        }
    }
});

function exportModel(format) {
    document.getElementById('exportDropdown').classList.remove('show');
    
    console.log(`[Export Pipeline triggered]: Initializing export for format -> ${format.toUpperCase()}`);
    
    switch(format) {
        case 'json':
            // Trigger your existing JSON export function
            if (typeof exportJSON === 'function') exportJSON();
            break;
        case 'openmc':
            // Placeholder: Generate OpenMC xml logic
            break;
        case 'mcnp':
            // Placeholder: Generate MCNP cards
            break;
        case 'serpent':
            // Placeholder: Generate SERPENT syntax
            break;
        default:
            console.error("Unknown export format requested.");
    }
}

// 2. Expose the functions to the global window object
window.toggleExportMenu = toggleExportMenu;
window.exportModel = exportModel;

/* =========================================
    VIEWPORT EXTENSIONS (PLACEHOLDERS)
   ========================================= */

// Placeholder logic for changing the render display mode
function setRenderMode() {
    const mode = document.getElementById('renderModeToggle').value;
    console.log(`[Render Mode]: Switching to ${mode.toUpperCase()} mode.`);
    
    // Future logic: Iterate through X3D nodes to swap materials/wireframe flags
}

// Placeholder logic for triggering an image export of the canvas
function captureImage() {
    console.log(`[Capture Image]: Capturing viewport screenshot.`);
    
    // Future logic: extract data URL from <x3d> canvas and trigger download
}

// Expose the new functions to the global window object
window.setRenderMode = setRenderMode;
window.captureImage = captureImage;

/* =========================================
    FOOTER / METRICS / THEME LOGIC
   ========================================= */

// Updates the placeholder scene metrics in the footer
function updateSceneMetrics(objCount = 0, groupCount = 0) {
    const metricsDisplay = document.getElementById('sceneMetrics');
    if (metricsDisplay) {
        metricsDisplay.innerHTML = `<i class="fa-solid fa-shapes"></i> Objects: ${objCount} &middot; Groups: ${groupCount}`;
    }
}

// Toggles light/dark UI mode and sets the X3D skyColor for white screenshots
function toggleTheme() {
    const body = document.body;
    const isLight = body.classList.toggle('light-theme');
    
    // Toggle the sun/moon icon
    const themeIcon = document.getElementById('themeIcon');
    if (isLight) {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
    } else {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    }
    
    // Target the specific X3DOM background element to handle the canvas color
    const x3dBg = document.querySelector('background');
    if (x3dBg) {
        if (isLight) {
            x3dBg.setAttribute('skyColor', '1 1 1'); // Pure white center view
        } else {
            x3dBg.setAttribute('skyColor', '0.15 0.15 0.15'); // Revert to original dark slate
        }
    }
    
    console.log(`[Theme]: Switched to ${isLight ? 'Presentation (Light)' : 'Workstation (Dark)'} mode.`);
}

// Expose new functions to global scope
window.toggleTheme = toggleTheme;
window.updateSceneMetrics = updateSceneMetrics;

/* =========================================
    APP INITIALIZATION
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {
    initMaterialDropdown();
    renderMaterialList();
});

// Application Initialization on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    initMaterialDropdown();
    renderMaterialList();
});