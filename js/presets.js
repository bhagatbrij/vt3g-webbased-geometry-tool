import { AppState, MATERIAL_DB } from './state.js';
import { setStatus } from './ui.js';
import { createSceneObject, applyMaterialToNode, addTreeItem, addTreeGroup, selectObject } from './scene.js';

export function updatePresetInputs() {
    var type = document.getElementById('preType').value;
    document.getElementById('pre-dims-cyl').style.display = (type === 'Cylinder') ? 'block' : 'none';
    document.getElementById('pre-dims-box').style.display = (type === 'Box') ? 'block' : 'none';
    document.getElementById('pre-dims-sph').style.display = (type === 'Sphere') ? 'block' : 'none';
}

export function createGridPreset() {
    var rows = parseInt(document.getElementById('gridRows').value) || 1;
    var cols = parseInt(document.getElementById('gridCols').value) || 1;
    var pitchX = parseFloat(document.getElementById('gridPitchX').value) || 1.0;
    var pitchZ = parseFloat(document.getElementById('gridPitchZ').value) || 1.0;
    var type = document.getElementById('preType').value;

    // 1. Create a Container Group for the Grid
    AppState.objectCount++;
    var groupID = "Grid_" + AppState.objectCount;
    var groupNode = document.createElement('transform');
    groupNode.setAttribute("DEF", groupID);
    groupNode.setAttribute("id", groupID);
    groupNode.setAttribute("class", "group-node");
    groupNode.setAttribute("translation", "0 0 0");
    groupNode.setAttribute("rotation", "0 1 0 0");
    groupNode.setAttribute("data-euler", "0 0 0");

    // Lattice metadata for export
    groupNode.setAttribute("data-lattice-type", "rectangular");
    groupNode.setAttribute("data-lattice-pitch-x", pitchX);
    groupNode.setAttribute("data-lattice-pitch-z", pitchZ);
    groupNode.setAttribute("data-lattice-dim-x", rows);
    groupNode.setAttribute("data-lattice-dim-z", cols);

    // Attach to scene
    var parent = document.getElementById('scene');
    var treeParent = document.getElementById('treeRoot');

    // If something is selected, add as child
    if (AppState.selectedNode && AppState.selectedNode.getAttribute('class') === 'group-node') {
        parent = AppState.selectedNode;
        treeParent = document.getElementById('container_' + AppState.selectedNode.id);
    }

    parent.appendChild(groupNode);

    // Events for Group
    groupNode.addEventListener("mousedown", function (e) {
        e.stopPropagation();
        selectObject(groupNode);
    });

    // Add Group to Tree (and capture the container for children)
    var groupContainer = addTreeGroup(groupID, groupNode, treeParent);
    // Default open state fix
    var toggleIcon = document.getElementById('tree_' + groupID).querySelector('.tree-toggle');
    if (toggleIcon) toggleIcon.className = "fa-solid fa-caret-down tree-toggle"; // Start down

    // 2. Generate Grid Items
    var startX = -((rows - 1) * pitchX) / 2;
    var startZ = -((cols - 1) * pitchZ) / 2;

    // Prepare params object based on type
    var params = {};
    if (type === 'Cylinder') {
        params.radius = parseFloat(document.getElementById('preCylR').value);
        params.height = parseFloat(document.getElementById('preCylH').value);
    } else if (type === 'Box') {
        params.size = document.getElementById('preBoxSize').value;
    } else if (type === 'Sphere') {
        params.radius = parseFloat(document.getElementById('preSphR').value);
    }

    for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
            var x = startX + (r * pitchX);
            var z = startZ + (c * pitchZ);

            // Create Node (using helper)
            var node = createSceneObject(type, params);
            node.setAttribute("translation", `${x} 0 ${z}`);

            // Append to Group
            groupNode.appendChild(node);

            // === NEW: Add child to Tree ===
            addTreeItem(node.getAttribute("DEF"), type, node, groupContainer);
        }
    }

    setStatus("Created Grid: " + rows + "x" + cols);
    selectObject(groupNode);
}

export function updateHexInputs() {
    var type = document.getElementById('hexType').value;
    document.getElementById('hex-dims-cyl').style.display = (type === 'Cylinder') ? 'block' : 'none';
    document.getElementById('hex-dims-box').style.display = (type === 'Box') ? 'block' : 'none';
    document.getElementById('hex-dims-sph').style.display = (type === 'Sphere') ? 'block' : 'none';
}

export function updateCircularInputs() {
    var type = document.getElementById('circType').value;
    document.getElementById('circ-dims-cyl').style.display = (type === 'Cylinder') ? 'block' : 'none';
    document.getElementById('circ-dims-box').style.display = (type === 'Box') ? 'block' : 'none';
    document.getElementById('circ-dims-sph').style.display = (type === 'Sphere') ? 'block' : 'none';
}

export function createHexPreset() {
    var A = parseInt(document.getElementById('hexA').value) || 1;
    var B = parseInt(document.getElementById('hexB').value) || 1;
    var C = parseInt(document.getElementById('hexC').value) || 1;
    var pitch = parseFloat(document.getElementById('hexPitch').value) || 1.2;
    var type = document.getElementById('hexType').value;

    // 1. Create Group Node
    AppState.objectCount++;
    var groupID = "HexGrid_" + AppState.objectCount;
    var groupNode = document.createElement('transform');
    groupNode.setAttribute("DEF", groupID);
    groupNode.setAttribute("id", groupID);
    groupNode.setAttribute("class", "group-node");
    groupNode.setAttribute("translation", "0 0 0");
    groupNode.setAttribute("rotation", "0 1 0 0");
    groupNode.setAttribute("data-euler", "0 0 0");

    // Lattice metadata for export
    groupNode.setAttribute("data-lattice-type", "hexagonal_abc");
    groupNode.setAttribute("data-lattice-a", A);
    groupNode.setAttribute("data-lattice-b", B);
    groupNode.setAttribute("data-lattice-c", C);
    groupNode.setAttribute("data-lattice-pitch", pitch);

    var parent = document.getElementById('scene');
    var treeParent = document.getElementById('treeRoot');
    if (AppState.selectedNode && AppState.selectedNode.getAttribute('class') === 'group-node') {
        parent = AppState.selectedNode;
        treeParent = document.getElementById('container_' + AppState.selectedNode.id);
    }
    parent.appendChild(groupNode);

    groupNode.addEventListener("mousedown", function (e) {
        e.stopPropagation(); selectObject(groupNode);
    });

    var groupContainer = addTreeGroup(groupID, groupNode, treeParent);
    var toggleIcon = document.getElementById('tree_' + groupID).querySelector('.tree-toggle');
    if (toggleIcon) toggleIcon.className = "fa-solid fa-caret-down tree-toggle";

    // 2. Gather object parameters based on type
    var params = {};
    if (type === 'Cylinder') {
        params.radius = parseFloat(document.getElementById('hexCylR').value);
        params.height = parseFloat(document.getElementById('hexCylH').value);
    } else if (type === 'Box') {
        params.size = document.getElementById('hexBoxSize').value;
    } else if (type === 'Sphere') {
        params.radius = parseFloat(document.getElementById('hexSphR').value);
    }

    // 3. A x B x C Hex Grid Generation
    var objectsCreated = 0;
    
    // Calculate the asymmetrical bounding box for the axial coordinates
    var qMin = -(A - 1);
    var qMax = C - 1;
    var rMin = -(B - 1);
    var rMax = A - 1;
    var sMin = -(C - 1);
    var sMax = B - 1;

    for (var q = qMin; q <= qMax; q++) {
        for (var r = rMin; r <= rMax; r++) {
            // In cube coordinates, q + r + s = 0 must always be true
            var s = -q - r;
            
            // If s falls within its bounds, the hex exists in the A x B x C region
            if (s >= sMin && s <= sMax) {
                // Convert axial (q, r) to Cartesian (x, z) for a "pointy-top" hex grid
                var x = pitch * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r);
                var z = pitch * (3 / 2) * r;

                var node = createSceneObject(type, params);
                node.setAttribute("translation", `${x.toFixed(4)} 0 ${z.toFixed(4)}`);
                groupNode.appendChild(node);
                addTreeItem(node.getAttribute("DEF"), type, node, groupContainer);
                objectsCreated++;
            }
        }
    }

    setStatus(`Created Hex Grid: ${objectsCreated} objects (${A}x${B}x${C})`);
    selectObject(groupNode);
}

