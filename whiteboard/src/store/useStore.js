import { create } from 'zustand'
import { geoConfigs } from '../lib/geoConfigs'

const defaultRotation = { enabled: false, x: false, y: true, z: false, speed: 1 }

const defaultObjectProps = {
  color: '#ff6600',
  scale: 1,
  wireframe: false,
  rotation: defaultRotation,
}

const defaultLights = {
  ambient: {
    enabled: true,
    color: '#ffffff',
    intensity: 0.5,
  },
  directional: {
    enabled: false,
    color: '#ffffff',
    intensity: 1,
    x: 10, y: 10, z: 5,
    showHelper: false,
    helperSize: 1,
  },
  point: {
    enabled: false,
    color: '#ffffff',
    intensity: 1,
    x: 0, y: 5, z: 0,
    distance: 0,
    decay: 2,
    showHelper: false,
    helperSize: 0.5,
  },
  spot: {
    enabled: false,
    color: '#ffffff',
    intensity: 1,
    x: 5, y: 10, z: 5,
    angle: 0.3,
    penumbra: 0.1,
    distance: 0,
    decay: 2,
    showHelper: false,
  },
  hemisphere: {
    enabled: false,
    skyColor: '#ffffff',
    groundColor: '#444444',
    intensity: 0.5,
    showHelper: false,
    helperSize: 1,
  },
}

const useStore = create((set) => ({
  selectedGeometry: null,
  transformMode: 'translate',
  showTransform: false,          // ← ADD THIS
  geoArgs: [],
  objectProps: defaultObjectProps,
  lights: defaultLights,
  backgroundColor: '#d1d5db',

  selectGeometry: (key) => set({
    selectedGeometry: key,
    geoArgs: [...(geoConfigs[key]?.defaults || [])],
    objectProps: defaultObjectProps,
  }),

  setTransformMode:  (mode) => set({ transformMode: mode }),
  setShowTransform:  (v)    => set({ showTransform: v }), // ← ADD THIS

  setObjectProp: (key, value) => set((state) => ({
    objectProps: { ...state.objectProps, [key]: value },
  })),

  setGeoArg: (index, value) => set((state) => {
    const next = [...state.geoArgs]
    next[index] = value
    return { geoArgs: next }
  }),

  resetObjectProps: () => set((state) => ({
    objectProps: defaultObjectProps,
    geoArgs: [...(geoConfigs[state.selectedGeometry]?.defaults || [])],
  })),

  updateLight: (type, key, value) => set((state) => ({
    lights: {
      ...state.lights,
      [type]: { ...state.lights[type], [key]: value },
    },
  })),

  resetLights:        () => set({ lights: defaultLights }),
  setBackgroundColor: (color) => set({ backgroundColor: color }),
}))

export default useStore