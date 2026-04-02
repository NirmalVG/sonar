"use client"

import { useEffect, useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { useSonarStore } from "@/store/useSonarStore"

const MAX_PARTICLES = 180000
const OFFSCREEN = new THREE.Vector3(999, 999, 999)

const vertexShader = `
  uniform float uTime;
  uniform vec3 uHandPosition;
  uniform vec3 uHandVelocity;
  uniform float uInteractionStrength;
  uniform float uClusterTransition;
  uniform float uOpenTransition;
  uniform float uRadius;
  uniform float uHandActive;
  uniform vec3 uOpenOffset;

  attribute vec3 aFieldOffset;
  attribute float aSize;
  attribute float aNoise;

  varying float vAlpha;
  varying float vShade;

  void main() {
    vec3 ambientLocal = position;

    float largeDust = smoothstep(0.65, 1.0, aNoise);
    float driftScale = mix(0.35, 1.25, largeDust);

    vec3 drift = vec3(
      sin(uTime * 0.24 + ambientLocal.z * 0.18 + aFieldOffset.x * 6.28318),
      cos(uTime * 0.19 + ambientLocal.x * 0.16 + aFieldOffset.y * 6.28318),
      sin(uTime * 0.28 + ambientLocal.y * 0.14 + aFieldOffset.z * 6.28318)
    ) * driftScale;

    vec3 ambientWorld = (modelMatrix * vec4(ambientLocal + drift, 1.0)).xyz;
    ambientWorld += uOpenOffset;

    float distToHand = distance(ambientWorld, uHandPosition);
    float handZone = uHandActive * (1.0 - smoothstep(0.0, 10.0, distToHand));
    float openHandZone = uHandActive * (1.0 - smoothstep(1.0, 16.0, distToHand));
    vec3 safeDirection = normalize(vec3(
      ambientWorld.x - uHandPosition.x + 0.0001,
      ambientWorld.y - uHandPosition.y + 0.0001,
      ambientWorld.z - uHandPosition.z + 0.0001
    ));
    vec3 flowDirection = normalize(uHandVelocity + vec3(0.0001));
    float directionalFlow = max(dot(safeDirection, flowDirection), 0.0);

    ambientWorld += uHandVelocity * handZone * (1.0 + largeDust * 2.4);
    ambientWorld += flowDirection * uOpenTransition * openHandZone * uInteractionStrength * (0.6 + directionalFlow * (1.2 + largeDust * 1.4));
    ambientWorld += uHandVelocity * uOpenTransition * openHandZone * (0.7 + largeDust * 0.9);
    ambientWorld += safeDirection * uOpenTransition * handZone * uInteractionStrength * (0.35 + aNoise * 1.2);

    vec3 clusterLocal = aFieldOffset * (0.45 + uRadius * 0.12);
    clusterLocal += vec3(
      sin(uTime * 1.1 + aFieldOffset.y * 7.0),
      cos(uTime * 1.4 + aFieldOffset.z * 7.0),
      sin(uTime * 1.2 + aFieldOffset.x * 7.0)
    ) * 0.18;

    vec3 clusterCenter = vec3(0.0, 0.0, 0.0);
    vec3 clusterWorld = clusterCenter + clusterLocal;
    vec3 finalWorld = mix(ambientWorld, clusterWorld, uClusterTransition * uHandActive);

    vec4 mvPosition = viewMatrix * vec4(finalWorld, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    float clusterSize = mix(2.0, 3.6, largeDust);
    float ambientSize = mix(1.6, 3.0, largeDust);
    float currentSize = mix(ambientSize, clusterSize, uClusterTransition);

    gl_PointSize = currentSize * aSize * (1.0 / -mvPosition.z);
    vAlpha = mix(0.18, 0.4, largeDust) + uClusterTransition * 0.1;
    vShade = aNoise;
  }
`

const fragmentShader = `
  uniform vec3 uColorBottom;
  uniform vec3 uColorTop;

  varying float vAlpha;
  varying float vShade;

  void main() {
    float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
    float softParticle = 1.0 - smoothstep(0.08, 0.5, distanceToCenter);
    float brightCore = 1.0 - smoothstep(0.0, 0.16, distanceToCenter);
    float alpha = softParticle * vAlpha + brightCore * 0.08;

    if (alpha <= 0.0) discard;

    vec3 finalColor = mix(uColorBottom, uColorTop, vShade);
    gl_FragColor = vec4(finalColor, alpha);
  }
`

function pseudoRandom(index: number, seed: number) {
  const value = Math.sin(index * 12.9898 + seed * 78.233) * 43758.5453

  return value - Math.floor(value)
}

function directionFromSeeds(seedA: number, seedB: number) {
  const u = seedA * 2 - 1
  const theta = seedB * Math.PI * 2
  const scale = Math.sqrt(1 - u * u)

  return new THREE.Vector3(
    scale * Math.cos(theta),
    u,
    scale * Math.sin(theta),
  )
}

export function Globe() {
  const pointsRef = useRef<THREE.Points>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const geometryRef = useRef<THREE.BufferGeometry>(null)
  const smoothedHandRef = useRef(new THREE.Vector3(999, 999, 999))
  const previousHandRef = useRef(new THREE.Vector3(999, 999, 999))
  const handVelocityRef = useRef(new THREE.Vector3())
  const openOffsetRef = useRef(new THREE.Vector3())
  const sceneOffsetRef = useRef(new THREE.Vector3())

  const {
    particleCount,
    globeRadius,
    rotationSpeed,
    colorScheme,
    interactionStrength,
  } = useSonarStore()

  const cappedParticleCount = Math.min(particleCount, MAX_PARTICLES)

  const { positions, fieldOffsets, sizes, noise } = useMemo(() => {
    const positionsArray = new Float32Array(MAX_PARTICLES * 3)
    const fieldOffsetsArray = new Float32Array(MAX_PARTICLES * 3)
    const sizesArray = new Float32Array(MAX_PARTICLES)
    const noiseArray = new Float32Array(MAX_PARTICLES)

    for (let i = 0; i < MAX_PARTICLES; i++) {
      const ambientDirection = directionFromSeeds(
        pseudoRandom(i, 0.17),
        pseudoRandom(i, 0.29),
      )
      const ambientRadius = 4 + Math.pow(pseudoRandom(i, 0.43), 0.7) * 13

      positionsArray[i * 3] = ambientDirection.x * ambientRadius * 1.45
      positionsArray[i * 3 + 1] = ambientDirection.y * ambientRadius * 0.9
      positionsArray[i * 3 + 2] = ambientDirection.z * ambientRadius * 1.1

      const clusterDirection = directionFromSeeds(
        pseudoRandom(i, 0.61),
        pseudoRandom(i, 0.73),
      )
      const clusterRadius = Math.pow(pseudoRandom(i, 0.89), 1.8) * 3.2

      fieldOffsetsArray[i * 3] = clusterDirection.x * clusterRadius
      fieldOffsetsArray[i * 3 + 1] = clusterDirection.y * clusterRadius
      fieldOffsetsArray[i * 3 + 2] = clusterDirection.z * clusterRadius

      noiseArray[i] = pseudoRandom(i, 1.03)
      sizesArray[i] =
        noiseArray[i] > 0.94
          ? pseudoRandom(i, 1.37) * 20 + 16
          : pseudoRandom(i, 1.71) * 3.2 + 1.4
    }

    return {
      positions: positionsArray,
      fieldOffsets: fieldOffsetsArray,
      sizes: sizesArray,
      noise: noiseArray,
    }
  }, [])

  const colors = useMemo(() => {
    switch (colorScheme) {
      case "SOLAR":
        return {
          bottom: new THREE.Color("#ff7b2c"),
          top: new THREE.Color("#ffe27a"),
        }
      case "AURORA":
        return {
          bottom: new THREE.Color("#44f2c9"),
          top: new THREE.Color("#c5fff8"),
        }
      case "MONO":
        return {
          bottom: new THREE.Color("#6f7684"),
          top: new THREE.Color("#f5f7ff"),
        }
      case "COSMIC":
      default:
        return {
          bottom: new THREE.Color("#4bc8ff"),
          top: new THREE.Color("#f5fbff"),
        }
    }
  }, [colorScheme])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0.0 },
      uRadius: { value: globeRadius },
      uColorBottom: { value: colors.bottom },
      uColorTop: { value: colors.top },
      uHandPosition: { value: new THREE.Vector3(999, 999, 999) },
      uHandVelocity: { value: new THREE.Vector3() },
      uInteractionStrength: { value: interactionStrength },
      uClusterTransition: { value: 0.0 },
      uOpenTransition: { value: 0.0 },
      uHandActive: { value: 0.0 },
      uOpenOffset: { value: new THREE.Vector3() },
    }),
    [colors, globeRadius, interactionStrength],
  )

  useEffect(() => {
    if (!materialRef.current) return

    materialRef.current.uniforms.uRadius.value = globeRadius
    materialRef.current.uniforms.uColorBottom.value = colors.bottom
    materialRef.current.uniforms.uColorTop.value = colors.top
    materialRef.current.uniforms.uInteractionStrength.value = interactionStrength
  }, [globeRadius, colors, interactionStrength])

  useEffect(() => {
    if (!geometryRef.current) return

    geometryRef.current.setDrawRange(0, cappedParticleCount)
  }, [cappedParticleCount])

  useFrame((state, delta) => {
    if (!materialRef.current) return

    const storeState = useSonarStore.getState()
    const handDetected = storeState.handPosition.distanceToSquared(OFFSCREEN) > 1
    const targetHand = handDetected ? storeState.handPosition : OFFSCREEN

    smoothedHandRef.current.lerp(targetHand, handDetected ? 0.09 : 0.18)

    handVelocityRef.current
      .copy(smoothedHandRef.current)
      .sub(previousHandRef.current)
      .multiplyScalar(0.38)

    previousHandRef.current.copy(smoothedHandRef.current)

    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
    materialRef.current.uniforms.uHandPosition.value.copy(smoothedHandRef.current)
    materialRef.current.uniforms.uHandVelocity.value.copy(handVelocityRef.current)
    materialRef.current.uniforms.uHandActive.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.uHandActive.value,
      handDetected ? 1 : 0,
      handDetected ? 0.14 : 0.2,
    )

    const clusterTarget = storeState.handGesture === "FIST" ? 1 : 0
    const scatterTarget = storeState.handGesture === "OPEN" ? 1 : 0
    const openOffsetTarget =
      scatterTarget && handDetected
        ? smoothedHandRef.current.clone().multiplyScalar(0.45)
        : new THREE.Vector3()
    const sceneTarget =
      scatterTarget && handDetected
        ? new THREE.Vector3(
            smoothedHandRef.current.x * 0.55,
            smoothedHandRef.current.y * 0.45,
            0,
          )
        : new THREE.Vector3()

    materialRef.current.uniforms.uClusterTransition.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.uClusterTransition.value,
      clusterTarget,
      0.11,
    )
    materialRef.current.uniforms.uOpenTransition.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.uOpenTransition.value,
      scatterTarget,
      0.055,
    )
    openOffsetRef.current.lerp(openOffsetTarget, scatterTarget ? 0.07 : 0.12)
    materialRef.current.uniforms.uOpenOffset.value.copy(openOffsetRef.current)

    if (pointsRef.current) {
      sceneOffsetRef.current.lerp(sceneTarget, scatterTarget ? 0.06 : 0.1)
      pointsRef.current.position.copy(sceneOffsetRef.current)
      pointsRef.current.rotation.y += delta * rotationSpeed * 0.01
      pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.08) * 0.04
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute
          attach="attributes-aFieldOffset"
          args={[fieldOffsets, 3]}
        />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
        <bufferAttribute attach="attributes-aNoise" args={[noise, 1]} />
      </bufferGeometry>

      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
