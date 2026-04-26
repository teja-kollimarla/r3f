import {Canvas,useFrame} from '@react-three/fiber';
import { useRef } from 'react';
import { BoxGeometry } from 'three/src/Three.Core.js';
import { FirstPersonControls } from '@react-three/drei';
import { OrbitControls } from '@react-three/drei';

function AnimateBox(){
const boxref=useRef()
 useFrame(()=>{
  boxref.current.rotation.x += 0.005;
  
  boxref.current.rotation.y += 0.005;
  
  boxref.current.rotation.z += 0.005;
 }) 
 return(
<mesh ref={boxref} >
          <FirstPersonControls movementSpeed={2} a/>
          <OrbitControls/>
          {/* 
            movementSpeed for the zoom in and out speed
            autoForward  for zoom in fully auto 
          
          */}
          <boxGeometry args={[1,1,1]}/>
          {/* <meshBasicMaterial wireframe color={'red'}/>  don't need light  */}
          <meshStandardMaterial  color={'red'}/>           {/* need light source */}
          
        </mesh>
 ) 

}

function App() {
 
  return (
    <div className='canvas-div' style={{}}>
      <Canvas >        {/* camera={{position:[2,-2,-2]}} */}
          <AnimateBox/>
        <directionalLight position={[0,0,0]}/>
      </Canvas>
    </div>
  )
}

export default App
