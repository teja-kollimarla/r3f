import { useRef } from "react";
import { useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import useRotate from "../lib/rotate";
import useLeva from "../lib/leva";
import useSelected from "../lib/zustand";


export default function Sun({children}) {
  const sun = useRef();
  const texture = useLoader(TextureLoader, "/sun.jpg");

  const setSelected = useSelected((s) => s.setSelected);

  const {
    speed = 0.1,
    size = 1,
    color = "orange",
    rotateX,
    rotateY,
    rotateZ,
  } = useLeva("Sun", {
    speed: { value: 0.01, min: 0, max: 10, step: 0.001 },
    size: { value: 7, min: 1, max: 10, step: 0.1 },
    color: "orange",
    rotateX: false,
    rotateY: true,
    rotateZ: false,
  });

  useRotate(sun, speed, rotateX, rotateY, rotateZ);

  return (
    <group>
    <mesh
      ref={sun}
      scale={size}
      position={[0,0,0]}
      onPointerDown={(e) => {
        e.stopPropagation();
        console.log("setting sun")
        setSelected("Sun", e.object);
      }}
    >
      <sphereGeometry args={[10, 32, 32]} />
      <meshBasicMaterial map={texture} color={color} />
    </mesh>
    {children}
  </group>
  );
}