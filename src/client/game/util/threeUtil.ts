import { type ThreeEvent } from "@react-three/fiber";
import { Vector2, Vector3, Raycaster, Plane, Camera } from "three";

export function getMouseWorldPosition(
  pointer: Vector2,
  camera: Camera,
  level = 0
) {
  const x = pointer.x;
  const y = pointer.y;

  const mouse = new Vector2(x, y);

  const plane = new Plane();
  plane.setFromNormalAndCoplanarPoint(
    new Vector3(0, 0, 1),
    new Vector3(0, 0, level)
  );

  const raycaster = new Raycaster();
  raycaster.setFromCamera(mouse, camera);

  const newPos = new Vector3();
  raycaster.ray.intersectPlane(plane, newPos);

  newPos.z = 0;

  return newPos;
}

export function getPointerNDC(event: ThreeEvent<PointerEvent>) {
  const x = (event.clientX / window.innerWidth) * 2 - 1;
  const y = -(event.clientY / window.innerHeight) * 2 + 1;
  return new Vector2(x, y);
}
