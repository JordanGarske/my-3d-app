import { useState, useMemo, useRef,createContext, useContext } from 'react';
import { Canvas  } from '@react-three/fiber';
import { Grid, OrbitControls, Text,   MeshTransmissionMaterial } from '@react-three/drei';
import { BoxWithPopup } from './attachmentPanel';
import { Suspense } from 'react';
import {PanelExtension} from './objects/panelExtension'


const JointContext = createContext();
const draggingContext = createContext();
export const objectContext = createContext();
export const App = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [lines, setLines] = useState([{start: [-100, 0, 0], end: [100, 0, 0], color: 'lightgray', }  ]);
  const [popupData, setPopupData] = useState(null); // State to store current clicked box data
  const [placePoint, setPlacePoint] = useState(null); // Store cylinders in the scene
  const [objectPoint, setObjectPoint] = useState(null) 

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
  // setLines([
  //   ...lines,
  //   {
  //     start: [Math.random() * 200 - 100, 0, Math.random() * 200 - 100],
  //     end: [Math.random() * 200 - 100, 0, Math.random() * 200 - 100],
  //     color: 'lightgray',
  //   },
  // ]);
  // Handle grid click to place a cylinder
  return (
    <div style={{ position: 'relative', height: '100vh' }}>
      <Suspense>
        <BoxWithPopup data={popupData} onUpdateDimensions={handleUpdateDimensions}  />
        <Canvas orthographic raycaster={{ params: { Line: { threshold: 5 } } }} camera={{ position: [0, 300, 500], zoom: 1 }}             >
          <ambientLight intensity={Math.PI / 2} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
          <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
            <JointContext.Provider value={{placePoint, setPlacePoint}}>
            <objectContext.Provider value={{objectPoint, setObjectPoint}}>
            <draggingContext.Provider value={{isDragging, setIsDragging}}>
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

                            {placePoint &&             <PanelExtension pos = {placePoint}></PanelExtension>}

                            <Platform lines={lines} setLines={setLines}></Platform>
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
            </draggingContext.Provider>
            </objectContext.Provider>
            </JointContext.Provider>
          <OrbitControls enabled={!isDragging} />
        </Canvas>
      </Suspense>
    </div>
  );
};
function Platform({ lines, setLines }){
  const { isDragging,setIsDragging } = useContext(draggingContext);
  const {  setPlacePoint } = useContext(JointContext);
  const { objectPoint, setObjectPoint } = useContext(objectContext);
  const clickPlatform = () => {
    console.log(isDragging,objectPoint)
      if (objectPoint !== null){
        console.log('here')
        setLines([
          ...lines,
          {
            start: objectPoint[0],
            end:objectPoint[1],
            color: 'lightgray',
          },
        ]);
        setObjectPoint(null)
        setPlacePoint(null)
        setIsDragging(false)
      }
  };
  return (
    <>
      <mesh visible={false} onClick={clickPlatform}>
        <boxGeometry args={[10000, 1, 100000]} />
        <meshStandardMaterial color='yellow' />
      </mesh>
    </>
  )
}
function PolyLine({ start, end, height,  onBoxClick }) {
  const [lineStart, setLineStart] = useState(start);
  const [lineEnd, setLineEnd] = useState(end);
  return (
    <>
      <EndPoint position={lineStart} onDrag={setLineStart}  otherPointPosition={lineEnd} />
      <EndPoint position={lineEnd} onDrag={setLineEnd}  otherPointPosition={lineStart} />
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


function EndPoint({ position, onDrag, otherPointPosition }) {
  const [active, setActive] = useState(false);
  const [hovered, setHover] = useState(false);
  const boxRef = useRef();
  const { setPlacePoint } = useContext(JointContext);
  const { setIsDragging } = useContext(draggingContext);
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


  return (
    <mesh
      position={position}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
      onPointerDown={down}
      onLostPointerCapture={up}
      onPointerUp={up}
      onPointerMove={move}
      onClick={() => {setPlacePoint(boxRef.current)} }
      ref = {boxRef}>
      

      <sphereGeometry args={[10, 16, 16]} />
      <meshBasicMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  );
}
