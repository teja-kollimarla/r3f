import { create } from 'zustand'
import { geoConfigs } from '../lib/geoConfigs'

const defaultRotation = { enabled: false, x: false, y: true, z: false, speed: 1 }

export const makeObjectProps = () => ({
  color: '#ff6600',
  scale: 1,
  wireframe: false,
  rotation: { ...defaultRotation },
})

const defaultLights = {
  ambient:     { enabled: true,  color: '#ffffff', intensity: 0.5 },
  directional: { enabled: false, color: '#ffffff', intensity: 1, x: 10, y: 10, z: 5,  showHelper: false, helperSize: 1 },
  point:       { enabled: false, color: '#ffffff', intensity: 1, x: 0,  y: 5,  z: 0,  distance: 0, decay: 2, showHelper: false, helperSize: 0.5 },
  spot:        { enabled: false, color: '#ffffff', intensity: 1, x: 5,  y: 10, z: 5,  angle: 0.3, penumbra: 0.1, distance: 0, decay: 2, showHelper: false },
  hemisphere:  { enabled: false, skyColor: '#ffffff', groundColor: '#444444', intensity: 0.5, showHelper: false, helperSize: 1 },
}

let nextId = 1

const useStore = create((set, get) => ({
  // ── Objects ────────────────────────────────────
  objects: [],        // [{ id, geometryKey, geoArgs, objectProps }]
  selectedId: null,

  addObject: (geometryKey) => {
    const id = nextId++
    const geoArgs = [...(geoConfigs[geometryKey]?.defaults || [])]
    set((state) => ({
      objects: [...state.objects, { id, geometryKey, geoArgs, objectProps: makeObjectProps() }],
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

  // ── Transform ──────────────────────────────────
  transformMode: 'translate',
  showTransform: false,
  setTransformMode:  (mode) => set({ transformMode: mode }),
  setShowTransform:  (v)    => set({ showTransform: v }),

  // ── Lights ─────────────────────────────────────
  lights: defaultLights,
  updateLight: (type, key, value) => set((state) => ({
    lights: { ...state.lights, [type]: { ...state.lights[type], [key]: value } },
  })),
  resetLights: () => set({ lights: defaultLights }),

  // ── Scene ──────────────────────────────────────
  backgroundColor: '#d1d5db',
  setBackgroundColor: (color) => set({ backgroundColor: color }),
}))

export default useStore