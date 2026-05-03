import {Canvas} from '@react-three/fiber';
import { BoxGeometry } from 'three/src/Three.Core.js';

function App() {
 

  return (
    <div className='canvas-div' style={{}}>
      <Canvas >
        <mesh>
          <boxGeometry args={[1,1,3]}/>
          {/* <meshBasicMaterial wireframe color={'red'}/>  don't need light  */}
          <meshPhongMaterial wireframe={false} color={'black'}/>           {/* need light source */}
          
        </mesh>
        <directionalLight position={[0,10,110]}/>
      </Canvas>
    </div>
  )
}

export default App
