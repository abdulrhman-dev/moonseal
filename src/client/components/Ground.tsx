import { useGLTF } from "@react-three/drei";
import { Mesh } from "three";

export function Ground() {
  const { nodes, materials } = useGLTF("/models/Ground.glb");
  return (
    <group dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.Plane as Mesh).geometry}
        material={materials["Material.002"]}
        rotation={[-Math.PI, 0, 0]}
        scale={40}
      />
    </group>
  );
}

useGLTF.preload("/models/Ground.glb");
