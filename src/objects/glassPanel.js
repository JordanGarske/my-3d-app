import { MeshTransmissionMaterial } from '@react-three/drei'

export const glassFrame = () => {
  return (
    <>
      <mesh>
        <boxGeometry args={[1, 1, 0.004]} />
        <MeshTransmissionMaterial envMapIntensity={1} roughness={0} ior={1} color={'#f0f0f0'} />
      </mesh>
    </>
  )
}
