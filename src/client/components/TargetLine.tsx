import type { RootState } from "@/store/store";
import { useEffect, useState, type RefObject } from "react";
import { useSelector } from "react-redux";

type TargetLineProps = {
  sourceId: number;
  destId: number;
  cardsElements: RefObject<Map<number, HTMLElement>>;
};

const LINE_THICKNESS = 8;
const TRIANGLE_THICKNESS = 20;

export const TargetLine = ({
  sourceId,
  destId,
  cardsElements,
}: TargetLineProps) => {
  const [lineProps, setLineProps] = useState({
    cx: 0,
    cy: 0,
    thickness: 0,
    length: 0,
    color: "none",
    angle: 0,
  });

  const { cx, cy, thickness, length, color, angle } = lineProps;

  const players = useSelector((state: RootState) => state.players);

  useEffect(() => {
    const off1 = cardsElements.current.get(sourceId)?.getBoundingClientRect();
    const off2 = cardsElements.current.get(destId)?.getBoundingClientRect();

    if (!off1 || !off2) return;

    const x1 = off1.left + off1.width / 2;
    const y1 = off1.top + off1.height / 2;

    const x2 = off2.left + off2.width / 2;
    const y2 = off2.top + off2.height / 2;

    const length = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));

    const cx = (x1 + x2) / 2 - length / 2;
    const cy = (y1 + y2) / 2 - LINE_THICKNESS / 2;

    const angle = Math.atan2(y1 - y2, x1 - x2) * (180 / Math.PI);

    setLineProps({ cx, cy, thickness: LINE_THICKNESS, length, color, angle });
  }, [sourceId, destId, players]);

  return (
    <>
      <div
        style={{
          padding: 0,
          margin: 0,

          position: "absolute",
          top: `${cy}px`,
          left: `${cx}px`,

          width: `${length}px`,
          height: `${thickness}px`,

          backgroundColor: "#FF4F0F",

          transform: `rotate(${angle}deg)`,
          transformOrigin: "center",

          zIndex: 100,
        }}
      />
      <div
        style={{
          padding: 0,
          margin: 0,

          position: "absolute",
          top: `${cy - TRIANGLE_THICKNESS + thickness / 2}px`,
          left: `${cx + length / 2 - TRIANGLE_THICKNESS / 2}px`,

          width: 0,
          height: 0,

          borderTop: `${TRIANGLE_THICKNESS}px solid transparent`,
          borderBottom: `${TRIANGLE_THICKNESS}px solid transparent`,
          borderRight: `${TRIANGLE_THICKNESS}px solid #FF4F0F`,

          transform: `rotate(${angle}deg) translate(-${length / 2}px)`,
          transformOrigin: "center",

          zIndex: 100,
        }}
      />
    </>
  );
};
