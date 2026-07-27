import { MATERIAL_DB, SIM_SETTINGS } from './state.js';
import { setStatus } from './ui.js';

function traverseGraph(node) {
    var entry = {
        name: node.getAttribute("DEF"),
        id: node.getAttribute("id"),
        type: "Group", // Default type
        children: [],
        parameters: {}
    };

    // Position and Rotation
    entry.translation = node.getAttribute("translation") || "0 0 0";
    // Export euler angles if available, otherwise export axis-angle
    var eulerAttr = node.getAttribute("data-euler");
    if (eulerAttr) {
        entry.rotation = eulerAttr;
        entry.rotation_format = "euler_xyz_deg";
    } else {
        // Read X3D axis-angle rotation attribute (format: "ax ay az angle_rad")
        var rawRot = node.getAttribute("rotation");
        if (rawRot && rawRot !== "0 1 0 0" && rawRot !== "0 0 1 0") {
            entry.rotation = rawRot;
            entry.rotation_format = "axis_angle";
        } else {
            entry.rotation = "0 0 0";
            entry.rotation_format = "euler_xyz_deg";
        }
    }

    // === LATTICE DETECTION ===
    var latticeType = node.getAttribute("data-lattice-type");
    if (latticeType) {
        entry.type = "Lattice";
        entry.lattice_type = latticeType;

        if (latticeType === "rectangular") {
            entry.parameters.pitch_x = parseFloat(node.getAttribute("data-lattice-pitch-x")) || 1.0;
            entry.parameters.pitch_z = parseFloat(node.getAttribute("data-lattice-pitch-z")) || 1.0;
            entry.parameters.dim_x = parseInt(node.getAttribute("data-lattice-dim-x")) || 1;
            entry.parameters.dim_z = parseInt(node.getAttribute("data-lattice-dim-z")) || 1;
        } else if (latticeType === "hexagonal") {
            entry.parameters.pitch = parseFloat(node.getAttribute("data-lattice-pitch")) || 1.0;
            entry.parameters.rings = parseInt(node.getAttribute("data-lattice-rings")) || 1;
        }
    }

    // === MATERIAL & PHYSICS (for Shapes) ===
    var matId = node.getAttribute("data-mat-id");
    if (matId) {
        entry.material_id = matId;
    }

    var density = node.getAttribute("data-density");
    if (density) {
        entry.density = parseFloat(density);
    }

    // Proxy pin type detection (fuel_pin_proxy, etc.)
    var pinType = node.getAttribute("data-pin-type");
    if (pinType) {
        entry.pin_type = pinType;
    }

    // Void / Subtraction detection
    var regionType = node.getAttribute("data-region-type");
    if (regionType === "void") {
        entry.is_void = true;
        entry.region_type = "subtraction";
    }

    // === GEOMETRY: Look at DIRECT children for the shape ===
    var shape = Array.from(node.children).find(el => el.tagName.toLowerCase() === 'shape');

    if (shape) {
        var cyl = shape.querySelector("cylinder");
        var box = shape.querySelector("box");
        var sph = shape.querySelector("sphere");
        var ext = shape.querySelector("extrusion");

        if (cyl) {
            entry.type = entry.is_void ? "Subtraction" : "Cylinder";
            entry.geometry = "Cylinder";
            entry.parameters.radius = parseFloat(cyl.getAttribute("radius"));
            entry.parameters.height = parseFloat(cyl.getAttribute("height"));
        } else if (box) {
            entry.type = entry.is_void ? "Subtraction" : "Box";
            entry.geometry = "Box";
            entry.parameters.size = box.getAttribute("size");
        } else if (sph) {
            entry.type = entry.is_void ? "Subtraction" : "Sphere";
            entry.geometry = "Sphere";
            entry.parameters.radius = parseFloat(sph.getAttribute("radius"));
        } else if (ext) {
            entry.type = "Extrusion";
            entry.geometry = "Extrusion";
            entry.parameters.crossSection = ext.getAttribute("crossSection") || "";
            entry.parameters.spine = ext.getAttribute("spine") || "";
        }
    }

    // === RECURSE for children transforms ===
    var children = Array.from(node.children).filter(el => el.tagName.toLowerCase() === 'transform');
    children.forEach(function (child) {
        if (child.id === "axisHelper") return;
        entry.children.push(traverseGraph(child));
    });

    // Clean up empty children array for leaf nodes
    if (entry.children.length === 0) {
        delete entry.children;
    }

    return entry;
}

export function exportJSON() {
    // 1. Export all materials from MATERIAL_DB (with composition)
    var materialsExport = {};
    for (var key in MATERIAL_DB) {
        var mat = MATERIAL_DB[key];
        materialsExport[key] = {
            id: mat.id,
            name: mat.name,
            color: mat.color,
            density: mat.density,
            density_unit: mat.density_unit,
            composition: mat.composition || []
        };
    }

    // 2. Build geometry tree
    var geometryRoot = {
        type: "Universe",
        name: "root",
        children: []
    };

    var scene = document.getElementById("scene");
    var topLevelNodes = Array.from(scene.children).filter(el => el.tagName.toLowerCase() === 'transform');

    topLevelNodes.forEach(function (node) {
        // Skip axis helper and nodes without DEF
        if (node.id === "axisHelper") return;
        if (!node.getAttribute("DEF")) return;

        geometryRoot.children.push(traverseGraph(node));
    });

    // 3. Package final export object
    var exportData = {
        materials: materialsExport,
        geometry: geometryRoot,
        settings: SIM_SETTINGS
    };

    // 4. Download File
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    var link = document.createElement('a');
    link.href = dataStr;
    link.download = "openmc_geometry_export.json";
    link.click();

    setStatus("Exported geometry with " + Object.keys(materialsExport).length + " materials.");
}