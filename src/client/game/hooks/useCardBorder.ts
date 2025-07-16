import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { BackSide, Color, ShaderMaterial } from "three";

export function useCardBorder(color: string) {
  const timeRef = useRef(0);

  const borderMaterial = useMemo(() => {
    const intensity = 2.5;
    return new ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new Color("white") },
        uGlowIntensity: { value: intensity },
      },
      vertexShader: `
            varying vec3 vNormal;
            void main() {
              vNormal = normalMatrix * normal;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
      fragmentShader: `
            uniform float uTime;
            uniform vec3 uColor;
            uniform float uGlowIntensity;
            varying vec3 vNormal;
    
            void main() {
              float intensity = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
              float flicker = sin(uTime * 5.0 + gl_FragCoord.y * 0.01) * 0.5 + 0.5;
              gl_FragColor = vec4(uColor * intensity * flicker * uGlowIntensity, flicker);
            }
          `,
      transparent: true,
      side: BackSide,
      depthWrite: false,
    });
  }, [color]);

  useFrame((_, delta) => {
    timeRef.current += delta;
    if (borderMaterial.uniforms.uTime) {
      borderMaterial.uniforms.uTime.value = timeRef.current;
    }
    borderMaterial.uniforms.uColor.value = new Color(color);
  });

  return { borderMaterial };
}