export function createCircularLatticePreset() {
    var rings = parseInt(document.getElementById('circRings').value) || 6;
    var baseCount = parseInt(document.getElementById('circBaseCount').value) || 6;
    var firstRadius = parseFloat(document.getElementById('circFirstRadius').value) || 4.05384;
    var ringSpacing = parseFloat(document.getElementById('circRingSpacing').value) || 3.92684;
    var type = document.getElementById('circType').value;

    AppState.objectCount++;
    var groupID = "CircularLattice_" + AppState.objectCount;
    var groupNode = document.createElement('transform');
    groupNode.setAttribute("DEF", groupID);
    groupNode.setAttribute("id", groupID);
    groupNode.setAttribute("class", "group-node");
    groupNode.setAttribute("translation", "0 0 0");
    groupNode.setAttribute("rotation", "0 1 0 0");
    groupNode.setAttribute("data-euler", "0 0 0");
    groupNode.setAttribute("data-lattice-type", "circular");
    groupNode.setAttribute("data-lattice-rings", rings);
    groupNode.setAttribute("data-lattice-base-count", baseCount);
    groupNode.setAttribute("data-lattice-first-radius", firstRadius);
    groupNode.setAttribute("data-lattice-ring-spacing", ringSpacing);

    var parent = document.getElementById('scene');
    var treeParent = document.getElementById('treeRoot');
    if (AppState.selectedNode && AppState.selectedNode.getAttribute('class') === 'group-node') {
        parent = AppState.selectedNode;
        treeParent = document.getElementById('container_' + AppState.selectedNode.id);
    }
    parent.appendChild(groupNode);

    groupNode.addEventListener('mousedown', function (e) {
        e.stopPropagation();
        selectObject(groupNode);
    });

    var groupContainer = addTreeGroup(groupID, groupNode, treeParent);
    var toggleIcon = document.getElementById('tree_' + groupID).querySelector('.tree-toggle');
    if (toggleIcon) toggleIcon.className = 'fa-solid fa-caret-down tree-toggle';

    var params = {};
    if (type === 'Cylinder') {
        params.radius = parseFloat(document.getElementById('circCylR').value);
        params.height = parseFloat(document.getElementById('circCylH').value);
    } else if (type === 'Box') {
        params.size = document.getElementById('circBoxSize').value;
    } else if (type === 'Sphere') {
        params.radius = parseFloat(document.getElementById('circSphR').value);
    }

    var objectsCreated = 0;
    for (var ring = 0; ring < rings; ring++) {
        var radius = (ring === 0) ? 0 : firstRadius + ((ring - 1) * ringSpacing);
        var count = (ring === 0) ? 1 : ring * baseCount;
        if (count < 1) count = 1;

        for (var i = 0; i < count; i++) {
            var theta = (count === 1) ? 0 : (i * 360.0 / count) * Math.PI / 180;
            var x = radius * Math.cos(theta);
            var z = radius * Math.sin(theta);
            var node = createSceneObject(type, params);
            node.setAttribute('translation', x.toFixed(4) + ' 0 ' + z.toFixed(4));
            applyMaterialToNode(node, 'mat_abs');
            groupNode.appendChild(node);
            addTreeItem(node.getAttribute('DEF'), type, node, groupContainer);
            objectsCreated++;
        }
    }

    setStatus('Created Circular Lattice: ' + objectsCreated + ' objects (' + rings + ' rings)');
    selectObject(groupNode);
}

// --- Helper math functions (ported from VA_RER.ipynb) ---
function polarisChordLength(radius, thetaDeg) {
    return 2 * radius * Math.sin((thetaDeg * Math.PI / 180) / 2);
}

function polarisMinimumTheta(pinRadius, ringRadius, minPinSpacing) {
    var thetaRad = 2 * Math.asin(((2 * pinRadius) + minPinSpacing) / (2 * ringRadius));
    return thetaRad * 180 / Math.PI;
}

function polarisDeltaR(side, base) {
    return Math.sqrt((side * side) - ((base * base) / 4));
}

// --- Control Drum Positioning (ported from VA_RER.ipynb func_CR_drum_positioning) ---
function polarisDrumPositioning(beamPortR, beamPortWall, drumGap, drumR, drumRingR, minDrumSpacing, symmetry) {
    // starting_theta: angle from 0 where the first drum clears the beam port
    var startingTheta = Math.asin((beamPortR + beamPortWall + drumGap + drumR) / drumRingR) * 180 / Math.PI;

    // Test how many drums fit in a quarter-circle (0..90 degrees)
    var drumsQ = 1; // at least 1 per quarter
    for (var test = 2; test <= 20; test++) {
        // linspace from startingTheta to (90-startingTheta), 'test' points
        if (test < 2) continue;
        var angSpacing = ((90 - startingTheta) - startingTheta) / (test - 1);
        // chord between adjacent drums at drumRingR
        var chord = polarisChordLength(drumRingR, angSpacing);
        if (chord >= (2 * drumR + minDrumSpacing)) {
            drumsQ = test;
        } else {
            break;
        }
    }

    // Build quarter-circle drum angles
    var quarterAngles = [];
    if (drumsQ <= 1) {
        quarterAngles.push(45.0); // single drum at 45 degrees
    } else {
        // linspace from startingTheta to (90 - startingTheta), drumsQ points
        for (var i = 0; i < drumsQ; i++) {
            var ang = startingTheta + i * ((90 - startingTheta) - startingTheta) / (drumsQ - 1);
            quarterAngles.push(ang);
        }

        // Check: last angle before 45° and its mirror at (90°-angle) must not overlap
        // Find the drum closest to (but below) 45 degrees
        var lastBelow45 = null;
        for (var i = 0; i < quarterAngles.length; i++) {
            if (quarterAngles[i] < 45.0) lastBelow45 = quarterAngles[i];
        }
        if (lastBelow45 !== null) {
            var mirror = 90.0 - lastBelow45;
            var chordCheck = polarisChordLength(drumRingR, mirror - lastBelow45);
            if (chordCheck < (2 * drumR + minDrumSpacing)) {
                // Remove the problematic drum (last one below 45)
                var idx = quarterAngles.indexOf(lastBelow45);
                if (idx !== -1) quarterAngles.splice(idx, 1);
            }
        }
    }

    // Reflect quarter to full circle based on symmetry
    // First: reflect to upper half (0..180) by mirroring over y-axis: 180 - angle
    var halfAngles = [];
    for (var i = 0; i < quarterAngles.length; i++) {
        halfAngles.push(quarterAngles[i]);
    }
    // Add mirrors (avoid duplicates at 0 and 90)
    for (var i = quarterAngles.length - 1; i >= 0; i--) {
        var mirrored = 180.0 - quarterAngles[i];
        // Avoid duplicates near 90 degrees
        var isDupe = false;
        for (var j = 0; j < halfAngles.length; j++) {
            if (Math.abs(halfAngles[j] - mirrored) < 0.01) { isDupe = true; break; }
        }
        if (!isDupe) halfAngles.push(mirrored);
    }

    // Reflect to lower half (add 360 - angle for each)
    var fullAngles = [];
    for (var i = 0; i < halfAngles.length; i++) {
        fullAngles.push(halfAngles[i]);
    }
    for (var i = halfAngles.length - 1; i >= 0; i--) {
        var mirrored = 360.0 - halfAngles[i];
        // Avoid duplicates near 0/360
        var isDupe = false;
        for (var j = 0; j < fullAngles.length; j++) {
            if (Math.abs(fullAngles[j] - mirrored) < 0.01) { isDupe = true; break; }
            if (Math.abs(fullAngles[j] - (mirrored - 360)) < 0.01) { isDupe = true; break; }
        }
        if (!isDupe) fullAngles.push(mirrored);
    }

    // Sort ascending
    fullAngles.sort(function (a, b) { return a - b; });
    return fullAngles;
}

