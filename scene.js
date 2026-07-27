import { AppState, MATERIAL_DB, DEFAULTS } from './state.js';
import { updateInputFields, getFloat, setStatus } from './ui.js';

export function addShape(type) {
    // 1. Determine Parent (Where does this new shape go?)
    var parent = document.getElementById("scene");         // Default: Scene Root
    var treeParent = document.getElementById("treeRoot");  // Default: Tree Root

    if (AppState.selectedNode) {
        // Check if the selected node itself is a Group
        if (AppState.selectedNode.getAttribute('class') === 'group-node') {
            parent = AppState.selectedNode;
            treeParent = document.getElementById('container_' + AppState.selectedNode.id);
        }
        // Check if the selected node is INSIDE a Group (Sibling logic)
        else if (AppState.selectedNode.parentNode && AppState.selectedNode.parentNode.getAttribute('class') === 'group-node') {
            parent = AppState.selectedNode.parentNode;
            treeParent = document.getElementById('container_' + parent.id);
        }
    }

    // 2. Create the Node using Helper
    // Pass empty params so it uses DEFAULTS
    var t = createSceneObject(type, {});

    // 3. Append to calculated Parent
    parent.appendChild(t);

    // 4. Events & Tree
    // (Note: mousedown is already attached in createSceneObject)

    // Pass the calculated treeParent to the tree builder
    var uniqueID = t.getAttribute("DEF");
    addTreeItem(uniqueID, type, t, treeParent);

    // 5. Initialize Gizmo
    // (Handled inside createSceneObject now)

    selectObject(t);
    setStatus("Created: " + uniqueID);
}

function dragCallback(transformNode) {
    if (!transformNode) return;
    if (AppState.selectedNode !== transformNode) selectObject(transformNode);

    // Get current local position from element
    var trans = transformNode.getAttribute("translation") || "0 0 0";
    var parts = trans.split(" ").map(Number);
    var positionVector = { x: parts[0], y: parts[1], z: parts[2] };

    // Get Parents Offset
    var parentOff = getParentOffsets(transformNode);

    // Display = Local (from Gizmo) + Parent
    updateInputFields('posX', positionVector.x + parentOff.x);
    updateInputFields('posY', positionVector.y + parentOff.y);
    updateInputFields('posZ', positionVector.z + parentOff.z);
}

export function selectObject(node) {
    if (!node) return;

    if (AppState.selectedNode === node) {
        deselectCurrent();
        return;
    }

    AppState.selectedNode = node;
    var def = node.getAttribute("DEF");
    var isGroup = (node.getAttribute("class") === "group-node");

    // 1. Sync Tree & Name
    updateTreeSelection(def);
    document.getElementById('objName').value = def;

    // 2. Sync Material
    var matSelect = document.getElementById('matSelect');

    if (isGroup) {
        // If Group: Scan children to decide what to show
        var groupState = checkGroupMaterialState(node);
        matSelect.value = groupState;
    } else {
        // If Shape: Show its actual material ID
        var savedMatId = node.getAttribute("data-mat-id") || "mat_fuel";
        matSelect.value = savedMatId;
    }

    // 3. Position & Rotation (CALCULATE ABSOLUTE)
    var parentOff = getParentOffsets(node);

    // Position: Local + Parent
    var transRaw = node.getAttribute("translation") || "0 0 0";
    var localPos = transRaw.split(' ').map(Number);
    updateInputFields('posX', localPos[0] + parentOff.x);
    updateInputFields('posY', localPos[1] + parentOff.y);
    updateInputFields('posZ', localPos[2] + parentOff.z);

    // Rotation: Local + Parent
    var rotRaw = node.getAttribute("data-euler") || "0 0 0";
    var localRot = rotRaw.split(' ').map(Number);
    updateInputFields('rotX', localRot[0] + parentOff.rx);
    updateInputFields('rotY', localRot[1] + parentOff.ry);
    updateInputFields('rotZ', localRot[2] + parentOff.rz);

    // 4. Handle Context (Group vs Shape)
    if (isGroup) {
        // HIDE Dimensions for groups
        document.getElementById('grp-radius').style.display = 'none';
        document.getElementById('grp-height').style.display = 'none';
        document.getElementById('grp-size').style.display = 'none';

        setStatus("Selected Group: " + def);
    } else {
        // SHOW Dimensions for shapes
        updateDimensionUI(node);
        setStatus("Selected Shape: " + def);
    }

    // Force the properties tab to be open if we were in View, 
    // or just ensure the UI is consistent
    // (Optional: You can uncomment this if you want auto-switching back to properties)
    // document.querySelector('.i-tab').click(); 
}

