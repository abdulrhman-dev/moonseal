import { useGLTF } from "@react-three/drei";

function OldMap() {
  const { nodes, materials } = useGLTF("/models/OldMap.glb");
  return (
    <group dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Plane.geometry}
        material={materials["Material.002"]}
        scale={[3, 1, 2]}
      />
    </group>
  );
}

useGLTF.preload("/models/OldMap.glb");
export default OldMap;
