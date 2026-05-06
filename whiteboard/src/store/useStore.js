import { create } from 'zustand'
import { geoConfigs } from '../lib/geoConfigs'

const makeObjectProps = () => ({
  color: '#ff6600',
  scale: 1,
  wireframe: false,
  opacity: 1,
  doubleSide: false,
  meshRotation: { x: 0, y: 0, z: 0 },
  rotation: { enabled: false, x: false, y: true, z: false, speed: 1 },
  revolve: { enabled: false, speed: 1, radiusX: 3, radiusZ: 3, y: 0 },
})

const makeCameraProps = () => ({
  fov: 10,
  near: 1,
  far: 10,
  showHelper: true,
  euler: [0, 0, 0],         // camera world rotation in radians [pitch, yaw, roll]
  lookAtObjectIds: [],      // object ids to keep in frame; empty = free rotation
  autoFrame: false,         // auto-adjust FOV so all bound objects fit in frame
  rotation: { enabled: false, x: false, y: true, z: false, speed: 1 },
  revolve: { enabled: false, speed: 1, radiusX: 5, radiusZ: 5, y: 0 },
})

const defaultLights = {
  ambient: { enabled: true, color: '#ffffff', intensity: 0.5 },
  directional: { enabled: false, color: '#ffffff', intensity: 1, x: 10, y: 10, z: 5, showHelper: false, helperSize: 1 },
  point: { enabled: false, color: '#ffffff', intensity: 1, x: 0, y: 5, z: 0, distance: 0, decay: 2, showHelper: false, helperSize: 0.5 },
  spot: { enabled: false, color: '#ffffff', intensity: 1, x: 5, y: 10, z: 5, angle: 0.3, penumbra: 0.1, distance: 0, decay: 2, showHelper: false },
  hemisphere: { enabled: false, skyColor: '#ffffff', groundColor: '#444444', intensity: 0.5, showHelper: false, helperSize: 1 },
}

const typeCounts = {}
let nextId = 1
let nextLabelId = 1
let nextCameraId = 1
let nextHotspotId = 1

const makeHotspot = (id) => ({
  id,
  name: `Hotspot ${id}`,
  position: [0, 1, 0],
  color: '#f59e0b',
  action: {
    type: 'move-to',
    // move-to / zoom-out
    toPosition: [5, 3, 5],
    toLookAt:   [0, 0, 0],
    toFov:      45,
    // zoom-in
    zoomTarget:   [0, 0, 0],
    zoomDistance: 3,
    zoomFov:      30,
    // focus-object
    focusObjectId: null,
    focusDistance: 5,
    focusFov:      45,
    // orbit
    orbitTarget: [0, 0, 0],
    orbitRadius: 5,
    orbitAngle:  360,
    orbitHeight: 0,
    // sequence
    sequenceIds: [],
    // start / path
    useDefinedStart: false,
    startPosition:   [0, 3, 5],
    startLookAt:     [0, 0, 0],
    startFov:        45,
    waypoints:       [],
  },
  transition: { duration: 1.5, easing: 'ease-in-out', delay: 0, loopBack: false, loopBackDuration: 1.5 },
})

