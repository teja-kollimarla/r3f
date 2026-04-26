import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { OrbitControls ,GizmoHelper,GizmoViewcube,GizmoViewport} from '@react-three/drei';
import { useControls,Leva } from 'leva';


function AnimateBox() {
  const boxref = useRef();

  const { colour,speed,button } = useControls({
    colour:'red',
    speed: {
      value: 0.05,
      min: 0.01,
      max: 1,
      step: 0.001,
    },
    wireframe:false  });

  useFrame(() => {
    if (boxref.current) {
      boxref.current.rotation.x += speed;
      boxref.current.rotation.y += speed;
      boxref.current.rotation.z += speed;
    }
  });

  return (
    <mesh ref={boxref}>
      <axesHelper/>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color= {colour} wireframe={button}/>
    </mesh>
  );
}

function App() {
  return (
    <div className="canvas-div" style={{ height: '100vh' }}>
      
        <Leva position='top-left' neverHide/>
      <Canvas>
        <GizmoHelper alignment='top-left'>
          <GizmoViewport/>
          
        </GizmoHelper>
        <gridHelper args={[10,20,'red','blue']}/>
        {/* args={[10,20,'red','blue']} 10=length of axis 
            20=number of grids 
            red= axis lenght 
            blue = axis of grids

         */}
        <axesHelper args={[10]}/>
        <AnimateBox />

        {/* Controls (correct place) */}
        <OrbitControls />

        {/* Lighting */}
        <ambientLight intensity={0.6} color={'yellow'} />
        {/* <directionalLight position={[2, 5, 5]} intensity={1} /> */}
      </Canvas>
    </div>
  );
}

export default App;