// js/state.js
export const DEFAULTS = {
    Cylinder: { radius: 0.5, height: 2.0, color: "#e74c3c" },
    Box: { size: "1.5 1.5 1.5", color: "#3498db" },
    Sphere: { radius: 0.75, color: "#2ecc71" }
};

export let MATERIAL_DB = {
    'mat_fuel': {
        id: 'mat_fuel', name: 'Fuel (UO2)', color: '1.0 0.6 0.2',
        density: 10.97, density_unit: 'g/cm3',
        composition: [
            { id: 'U235', amount: 0.05, type: 'ao' },
            { id: 'U238', amount: 0.95, type: 'ao' },
            { id: 'O16', amount: 2.0, type: 'ao' }
        ]
    },
    'mat_clad': {
        id: 'mat_clad', name: 'Cladding (Zircaloy)', color: '0.95 0.91 0.09',
        density: 6.56, density_unit: 'g/cm3',
        composition: [
            { id: 'Zr', amount: 1.0, type: 'ao' }
        ]
    },
    'mat_mod': {
        id: 'mat_mod', name: 'Moderator (Water)', color: '0.11 0.36 0.60',
        density: 1.0, density_unit: 'g/cm3',
        composition: [
            { id: 'H1', amount: 2.0, type: 'ao' },
            { id: 'O16', amount: 1.0, type: 'ao' }
        ]
    },
    'mat_abs': {
        id: 'mat_abs', name: 'Absorber (B4C)', color: '0.004 0.56 0.11',
        density: 2.52, density_unit: 'g/cm3',
        composition: [
            { id: 'B', amount: 4.0, type: 'ao' },
            { id: 'C', amount: 1.0, type: 'ao' }
        ]
    },
    'mat_drum': {
        id: 'mat_drum', name: 'Control Drum (B4C/SS)', color: '1 0.5 0',
        density: 5.0, density_unit: 'g/cm3',
        composition: [
            { id: 'B', amount: 4.0, type: 'ao' },
            { id: 'C', amount: 1.0, type: 'ao' }
        ]
    },
    'mat_vessel': {
        id: 'mat_vessel', name: 'Vessel/Reflector', color: '0.4 0.6 0.9',
        density: 7.87, density_unit: 'g/cm3',
        composition: [
            { id: 'Fe', amount: 1.0, type: 'ao' }
        ]
    },
    'mat_annulus': {
        id: 'mat_annulus', name: 'Annulus (Flux Trap)', color: '0.95 0.95 1.0',
        density: 1.0, density_unit: 'g/cm3',
        composition: [
            { id: 'H1', amount: 2.0, type: 'ao' },
            { id: 'O16', amount: 1.0, type: 'ao' }
        ]
    },
    'mat_steel': {
        id: 'mat_steel', name: 'Steel', color: '0.3 0.3 0.3',
        density: 7.9, density_unit: 'g/cm3',
        composition: [
            { id: 'Fe', amount: 1.0, type: 'ao' }
        ]
    },
    'mat_beamport': {
        id: 'mat_beamport', name: 'Beam Port (Aluminum)', color: '0.60 0.16 0.35',
        density: 2.7, density_unit: 'g/cm3',
        composition: [
            { id: 'Al', amount: 1.0, type: 'ao' }
        ]
    },
    'mat_air': {
        id: 'mat_air', name: 'Air', color: '1.0 1.0 1.0',
        density: 0.0012, density_unit: 'g/cm3',
        locked: true,
        composition: [
            { id: 'N14', amount: 0.78, type: 'ao' },
            { id: 'O16', amount: 0.21, type: 'ao' },
            { id: 'Ar40', amount: 0.01, type: 'ao' }
        ]
    },
    'mat_graphite': {
        id: 'mat_graphite', name: 'Graphite', color: '0.41 0.41 0.41',
        density: 1.7, density_unit: 'g/cm3',
        composition: [
            { id: 'C', amount: 1.0, type: 'ao' }
        ]
    },
    'mat_zirconium': {
        id: 'mat_zirconium', name: 'Zirconium', color: '0.55 0.02 0.81',
        density: 6.52, density_unit: 'g/cm3',
        composition: [
            { id: 'Zr90', amount: 0.5145, type: 'ao' },
            { id: 'Zr91', amount: 0.1122, type: 'ao' },
            { id: 'Zr92', amount: 0.1715, type: 'ao' },
            { id: 'Zr94', amount: 0.1738, type: 'ao' },
            { id: 'Zr96', amount: 0.0280, type: 'ao' }
        ]
    },
    'mat_molybdenum': {
        id: 'mat_molybdenum', name: 'Molybdenum', color: '0.40 0.26 0.13',
        density: 10.22, density_unit: 'g/cm3',
        composition: [
            { id: 'Mo', amount: 1.0, type: 'ao' }
        ]
    },
    'mat_helium': {
        id: 'mat_helium', name: 'Helium', color: '0.85 0.95 1.0',
        density: 0.178, density_unit: 'g/cm3',
        composition: [
            { id: 'He3', amount: 2e-06, type: 'ao' },
            { id: 'He4', amount: 0.999998, type: 'ao' }
        ]
    },
    'mat_carrier': {
        id: 'mat_carrier', name: 'Carrier Rod (Zr-Nb)', color: '0.45 0.55 0.65',
        density: 8.59, density_unit: 'g/cm3',
        composition: [
            { id: 'Zr90', amount: 0.5016375, type: 'ao' },
            { id: 'Zr91', amount: 0.10939499999999999, type: 'ao' },
            { id: 'Zr92', amount: 0.16721250000000001, type: 'ao' },
            { id: 'Zr94', amount: 0.169455, type: 'ao' },
            { id: 'Zr96', amount: 0.0273, type: 'ao' },
            { id: 'Nb93', amount: 0.025, type: 'ao' }
        ]
    },
    'mat_rbmk_fuel': {
        id: 'mat_rbmk_fuel', name: 'RBMK Fuel (2% UO2-Er)', color: '0.90 0.45 0.10',
        density: 10.4, density_unit: 'g/cm3',
        composition: [
            { id: 'U234', amount: 0.00018009766660366655, type: 'ao' },
            { id: 'U235', amount: 0.020149343268423638, type: 'ao' },
            { id: 'U238', amount: 0.9745782653947512, type: 'ao' },
            { id: 'U236', amount: 9.229367022139781e-05, type: 'ao' },
            { id: 'Er162', amount: 6.9499999999999995e-06, type: 'ao' },
            { id: 'Er164', amount: 8.005000000000001e-05, type: 'ao' },
            { id: 'Er166', amount: 0.00167515, type: 'ao' },
            { id: 'Er167', amount: 0.00114345, type: 'ao' },
            { id: 'Er168', amount: 0.0013489, type: 'ao' },
            { id: 'Er170', amount: 0.0007455000000000001, type: 'ao' },
            { id: 'O16', amount: 2.0, type: 'ao' }
        ]
    },
    'mat_rbmk_clad': {
        id: 'mat_rbmk_clad', name: 'RBMK Cladding (Zircaloy)', color: '0.80 0.78 0.20',
        density: 8.59, density_unit: 'g/cm3',
        composition: [
            { id: 'Zr90', amount: 0.509355, type: 'ao' },
            { id: 'Zr91', amount: 0.111078, type: 'ao' },
            { id: 'Zr92', amount: 0.16978500000000002, type: 'ao' },
            { id: 'Zr94', amount: 0.17206200000000002, type: 'ao' },
            { id: 'Zr96', amount: 0.02772, type: 'ao' },
            { id: 'Nb93', amount: 0.01, type: 'ao' }
        ]
    },
    'mat_subtract': {
        id: 'mat_subtract', name: 'Subtract', color: '1.0 1.0 1.0',
        density: 0, density_unit: 'g/cm3',
        locked: true, composition: []
    }
};

export let SIM_SETTINGS = {
    batches: 50,
    particles: 1000,
    inactive: 10,
    run_mode: 'eigenvalue',
    boundary: 'vacuum'
};

// Mutable state variables
export const AppState = {
    selectedNode: null,
    objectCount: 0
};