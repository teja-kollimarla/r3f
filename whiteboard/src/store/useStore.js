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
}))

export default useStore