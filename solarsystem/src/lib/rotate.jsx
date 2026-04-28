import { useFrame } from "@react-three/fiber";

const useRotate=(ref,speed=0.01,isx,isy,isz)=>{
    useFrame(()=>{
        if(ref.current){
            if(isx){
            ref.current.rotation.x +=speed;}
            if(isy)ref.current.rotation.y +=speed;
            if(isz)ref.current.rotation.z +=speed;
        }
    })
}


export default useRotate;