import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useStore from '../store/useStore'
import { captureCameraState, resolveAction, applyEasing } from '../lib/cameraAnimations'

// Cancel any running animation, syncing OrbitControls to the actual step lookAt first
function cancelCurrentAnimation({ stepRef, queueRef, camera, controls }) {
  const step = stepRef.current
  if (step?.lookAt && controls?.target) {
    controls.target.copy(step.lookAt)
    controls.update?.()
  }
  stepRef.current  = null
  queueRef.current = []
}

function CameraCapture() {
  const { camera } = useThree()
  const captureRequest        = useStore((s) => s.captureRequest)
  const clearCaptureRequest   = useStore((s) => s.clearCaptureRequest)
  const updateHotspotAction   = useStore((s) => s.updateHotspotAction)
  const updateHotspotWaypoint = useStore((s) => s.updateHotspotWaypoint)

  useEffect(() => {
    if (!captureRequest) return
    const { hid, field, waypointIndex } = captureRequest
    const pos = [camera.position.x, camera.position.y, camera.position.z]
    const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion)
    const lookAt = [
      camera.position.x + dir.x * 5,
      camera.position.y + dir.y * 5,
      camera.position.z + dir.z * 5,
    ]
    const fov = Math.round(camera.fov)

    if (field === 'start') {
      updateHotspotAction(hid, 'startPosition', pos)
      updateHotspotAction(hid, 'startLookAt',   lookAt)
      updateHotspotAction(hid, 'startFov',      fov)
    } else if (field === 'end') {
      updateHotspotAction(hid, 'toPosition', pos)
      updateHotspotAction(hid, 'toLookAt',   lookAt)
      updateHotspotAction(hid, 'toFov',      fov)
    } else if (field === 'waypoint' && waypointIndex != null) {
      updateHotspotWaypoint(hid, waypointIndex, 'position', pos)
      updateHotspotWaypoint(hid, waypointIndex, 'lookAt',   lookAt)
      updateHotspotWaypoint(hid, waypointIndex, 'fov',      fov)
    }
    clearCaptureRequest()
  }, [captureRequest]) // eslint-disable-line

  return null
}

function CameraAnimator() {
  const { camera, controls } = useThree()
  const stepRef   = useRef(null)
  const queueRef  = useRef([])
  const animIdRef = useRef(0)   // incremented each animation start; guards stale frames

  const pendingHotspotId    = useStore((s) => s.pendingHotspotId)
  const hotspots            = useStore((s) => s.hotspots)
  const clearPendingHotspot = useStore((s) => s.clearPendingHotspot)
  const setIsAnimating      = useStore((s) => s.setIsAnimating)

  useEffect(() => {
    if (pendingHotspotId == null) return
    const hotspot = hotspots.find((h) => h.id === pendingHotspotId)
    clearPendingHotspot()
    if (!hotspot) return

    // Cancel any running animation cleanly before starting the new one
    cancelCurrentAnimation({ stepRef, queueRef, camera, controls })

    const thisId    = ++animIdRef.current
    const fromState = captureCameraState(camera)
    const descriptors = buildQueue(hotspot, hotspots, fromState)
    if (!descriptors.length) { setIsAnimating(false); return }

    queueRef.current = descriptors.slice(1)
    stepRef.current  = { ...hydrateStep(descriptors[0], fromState, camera), _animId: thisId }
    setIsAnimating(true)
  }, [pendingHotspotId]) // eslint-disable-line

  useFrame((_, delta) => {
    const step = stepRef.current
    if (!step) return

    // Guard against stale frames from rapid hotspot clicks
    if (step._animId !== animIdRef.current) { stepRef.current = null; return }

    if (step.delayRemaining > 0) {
      step.delayRemaining -= delta
      return
    }

    step.elapsed += delta
    const t  = Math.min(step.elapsed / step.duration, 1)
    const et = applyEasing(t, step.easing)

    if (step.animType === 'tween') {
      camera.position.lerpVectors(step.from.position, step.to.position, et)
      camera.quaternion.slerpQuaternions(step.from.quaternion, step.to.quaternion, et)
      camera.fov = THREE.MathUtils.lerp(step.from.fov, step.to.fov, et)
      camera.updateProjectionMatrix()
    } else if (step.animType === 'orbit') {
      const angle = THREE.MathUtils.lerp(step.startAngle, step.endAngle, et)
      camera.position.set(
        step.center.x + Math.cos(angle) * step.radius,
        step.height,
        step.center.z + Math.sin(angle) * step.radius
      )
      camera.up.set(0, 1, 0)
      camera.lookAt(step.center)
      camera.fov = step.fov
      camera.updateProjectionMatrix()
      camera.updateMatrixWorld()
    }

    // Keep OrbitControls target synced every frame — prevents snap on next user interaction
    if (controls?.target && step.lookAt) {
      controls.target.copy(step.lookAt)
      controls.update?.()
    }

    if (t >= 1) {
      if (queueRef.current.length > 0) {
        const next = queueRef.current.shift()
        stepRef.current = { ...hydrateStep(next, captureCameraState(camera), camera), _animId: animIdRef.current }
      } else {
        stepRef.current = null
        setIsAnimating(false)
      }
    }
  })

  return <CameraCapture />
}

