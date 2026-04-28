import { useRef } from "react";
import useSelected from "../lib/zustand";
import { useFrame, useLoader } from "@react-three/fiber";
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
    roatateSpeed=160
  } = useLeva("Mercury", {
    speed: { value: 5, min: 1, max: 10, step: 0.001 },
    size: { value: 1.6, min: 0.1, max: 10, step: 0.1 },
    color: "orange",
    rotateX: false,
    rotateY: true,
    rotateZ: false,
    roatateSpeed:16,
  });
useFrame((state) => {
  const t = state.clock.elapsedTime;
  mercury.current.position.x = roatateSpeed * Math.cos(t) *2.5;
  mercury.current.position.z = (roatateSpeed *3) * Math.sin(t) ;
  // mercury.current.position.y=56
});
  useRotate(mercury, speed, rotateX, rotateY, rotateZ);
  return (
    <mesh
      ref={mercury}
      position={[56, 0, 0]}
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