export function updatePos() {
    if (!AppState.selectedNode) return;

    var parentOff = getParentOffsets(AppState.selectedNode);

    // Calculate Local = TargetAbsolute - ParentOffset
    var x = getFloat('posX') - parentOff.x;
    var y = getFloat('posY') - parentOff.y;
    var z = getFloat('posZ') - parentOff.z;

    AppState.selectedNode.setAttribute("translation", `${x} ${y} ${z}`);
}

export function updateRotation() {
    if (!AppState.selectedNode) return;

    var parentOff = getParentOffsets(AppState.selectedNode);

    // Calculate Local = TargetAbsolute - ParentOffset
    var degX = getFloat('rotX') - parentOff.rx;
    var degY = getFloat('rotY') - parentOff.ry;
    var degZ = getFloat('rotZ') - parentOff.rz;

    // 1. Save Euler (for data persistence)
    AppState.selectedNode.setAttribute("data-euler", `${degX} ${degY} ${degZ}`);

    // 2. Convert to Quaternion for X3D Display
    var radX = degX * (Math.PI / 180);
    var radY = degY * (Math.PI / 180);
    var radZ = degZ * (Math.PI / 180);

    var q = new x3dom.fields.Quaternion();
    q.setFromEuler(radX, radY, radZ);
    var axisAngle = q.toAxisAngle();
    AppState.selectedNode.setAttribute("rotation", `${axisAngle[0].x} ${axisAngle[0].y} ${axisAngle[0].z} ${axisAngle[1]}`);
}

export function updateDims() {
    if (!AppState.selectedNode) return;
    var shape = AppState.selectedNode.querySelector("shape");

    if (shape.querySelector("cylinder")) {
        var cyl = shape.querySelector("cylinder");
        cyl.setAttribute("radius", getFloat('dimRadius'));
        cyl.setAttribute("height", getFloat('dimHeight'));
    } else if (shape.querySelector("sphere")) {
        shape.querySelector("sphere").setAttribute("radius", getFloat('dimRadius'));
    } else if (shape.querySelector("box")) {
        var x = getFloat('sizeX');
        var y = getFloat('sizeY');
        var z = getFloat('sizeZ');
        shape.querySelector("box").setAttribute("size", `${x} ${y} ${z}`);
    }
}

export function updateName() {
    if (!AppState.selectedNode) return;

    var oldID = AppState.selectedNode.getAttribute("DEF");
    var newID = document.getElementById('objName').value.trim();

    if (!newID || newID === oldID) return;

    // 1. Update the X3D node's DEF and id attributes
    AppState.selectedNode.setAttribute("DEF", newID);
    AppState.selectedNode.setAttribute("id", newID);

    // 2. Update the tree item ID (tree_oldID -> tree_newID)
    var treeItem = document.getElementById('tree_' + oldID);
    if (treeItem) {
        treeItem.id = 'tree_' + newID;
    }

    // 3. Update the label text and ID (label_oldID -> label_newID)
    var label = document.getElementById('label_' + oldID);
    if (label) {
        label.innerText = newID;
        label.id = 'label_' + newID;
    }

    // 4. CRITICAL: Update the container ID (container_oldID -> container_newID)
    // This fixes the bug where addShape fails after renaming a Group
    var container = document.getElementById('container_' + oldID);
    if (container) {
        container.id = 'container_' + newID;
    }
}

