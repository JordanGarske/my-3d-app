import { useState, useMemo,useContext } from 'react';
import { useFrame  } from '@react-three/fiber';
import { objectContext  } from '../App';
export function PanelExtension(pos){
  let posi = pos.pos.position
  let loc = [posi.x,posi.y,posi.z]
  const [position, setPosition] = useState(loc);
  const { setObjectPoint } = useContext(objectContext);
  useFrame((state) => {
    let x =[state.raycaster.ray.origin.x, 0, state.raycaster.ray.origin.z]
    setPosition([state.raycaster.ray.origin.x, 0, state.raycaster.ray.origin.z])
    setObjectPoint([x, loc])
  });
  const clickPlatform = () => {

};
  return (
    <>
      <mesh  position={loc}>
        <sphereGeometry args={[10, 16, 16]}  />
        <meshStandardMaterial color='yellow' />
      </mesh>
        <BoxBetweenPoints start={loc} end={position}></BoxBetweenPoints>
      <mesh visible={true} position={position}  onClick={clickPlatform}  >
        <sphereGeometry args={[10, 16, 16]}  />
        <meshStandardMaterial color='yellow' />
      </mesh>
    
    </>
  );
}



function BoxBetweenPoints({ start, end}) {
    const direction = useMemo(() => {
      const dx = end[0] - start[0];
      const dz = end[2] - start[2];
      return [dx, 0, dz];
    }, [start, end]);
  
  
    const length = useMemo(() => Math.sqrt(direction[0] ** 2 + direction[2] ** 2), [direction]);
  
    const position = useMemo(() => [(start[0] + end[0]) / 2, 132/2, (start[2] + end[2]) / 2], [start, end]);
    const rotation = useMemo(() => {
      const angle = Math.atan2(direction[2], direction[0]);
      return [0, -angle, 0];
    }, [direction]);
  
    return (
        <mesh
          position={position}
          rotation={rotation}
        >
          <boxGeometry args={[length, 132, 3]} />
          <meshStandardMaterial color= 'orange' />
        </mesh>
    );
  }