const useStore = create((set) => ({
  objects: [],
  selectedId: null,

  cameras: [],
  selectedCameraId: null,
  previewCameraId: null,

  addObject: (geometryKey) => {
    const id = nextId++
    typeCounts[geometryKey] = (typeCounts[geometryKey] || 0) + 1
    const defaultName = `${geometryKey.charAt(0).toUpperCase() + geometryKey.slice(1)} ${typeCounts[geometryKey]}`
    const geoArgs = [...(geoConfigs[geometryKey]?.defaults || [])]
    set((state) => ({
      objects: [...state.objects, { id, geometryKey, name: defaultName, geoArgs, objectProps: makeObjectProps() }],
      selectedId: id,
    }))
  },

  removeObject: (id) => set((state) => {
    const objects = state.objects.filter((o) => o.id !== id)
    const selectedId = state.selectedId === id
      ? (objects.length > 0 ? objects[objects.length - 1].id : null)
      : state.selectedId
    return { objects, selectedId }
  }),

  renameObject: (id, name) => set((state) => ({
    objects: state.objects.map((o) => o.id === id ? { ...o, name } : o),
  })),

  selectObject: (id) => set({ selectedId: id }),

  setObjectProp: (id, key, value) => set((state) => ({
    objects: state.objects.map((o) =>
      o.id === id ? { ...o, objectProps: { ...o.objectProps, [key]: value } } : o
    ),
  })),

  setGeoArg: (id, index, value) => set((state) => ({
    objects: state.objects.map((o) => {
      if (o.id !== id) return o
      const geoArgs = [...o.geoArgs]
      geoArgs[index] = value
      return { ...o, geoArgs }
    }),
  })),

  resetObjectProps: (id) => set((state) => ({
    objects: state.objects.map((o) =>
      o.id === id
        ? { ...o, objectProps: makeObjectProps(), geoArgs: [...(geoConfigs[o.geometryKey]?.defaults || [])] }
        : o
    ),
  })),

  transformMode: 'translate',
  showTransform: false,
  setTransformMode: (mode) => set({ transformMode: mode }),
  setShowTransform: (v) => set({ showTransform: v }),

  lights: defaultLights,
  updateLight: (type, key, value) => set((state) => ({
    lights: { ...state.lights, [type]: { ...state.lights[type], [key]: value } },
  })),
  resetLights: () => set({ lights: defaultLights }),

  backgroundColor: '#d1d5db',
  setBackgroundColor: (color) => set({ backgroundColor: color }),

  isTransforming: false,
  setIsTransforming: (v) => set({ isTransforming: v }),


  isDraggingLabel: false,
  setIsDraggingLabel: (v) => set({ isDraggingLabel: v }),


  labels: [],
  selectedLabelId: null,

  addLabel: (targetId) => {
    const id = nextLabelId++
    set((state) => ({
      labels: [...state.labels, {
        id,
        text: 'Label',
        targetId: targetId ?? null,
        position: [2, 2, 0],
        lineColor: '#ffffff',
        bgColor: '#1e293b',
        textColor: '#ffffff',
        fontSize: 12,
      }],
      selectedLabelId: id,
    }))
  },

  removeLabel: (id) => set((state) => ({
    labels: state.labels.filter((l) => l.id !== id),
    selectedLabelId: state.selectedLabelId === id ? null : state.selectedLabelId,
  })),

  updateLabel: (id, key, value) => set((state) => ({
    labels: state.labels.map((l) => l.id === id ? { ...l, [key]: value } : l),
  })),

  selectLabel: (id) => set({ selectedLabelId: id }),

  addCamera: () => {
    const id = nextCameraId++
    set((state) => ({
      cameras: [...state.cameras, {
        id,
        name: `Camera ${id}`,
        position: [0, 2, 0],   // ← was [0, 2, 5], now spawns at center
        cameraProps: makeCameraProps(),
      }],
      selectedCameraId: id,
      selectedId: null,
    }))
  },

  removeCamera: (id) => set((state) => {
    const cameras = state.cameras.filter((c) => c.id !== id)
    const selectedCameraId = state.selectedCameraId === id
      ? (cameras.length > 0 ? cameras[cameras.length - 1].id : null)
      : state.selectedCameraId
    return { cameras, selectedCameraId, previewCameraId: state.previewCameraId === id ? null : state.previewCameraId }
  }),

  renameCamera: (id, name) => set((state) => ({
    cameras: state.cameras.map((c) => c.id === id ? { ...c, name } : c),
  })),

  selectCamera: (id) => set({ selectedCameraId: id, selectedId: null }),

  setCameraProp: (id, key, value) => set((state) => ({
    cameras: state.cameras.map((c) =>
      c.id === id ? { ...c, cameraProps: { ...c.cameraProps, [key]: value } } : c
    ),
  })),

  setCameraPosition: (id, position) => set((state) => ({
    cameras: state.cameras.map((c) => c.id === id ? { ...c, position } : c),
  })),

  startPreview: (id) => set({ previewCameraId: id }),
  stopPreview: () => set({ previewCameraId: null }),

  // ── Hotspots ────────────────────────────────────────────────────────────────
  hotspots: [],
  selectedHotspotId: null,
  pendingHotspotId:  null,
  isAnimating:       false,

  addHotspot: () => {
    const id = nextHotspotId++
    set((state) => ({
      hotspots: [...state.hotspots, makeHotspot(id)],
      selectedHotspotId: id,
      selectedId: null,
      selectedCameraId: null,
    }))
  },

  removeHotspot: (id) => set((state) => ({
    hotspots: state.hotspots.filter((h) => h.id !== id),
    selectedHotspotId: state.selectedHotspotId === id ? null : state.selectedHotspotId,
    pendingHotspotId:  state.pendingHotspotId  === id ? null : state.pendingHotspotId,
  })),

  updateHotspot: (id, key, value) => set((state) => ({
    hotspots: state.hotspots.map((h) => h.id === id ? { ...h, [key]: value } : h),
  })),

  updateHotspotAction: (id, key, value) => set((state) => ({
    hotspots: state.hotspots.map((h) =>
      h.id === id ? { ...h, action: { ...h.action, [key]: value } } : h
    ),
  })),

  updateHotspotTransition: (id, key, value) => set((state) => ({
    hotspots: state.hotspots.map((h) =>
      h.id === id ? { ...h, transition: { ...h.transition, [key]: value } } : h
    ),
  })),

  selectHotspot:       (id) => set({ selectedHotspotId: id, selectedId: null, selectedCameraId: null }),
  triggerHotspot:      (id) => set({ pendingHotspotId: id }),
  clearPendingHotspot: ()   => set({ pendingHotspotId: null }),
  setIsAnimating:      (v)  => set({ isAnimating: v }),

  captureRequest: null,
  requestCaptureCamera: (hid, field, waypointIndex = null) =>
    set({ captureRequest: { hid, field, waypointIndex } }),
  clearCaptureRequest: () => set({ captureRequest: null }),

  addHotspotWaypoint: (hid) => set((state) => ({
    hotspots: state.hotspots.map((h) =>
      h.id === hid
        ? { ...h, action: { ...h.action, waypoints: [...(h.action.waypoints ?? []), { position: [5, 3, 5], lookAt: [0, 0, 0], fov: 45 }] } }
        : h
    ),
  })),

  removeHotspotWaypoint: (hid, index) => set((state) => ({
    hotspots: state.hotspots.map((h) =>
      h.id === hid
        ? { ...h, action: { ...h.action, waypoints: (h.action.waypoints ?? []).filter((_, i) => i !== index) } }
        : h
    ),
  })),

  updateHotspotWaypoint: (hid, index, key, value) => set((state) => ({
    hotspots: state.hotspots.map((h) => {
      if (h.id !== hid) return h
      const waypoints = (h.action.waypoints ?? []).map((wp, i) =>
        i === index ? { ...wp, [key]: value } : wp
      )
      return { ...h, action: { ...h.action, waypoints } }
    }),
  })),
}))

export default useStore