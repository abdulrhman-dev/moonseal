import React, { useMemo, useLayoutEffect, useRef, useState } from "react";
import {
  DoubleSide,
  Mesh,
  QuadraticBezierCurve3,
  Quaternion,
  TubeGeometry,
  Vector3,
} from "three";
import { useFrame } from "@react-three/fiber";
import { getMouseWorldPosition } from "@/game/util/threeUtil";

type TargetArrowProps = {
  startPos: Vector3;
  endPos?: Vector3;
  mouseEndZ?: number;
  mouseEnd?: boolean;
};

const DirectTargetArrow = ({
  startPos,
  endPos,
  mouseEndZ = 0,
  mouseEnd = false,
}: TargetArrowProps) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, z: 0 });
  const [initlizedMousePos, setInitlizedMousePos] = useState(false);
  const arrowMeshRef = useRef<Mesh | null>(null);

  useFrame(({ pointer, camera }) => {
    if (mouseEnd) {
      if (!initlizedMousePos) setInitlizedMousePos(true);

      const pos = getMouseWorldPosition(pointer, camera, mouseEndZ);
      const newPos = pos.clone();
      arrowMeshRef.current?.parent?.worldToLocal(newPos);
      setMousePos({ x: newPos.x, y: newPos.y, z: mouseEndZ });
    }
  });

  const { tubeGeometry, arrowTipPosition, arrowTipDirection } = useMemo(() => {
    const usedEnd = endPos ?? mousePos;

    const controlPoint = new Vector3(
      (startPos.x + usedEnd.x) / 2,
      (startPos.y + usedEnd.y) / 2 + 1,
      (startPos.z + usedEnd.z) / 2 + 0.5
    );

    const curve = new QuadraticBezierCurve3(
      new Vector3(startPos.x, startPos.y, startPos.z),
      controlPoint,
      new Vector3(usedEnd.x, usedEnd.y, usedEnd.z)
    );

    const tubeGeometry = new TubeGeometry(curve, 40, 0.04, 8, false);
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
        <mesh ref={arrowMeshRef} geometry={tubeGeometry}>
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
      </group>
    );
  }

  return <></>;
};

export default DirectTargetArrow;
