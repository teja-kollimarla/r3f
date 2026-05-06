import * as THREE from 'three'
import objectPositions from './objectPositions'

const _center = new THREE.Vector3()
const _up     = new THREE.Vector3(0, 1, 0)
const _dir    = new THREE.Vector3()

/**
 * Given a list of object ids, compute the centroid and bounding radius
 * of their current world positions. Returns null if no positions are known yet.
 */
export function computeBoundingSphere(lookAtObjectIds) {
  if (!lookAtObjectIds || lookAtObjectIds.length === 0) return null

  const pts = lookAtObjectIds
    .filter((id) => objectPositions.has(id))
    .map((id) => objectPositions.get(id))

  if (pts.length === 0) return null

  _center.set(0, 0, 0)
  pts.forEach((p) => _center.add(p))
  _center.divideScalar(pts.length)

  let radius = 0
  pts.forEach((p) => { radius = Math.max(radius, _center.distanceTo(p)) })
  radius = Math.max(radius, 0.5) // floor so frustum never collapses

  return { center: _center.clone(), radius }
}

/**
 * Rotate cam to face target, with gimbal-safe up vector.
 */
export function lookAtSafe(cam, target) {
  _dir.subVectors(target, cam.position).normalize()
  const parallel = Math.abs(_dir.dot(_up)) > 0.99
  cam.up.set(0, parallel ? 0 : 1, parallel ? -1 : 0)
  cam.lookAt(target.x, target.y, target.z)
}

/**
 * Adjust cam.fov so the bounding sphere (center, radius) fits inside the frustum.
 * Adds 20 % padding. Updates projectionMatrix.
 */
export function autoFrameFOV(cam, center, radius) {
  const dist = cam.position.distanceTo(center)
  if (dist < 0.001) return
  const fov = 2 * Math.atan2(radius * 1.2, dist) * (180 / Math.PI)
  cam.fov = Math.min(Math.max(fov, 1), 170)
  cam.updateProjectionMatrix()
}
