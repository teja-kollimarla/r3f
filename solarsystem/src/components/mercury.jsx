import { useRef } from "react";
import useSelected from "../lib/zustand";
import { useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import useLeva from "../lib/leva";
import useRotate from "../lib/rotate";

export default function Mercury() {
  const mercury = useRef();

  const setSelected = useSelected((s) => s.setSelected);
  const texture = useLoader(TextureLoader, "/mercury.jpg");
  const {
    speed = 0.01,
    size = 1,
    color = "orange",
    rotateX,
    rotateY,
    rotateZ,
  } = useLeva("Mercury", {
    speed: { value: 5, min: 1, max: 10, step: 0.001 },
    size: { value: 1.6, min: 0.1, max: 10, step: 0.1 },
    color: "orange",
    rotateX: false,
    rotateY: true,
    rotateZ: false,
  });

  useRotate(mercury, speed, rotateX, rotateY, rotateZ);
  return (
    <mesh
      ref={mercury}
      position={[16, 0, 0]}
      onPointerDown={(e) => {
        e.stopPropagation();
        setSelected("Mercury", e.object);
      }}
    >
      <sphereGeometry args={[size, 32, 32]} />
      <meshBasicMaterial map={texture} color="yellow" />
    </mesh>
  );
}