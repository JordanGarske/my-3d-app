import React, { useState, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Vector2 } from 'three';

function Circle({ position }) {
  return (
    <mesh position={position}>
      <circleGeometry args={[1, 32]} />
      <meshBasicMaterial color="blue" />
    </mesh>
  );
}

function Scene() {
  const [circles, setCircles] = useState([]);
  const { camera, raycaster } = useThree();
  
  const handleClick = (event) => {
    // Normalize mouse position to [-1, 1]
    const mouse = new Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Set the raycaster based on the mouse position
    raycaster.update();

    // Perform a raycast from the camera into the scene
    const intersects = raycaster.intersectObjects([camera]);

    if (intersects.length > 0) {
      const point = intersects[0].point;
      setCircles([...circles, point]);
    }
  };

  return (
    <Canvas onClick={handleClick}>
      {circles.map((position, index) => (
        <Circle key={index} position={position} />
      ))}
    </Canvas>
  );
}

export default App;
