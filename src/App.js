import { useState, useMemo, useRef } from 'react';
import { Canvas, useThree,extend, useFrame  } from '@react-three/fiber';
import { Grid, OrbitControls, Text,   MeshTransmissionMaterial } from '@react-three/drei';
import { BoxWithPopup } from './attachmentPanel';
import { Suspense } from 'react';

export const App = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [lines, setLines] = useState([{start: [-100, 0, 0], end: [100, 0, 0], color: 'lightgray', },  ]);
  const [popupData, setPopupData] = useState(null); // State to store current clicked box data
  const [cylinders, setCylinders] = useState([]); // Store cylinders in the scene
  const [placePoint, setPlacePoint] = useState(false); // Store cylinders in the scene
  const addLine = () => {
    setLines([
      ...lines,
      {
        start: [Math.random() * 200 - 100, 0, Math.random() * 200 - 100],
        end: [Math.random() * 200 - 100, 0, Math.random() * 200 - 100],
        color: 'lightgray',
      },
    ]);
  };

  // Function to handle click on BoxBetweenPoints and pass data to popup
  const handleBoxClick = (start, end, startState, endState, curHeight, setHeightFunc  ) => {
    const direction = [
      end[0] - start[0],
      0,
      end[2] - start[2],
    ];
    const length = Math.sqrt(direction[0] ** 2 + direction[2] ** 2);
    setPopupData({ start, end, length, height: curHeight, sState: startState, eState: endState, setHeight: setHeightFunc }); // Store height as well, defaulting to 132
  };



  // Update Box dimensions (length and height) from popup
  const handleUpdateDimensions = (updatedData) =>  {

    let s  = updatedData.start
    let e =  updatedData.end
    updatedData.newLength += (updatedData.length - updatedData.newLength)/2

    let lengthRatio = ((parseFloat(updatedData.newLength ) )  / parseFloat(updatedData.length ));

    updatedData.sState([e[0] + lengthRatio * (s[0] - e[0]) , s[1], e[2] + lengthRatio * (s[2] - e[2]) ])
    updatedData.eState([s[0] + lengthRatio * (e[0] - s[0]), e[1], s[2] + lengthRatio * (e[2] - s[2])])
    updatedData.setHeight(updatedData.height)
  };
  
  // Handle grid click to place a cylinder
  const handleGridClick = (event) => {

    setLines([
      ...lines,
      {
        start: [Math.random() * 200 - 100, 0, Math.random() * 200 - 100],
        end: [Math.random() * 200 - 100, 0, Math.random() * 200 - 100],
        color: 'lightgray',
      },
    ]);
  };

  // Handle grid click to place a cylinder
  const handyUP = (event) => {

    console.log('here')
  };
  return (
    <div style={{ position: 'relative', height: '100vh' }}>
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 1 }}>
        <button onClick={addLine}>Add Line</button>
      </div>
      <Suspense>
        <BoxWithPopup data={popupData} onUpdateDimensions={handleUpdateDimensions}  />
        <Canvas orthographic raycaster={{ params: { Line: { threshold: 5 } } }} camera={{ position: [0, 300, 500], zoom: 1 }}             >
          <ambientLight intensity={Math.PI / 2} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
          <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />

          {lines.map((line, index) => (
            <PolyLine
              key={index}
              start={line.start}
              end={line.end}
              height={132}
              color={line.color}
              setIsDragging={setIsDragging}
              onBoxClick={handleBoxClick} // Trigger data update for clicked box
            />
          ))}
          <mesh visible={false} onClick={handyUP}>
            <boxGeometry args={[10000, 1, 100000]} />
            <meshStandardMaterial color='yellow' />

          </mesh>
          <WallPost></WallPost>
          <Grid
            rotation={[0, 0, 0]}
            cellSize={100}
            cellThickness={2}
            cellColor="red"
            sectionSize={20}
            sectionThickness={1.5}
            sectionColor="lightgray"
            fadeDistance={10000}
            infiniteGrid

          />
          <OrbitControls enabled={!isDragging} />
        </Canvas>
      </Suspense>
    </div>
  );
};
function WallPost(){
  const [position, setPosition] = useState([10, 16, 16]);
  console.log(position)
  //setPosition([state.raycaster.ray.origin.x, state.raycaster.ray.origin.y, state.raycaster.ray.origin.z])
  useFrame((state) => setPosition([state.raycaster.ray.origin.x, 0, state.raycaster.ray.origin.z]));
  return (
    <>
      <mesh visible={true} position={position} >
        <sphereGeometry args={[10, 16, 16]}  />
        <meshStandardMaterial color='yellow' />
      </mesh>
    </>
  );
}

