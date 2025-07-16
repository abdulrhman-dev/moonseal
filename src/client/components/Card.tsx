import { use, useEffect, useRef, useState } from "react";
import { useGLTF, useTexture, Text, useFont, Html } from "@react-three/drei";
import { Texture, Mesh, Object3D, TextureLoader } from "three";
import CardTransformHandler from "./CardTransformHandler";
import { useCardBorder } from "@/game/hooks/useCardBorder";
import { CARD_HAND_RADUIS } from "@/game/constants";
import type { CardState } from "@backend/types/cards";
import useHandleCardLogic from "@/game/hooks/useHandleCardLogic";
import { DamageAssignment } from "./DamageAssigment";
import { ActivatedAbility } from "./ActivatedAbility";
import { HtmlProvider } from "./HtmlProvider";
import { CardObjectsContext } from "@/game/providers/CardObjectsProvider";
import { canCast } from "@/css/card.module.css";

export type CardLocations = "hand" | "battlefield" | "stack" | "lookup";

type CardProps = {
  card: CardState;
  location: CardLocations;
  transformation: {
    angle: number;
    xPos: number;
    zPos: number;
  };
};

function Card({ card, location, transformation }: CardProps) {
  const { angle, xPos, zPos } = transformation;
  const sparkleTexture = useTexture("/icons/sparkles.svg");
  const { nodes, materials } = useGLTF("/models/Card.glb");
  const cardObjects = use(CardObjectsContext);

  const [texture, setTexture] = useState<Texture | null>(null);

  useEffect(() => {
    const loader = new TextureLoader();
    loader.load(`/cards/${card.gameId}.jpeg`, (tex) => {
      tex.flipY = false;
      setTexture(tex);
    });
  }, []);

  const cardRef = useRef<Object3D | null>(null);

  const { flags, handleCardCast } = useHandleCardLogic(card, location);
  const { canTarget, isAttacking, showActivated, hasPriority } = flags;

  const [showingBorder, setShowingBorder] = useState(false);
  const borderColor = useRef("white");
  const { borderMaterial } = useCardBorder(borderColor.current);

  useEffect(() => {
    if (canTarget) {
      setShowingBorder(true);
      borderColor.current = "green";
    } else if (isAttacking) {
      setShowingBorder(true);
      borderColor.current = "red";
    } else if (card.canCast && location === "hand") {
      setShowingBorder(true);
      borderColor.current = "blue";
    } else setShowingBorder(false);
  }, [canTarget, isAttacking, card.canCast, location]);

  if (!texture) {
    return <></>;
  }
  return (
    <CardTransformHandler
      cardRef={cardRef}
      canDrag={location === "hand" && card.canCast && !canTarget}
      onDragEnd={handleCardCast}
      xPos={CARD_HAND_RADUIS * Math.sin(angle) + xPos}
      zPos={zPos}
      cardYPos={-(CARD_HAND_RADUIS * (1 - Math.cos(angle)))}
      zRotation={angle}
      defaultHoverable={location === "hand" && card.cardPlayer === 1}
    >
      <group
        ref={(object) => {
          cardRef.current = object;

          if (object) cardObjects.addObject(object, card.id);
        }}
        position={[
          0,
          -(CARD_HAND_RADUIS * (1 - Math.cos(angle))),
          zPos + card.enchanters.length * 0.01,
        ]}
        dispose={null}
        rotation={[0, 0, -angle + (card.tapped ? -Math.PI / 6 : 0)]}
        onClick={(e) => {
          e.stopPropagation();
          if (canTarget || location !== "hand") handleCardCast();
        }}
      >
        <HtmlProvider>
          <DamageAssignment card={card} />
        </HtmlProvider>

        <HtmlProvider>
          {showActivated &&
            hasPriority &&
            card.activatedAbilities.length > 0 && (
              <ActivatedAbility
                activatedAbilities={card.activatedAbilities}
                card={card}
              />
            )}
        </HtmlProvider>
        <group>
          {card.enchanters.map((enchanter, index) => (
            <Card
              key={enchanter.id}
              card={enchanter}
              location={location}
              transformation={{
                xPos: 0.25 * (index + 1),
                angle: 0,
                zPos: -0.01 * (index + 1),
              }}
            />
          ))}
        </group>

        <group scale={[1, 1.4, 0.01]}>
          <mesh
            castShadow
            receiveShadow
            geometry={(nodes.Cube001 as Mesh).geometry}
            material={materials["Base Card"]}
          />
          {showingBorder && (
            <mesh
              scale={1.02}
              castShadow
              receiveShadow
              geometry={(nodes.Cube001 as Mesh).geometry}
              material={borderMaterial}
            />
          )}

          <mesh
            castShadow
            receiveShadow
            geometry={(nodes.Cube001_1 as Mesh).geometry}
            material={materials["Card Face"]}
          >
            <meshStandardMaterial
              {...materials["Card Face"]}
              map={texture}
              color={
                location === "battlefield" &&
                (card.tapped || card.summoningSickness)
                  ? "grey"
                  : "white"
              }
            />
          </mesh>
        </group>
        {location === "battlefield" && (
          <>
            {card.tapped && (
              <group position={[0, 0, 0.011]}>
                <Text
                  font="/fonts/mana.ttf"
                  anchorX={"center"}
                  anchorY={"middle"}
                  fontSize={1.52}
                  position-x={0}
                  position-y={0}
                  color={"white"}
                >
                  {"\uE61a"}
                </Text>
              </group>
            )}

            {card.summoningSickness && (
              <mesh position={[0, 0, 0.011]}>
                <planeGeometry args={[1, 1]} />
                <meshBasicMaterial
                  map={sparkleTexture}
                  color="white"
                  transparent
                />
              </mesh>
            )}
          </>
        )}
        {card.type === "creature" && (
          <group position={[0.64, -1.075, 0.011]}>
            <Text
              font="/fonts/Zain-Regular.ttf"
              anchorX={"center"}
              anchorY={"top"}
              fontSize={0.14}
              position-x={0}
              position-y={0}
              color={
                card.power > card.defaultPower
                  ? "green"
                  : card.power < card.defaultPower
                  ? "red"
                  : "#1e1e1f"
              }
            >
              {card.power}
            </Text>
            <Text
              font="/fonts/Zain-Regular.ttf"
              anchorX={"center"}
              anchorY={"top"}
              fontSize={0.14}
              position-x={0.07}
              position-y={0}
              color={"#1e1e1f"}
            >
              /
            </Text>
            <Text
              font="/fonts/Zain-Regular.ttf"
              anchorX={"center"}
              anchorY={"top"}
              fontSize={0.14}
              position-x={0.147}
              position-y={0}
              color={
                card.toughness > card.defaultToughness
                  ? "green"
                  : card.toughness < card.defaultToughness
                  ? "red"
                  : "#1e1e1f"
              }
            >
              {card.toughness}
            </Text>
          </group>
        )}
      </group>
    </CardTransformHandler>
  );
}

useGLTF.preload("/models/Card.glb");
useFont.preload("/fonts/Zain-Regular.ttf");
useFont.preload("/fonts/Mana.ttf");
useTexture.preload("/icons/sparkles.svg");

export default Card;
