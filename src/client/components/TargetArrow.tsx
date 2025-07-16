import { getMouseWorldPosition } from "@/game/util/threeUtil";
import React, {
  useMemo,
  forwardRef,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  CubicBezierCurve3,
  DoubleSide,
  Mesh,
  Quaternion,
  TubeGeometry,
  Vector3,
} from "three";
import { useFrame } from "@react-three/fiber";

type TargetArrowPops = {
  startPos: Vector3;
  endPos?: Vector3;
  mouseEndZ?: number;
  mouseEnd?: boolean;
};

const TargetArrow = ({
  startPos,
  endPos,
  mouseEndZ = 0,
  mouseEnd = false,
}: TargetArrowPops) => {
  const [mousePos, setMousePos] = useState({
    x: 0,
    y: 0,
    z: 0,
  });

  const directTargetArrowRef = useRef<Mesh | null>(null);
  const [initlizedMousePos, setInitlizedMousePos] = useState(false);

  useFrame(({ pointer, camera }) => {
    if (mouseEnd) {
      if (!initlizedMousePos) setInitlizedMousePos(true);

      const pos = getMouseWorldPosition(pointer, camera, mouseEndZ);
      const newPos = pos.clone();
      directTargetArrowRef.current?.parent?.worldToLocal(newPos);
      setMousePos({ x: newPos.x, y: newPos.y, z: mouseEndZ });
    }
  });

  const { tubeGeometry, arrowTipPosition, arrowTipDirection } = useMemo(() => {
    const usedEndPos = endPos ?? mousePos;

    const curve = new CubicBezierCurve3(
      new Vector3(startPos.x, startPos.y, startPos.z),
      new Vector3(
        startPos.x + (usedEndPos.x - startPos.x) * 0.3,
        startPos.y + 2,
        startPos.z + (usedEndPos.z - startPos.z) * 0.3
      ),
      new Vector3(
        usedEndPos.x - (usedEndPos.x - startPos.x) * 0.3,
        usedEndPos.y + 2,
        usedEndPos.z - (usedEndPos.z - startPos.z) * 0.3
      ),
      new Vector3(usedEndPos.x, usedEndPos.y, usedEndPos.z)
    );

    const tubeGeometry = new TubeGeometry(curve, 60, 0.04, 8, false);

    const arrowTipPosition = curve.getPoint(1);
    const prevPoint = curve.getPoint(0.99);
    const direction = new Vector3()
      .subVectors(arrowTipPosition, prevPoint)
      .normalize();

    return { tubeGeometry, arrowTipPosition, arrowTipDirection: direction };
  }, [startPos, endPos, mousePos]);

  const arrowHeadRef = useRef<Mesh | null>(null);

  useLayoutEffect(() => {
    if (arrowHeadRef.current) {
      arrowHeadRef.current.position.copy(arrowTipPosition);

      const quaternion = new Quaternion();
      quaternion.setFromUnitVectors(new Vector3(0, 1, 0), arrowTipDirection);
      arrowHeadRef.current.quaternion.copy(quaternion);
    }
  }, [arrowTipPosition, arrowTipDirection]);
  if (!mouseEnd || initlizedMousePos) {
    return (
      <group>
        <mesh ref={directTargetArrowRef} geometry={tubeGeometry}>
          <meshStandardMaterial
            emissive="#2320f5"
            emissiveIntensity={3}
            color="#2320f5"
            side={DoubleSide}
          />
        </mesh>
        <mesh ref={arrowHeadRef}>
          <coneGeometry args={[0.07, 0.2, 12]} />
          <meshStandardMaterial
            emissive="#2320f5"
            emissiveIntensity={3}
            color="#2320f5"
          />
        </mesh>
        <mesh position={startPos}>
          <sphereGeometry args={[0.04]} />
          <meshStandardMaterial
            emissive="#2320f5"
            emissiveIntensity={3}
            color="#2320f5"
          />
        </mesh>
      </group>
    );
  }

  return <></>;
};
export default TargetArrow;
