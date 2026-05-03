import { useRef } from 'react'
import { useHelper } from '@react-three/drei'
import {
  DirectionalLightHelper,
  PointLightHelper,
  SpotLightHelper,
  HemisphereLightHelper,
} from 'three'
import useStore from '../store/useStore'

function DirectionalWithHelper({ light }) {
  const ref = useRef()
  useHelper(light.showHelper && ref, DirectionalLightHelper, light.helperSize ?? 1)
  return (
    <directionalLight
      ref={ref}
      color={light.color}
      intensity={light.intensity}
      position={[light.x, light.y, light.z]}
    />
  )
}

function PointWithHelper({ light }) {
  const ref = useRef()
  useHelper(light.showHelper && ref, PointLightHelper, light.helperSize ?? 0.5)
  return (
    <pointLight
      ref={ref}
      color={light.color}
      intensity={light.intensity}
      position={[light.x, light.y, light.z]}
      distance={light.distance}
      decay={light.decay}
    />
  )
}

function SpotWithHelper({ light }) {
  const ref = useRef()
  useHelper(light.showHelper && ref, SpotLightHelper)
  return (
    <spotLight
      ref={ref}
      color={light.color}
      intensity={light.intensity}
      position={[light.x, light.y, light.z]}
      angle={light.angle}
      penumbra={light.penumbra}
      distance={light.distance}
      decay={light.decay}
    />
  )
}

function HemiWithHelper({ light }) {
  const ref = useRef()
  useHelper(light.showHelper && ref, HemisphereLightHelper, light.helperSize ?? 1)
  return (
    <hemisphereLight
      ref={ref}
      color={light.skyColor}
      groundColor={light.groundColor}
      intensity={light.intensity}
    />
  )
}

function SceneLights() {
  const lights = useStore((s) => s.lights)
  const { ambient, directional, point, spot, hemisphere } = lights

  return (
    <>
      {ambient.enabled && (
        <ambientLight color={ambient.color} intensity={ambient.intensity} />
      )}
      {directional.enabled && <DirectionalWithHelper light={directional} />}
      {point.enabled       && <PointWithHelper       light={point}       />}
      {spot.enabled        && <SpotWithHelper        light={spot}        />}
      {hemisphere.enabled  && <HemiWithHelper        light={hemisphere}  />}
    </>
  )
}

export default SceneLights