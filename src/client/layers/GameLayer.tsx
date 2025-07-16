import { Canvas } from "@react-three/fiber";
import {
  Environment,
  GizmoHelper,
  GizmoViewport,
  OrbitControls,
  useEnvironment,
} from "@react-three/drei";
import Hand from "@/components/Hand";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/features/store";
import { ACESFilmicToneMapping } from "three";
import { Battlefield } from "@/components/Battlefield";
import { SpellStack } from "@/components/SpellStack";
import TargetLinesHandler from "@/components/TargetArrowsHandler";
import Lookup from "@/components/Lookup";
import { Ground } from "@/components/Ground";
import Lighting from "@/components/Lighting";
import OldMap from "@/components/OldMap";

const GameLayer = () => {
  const game = useSelector((state: RootState) => state.game);
  return (
    <Canvas
      camera={{
        position: [0, 0, 7.5],
        rotation: [Math.PI / 20, 0, 0],
      }}
      gl={{ toneMapping: ACESFilmicToneMapping }}
    >
      {/* <GizmoHelper alignment="bottom-left" margin={[80, 80]}>
        <GizmoViewport />
      </GizmoHelper>
      <axesHelper args={[10]} /> */}
      {/* 
      <hemisphereLight
        color="white"
        intensity={1.5}
        position={[0, 0, 5.5]}
        rotation={[Math.PI / 20, 0, 0]}
      /> */}
      {/* <OrbitControls /> */}
      <Lighting />
      <TargetLinesHandler />
      <group rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -2]} scale={5}>
        <OldMap />
      </group>
      <group position={[0, 0, -2.1]} rotation={[Math.PI / 2, 0, 0]} scale={0.5}>
        <Ground />
      </group>

      <group
        position={[0, 6.5, 1]}
        rotation={[Math.PI, Math.PI, 0]}
        scale={0.7}
      >
        <Hand cards={game.opponentPlayer.hand} />
      </group>

      <group>
        <Battlefield data={game.player.battlefield} />
      </group>

      <group position={[0, 4, 0]}>
        <Battlefield data={game.opponentPlayer.battlefield} />
      </group>

      <group position={[0, -3.2, 0]}>
        <Hand cards={game.player.hand} />
      </group>

      {game.lookup.length && <Lookup cards={game.lookup} />}
      <SpellStack cards={game.spellStack.map((stackCard) => stackCard.data)} />
    </Canvas>
  );
};

export default GameLayer;