// --- Main VA RER Preset function ---
export function createPOLARISPreset() {
    // Read UI inputs
    var numRings = parseInt(document.getElementById('polarisNumRings').value) || 4;
    var pinRadius = parseFloat(document.getElementById('polarisPinR').value) || 0.4;
    var pinHeight = parseFloat(document.getElementById('polarisPinH').value) || 10.0;
    var pinPitch = parseFloat(document.getElementById('polarisPinPitch').value) || 4.261;
    var firstRingRadius = parseFloat(document.getElementById('polarisFirstR').value) || 43.877;
    var symmetry = parseInt(document.getElementById('polarisSymmetry').value) || 8;
    var trigaEnabled = document.getElementById('polarisTRIGA').checked;

    // Calculate d_min from pitch & radius: d_min = pitch - 2*radius
    var minPinSpacing = pinPitch - (2 * pinRadius);
    if (minPinSpacing < 0.001) {
        alert('Pin Pitch is too small! Must be > 2 * Pin Radius. Adjusting to minimum.');
        minPinSpacing = 0.1;
        pinPitch = (2 * pinRadius) + minPinSpacing;
    }

    // --- Port of func_pin_positioning ---
    // Build potential pin counts
    var pinsPerRing = symmetry; // start from symmetry
    var minimumTheta = polarisMinimumTheta(pinRadius, firstRingRadius, minPinSpacing);
    // Find largest multiple of symmetry whose delta-theta >= minimumTheta
    var bestPins = symmetry;
    for (var n = symmetry; n < 300; n += symmetry) {
        var angle = 360.0 / n;
        if (angle >= minimumTheta) {
            bestPins = n; // keep the largest that still satisfies the constraint
        }
    }
    pinsPerRing = bestPins;

    // Compute actual pin pitch (chord length for the chosen pin count)
    var actualPinPitch = pinPitch; // user-specified
    var chordFirst = polarisChordLength(firstRingRadius, 360.0 / pinsPerRing);

    // --- Create Group Node ---
    AppState.objectCount++;
    var groupID = 'POLARIS_Core_' + AppState.objectCount;
    var groupNode = document.createElement('transform');
    groupNode.setAttribute('DEF', groupID);
    groupNode.setAttribute('id', groupID);
    groupNode.setAttribute('class', 'group-node');
    groupNode.setAttribute('translation', '0 0 0');
    groupNode.setAttribute('rotation', '0 1 0 0');
    groupNode.setAttribute('data-euler', '0 0 0');
    groupNode.setAttribute('data-lattice-type', 'polaris');

    var parent = document.getElementById('scene');
    var treeParent = document.getElementById('treeRoot');
    if (AppState.selectedNode && AppState.selectedNode.getAttribute('class') === 'group-node') {
        parent = AppState.selectedNode;
        treeParent = document.getElementById('container_' + AppState.selectedNode.id);
    }
    parent.appendChild(groupNode);

    groupNode.addEventListener('mousedown', function (e) {
        e.stopPropagation();
        selectObject(groupNode);
    });

    var groupContainer = addTreeGroup(groupID, groupNode, treeParent);
    var toggleIcon = document.getElementById('tree_' + groupID).querySelector('.tree-toggle');
    if (toggleIcon) toggleIcon.className = 'fa-solid fa-caret-down tree-toggle';

    // --- Fuel Pin Proxy Dimensions ---
    // The browser renders a single proxy cylinder per pin for performance.
    // The converter expands each proxy into a full 9-segment TRIGA stack.
    var fuelHeight = pinHeight; // Active fuel meat height (default 38.1 cm for TRIGA)
    var totalPinH = 7.58 + 1.12 + 8.81 + 0.0797   // bottom segments
        + fuelHeight                      // fuel meat
        + 8.6797 + 0.6706 + 1.12 + 7.08; // top segments

    // Proxy cylinder params: full height, fuel material for visual color
    var proxyParams = { radius: pinRadius, height: totalPinH };

    // Helper: create a single proxy fuel pin at position (x, z) in the X-Z plane
    function createFuelPinProxy(px, pz, parentNode, treeContainer) {
        var node = createSceneObject('Cylinder', proxyParams);
        node.setAttribute('translation', px.toFixed(4) + ' 0 ' + pz.toFixed(4));
        node.setAttribute('data-pin-type', 'fuel_pin_proxy');
        applyMaterialToNode(node, 'mat_fuel');
        parentNode.appendChild(node);
        addTreeItem(node.getAttribute('DEF'), 'Cylinder', node, treeContainer);
        return 1;
    }

    var objectsCreated = 0;

    // --- Ring iteration logic (faithful port of Python) ---
    var ringInformation = []; // [{name, pins, radius, startingTheta}]
    var switchDeltaR = 0;
    var rNext = firstRingRadius;

    for (var i = 0; i < numRings; i++) {
        var startingTheta, currentRadius;

        if (i === 0) {
            // First ring: starting theta = 0, radius = firstRingRadius
            startingTheta = 0;
            currentRadius = firstRingRadius;
            for (var j = 0; j < pinsPerRing; j++) {
                var thetaRad = (startingTheta + j * (360.0 / pinsPerRing)) * Math.PI / 180;
                var x = currentRadius * Math.cos(thetaRad);
                var z = currentRadius * Math.sin(thetaRad);
                objectsCreated += createFuelPinProxy(x, z, groupNode, groupContainer);
            }
            ringInformation.push({ name: 'Ring ' + (i + 1), pins: pinsPerRing, radius: currentRadius, startingTheta: startingTheta });
            var dr = polarisDeltaR(actualPinPitch, polarisChordLength(firstRingRadius, 360.0 / pinsPerRing));
            rNext = firstRingRadius + dr;
        } else if (i % 2 === 1) {
            // Odd rings: offset starting theta
            if (ringInformation.length >= 3 && switchDeltaR === 0) {
                if ((rNext - ringInformation[i - 2].radius) < chordFirst) {
                    switchDeltaR++;
                    rNext = ringInformation[i - 2].radius + chordFirst;
                }
            }
            startingTheta = (360.0 / pinsPerRing) / 2;
            currentRadius = rNext;
            for (var j = 0; j < pinsPerRing; j++) {
                var thetaRad = (startingTheta + j * (360.0 / pinsPerRing)) * Math.PI / 180;
                var x = currentRadius * Math.cos(thetaRad);
                var z = currentRadius * Math.sin(thetaRad);
                objectsCreated += createFuelPinProxy(x, z, groupNode, groupContainer);
            }
            ringInformation.push({ name: 'Ring ' + (i + 1), pins: pinsPerRing, radius: currentRadius, startingTheta: startingTheta });
            if (switchDeltaR === 0) {
                var dr = polarisDeltaR(actualPinPitch, polarisChordLength(currentRadius, 360.0 / pinsPerRing));
                rNext = currentRadius + dr;
            } else {
                rNext = currentRadius + (chordFirst / 2);
            }
        } else {
            // Even rings (>0): same orientation as first ring
            if (ringInformation.length >= 3 && switchDeltaR === 0) {
                if ((rNext - ringInformation[i - 2].radius) < chordFirst) {
                    rNext = ringInformation[i - 2].radius + chordFirst;
                }
            }
            startingTheta = 0;
            currentRadius = rNext;
            for (var j = 0; j < pinsPerRing; j++) {
                var thetaRad = (startingTheta + j * (360.0 / pinsPerRing)) * Math.PI / 180;
                var x = currentRadius * Math.cos(thetaRad);
                var z = currentRadius * Math.sin(thetaRad);
                objectsCreated += createFuelPinProxy(x, z, groupNode, groupContainer);
            }
            ringInformation.push({ name: 'Ring ' + (i + 1), pins: pinsPerRing, radius: currentRadius, startingTheta: startingTheta });
            if (switchDeltaR === 0) {
                var dr = polarisDeltaR(actualPinPitch, polarisChordLength(currentRadius, 360.0 / pinsPerRing));
                rNext = currentRadius + dr;
            } else {
                rNext = currentRadius + (chordFirst / 2);
            }
        }
    }

    // --- TRIGA Mode: Place absorber "blue" pins ---
    if (trigaEnabled) {
        var trigaInfo = [
            { count: 1, radius: 0 },
            { count: 6, radius: 4.05384 },
            { count: 12, radius: 7.98068 },
            { count: 18, radius: 11.94562 },
            { count: 24, radius: 15.91564 },
            { count: 30, radius: 19.88820 }
        ];
        for (var t = 0; t < trigaInfo.length; t++) {
            var ti = trigaInfo[t];
            for (var j = 0; j < ti.count; j++) {
                var thetaRad = (j * (360.0 / ti.count)) * Math.PI / 180;
                var x = ti.radius * Math.cos(thetaRad);
                var z = ti.radius * Math.sin(thetaRad);
                var node = createSceneObject('Cylinder', { radius: pinRadius, height: totalPinH });
                node.setAttribute('translation', x.toFixed(4) + ' 0 ' + z.toFixed(4));
                // Assign absorber material for TRIGA blue pins
                applyMaterialToNode(node, 'mat_abs');
                groupNode.appendChild(node);
                addTreeItem(node.getAttribute('DEF'), 'Cylinder', node, groupContainer);
                objectsCreated++;
            }
        }
    }

    // --- Control Drums ---
    var drumsEnabled = document.getElementById('polarisDrumsEnabled').checked;
    var drumsCreated = 0;
    if (drumsEnabled) {
        var beamPortR = parseFloat(document.getElementById('polarisBeamPortR').value) || 7.7;
        var beamPortWall = parseFloat(document.getElementById('polarisBeamPortWall').value) || 0.7;
        var drumGap = parseFloat(document.getElementById('polarisDrumGap').value) || 5.0;
        var drumR = parseFloat(document.getElementById('polarisDrumR').value) || 12.0;
        var drumRingR = parseFloat(document.getElementById('polarisDrumRingR').value) || 85.0;
        var drumMinSpacing = parseFloat(document.getElementById('polarisDrumMinSpacing').value) || 5.0;
        var drumH = parseFloat(document.getElementById('polarisDrumH').value) || 15.0;

        var drumAngles = polarisDrumPositioning(beamPortR, beamPortWall, drumGap, drumR, drumRingR, drumMinSpacing, symmetry);

        // --- Control Drums (Complex: Pin + Absorber + Reflector) ---
        var pinR = 0.635; // Central pin radius (approx 0.5 inch diameter?)

        // Helper to generate semi-annulus cross-section points (XZ plane)
        // Returns string "x z, x z, ..."
        function getSemiAnnulusCrossSection(rIn, rOut, startDeg, endDeg) {
            var points = [];
            var steps = 16;
            // Outer arc
            for (var i = 0; i <= steps; i++) {
                var theta = (startDeg + (endDeg - startDeg) * (i / steps)) * Math.PI / 180;
                points.push((-rOut * Math.sin(theta)) + " " + (-rOut * Math.cos(theta))); // Rotate 90 to align with X-axis logic if needed, but standard math is fine
            }
            // Inner arc (reverse)
            for (var i = 0; i <= steps; i++) {
                var theta = (endDeg - (endDeg - startDeg) * (i / steps)) * Math.PI / 180;
                points.push((-rIn * Math.sin(theta)) + " " + (-rIn * Math.cos(theta)));
            }
            // Close loop
            points.push(points[0]);
            return points.join(", ");
        }

        // We define "Inward" as the absorber side.
        // If local X is radial outward, then Inward is -X.
        // Top half (0 to 180) vs Bottom half (180 to 360).
        // Let's create two shapes:
        // 1. Absorber: Semicircle facing "In" (Local -X). Angles: 90 to 270?
        // Standard sin/cos: 0 is +X, 90 is +Z, 180 is -X, 270 is -Z.
        // In X3D Extrusion XZ plane:
        // We want split plane perpendicular to X axis.
        // So split line is approx Z axis.
        // Absorber on -X side (Inward): Angles 90 to 270.
        // Reflector on +X side (Outward): Angles -90 to 90.

        // 1. Absorber: Semicircle facing "In" (Local -X). Angles: 0 to 180.
        // Function x=-r*sin(t), z=-r*cos(t).
        // t=0 -> x=0, z=-r. t=180 -> x=0, z=r.
        // The flat face connects (0,-r) and (0,r), which is on the Z axis (Normal to X/Radial).
        var csAbsorber = getSemiAnnulusCrossSection(pinR, drumR, 0, 180);
        var csReflector = getSemiAnnulusCrossSection(pinR, drumR, 180, 360);

        for (var d = 0; d < drumAngles.length; d++) {
            var angleDeg = drumAngles[d];
            var angleRad = angleDeg * Math.PI / 180;
            var dx = drumRingR * Math.cos(angleRad);
            var dy = drumRingR * Math.sin(angleRad);

            // Create Drum Group
            var dGroup = document.createElement('transform');
            dGroup.setAttribute('translation', dx.toFixed(4) + ' 0 ' + dy.toFixed(4));
            // Rotate group so its Local +X points radially outward (along angleRad).
            // Axis of rotation is Y (0 1 0). Angle is angleRad.
            // However, we need to convert rotation to Axis-Angle.
            // Rotation around Y by angleRad.
            // BUT X3D standard orientation: Identity matches Global X.
            // If angleRad is 0 (East), Local X is East. Correct.
            // If angleRad is 90 (South/Z+ in X3D?), wait.
            // X3D: X is Right, Y is Up, Z is Forward (towards viewer).
            // In our top-down view (Y-up), X is Right, -Z is Up on screen? 
            // Let's assume standard math X,Y plane map to X,Z in 3D.
            // x = R cos(t), z = R sin(t).
            // If t=0, x=R, z=0. (+X axis).
            // Rotation around Y:
            // x' = x cos(t) + z sin(t)
            // z' = -x sin(t) + z cos(t)
            // This is clockwise?
            // We simply use '0 1 0 -angleRad' (standard right-hand rule about Y).
            // Actually, let's stick to the visual check.
            dGroup.setAttribute('rotation', '0 1 0 ' + (-(angleRad + Math.PI)));

            var drumId = 'Drum_' + (d + 1) + '_' + AppState.objectCount;
            dGroup.setAttribute('DEF', drumId);

            // 1. Central Pin
            var pin = createSceneObject('Cylinder', { radius: pinR, height: drumH });
            pin.setAttribute('translation', '0 0 0');
            applyMaterialToNode(pin, 'mat_clad'); // Steel cladding for pin
            dGroup.appendChild(pin);
            addTreeItem(pin.getAttribute('DEF'), 'Cylinder', pin, groupContainer);

            // 2. Absorber Semi-Cylinder (Extrusion)
            var absShape = document.createElement('shape');
            var absApp = document.createElement('appearance');
            var absMat = document.createElement('material');
            var matDefA = MATERIAL_DB['mat_abs']; // B4C
            absMat.setAttribute('diffuseColor', matDefA.color);
            absApp.appendChild(absMat);
            absShape.appendChild(absApp);

            var absExt = document.createElement('extrusion');
            absExt.setAttribute('crossSection', csAbsorber);
            absExt.setAttribute('spine', '0 ' + (-drumH / 2) + ' 0, 0 ' + (drumH / 2) + ' 0');
            absExt.setAttribute('solid', 'false');
            var absId = drumId + '_Abs';
            absExt.setAttribute('DEF', absId);

            absShape.appendChild(absExt);
            dGroup.appendChild(absShape);
            // Add to tree manually? or wrap in transform?
            // Just add to tree as 'Shape' (Extrusion not fully supported in my tree helper? it defaults to group/shape)
            // We can use a dummy transform wrapper for the tree helper
            var absTrans = document.createElement('transform');
            absTrans.setAttribute('DEF', absId);
            absTrans.appendChild(absShape);

            // We need to attach data-materials for export!
            absTrans.setAttribute("data-mat-id", matDefA.id);
            // The tree logic uses data attributes on the Transform.

            // append the transform instead of raw shape? No, X3D structure is flexible.
            // Let's stick to appending the shape to dGroup, but how do we export it?
            // The export logic walks the tree and looks for Shapes inside Transforms.
            // dGroup is a Transform. traverseGraph looks at children.
            // It expects ONE shape per transform usually for my simple exporter.
            // If dGroup has multiple shapes, traverseGraph might miss them or bundle them?
            // traverseGraph: "var shape = Array.from(node.children).find..." -> Finds ONLY ONE shape.
            // FIX: We MUST wrap each component (Pin, Abs, Refl) in its own Transform child of dGroup.

            // Re-do Absorber as Transform
            var tAbs = document.createElement('transform');
            tAbs.setAttribute('DEF', absId);
            tAbs.setAttribute("data-mat-id", matDefA.id);
            tAbs.setAttribute("data-density", matDefA.density);
            tAbs.appendChild(absShape);
            dGroup.appendChild(tAbs);
            addTreeItem(absId, 'Extrusion', tAbs, groupContainer);

            // 3. Reflector Semi-Cylinder (Extrusion)
            var reflShape = document.createElement('shape');
            var reflApp = document.createElement('appearance');
            var reflMat = document.createElement('material');
            var matDefR = MATERIAL_DB['mat_graphite']; // Graphite/Reflector
            reflMat.setAttribute('diffuseColor', matDefR.color);
            reflApp.appendChild(reflMat);
            reflShape.appendChild(reflApp);

            var reflExt = document.createElement('extrusion');
            reflExt.setAttribute('crossSection', csReflector);
            reflExt.setAttribute('spine', '0 ' + (-drumH / 2) + ' 0, 0 ' + (drumH / 2) + ' 0');
            reflExt.setAttribute('solid', 'false');
            var reflId = drumId + '_Refl';
            reflExt.setAttribute('DEF', reflId);
            reflShape.appendChild(reflExt);

            var tRefl = document.createElement('transform');
            tRefl.setAttribute('DEF', reflId);
            tRefl.setAttribute("data-mat-id", matDefR.id);
            tRefl.setAttribute("data-density", matDefR.density);
            tRefl.appendChild(reflShape);
            dGroup.appendChild(tRefl);
            addTreeItem(reflId, 'Extrusion', tRefl, groupContainer);

            groupNode.appendChild(dGroup);
            // Add Group to Tree
            addTreeItem(drumId, 'Drum', dGroup, groupContainer);

            drumsCreated++;
            objectsCreated += 3;
        }
    }

    // --- Vessel / Reflector ---
    var vesselEnabled = document.getElementById('polarisVesselEnabled').checked;
    if (vesselEnabled) {
        var reflectorR = parseFloat(document.getElementById('polarisReflectorR').value) || 120.0;
        var vesselH = totalPinH; // Clamp to active core height so wall aligns with innards
        var drumR = parseFloat(document.getElementById('polarisDrumR').value) || 12.0;
        var drumRingR = parseFloat(document.getElementById('polarisDrumRingR').value) || 85.0;
        var reflecterInnerR = (0.75 * (reflectorR - (drumR + drumRingR))) + drumRingR;
        var vesselParams = { radius: reflectorR, height: vesselH };
        var innerVesselParams = { radius: reflecterInnerR, height: vesselH };
        var vesselNode = createSceneObject('Cylinder', vesselParams);
        vesselNode.setAttribute('translation', '0 0 0');
        applyMaterialToNode(vesselNode, 'mat_graphite');
        var innerVesselNode = createSceneObject('Cylinder', innerVesselParams);
        innerVesselNode.setAttribute('translation', '0 0 0');
        applyMaterialToNode(innerVesselNode, 'mat_subtract');
        // Make vessel semi-transparent
        var vesselShape = vesselNode.querySelector('shape');
        if (vesselShape) {
            var vesselMat = vesselShape.querySelector('material');
            if (vesselMat) {
                vesselMat.setAttribute('transparency', '0.6');
            }
            var innerVesselShape = innerVesselNode.querySelector('shape');
            var InnerVesselMat = innerVesselShape.querySelector('material');
            if (InnerVesselMat) {
                InnerVesselMat.setAttribute('transparency', '0.9');
            }
        }
        groupNode.appendChild(vesselNode);
        groupNode.appendChild(innerVesselNode);
        addTreeItem(vesselNode.getAttribute('DEF'), 'Cylinder', vesselNode, groupContainer);
        addTreeItem(innerVesselNode.getAttribute('DEF'), 'Cylinder', innerVesselNode, groupContainer);
        objectsCreated += 2;

        // --- Drum Region Water Fill ---
        // Water extends to vessel inner radius (reflecterInnerR) to eliminate air gap
        var drumWaterR = reflecterInnerR;
        var drumWaterParams = { radius: drumWaterR, height: vesselH };
        var drumWaterNode = createSceneObject('Cylinder', drumWaterParams);
        drumWaterNode.setAttribute('translation', '0 0 0');
        applyMaterialToNode(drumWaterNode, 'mat_mod');
        var dwShape = drumWaterNode.querySelector('shape');
        if (dwShape) {
            var dwMat = dwShape.querySelector('material');
            if (dwMat) {
                dwMat.setAttribute('transparency', '0.4');
            }
        }
        groupNode.appendChild(drumWaterNode);
        addTreeItem(drumWaterNode.getAttribute('DEF'), 'Cylinder', drumWaterNode, groupContainer);
        objectsCreated++;
    }

    // --- Radial Zone Cylinders ---
    // Added AFTER pins/drums/vessel so transparent shells render over opaque geometry correctly.
    var zonesEnabled = document.getElementById('polarisZonesEnabled').checked;
    var zonesCreated = 0;
    if (zonesEnabled) {
        // Zone height = active core height (totalPinH), NOT vessel height.
        // This ensures zones terminate at the base plate and don't pierce through.
        var zoneH = totalPinH;
        var zoneDefinitions = [
            { id: 'polarisShroudR', matId: 'mat_beamport', label: 'Shroud' },
            { id: 'polarisRefl2R', matId: 'mat_graphite', label: 'OuterReflector' },
            { id: 'polarisWaterGapR', matId: 'mat_mod', label: 'WaterGap' },
            { id: 'polarisRefl1R', matId: 'mat_graphite', label: 'InnerReflector' },
            { id: 'polarisBufferR', matId: 'mat_steel', label: 'Buffer' },
            { id: 'polarisAnnularR', matId: 'mat_air', label: 'Annulus' }
        ];
        for (var z = 0; z < zoneDefinitions.length; z++) {
            var zDef = zoneDefinitions[z];
            var zoneR = parseFloat(document.getElementById(zDef.id).value);
            if (!zoneR || zoneR <= 0) continue;
            var zoneParams = { radius: zoneR, height: zoneH };
            var zoneNode = createSceneObject('Cylinder', zoneParams);
            zoneNode.setAttribute('translation', '0 0 0');
            applyMaterialToNode(zoneNode, zDef.matId);
            // High transparency so inner pins remain visible
            var zShape = zoneNode.querySelector('shape');
            if (zShape) {
                var zMat = zShape.querySelector('material');
                if (zMat) {
                    zMat.setAttribute('transparency', '0.6');
                }
            }
            groupNode.appendChild(zoneNode);
            addTreeItem(zoneNode.getAttribute('DEF'), 'Cylinder', zoneNode, groupContainer);
            zonesCreated++;
            objectsCreated++;
        }
    }

    // --- Axial Support Structures (Below Core) ---
    // Lower graphite plate and steel plate, matching VA_RER reference.
    // These sit below the fuel pins' bottom.
    if (zonesEnabled || vesselEnabled) {
        var supportRadius = parseFloat(document.getElementById('polarisReflectorR').value) || 120.0;
        var graphitePlateH = 5.0;  // lower_core_graphite_thickness = 5 cm
        var steelPlateH = 5.0;     // lower_core_steel_thickness = 5 cm

        // Bottom of fuel pin stack in X3D Y-axis = -totalPinH/2
        var pinBottom = -totalPinH / 2;

        // Graphite plate: sits directly below fuel pins
        var graphiteY = pinBottom - graphitePlateH / 2;
        var graphitePlate = createSceneObject('Cylinder', { radius: supportRadius, height: graphitePlateH });
        graphitePlate.setAttribute('translation', '0 ' + graphiteY.toFixed(4) + ' 0');
        applyMaterialToNode(graphitePlate, 'mat_graphite'); // graphite material
        groupNode.appendChild(graphitePlate);
        addTreeItem(graphitePlate.getAttribute('DEF'), 'Cylinder', graphitePlate, groupContainer);
        objectsCreated++;

        // Steel plate: sits below the graphite plate
        var steelY = pinBottom - graphitePlateH - steelPlateH / 2;
        var steelPlate = createSceneObject('Cylinder', { radius: supportRadius, height: steelPlateH });
        steelPlate.setAttribute('translation', '0 ' + steelY.toFixed(4) + ' 0');
        applyMaterialToNode(steelPlate, 'mat_steel'); // steel material
        groupNode.appendChild(steelPlate);
        addTreeItem(steelPlate.getAttribute('DEF'), 'Cylinder', steelPlate, groupContainer);
        objectsCreated++;

        // Lower Plenum: fills from bottom of steel plate to bottom of vessel
        if (vesselEnabled) {
            var vesselH = parseFloat(document.getElementById('polarisVesselH').value) || 150.0;
            var steelBottom = pinBottom - graphitePlateH - steelPlateH;
            var vesselBottom = -vesselH / 2;
            var plenumH = steelBottom - vesselBottom;
            if (plenumH > 0.1) {
                var plenumY = vesselBottom + plenumH / 2;
                var plenumNode = createSceneObject('Cylinder', { radius: supportRadius, height: plenumH });
                plenumNode.setAttribute('translation', '0 ' + plenumY.toFixed(4) + ' 0');
                applyMaterialToNode(plenumNode, 'mat_steel'); // light grey (graphite/aluminum) lower plenum
                groupNode.appendChild(plenumNode);
                addTreeItem(plenumNode.getAttribute('DEF'), 'Cylinder', plenumNode, groupContainer);
                objectsCreated++;
            }
        }
    }

    // --- Beam Ports ---
    // Four horizontal cylinder segments (X+, X-, Z+, Z-) existing ONLY in the reflector region (between Shroud and Vessel)
    // Logic matches VA_RER.ipynb: region (+surf_reactor_r6 & -surf_reactor_r8)
    var beamPortR = parseFloat(document.getElementById('polarisBeamPortR').value) || 7.7;
    var beamPortWall = parseFloat(document.getElementById('polarisBeamPortWall').value) || 0.7;
    var reflectorR = parseFloat(document.getElementById('polarisReflectorR').value) || 120.0;
    var shroudR = parseFloat(document.getElementById('polarisShroudR').value) || 84.0;

    var beamPortOuterR = beamPortR + beamPortWall;
    // Length of each segment = distance between shroud and reflector
    var beamPortLength = reflectorR - shroudR;
    // Center distance from origin = average of shroud and reflector radii
    var centerDist = (shroudR + reflectorR) / 2.0;

    var beamPortsCreated = 0;

    if (drumsEnabled || zonesEnabled) {
        // Common params for all 4 ports
        var portParams = { radius: beamPortOuterR, height: beamPortLength };

        // Helper to create and place a port segment (Hollow Tube)
        function createPortSegment(nameSuffix, translation, rotation) {
            var group = document.createElement('transform');
            group.setAttribute('translation', translation);
            group.setAttribute('rotation', rotation);

            // 1. Outer Shell (Aluminum)
            // We need a tube, but X3D primitives are solid. 
            // To simulate a tube in this context without CSG subtraction (which is complex in X3DOM),
            // we render the outer cylinder as the wall, and the inner cylinder as Air.
            // This works for OpenMC export if we define them correctly.

            var shellNode = createSceneObject('Cylinder', { radius: beamPortOuterR, height: beamPortLength });
            // Reset translation/rotation since they are on the group
            shellNode.setAttribute('translation', '0 0 0');
            shellNode.setAttribute('rotation', '0 0 1 0');
            applyMaterialToNode(shellNode, 'mat_beamport');

            var shellShape = shellNode.querySelector('shape');
            if (shellShape) {
                var mat = shellShape.querySelector('material');
                if (mat) mat.setAttribute('transparency', '0.4'); // Semi-transparent wall
            }
            shellNode.setAttribute('DEF', 'BeamPort_Shell_' + nameSuffix + '_' + AppState.objectCount);
            group.appendChild(shellNode);

            // 2. Inner Volume (Air)
            // Slightly longer to avoid z-fighting at ends, or same length? Same length is physically accurate.
            // Let's use same length for now.
            var airNode = createSceneObject('Cylinder', { radius: beamPortR, height: beamPortLength });
            airNode.setAttribute('translation', '0 0 0');
            airNode.setAttribute('rotation', '0 0 1 0');
            applyMaterialToNode(airNode, 'mat_air');

            var airShape = airNode.querySelector('shape');
            if (airShape) {
                var mat = airShape.querySelector('material');
                if (mat) mat.setAttribute('transparency', '0.8'); // Very transparent air
            }
            airNode.setAttribute('DEF', 'BeamPort_Air_' + nameSuffix + '_' + AppState.objectCount);
            group.appendChild(airNode);

            groupNode.appendChild(group);

            // Add grouping to tree? Or just the parts?
            // Let's add the parts to the tree, but maybe grouped?
            // For simplicity, just add the two cylinders to the main tree for now.
            addTreeItem(shellNode.getAttribute('DEF'), 'Cylinder', shellNode, groupContainer);
            addTreeItem(airNode.getAttribute('DEF'), 'Cylinder', airNode, groupContainer);

            beamPortsCreated++;
            objectsCreated += 2;
        }

        // 1. X+ (East) -> Rotate 90 deg around Z (0 0 1 1.5708), translate +X
        createPortSegment('X_Pos', centerDist + ' 0 0', '0 0 1 1.5708');

        // 2. X- (West) -> Rotate 90 deg around Z, translate -X
        createPortSegment('X_Neg', (-centerDist) + ' 0 0', '0 0 1 1.5708');

        // 3. Z+ (South) -> Rotate 90 deg around X (1 0 0 1.5708), translate +Z
        createPortSegment('Z_Pos', '0 0 ' + centerDist, '1 0 0 1.5708');

        // 4. Z- (North) -> Rotate 90 deg around X, translate -Z
        createPortSegment('Z_Neg', '0 0 ' + (-centerDist), '1 0 0 1.5708');
    }

    var statusParts = [objectsCreated + ' objects', numRings + ' rings'];
    if (trigaEnabled) statusParts.push('TRIGA');
    if (drumsEnabled) statusParts.push(drumsCreated + ' drums');
    if (vesselEnabled) statusParts.push('vessel');
    if (zonesEnabled) statusParts.push(zonesCreated + ' zones');
    if (beamPortsCreated > 0) statusParts.push(beamPortsCreated + ' beam ports');
    setStatus('Created VA RER Core: ' + statusParts.join(', '));
    selectObject(groupNode);
}

