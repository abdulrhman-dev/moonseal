import { Environment, useEnvironment } from "@react-three/drei";

const Lighting = () => {
  const envMap = useEnvironment({ files: "/hdri/indoor.hdr" });

  return (
    <group>
      <spotLight
        color="white"
        position={[0, 3, 10.5]}
        intensity={120}
        angle={Math.PI}
        penumbra={1}
      />
      <Environment preset="forest" background blur={2} map={envMap} />
    </group>
  );
};

export default Lighting;