export function updateMaterial() {
    if (!AppState.selectedNode) return;

    var matId = document.getElementById('matSelect').value;
    if (matId === "mixed") return; // Should not be selectable, but safety check

    var mat = MATERIAL_DB[matId];
    if (!mat) return;

    var isSubtract = (matId === 'mat_subtract');

    // Helper to apply material to one node
    function applyMat(node, material) {
        // Store material data for OpenMC export
        node.setAttribute("data-material", material.name);
        node.setAttribute("data-mat-id", material.id);
        node.setAttribute("data-density", material.density);

        // Get the X3D material node
        var matNode = node.querySelector("appearance material");
        if (!matNode) return;

        if (isSubtract) {
            // SUBTRACT / VOID: Ghost volume styling
            node.setAttribute("data-region-type", "void");
            matNode.setAttribute("diffuseColor", "1.0 1.0 1.0");  // White
            matNode.setAttribute("emissiveColor", "0 0 0");        // No glow
            matNode.setAttribute("transparency", "0.9");           // Nearly invisible
        } else {
            // NORMAL MATERIAL: Solid styling
            node.removeAttribute("data-region-type");
            matNode.setAttribute("diffuseColor", material.color);
            matNode.setAttribute("emissiveColor", "0 0 0");       // No glow
            matNode.setAttribute("transparency", "0.2");          // Slight transparency
        }
    }

    var isGroup = (AppState.selectedNode.getAttribute("class") === "group-node");

    if (isGroup) {
        // Apply to ALL children recursively
        var descendants = AppState.selectedNode.querySelectorAll("transform[data-material]");
        descendants.forEach(function (child) {
            applyMat(child, mat);
        });
        // Also tag the group itself
        AppState.selectedNode.setAttribute("data-material", mat.name);
        AppState.selectedNode.setAttribute("data-mat-id", mat.id);
        if (isSubtract) {
            AppState.selectedNode.setAttribute("data-region-type", "void");
        } else {
            AppState.selectedNode.removeAttribute("data-region-type");
        }
    } else {
        // Apply to single shape
        applyMat(AppState.selectedNode, mat);
    }
}

function updateDimensionUI(node) {
    var shape = node.querySelector("shape");
    var grpRad = document.getElementById('grp-radius');
    var grpHei = document.getElementById('grp-height');
    var grpSize = document.getElementById('grp-size');

    grpRad.style.display = 'none';
    grpHei.style.display = 'none';
    grpSize.style.display = 'none';

    if (shape.querySelector("cylinder")) {
        var cyl = shape.querySelector("cylinder");
        grpRad.style.display = 'flex';
        grpHei.style.display = 'flex';
        updateInputFields('dimRadius', cyl.getAttribute("radius"));
        updateInputFields('dimHeight', cyl.getAttribute("height"));
    } else if (shape.querySelector("sphere")) {
        var sph = shape.querySelector("sphere");
        grpRad.style.display = 'flex';
        updateInputFields('dimRadius', sph.getAttribute("radius"));
    } else if (shape.querySelector("box")) {
        var box = shape.querySelector("box");
        grpSize.style.display = 'block';
        var s = (box.getAttribute("size") || "1 1 1").split(' ');
        updateInputFields('sizeX', s[0]);
        updateInputFields('sizeY', s[1]);
        updateInputFields('sizeZ', s[2]);
    }
}

export function addTreeItem(id, type, nodeRef, targetContainer) {
    var container = targetContainer || document.getElementById('treeRoot');
    var item = document.createElement('div');
    item.className = 'tree-item';
    item.id = 'tree_' + id;

    var iconClass = 'fa-cube';
    if (type === 'Cylinder') iconClass = 'fa-database';
    if (type === 'Sphere') iconClass = 'fa-circle';

    item.innerHTML = `<i class="fa-solid ${iconClass}"></i> <span id="label_${id}">${id}</span>`;
    item.onclick = function (e) {
        e.stopPropagation();
        selectObject(nodeRef);
    };
    container.appendChild(item);
}

export function addGroup() {
    AppState.objectCount++;
    var uniqueID = "Group_" + AppState.objectCount;

    var t = document.createElement('transform');
    t.setAttribute("DEF", uniqueID);
    t.setAttribute("id", uniqueID);
    t.setAttribute("class", "group-node");

    // === FIX START: Initialize Transform Attributes ===
    t.setAttribute("translation", "0 0 0");
    t.setAttribute("rotation", "0 1 0 0");
    t.setAttribute("data-euler", "0 0 0");
    // === FIX END ===

    // Determine Parent
    var parent = document.getElementById('scene');
    var treeParent = document.getElementById('treeRoot');

    if (AppState.selectedNode && AppState.selectedNode.getAttribute('class') === 'group-node') {
        parent = AppState.selectedNode;
        treeParent = document.getElementById('container_' + AppState.selectedNode.id);
    }

    parent.appendChild(t);

    // Events
    t.addEventListener("mousedown", function (e) {
        e.stopPropagation();
        selectObject(t);
    });

    addTreeGroup(uniqueID, t, treeParent);

    setStatus("Created Group: " + uniqueID);
    selectObject(t);
}

