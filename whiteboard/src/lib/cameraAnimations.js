import * as THREE from 'three'
import objectPositions from './objectPositions'

const _tmpCam = new THREE.PerspectiveCamera()

// ── Easing functions ──────────────────────────────────────────────────────────
export const EASING_OPTIONS = ['linear', 'ease-in', 'ease-out', 'ease-in-out']

const EASINGS = {
  linear:       (t) => t,
  'ease-in':    (t) => t * t * t,
  'ease-out':   (t) => 1 - Math.pow(1 - t, 3),
  'ease-in-out':(t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
}

export function applyEasing(t, easing) {
  return (EASINGS[easing] ?? EASINGS['ease-in-out'])(Math.min(1, Math.max(0, t)))
}

// ── Camera state capture ──────────────────────────────────────────────────────
export function captureCameraState(camera) {
  return {
    position:   camera.position.clone(),
    quaternion: camera.quaternion.clone(),
    fov:        camera.fov,
  }
}

// Build a camera state from world position + lookAt point
function stateFromPosLook(position, lookAt, fov) {
  _tmpCam.position.copy(position)
  const dir = new THREE.Vector3().subVectors(lookAt, position).normalize()
  _tmpCam.up.set(0, Math.abs(dir.y) > 0.99 ? 0 : 1, Math.abs(dir.y) > 0.99 ? -1 : 0)
  _tmpCam.lookAt(lookAt)
  return {
    position:   position.clone(),
    quaternion: _tmpCam.quaternion.clone(),
    fov,
    lookAt:     lookAt.clone(),
  }
}

// ── Action resolver ───────────────────────────────────────────────────────────
/**
 * Resolves a hotspot action into a step descriptor:
 *   { animType: 'tween', to: CameraState, lookAt: V3 }
 *   { animType: 'orbit', center, radius, height, startAngle, endAngle, fov }
 */
export function resolveAction(action, currentPos, currentFov) {
  const cur = currentPos instanceof THREE.Vector3 ? currentPos : new THREE.Vector3(...currentPos)

  switch (action.type) {
    case 'move-to': {
      const pos  = new THREE.Vector3(...(action.toPosition ?? [5, 3, 5]))
      const look = new THREE.Vector3(...(action.toLookAt  ?? [0, 0, 0]))
      return { animType: 'tween', to: stateFromPosLook(pos, look, action.toFov ?? currentFov), lookAt: look }
    }

    case 'zoom-in': {
      // Explicit end position — no distance-based math, no auto-rotation
      const pos  = new THREE.Vector3(...(action.toPosition ?? [2, 1, 2]))
      const look = new THREE.Vector3(...(action.toLookAt  ?? [0, 0, 0]))
      return { animType: 'tween', to: stateFromPosLook(pos, look, action.toFov ?? currentFov), lookAt: look }
    }

    case 'zoom-out': {
      const pos  = new THREE.Vector3(...(action.toPosition ?? [5, 8, 5]))
      const look = new THREE.Vector3(...(action.toLookAt  ?? [0, 0, 0]))
      return { animType: 'tween', to: stateFromPosLook(pos, look, action.toFov ?? 60), lookAt: look }
    }

    case 'focus-object': {
      const objWP = action.focusObjectId != null && objectPositions.has(action.focusObjectId)
        ? objectPositions.get(action.focusObjectId).clone()
        : new THREE.Vector3(0, 0, 0)
      const dir = new THREE.Vector3().subVectors(cur, objWP)
      if (dir.length() < 0.001) dir.set(0, 0, 1)
      dir.normalize()
      const pos = objWP.clone().addScaledVector(dir, action.focusDistance ?? 5)
      return { animType: 'tween', to: stateFromPosLook(pos, objWP, action.focusFov ?? currentFov), lookAt: objWP }
    }

    case 'orbit': {
      const center = new THREE.Vector3(...(action.orbitTarget ?? [0, 0, 0]))
      const startAngle = Math.atan2(cur.z - center.z, cur.x - center.x)
      const sweep = ((action.orbitAngle ?? 360) * Math.PI) / 180
      return {
        animType: 'orbit',
        center,
        radius:     action.orbitRadius ?? 5,
        height:     center.y + (action.orbitHeight ?? 0),
        startAngle,
        endAngle:   startAngle + sweep,
        fov:        currentFov,
        lookAt:     center.clone(),
      }
    }

    default:
      return null
  }
}
