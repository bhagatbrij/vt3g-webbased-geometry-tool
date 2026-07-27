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

// Application Initialization on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    initMaterialDropdown();
    renderMaterialList();
});