function updateTreeSelection(id) {
    document.querySelectorAll('.tree-item').forEach(el => el.classList.remove('selected'));
    var el = document.getElementById('tree_' + id);
    if (el) el.classList.add('selected');
}

function checkGroupMaterialState(groupNode) {
    // Find all Shapes inside this group (recursively)
    var allShapes = groupNode.querySelectorAll("transform[data-mat-id]");

    if (allShapes.length === 0) return "mat_fuel"; // Default if empty

    var firstMatId = allShapes[0].getAttribute("data-mat-id");
    var isMixed = false;

    // Check if any subsequent shape differs from the first
    for (var i = 1; i < allShapes.length; i++) {
        if (allShapes[i].getAttribute("data-mat-id") !== firstMatId) {
            isMixed = true;
            break;
        }
    }

    return isMixed ? "mixed" : firstMatId;
}

export function addTreeGroup(id, nodeRef, parentContainer) {
    // 1. The Label/Button
    var item = document.createElement('div');
    item.className = 'tree-item is-group';
    item.id = 'tree_' + id;

    // Toggle Icon + Folder + Label
    item.innerHTML = `
        <i class="fa-solid fa-caret-right tree-toggle" onclick="toggleTreeGroup('${id}', this, event)"></i> 
        <i class="fa-solid fa-folder"></i> 
        <span id="label_${id}" style="margin-left:5px;">${id}</span>
    `;

    item.onclick = function (e) {
        e.stopPropagation(); // Don't trigger parent clicks
        selectObject(nodeRef);
    };

    // 2. The Container for Children
    var childContainer = document.createElement('div');
    childContainer.id = 'container_' + id;
    childContainer.className = 'nested-group';
    // Optional: Start compressed? For now, start expanded.

    // 3. Append
    parentContainer.appendChild(item);
    parentContainer.appendChild(childContainer);

    return childContainer; // Return so we can append children to it
}

export function toggleTreeGroup(id, icon, event) {
    event.stopPropagation(); // Don't select the group when just toggling
    var container = document.getElementById('container_' + id);
    if (container) {
        if (container.classList.contains('collapsed')) {
            container.classList.remove('collapsed');
            icon.classList.add('expanded');
            icon.className = "fa-solid fa-caret-down tree-toggle";
        } else {
            container.classList.add('collapsed');
            icon.classList.remove('expanded');
            icon.className = "fa-solid fa-caret-right tree-toggle";
        }
    }
}

function deselectCurrent() {
    // 1. Remove highlight from Tree
    if (AppState.selectedNode) {
        var oldDef = AppState.selectedNode.getAttribute("DEF");
        var oldTreeItem = document.getElementById('tree_' + oldDef);
        if (oldTreeItem) oldTreeItem.classList.remove('selected');
    }

    // 2. Clear Internal State
    AppState.selectedNode = null;

    // 3. Clear UI Inputs (Visual feedback that nothing is active)
    document.getElementById('objName').value = "";
    document.getElementById('matSelect').value = "Fuel (UO2)";

    updateInputFields('posX', 0);
    updateInputFields('posY', 0);
    updateInputFields('posZ', 0);
    updateInputFields('rotX', 0);
    updateInputFields('rotY', 0);
    updateInputFields('rotZ', 0);

    // Hide context panels
    // document.getElementById('panel-omc').style.display = 'none';
    document.getElementById('grp-radius').style.display = 'none';
    document.getElementById('grp-height').style.display = 'none';
    document.getElementById('grp-size').style.display = 'none';

    setStatus("Ready. (Root Selected)");
}

export function deleteCurrent() {
    if (!AppState.selectedNode) {
        alert("Nothing selected to delete.");
        return;
    }

    // 1. Identify the items to remove
    var def = AppState.selectedNode.getAttribute("DEF");
    var treeItem = document.getElementById('tree_' + def);
    var treeContainer = document.getElementById('container_' + def); // For groups

    // 2. Remove from HTML Tree
    if (treeItem) treeItem.remove();
    if (treeContainer) treeContainer.remove(); // Remove children container if it was a group

    // 3. Remove from X3D Scene
    AppState.selectedNode.parentNode.removeChild(AppState.selectedNode);

    // 4. Clean up state
    AppState.selectedNode = null;
    deselectCurrent();
    setStatus("Deleted: " + def);
}