function PolyLine({ start, end, height, setIsDragging, onBoxClick }) {
  const [lineStart, setLineStart] = useState(start);
  const [lineEnd, setLineEnd] = useState(end);
  return (
    <>
      <EndPoint position={lineStart} onDrag={setLineStart} setIsDragging={setIsDragging} otherPointPosition={lineEnd} />
      <EndPoint position={lineEnd} onDrag={setLineEnd} setIsDragging={setIsDragging} otherPointPosition={lineStart} />
      <BoxBetweenPoints start={lineStart} end={lineEnd} onDragStart={setLineStart} enterHeight={height} onDragEnd={setLineEnd} BoxClick={onBoxClick}  />
    </>
  );
}

function BoxBetweenPoints({ start, end,  onDragStart,onDragEnd, enterHeight, BoxClick  }) {
  const [active, setActive] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [height, setHeight] = useState(enterHeight);
  const direction = useMemo(() => {
    const dx = end[0] - start[0];
    const dz = end[2] - start[2];
    return [dx, 0, dz];
  }, [start, end]);

  const onClick= () => BoxClick(end, start,onDragStart , onDragEnd, height, setHeight)

  const length = useMemo(() => Math.sqrt(direction[0] ** 2 + direction[2] ** 2), [direction]);

  const position = useMemo(() => [(start[0] + end[0]) / 2, height/2, (start[2] + end[2]) / 2], [start, end]);
  const rotation = useMemo(() => {
    const angle = Math.atan2(direction[2], direction[0]);
    return [0, -angle, 0];
  }, [direction]);

  return (
    <group>
      <mesh
        position={position}
        rotation={rotation}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={onClick} // Handle click to trigger popup data update
      >
        <boxGeometry args={[length, height, 3]} />
        <meshStandardMaterial color={hovered ? 'yellow' : 'orange'} />
        <Text color="red" position={[0, 100, 0]} rotation={[-Math.PI / 2,0, 0]}  fontSize={20}>
          {Number(length.toFixed(2))}
        </Text>
      </mesh>
      <mesh visible={false} position={[position[0], height + 1, position[2]]} rotation={rotation} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
        <boxGeometry args={[length, 32, 3]} />
        <MeshTransmissionMaterial envMapIntensity={1} roughness={0} ior={1} />
      </mesh>
    </group>
  );
}


function EndPoint({ position, onDrag, setIsDragging, otherPointPosition }) {
  const [active, setActive] = useState(false);
  const [hovered, setHover] = useState(false);


  const down = (event) => {
    event.stopPropagation();
    event.target.setPointerCapture(event.pointerId);
    setActive(true);
    setIsDragging(true);
  };

  const up = (event) => {
    setActive(false);
    setIsDragging(false);
  };

  const move = (event) => {
    if (active && onDrag) {
      let newPosition = event.unprojectedPoint.toArray();
      newPosition[1] = 0;

      onDrag(newPosition);
    }
  };

  const click = (event) =>{
    console.log(event)
  }
  return (
    <mesh
      position={position}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
      onPointerDown={down}
      onLostPointerCapture={up}
      onPointerUp={up}
      onPointerMove={move}
      onClick={click}>

      <sphereGeometry args={[10, 16, 16]} />
      <meshBasicMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  );
}