// Attach 'from', 'elapsed', resolve startAngle for orbit from live camera
function hydrateStep(descriptor, fromState, camera) {
  const step = { ...descriptor, from: fromState, elapsed: 0 }
  if (step.animType === 'orbit' && step.computeStartAngle) {
    step.startAngle = Math.atan2(
      camera.position.z - step.center.z,
      camera.position.x - step.center.x
    )
    step.endAngle = step.startAngle + step.sweepAngle
  }
  return step
}

// Turn a hotspot (possibly a sequence) into an ordered list of step descriptors
function buildQueue(hotspot, allHotspots, fromState) {
  const { action, transition } = hotspot
  const steps = []

  // (A) Defined start position — prepend a tween step to the start state
  if (action.useDefinedStart) {
    steps.push(toDescriptorFromWaypoint(
      { position: action.startPosition, lookAt: action.startLookAt, fov: action.startFov },
      { duration: transition.duration, easing: transition.easing, delay: transition.delay ?? 0 }
    ))
  }

  // (B) Intermediate waypoints
  for (const wp of (action.waypoints ?? [])) {
    steps.push(toDescriptorFromWaypoint(
      wp,
      { duration: transition.duration, easing: transition.easing, delay: 0 }
    ))
  }

  // (C) Main action (the end destination)
  if (action.type === 'sequence') {
    const seqSteps = (action.sequenceIds ?? [])
      .map((id) => allHotspots.find((h) => h.id === id))
      .filter((h) => h && h.action.type !== 'sequence')
      .map((h) => toDescriptor(h.action, h.transition, fromState))
      .filter(Boolean)
    steps.push(...seqSteps)
  } else {
    const desc = toDescriptor(action, { ...transition, delay: 0 }, fromState)
    if (desc) steps.push(desc)
  }

  // (D) Loop back to start
  if (action.useDefinedStart && transition.loopBack) {
    steps.push(toDescriptorFromWaypoint(
      { position: action.startPosition, lookAt: action.startLookAt, fov: action.startFov },
      { duration: transition.loopBackDuration ?? 1.5, easing: 'ease-in-out', delay: 0 }
    ))
  }

  return steps
}

function toDescriptorFromWaypoint(wp, transition) {
  const toPos  = new THREE.Vector3(...wp.position)
  const lookAt = new THREE.Vector3(...wp.lookAt)
  const tmp    = new THREE.Object3D()
  tmp.position.copy(toPos)
  tmp.lookAt(lookAt)
  const toQ = tmp.quaternion.clone()
  return {
    animType:       'tween',
    to:             { position: toPos, quaternion: toQ, fov: wp.fov ?? 45 },
    lookAt,
    duration:       transition.duration ?? 1.5,
    easing:         transition.easing   ?? 'ease-in-out',
    delayRemaining: transition.delay    ?? 0,
  }
}

function toDescriptor(action, transition, fromState) {
  if (action.type === 'orbit') {
    const center = new THREE.Vector3(...(action.orbitTarget ?? [0, 0, 0]))
    return {
      animType:          'orbit',
      center,
      radius:            action.orbitRadius ?? 5,
      height:            center.y + (action.orbitHeight ?? 0),
      fov:               fromState.fov,
      sweepAngle:        ((action.orbitAngle ?? 360) * Math.PI) / 180,
      computeStartAngle: true,
      lookAt:            center.clone(),
      duration:          transition.duration ?? 1.5,
      easing:            transition.easing   ?? 'ease-in-out',
      delayRemaining:    transition.delay    ?? 0,
    }
  }

  const resolved = resolveAction(action, fromState.position, fromState.fov)
  if (!resolved) return null
  return {
    ...resolved,
    duration:       transition.duration ?? 1.5,
    easing:         transition.easing   ?? 'ease-in-out',
    delayRemaining: transition.delay    ?? 0,
  }
}

export default CameraAnimator
