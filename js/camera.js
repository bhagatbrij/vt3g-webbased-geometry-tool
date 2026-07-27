export function setCamera(view) {
    var vp = document.getElementById('mainView');
    if (!vp) return;

    // Get live camera distance from X3DOM runtime view matrix
    var dist = 15; // fallback default
    try {
        var x3dElem = document.getElementById('x3dElement');
        if (x3dElem && x3dElem.runtime) {
            var viewMat = x3dElem.runtime.viewMatrix();
            // viewMatrix is world-to-camera; invert to get camera position
            var invMat = viewMat.inverse();
            // Camera position is the translation column of the inverse
            var cx = invMat._03, cy = invMat._13, cz = invMat._23;
            var d = Math.sqrt(cx * cx + cy * cy + cz * cz);
            if (d > 0.1) dist = d;
        }
    } catch (e) {
        // If runtime not ready, use fallback
    }

    if (view === 'TOP') {
        vp.setAttribute('position', '0 ' + dist + ' 0');
        vp.setAttribute('orientation', '1 0 0 -1.57');
    } else if (view === 'FRONT') {
        vp.setAttribute('position', '0 0 ' + dist);
        vp.setAttribute('orientation', '0 0 0 0');
    } else if (view === 'SIDE') {
        vp.setAttribute('position', dist + ' 0 0');
        vp.setAttribute('orientation', '0 1 0 1.57');
    } else if (view === 'ISO') {
        var d = dist / Math.sqrt(3);
        vp.setAttribute('position', d + ' ' + (d * 0.65) + ' ' + d);
        vp.setAttribute('orientation', '-0.5 1 0.2 0.9');
    }
}

export function zoomCamera(val) {
    var vp = document.getElementById('mainView');
    if (!vp) return;
    vp.setAttribute('fieldOfView', val / 20.0);
}

export function toggleAxes() {
    var axis = document.getElementById('axisHelper');
    var isChecked = document.getElementById('axisToggle').checked;
    if (axis) axis.setAttribute("render", isChecked);
}