// ===============================================
// RBMK ASSEMBLY PRESET
// ===============================================
export function createRBMKPreset() {
    // --- Read UI Inputs ---
    var fuelR     = parseFloat(document.getElementById('rbmkFuelR').value)     || 0.55;
    var gapR      = parseFloat(document.getElementById('rbmkGapR').value)      || 0.596;
    var cladR     = parseFloat(document.getElementById('rbmkCladR').value)     || 0.68;
    var innerRodR = parseFloat(document.getElementById('rbmkInnerRodR').value) || 0.75;
    var outerTubeR= parseFloat(document.getElementById('rbmkOuterTubeR').value)|| 0.7625;
    var pressureR = parseFloat(document.getElementById('rbmkPressureTubeR').value) || 4.5;

    var innerRingR  = parseFloat(document.getElementById('rbmkInnerRingR').value)  || 1.8278;
    var innerPins   = parseInt(document.getElementById('rbmkInnerPins').value)     || 6;
    var outerRingR  = parseFloat(document.getElementById('rbmkOuterRingR').value)  || 3.32;
    var outerPins   = parseInt(document.getElementById('rbmkOuterPins').value)     || 12;
    var outerOffset = parseFloat(document.getElementById('rbmkOuterOffset').value) || 15;

    var activeH    = parseFloat(document.getElementById('rbmkActiveH').value) || 728;
    var gapHalfW   = parseFloat(document.getElementById('rbmkGapHalfW').value)|| 12;
    var fullH      = parseFloat(document.getElementById('rbmkFullH').value)   || 1000;

    // Derived dimensions
    var fuelStackH = (activeH / 2) - gapHalfW; // height of each fuel stack (upper & lower)
    // Y offsets for fuel stacks (X3D Y-axis is axial)
    // Lower fuel: centered at -(gapHalfW + fuelStackH/2)
    // Upper fuel: centered at +(gapHalfW + fuelStackH/2)
    var fuelLowerY = -(gapHalfW + fuelStackH / 2);
    var fuelUpperY =  (gapHalfW + fuelStackH / 2);

    // --- Create Root Group ---
    AppState.objectCount++;
    var groupID = 'RBMK_Assembly_' + AppState.objectCount;
    var groupNode = document.createElement('transform');
    groupNode.setAttribute('DEF', groupID);
    groupNode.setAttribute('id', groupID);
    groupNode.setAttribute('class', 'group-node');
    groupNode.setAttribute('translation', '0 0 0');
    groupNode.setAttribute('rotation', '0 1 0 0');
    groupNode.setAttribute('data-euler', '0 0 0');

    var parent = document.getElementById('scene');
    var treeParent = document.getElementById('treeRoot');
    if (AppState.selectedNode && AppState.selectedNode.getAttribute('class') === 'group-node') {
        parent = AppState.selectedNode;
        treeParent = document.getElementById('container_' + AppState.selectedNode.id);
    }
    parent.appendChild(groupNode);

    groupNode.addEventListener('mousedown', function (e) {
        e.stopPropagation();
        selectObject(groupNode);
    });

    var groupContainer = addTreeGroup(groupID, groupNode, treeParent);
    var toggleIcon = document.getElementById('tree_' + groupID).querySelector('.tree-toggle');
    if (toggleIcon) toggleIcon.className = 'fa-solid fa-caret-down tree-toggle';

    var objectsCreated = 0;

    // --- 1. Pressure Tube / Channel Boundary ---
    var ptNode = createSceneObject('Cylinder', { radius: pressureR, height: fullH });
    ptNode.setAttribute('translation', '0 0 0');
    applyMaterialToNode(ptNode, 'mat_helium');
    var ptShape = ptNode.querySelector('shape');
    if (ptShape) {
        var ptMat = ptShape.querySelector('material');
        if (ptMat) ptMat.setAttribute('transparency', '0.7');
    }
    groupNode.appendChild(ptNode);
    addTreeItem(ptNode.getAttribute('DEF'), 'Cylinder', ptNode, groupContainer);
    objectsCreated++;

    // --- 2. Central Carrier Rod (tube: outer cylinder + inner subtract) ---
    // Outer tube
    var outerTubeNode = createSceneObject('Cylinder', { radius: outerTubeR, height: fullH });
    outerTubeNode.setAttribute('translation', '0 0 0');
    applyMaterialToNode(outerTubeNode, 'mat_carrier');
    groupNode.appendChild(outerTubeNode);
    addTreeItem(outerTubeNode.getAttribute('DEF'), 'Cylinder', outerTubeNode, groupContainer);
    objectsCreated++;

    // Inner rod (helium fill inside the tube)
    var innerRodNode = createSceneObject('Cylinder', { radius: innerRodR, height: fullH });
    innerRodNode.setAttribute('translation', '0 0 0');
    applyMaterialToNode(innerRodNode, 'mat_helium');
    groupNode.appendChild(innerRodNode);
    addTreeItem(innerRodNode.getAttribute('DEF'), 'Cylinder', innerRodNode, groupContainer);
    objectsCreated++;

    // --- Helper: Create one complete fuel pin assembly at (px, pz) ---
    function createFuelPin(px, pz, ringLabel, pinIdx, parentNode, treeContainer) {
        // Each fuel pin is a nested group containing:
        // 1. Cladding cylinder (full active height)
        // 2. Gap cylinder (full active height)
        // 3. Lower fuel stack
        // 4. Upper fuel stack
        // 5. Sleeve fill (gap region between stacks — helium)

        // -- Pin sub-group --
        AppState.objectCount++;
        var pinGroupID = 'RBMK_Pin_' + ringLabel + '_' + pinIdx + '_' + AppState.objectCount;
        var pinGroup = document.createElement('transform');
        pinGroup.setAttribute('DEF', pinGroupID);
        pinGroup.setAttribute('id', pinGroupID);
        pinGroup.setAttribute('class', 'group-node');
        pinGroup.setAttribute('translation', px.toFixed(6) + ' 0 ' + pz.toFixed(6));
        pinGroup.setAttribute('rotation', '0 1 0 0');
        pinGroup.setAttribute('data-euler', '0 0 0');

        pinGroup.addEventListener('mousedown', function (e) {
            e.stopPropagation();
            selectObject(pinGroup);
        });

        parentNode.appendChild(pinGroup);
        var pinContainer = addTreeGroup(pinGroupID, pinGroup, treeContainer);
        var count = 0;

        // 1. Cladding — full active height
        var cladNode = createSceneObject('Cylinder', { radius: cladR, height: activeH });
        cladNode.setAttribute('translation', '0 0 0');
        applyMaterialToNode(cladNode, 'mat_rbmk_clad');
        pinGroup.appendChild(cladNode);
        addTreeItem(cladNode.getAttribute('DEF'), 'Cylinder', cladNode, pinContainer);
        count++;

        // 2. Gap — full active height (helium between clad and fuel)
        var gapNode = createSceneObject('Cylinder', { radius: gapR, height: activeH });
        gapNode.setAttribute('translation', '0 0 0');
        applyMaterialToNode(gapNode, 'mat_helium');
        pinGroup.appendChild(gapNode);
        addTreeItem(gapNode.getAttribute('DEF'), 'Cylinder', gapNode, pinContainer);
        count++;

        // 3. Lower fuel stack
        var lowerFuel = createSceneObject('Cylinder', { radius: fuelR, height: fuelStackH });
        lowerFuel.setAttribute('translation', '0 ' + fuelLowerY.toFixed(4) + ' 0');
        applyMaterialToNode(lowerFuel, 'mat_rbmk_fuel');
        pinGroup.appendChild(lowerFuel);
        addTreeItem(lowerFuel.getAttribute('DEF'), 'Cylinder', lowerFuel, pinContainer);
        count++;

        // 4. Upper fuel stack
        var upperFuel = createSceneObject('Cylinder', { radius: fuelR, height: fuelStackH });
        upperFuel.setAttribute('translation', '0 ' + fuelUpperY.toFixed(4) + ' 0');
        applyMaterialToNode(upperFuel, 'mat_rbmk_fuel');
        pinGroup.appendChild(upperFuel);
        addTreeItem(upperFuel.getAttribute('DEF'), 'Cylinder', upperFuel, pinContainer);
        count++;

        // 5. Sleeve — helium fill in the gap between upper and lower fuel
        var sleeveH = 2 * gapHalfW;
        var sleeveNode = createSceneObject('Cylinder', { radius: fuelR, height: sleeveH });
        sleeveNode.setAttribute('translation', '0 0 0');
        applyMaterialToNode(sleeveNode, 'mat_helium');
        pinGroup.appendChild(sleeveNode);
        addTreeItem(sleeveNode.getAttribute('DEF'), 'Cylinder', sleeveNode, pinContainer);
        count++;

        return count;
    }

    // --- 3. Inner Ring Fuel Pins ---
    for (var i = 0; i < innerPins; i++) {
        var thetaRad = (i * 360.0 / innerPins) * Math.PI / 180;
        var px = innerRingR * Math.cos(thetaRad);
        var pz = innerRingR * Math.sin(thetaRad);
        objectsCreated += createFuelPin(px, pz, 'Inner', i + 1, groupNode, groupContainer);
    }

    // --- 4. Outer Ring Fuel Pins (with angular offset) ---
    for (var i = 0; i < outerPins; i++) {
        var thetaDeg = outerOffset + (i * 360.0 / outerPins);
        var thetaRad = thetaDeg * Math.PI / 180;
        var px = outerRingR * Math.cos(thetaRad);
        var pz = outerRingR * Math.sin(thetaRad);
        objectsCreated += createFuelPin(px, pz, 'Outer', i + 1, groupNode, groupContainer);
    }

    setStatus('Created RBMK Assembly: ' + objectsCreated + ' objects (' + innerPins + ' inner + ' + outerPins + ' outer pins)');
    selectObject(groupNode);
}