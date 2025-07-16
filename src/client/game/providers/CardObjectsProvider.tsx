import {
  createContext,
  useContext,
  useRef,
  type PropsWithChildren,
} from "react";
import { Object3D } from "three";

type CardObjects = {
  objects: Map<number, Object3D>;
  addObject: (node: Object3D, cardId: number) => void;
};

const initialState = {
  objects: new Map(),
  addObject: (node: Object3D, cardId: number) => 0,
};

export const CardObjectsContext = createContext<CardObjects>(initialState);

export default function CardObjectsProvider({ children }: PropsWithChildren) {
  const cardObjects = useRef<Map<number, Object3D>>(new Map());

  function addObject(node: Object3D, cardId: number) {
    cardObjects.current.set(cardId, node);
  }

  return (
    <CardObjectsContext value={{ objects: cardObjects.current, addObject }}>
      {children}
    </CardObjectsContext>
  );
}
