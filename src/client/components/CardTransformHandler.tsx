import { type ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import React, { type RefObject, useEffect, useRef, useState } from "react";
import { Object3D, Vector3 } from "three";
import { getMouseWorldPosition, getPointerNDC } from "@/game/util/threeUtil";

type CardTransformHandlerProps = {
  cardRef: RefObject<Object3D | null>;
  defaultHoverable?: boolean;
  canDrag: boolean;
  xPos: number;
  zPos: number;
  zRotation: number;
  cardYPos: number;
  onDragEnd?: () => void;
};

type DraggingDataType = {
  dragging: boolean;
  shiftVector?: Vector3;
  originalPosition?: Vector3;
};

const CardTransformHandler = ({
  children,
  cardRef,
  defaultHoverable,
  canDrag,
  xPos,
  zPos,
  cardYPos,
  zRotation,
  onDragEnd,
}: React.PropsWithChildren<CardTransformHandlerProps>) => {
  const [draggingData, setDraggingData] = useState<DraggingDataType>({
    dragging: false,
  });
  const [hovering, setHovering] = useState(false);

  const checkDragging = useRef(false);
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Drag Handling */

  const { camera } = useThree();
  useFrame(({ pointer }, delta) => {
    if (!cardRef.current) return;

    if (draggingData.dragging && draggingData.shiftVector) {
      if (!checkDragging.current) return;

      cardRef.current.rotation.x = 0;
      cardRef.current.rotation.y = 0;
      cardRef.current.rotation.z = 0;

      const newPos = getMouseWorldPosition(pointer, camera, 1);
      cardRef.current.parent?.worldToLocal(newPos);
      newPos.sub(draggingData.shiftVector);

      const cardPos = cardRef.current.position;
      const oldCardPos = new Vector3().copy(cardPos);

      cardPos.x += (newPos.x - cardPos.x) * 12.5 * delta;
      cardPos.y += (newPos.y - cardPos.y) * 12.5 * delta;

      const cardRot = cardRef.current.rotation;

      let rotX = (cardPos.y - oldCardPos.y - cardRot.x) * -45 * delta;
      let rotY = (cardPos.x - oldCardPos.x - cardRot.x) * 45 * delta;

      rotX = Math.min(rotX, Math.PI / 2);
      rotX = Math.max(rotX, -Math.PI / 2);
      rotY = Math.min(rotY, Math.PI / 2);
      rotY = Math.max(rotY, -Math.PI / 2);

      cardRot.x += rotX;
      cardRot.y += rotY;
    }
  });

  function resestToOldPos(oldPos: Vector3) {
    if (!cardRef.current) return;

    cardRef.current.position.x = oldPos.x;
    cardRef.current.position.y = oldPos.y;
    cardRef.current.position.z = oldPos.z;

    cardRef.current.scale.x = 1;
    cardRef.current.scale.y = 1;

    cardRef.current.rotation.z = -zRotation;
    cardRef.current.rotation.x = 0;
    cardRef.current.rotation.y = 0;
  }

  function handleDragEnd() {
    checkDragging.current = false;

    if (draggingData.originalPosition && cardRef.current) {
      const oldPos = draggingData.originalPosition;

      const worldPos = new Vector3();
      cardRef.current.getWorldPosition(worldPos);

      if (Math.abs(worldPos.y - oldPos.y) > 2 && onDragEnd) {
        onDragEnd();
        hoverable.current = false;
      } else {
        setHovering(false);
      }

      cardRef.current.parent?.worldToLocal(oldPos);
      resestToOldPos(oldPos);
    }

    setDraggingData({
      dragging: false,
      shiftVector: undefined,
      originalPosition: undefined,
    });
  }

  useEffect(() => {
    if (draggingData.dragging) {
      window.addEventListener("pointerup", handleDragEnd);
    }
    return () => window.removeEventListener("pointerup", handleDragEnd);
  }, [draggingData.dragging]);

  const hoverable = useRef(
    defaultHoverable === undefined ? true : defaultHoverable
  );

  /* Hovering Handling */

  useEffect(() => {
    if (!cardRef.current) return;

    if (hovering) {
      cardRef.current.rotation.z = 0;

      cardRef.current.position.y = 1.4;
      cardRef.current.position.z = 1;

      cardRef.current.scale.x = 1.4;
      cardRef.current.scale.y = 1.4;
    } else {
      cardRef.current.rotation.x = 0;
      cardRef.current.rotation.y = 0;
      cardRef.current.rotation.z = -zRotation;

      cardRef.current.position.y = cardYPos;
      cardRef.current.position.z = zPos;

      cardRef.current.scale.x = 1;
      cardRef.current.scale.y = 1;
    }
  }, [hovering]);

  useFrame(({ pointer }) => {
    if (!cardRef.current) return;

    if (hovering) {
      if (checkDragging.current || cardRef.current.position.z !== 1) return;
      const newPos = getMouseWorldPosition(pointer, camera);

      const startPos = new Vector3();
      cardRef.current.getWorldPosition(startPos);
      const magPos = newPos.sub(startPos);
      const yRotationScale = magPos.x / cardRef.current.scale.x;
      const xRotationScale = magPos.y / (cardRef.current.scale.y * 1.4);

      cardRef.current.rotation.x = (-xRotationScale * Math.PI) / 20;
      cardRef.current.rotation.y = (-yRotationScale * Math.PI) / 20;
    }
  });

  /* Pointer Events */

  function handlePointerDown(e: ThreeEvent<PointerEvent>) {
    if (!cardRef.current || !canDrag) return;

    const newPos = getMouseWorldPosition(getPointerNDC(e), camera);
    cardRef.current.parent?.worldToLocal(newPos);

    const startPos = new Vector3();
    cardRef.current.getWorldPosition(startPos);

    setDraggingData({
      dragging: true,
      originalPosition: startPos,
      shiftVector: newPos.sub(cardRef.current.position),
    });

    checkDragging.current = true;
    e.stopPropagation();
  }

  function handlePointerleave(e: ThreeEvent<PointerEvent>) {
    e.stopPropagation();
    if (checkDragging.current) return;

    if (hoverTimeout.current !== null) {
      clearTimeout(hoverTimeout.current);
    }

    hoverTimeout.current = setTimeout(() => {
      setHovering(false);
    }, 20);
  }

  function handlePointerEnter(e: ThreeEvent<PointerEvent>) {
    if (!hoverable.current) return;

    e.stopPropagation();
    if (hoverTimeout.current !== null) {
      clearTimeout(hoverTimeout.current);
    }
    hoverTimeout.current = setTimeout(() => {
      setHovering(true);
    }, 20);
  }

  return (
    <group
      onPointerEnter={handlePointerEnter}
      onPointerDown={handlePointerDown}
      onPointerLeave={handlePointerleave}
      position={[xPos, 0, zPos]}
    >
      {children}
    </group>
  );
};

export default CardTransformHandler;
