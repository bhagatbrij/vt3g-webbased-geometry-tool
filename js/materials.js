import { MATERIAL_DB } from './state.js';
import { setStatus } from './ui.js';

// Helper to lookup material by name (for backwards compatibility)
function getMaterialByName(name) {
    for (var key in MATERIAL_DB) {
        if (MATERIAL_DB[key].name === name) return MATERIAL_DB[key];
    }
    return null;
}

export function initMaterialDropdown() {
    refreshMaterialDropdown();
}

// ===============================================
// 9. MATERIAL MANAGER FUNCTIONS
// ===============================================

function refreshMaterialDropdown() {
    var select = document.getElementById('matSelect');
    // Keep the first "mixed" option, remove the rest
    while (select.options.length > 1) select.remove(1);
    for (var key in MATERIAL_DB) {
        var mat = MATERIAL_DB[key];
        var opt = document.createElement('option');
        opt.value = mat.id;
        opt.textContent = mat.name;
        select.appendChild(opt);
    }
}

export function renderMaterialList() {
    var list = document.getElementById('matList');
    list.innerHTML = '';
    for (var key in MATERIAL_DB) {
        var mat = MATERIAL_DB[key];
        var rgb = mat.color.split(' ');
        var cssColor = 'rgb(' + Math.round(rgb[0] * 255) + ',' + Math.round(rgb[1] * 255) + ',' + Math.round(rgb[2] * 255) + ')';
        var item = document.createElement('div');
        item.className = 'mat-list-item';
        item.setAttribute('data-mat-key', key);
        item.innerHTML = '<div class="mat-swatch" style="background:' + cssColor + '"></div>'
            + '<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + mat.name + '</span>'
            + (mat.locked ? '<i class="fa-solid fa-lock" style="color:var(--text-mute);font-size:10px;"></i>' : '');
        item.onclick = (function (k) { return function () { selectMaterialForEdit(k); }; })(key);
        list.appendChild(item);
    }
}

function selectMaterialForEdit(key) {
    var mat = MATERIAL_DB[key];
    if (!mat) return;

    // Highlight in list
    document.querySelectorAll('.mat-list-item').forEach(function (el) { el.classList.remove('selected'); });
    var item = document.querySelector('.mat-list-item[data-mat-key="' + key + '"]');
    if (item) item.classList.add('selected');

    // Fill form
    document.getElementById('matEditKey').value = key;
    document.getElementById('matEditName').value = mat.name;
    document.getElementById('matEditColor').value = mat.color;
    document.getElementById('matEditDensity').value = mat.density;
    document.getElementById('matEditDensityUnit').value = mat.density_unit;

    // Composition rows
    renderCompositionRows(mat.composition || []);

    // Lock controls for mat_subtract
    var isLocked = !!mat.locked;
    document.getElementById('matEditName').disabled = isLocked;
    document.getElementById('matEditColor').disabled = isLocked;
    document.getElementById('matEditDensity').disabled = isLocked;
    document.getElementById('matEditDensityUnit').disabled = isLocked;
    document.getElementById('matDeleteBtn').style.display = isLocked ? 'none' : 'block';

    document.getElementById('matEditForm').style.display = 'block';
}

function renderCompositionRows(composition) {
    var container = document.getElementById('compRows');
    container.innerHTML = '';
    composition.forEach(function (comp, idx) {
        addCompositionRow(comp.id, comp.amount, comp.type);
    });
}

export function addCompositionRow(isoId, amount, fracType) {
    var container = document.getElementById('compRows');
    var row = document.createElement('div');
    row.className = 'comp-row';
    row.innerHTML =
        '<input type="text" class="comp-id" placeholder="e.g. U235 or Zr" value="' + (isoId || '') + '">'
        + '<input type="number" class="comp-amt" step="0.01" placeholder="Amount" value="' + (amount || '') + '">'
        + '<select class="comp-type">'
        + '  <option value="ao"' + ((fracType !== 'wo') ? ' selected' : '') + '>Atom %</option>'
        + '  <option value="wo"' + ((fracType === 'wo') ? ' selected' : '') + '>Wt %</option>'
        + '</select>'
        + '<button class="comp-del" onclick="this.parentElement.remove()"><i class="fa-solid fa-xmark"></i></button>';
    container.appendChild(row);
}

export function newMaterial() {
    // Generate immutable ID
    var key = 'mat_' + Date.now();
    MATERIAL_DB[key] = {
        id: key, name: 'New Material', color: '0.5 0.5 0.5',
        density: 1.0, density_unit: 'g/cm3', composition: []
    };
    refreshMaterialDropdown();
    renderMaterialList();
    selectMaterialForEdit(key);
    setStatus('Created new material: ' + key);
}

export function saveMaterial() {
    var key = document.getElementById('matEditKey').value;
    var mat = MATERIAL_DB[key];
    if (!mat || mat.locked) return;

    var name = document.getElementById('matEditName').value.trim();
    if (!name) { alert('Material name cannot be empty.'); return; }

    // Parse composition and validate
    var rows = document.querySelectorAll('#compRows .comp-row');
    var composition = [];
    var valid = true;
    rows.forEach(function (row) {
        var isoId = row.querySelector('.comp-id').value.trim();
        var amt = parseFloat(row.querySelector('.comp-amt').value);
        var ftype = row.querySelector('.comp-type').value;
        if (!isoId) { alert('Isotope/Element ID cannot be empty.'); valid = false; return; }
        if (isNaN(amt) || amt <= 0) { alert('Amount for "' + isoId + '" must be a positive number.'); valid = false; return; }
        composition.push({ id: isoId, amount: amt, type: ftype });
    });
    if (!valid) return;

    mat.name = name;
    mat.color = document.getElementById('matEditColor').value.trim() || '0.5 0.5 0.5';
    mat.density = parseFloat(document.getElementById('matEditDensity').value) || 0;
    mat.density_unit = document.getElementById('matEditDensityUnit').value;
    mat.composition = composition;

    refreshMaterialDropdown();
    renderMaterialList();
    selectMaterialForEdit(key);
    setStatus('Saved material: ' + mat.name);
}

export function deleteMaterial() {
    var key = document.getElementById('matEditKey').value;
    var mat = MATERIAL_DB[key];
    if (!mat || mat.locked) return;

    // REFERENTIAL INTEGRITY CHECK: Is this material in use?
    var inUse = false;
    var scene = document.getElementById('scene');
    var allNodes = scene.querySelectorAll('transform[data-mat-id]');
    allNodes.forEach(function (node) {
        if (node.getAttribute('data-mat-id') === key) inUse = true;
    });
    if (inUse) {
        alert('Cannot delete "' + mat.name + '" — it is assigned to one or more geometry objects.\n\nReassign those objects to a different material first.');
        return;
    }

    if (!confirm('Delete material "' + mat.name + '"?')) return;

    delete MATERIAL_DB[key];
    document.getElementById('matEditForm').style.display = 'none';
    refreshMaterialDropdown();
    renderMaterialList();
    setStatus('Deleted material: ' + mat.name);
}