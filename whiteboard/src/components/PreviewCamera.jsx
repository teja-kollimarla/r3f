import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useStore from '../store/useStore'
import { computeBoundingSphere, lookAtSafe, autoFrameFOV } from '../lib/cameraFrame'

function PreviewCamera() {
  const previewCameraId = useStore((s) => s.previewCameraId)
  const cameras         = useStore((s) => s.cameras)
  const { set, size }   = useThree()

  const camRef = useRef(new THREE.PerspectiveCamera())

  const previewCamera = cameras.find((c) => c.id === previewCameraId)

  useEffect(() => {
    const cam = camRef.current
    cam.aspect = size.width / size.height
    cam.updateProjectionMatrix()
    set({ camera: cam })

    return () => {
      const fallback = new THREE.PerspectiveCamera(45, size.width / size.height, 0.1, 10000)
      fallback.position.set(5, 3, 5)
      fallback.lookAt(0, 0, 0)
      fallback.updateMatrixWorld()
      set({ camera: fallback })
    }
  }, [])   // eslint-disable-line

  useEffect(() => {
    camRef.current.aspect = size.width / size.height
    camRef.current.updateProjectionMatrix()
  }, [size.width, size.height])

  useFrame(() => {
    if (!previewCamera) return
    const cam = camRef.current
    const { euler, lookAtObjectIds, autoFrame, fov, near, far } = previewCamera.cameraProps
    const boundIds = lookAtObjectIds ?? []
    const [x, y, z] = previewCamera.position

    cam.position.set(x, y, z)
    cam.near = near
    cam.far  = far

    const sphere = boundIds.length > 0 ? computeBoundingSphere(boundIds) : null

    if (sphere) {
      // ── Multi-object framing mode ─────────────────────────────────────────
      lookAtSafe(cam, sphere.center)
      if (autoFrame) {
        autoFrameFOV(cam, sphere.center, sphere.radius)
      } else {
        cam.fov = fov
        cam.updateProjectionMatrix()
      }
    } else {
      // ── Free rotation mode ────────────────────────────────────────────────
      cam.fov = fov
      cam.updateProjectionMatrix()
      cam.up.set(0, 1, 0)
      const [ex, ey, ez] = euler ?? [0, 0, 0]
      cam.rotation.set(ex, ey, ez)
    }

    cam.updateMatrixWorld(true)
  })

  return null
}

export default PreviewCamera