function getParentOffsets(node) {
    var sum = { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 };
    var current = node.parentNode;

    while (current && current.tagName !== 'SCENE') {
        // Safe Translation Parse
        var tAttr = current.getAttribute("translation");
        if (tAttr) {
            var t = tAttr.split(' ').map(Number);
            // Check for NaN to be safe
            sum.x += (t[0] || 0);
            sum.y += (t[1] || 0);
            sum.z += (t[2] || 0);
        }

        // Safe Rotation Parse
        var rAttr = current.getAttribute("data-euler");
        if (rAttr) {
            var r = rAttr.split(' ').map(Number);
            sum.rx += (r[0] || 0);
            sum.ry += (r[1] || 0);
            sum.rz += (r[2] || 0);
        }

        current = current.parentNode;
    }
    return sum;
}

export function clearScene() { location.reload(); }

// Fit camera to show all scene objects
export function recenterView() {
    var x3dElem = document.getElementById('x3dElement');
    if (x3dElem && x3dElem.runtime) {
        x3dElem.runtime.showAll('negZ');
        setStatus('Camera re-centered to fit scene.');
    }
}

// --- Apply a specific material from MATERIAL_DB to a scene object node ---
export function applyMaterialToNode(node, matId) {
    var mat = MATERIAL_DB[matId];
    if (!mat) return;
    node.setAttribute('data-material', mat.name);
    node.setAttribute('data-mat-id', mat.id);
    node.setAttribute('data-density', mat.density);
    // Update visual color
    var matElem = node.querySelector('material');
    if (matElem) {
        matElem.setAttribute('diffuseColor', mat.color);
    }
}

export function createSceneObject(type, params) {
    AppState.objectCount++;
    var uniqueID = type + "_" + AppState.objectCount;
    var geoID = "Geo_" + uniqueID;

    // Default material
    var defaultMat = MATERIAL_DB['mat_fuel'];

    // Transform
    var t = document.createElement('transform');
    t.setAttribute("DEF", uniqueID);
    t.setAttribute("id", uniqueID);
    t.setAttribute("rotation", "0 1 0 0");
    t.setAttribute("data-euler", "0 0 0");
    t.setAttribute("data-material", defaultMat.name);
    t.setAttribute("data-mat-id", defaultMat.id);
    t.setAttribute("data-density", defaultMat.density);

    // Shape
    var shape = document.createElement('shape');
    var app = document.createElement('appearance');
    var mat = document.createElement('material');
    mat.setAttribute("diffuseColor", defaultMat.color);
    mat.setAttribute("transparency", "0.1");
    app.appendChild(mat);
    shape.appendChild(app);

    // Geometry
    var geometry;
    if (type === 'Cylinder') {
        geometry = document.createElement('cylinder');
        geometry.setAttribute("radius", params.radius || DEFAULTS.Cylinder.radius);
        geometry.setAttribute("height", params.height || DEFAULTS.Cylinder.height);
    } else if (type === 'Box') {
        geometry = document.createElement('box');
        geometry.setAttribute("size", params.size || DEFAULTS.Box.size);
    } else if (type === 'Sphere') {
        geometry = document.createElement('sphere');
        geometry.setAttribute("radius", params.radius || DEFAULTS.Sphere.radius);
    }
    geometry.setAttribute("DEF", geoID);
    geometry.setAttribute("id", geoID);

    shape.appendChild(geometry);
    t.appendChild(shape);

    // Interaction
    t.addEventListener("mousedown", function (e) {
        e.stopPropagation(); // Stop click from bubbling to parent group
        selectObject(t);
    });

    // Initialize Gizmo (Universal for ALL objects created via this helper)
    var x3dElem = document.getElementById("x3dElement");
    setTimeout(function () {
        // Remove any existing moveable first? X3DOM handles it usually.
        // We attach the Moveable behavior.
        new x3dom.Moveable(x3dElem, t, dragCallback, 0.1);

        // Force Update of Props if needed (hack for some X3DOM versions)
        // Re-setting a value forces X3DOM to refresh geometry
        var geo = document.getElementById(geoID);
        if (geo) {
            if (type === 'Cylinder') {
                geo.setAttribute('radius', geo.getAttribute('radius'));
                geo.setAttribute('height', geo.getAttribute('height'));
            } else if (type === 'Box') {
                geo.setAttribute('size', geo.getAttribute('size'));
            } else if (type === 'Sphere') {
                geo.setAttribute('radius', geo.getAttribute('radius'));
            }
        }
    }, 0);

    return t;
}