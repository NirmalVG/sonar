"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision"
import { useSonarStore, type Gesture } from "@/store/useSonarStore"

type HandPoint = { x: number; y: number }
const OFFSCREEN_HAND = new THREE.Vector3(999, 999, 999)
const REQUIRED_LANDMARKS = [0, 5, 8, 9, 12, 13, 16, 17, 20] as const

// Helper math function to calculate the 2D distance between two hand joints
const getDistance = (p1: HandPoint, p2: HandPoint) =>
  Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)

const isFinitePoint = (point: HandPoint | undefined) =>
  Boolean(
    point &&
      Number.isFinite(point.x) &&
      Number.isFinite(point.y),
  )

const clampNormalized = (value: number) =>
  THREE.MathUtils.clamp(value, -0.15, 1.15)

export function HandTracker() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const requestRef = useRef<number | null>(null)
  const gestureCandidateRef = useRef<Gesture>("NONE")
  const gestureFramesRef = useRef(0)

  // Bring in all our necessary setters from Zustand
  const {
    setHandPosition,
    setTelemetry,
    handTrackingActive,
    setHandGesture,
    setHandTrackingLoading,
  } = useSonarStore()

  useEffect(() => {
    if (!handTrackingActive || !videoRef.current) return
    const videoElement = videoRef.current

    let isTracking = true
    let handLandmarker: HandLandmarker | null = null

    setHandTrackingLoading(true)

    const commitGesture = (nextGesture: Gesture) => {
      if (gestureCandidateRef.current === nextGesture) {
        gestureFramesRef.current += 1
      } else {
        gestureCandidateRef.current = nextGesture
        gestureFramesRef.current = 1
      }

      const framesRequired = nextGesture === "NONE" ? 2 : 4
      if (gestureFramesRef.current >= framesRequired) {
        setHandGesture(nextGesture)
      }
    }

    const initializeTracking = async () => {
      try {
        // 1. Load the modern WebAssembly backend
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
        )

        // 2. Initialize the Hand Landmarker Model (Forced to GPU!)
        handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numHands: 1,
        })

        // 3. Start the Webcam natively
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: "user" },
        })

        if (isTracking) {
          videoElement.srcObject = stream
          await videoElement.play()
          setHandTrackingLoading(false)

          // 4. The High-Performance Prediction Loop
          const predictFrame = () => {
            if (!isTracking || !handLandmarker) return

            // Only analyze if the video is actively playing a frame
            if (videoElement.currentTime > 0) {
              const results = handLandmarker.detectForVideo(
                videoElement,
                performance.now(),
              )

              if (results.landmarks && results.landmarks.length > 0) {
                const hand = results.landmarks[0]
                const hasValidHand = REQUIRED_LANDMARKS.every((index) =>
                  isFinitePoint(hand[index]),
                )

                if (!hasValidHand) {
                  setHandPosition(OFFSCREEN_HAND.clone())
                  commitGesture("NONE")
                  requestRef.current = requestAnimationFrame(predictFrame)
                  return
                }

                const palm = hand[9] // Center of palm (base of middle finger)
                const normalizedX = clampNormalized(palm.x)
                const normalizedY = clampNormalized(palm.y)

                // Map the normalized hand position into the visible dust field.
                const x = THREE.MathUtils.clamp(-(normalizedX - 0.5) * 18, -9, 9)
                const y = THREE.MathUtils.clamp(-(normalizedY - 0.5) * 12, -6, 6)
                const z = 1.5

                // Send position to GPU via Zustand
                setHandPosition(new THREE.Vector3(x, y, z))
                setTelemetry(x.toFixed(3), y.toFixed(3))

                // --- THE GESTURE MATH ---
                const wrist = hand[0]
                let curledFingers = 0

                // Check Index(8/5), Middle(12/9), Ring(16/13), and Pinky(20/17)
                // If the tip is closer to the wrist than the knuckle, the finger is curled.
                if (getDistance(hand[8], wrist) < getDistance(hand[5], wrist))
                  curledFingers++
                if (getDistance(hand[12], wrist) < getDistance(hand[9], wrist))
                  curledFingers++
                if (getDistance(hand[16], wrist) < getDistance(hand[13], wrist))
                  curledFingers++
                if (getDistance(hand[20], wrist) < getDistance(hand[17], wrist))
                  curledFingers++

                // Be forgiving here: we want an intentional close/open feel,
                // not a perfect pose that is hard to hold in front of the camera.
                if (curledFingers >= 2) {
                  commitGesture("FIST")
                } else if (curledFingers <= 1) {
                  commitGesture("OPEN")
                } else {
                  commitGesture("NONE") // E.g., just pointing or a relaxed hand
                }
              } else {
                // Hand is off-screen
                setHandPosition(OFFSCREEN_HAND.clone())
                commitGesture("NONE")
              }
            }

            // Loop infinitely at your monitor's refresh rate
            requestRef.current = requestAnimationFrame(predictFrame)
          }

          // Kick off the loop
          predictFrame()
        }
      } catch (error) {
        console.error("Error initializing Sonar Hand Tracking:", error)
        setHandTrackingLoading(false)
        useSonarStore.setState({ handTrackingActive: false })
      }
    }

    initializeTracking()

    // 5. Perfect Cleanup on Unmount / Toggle Off
    return () => {
      isTracking = false
      if (requestRef.current) cancelAnimationFrame(requestRef.current)

      // Stop webcam light immediately
      if (videoElement.srcObject) {
        const tracks = (videoElement.srcObject as MediaStream).getTracks()
        tracks.forEach((track) => track.stop())
        videoElement.srcObject = null
      }

      if (handLandmarker) {
        handLandmarker.close()
      }

      // Reset state safely
      gestureCandidateRef.current = "NONE"
      gestureFramesRef.current = 0
      setHandPosition(OFFSCREEN_HAND.clone())
      setHandGesture("NONE")
      setHandTrackingLoading(false)
    }
  }, [
    handTrackingActive,
    setHandPosition,
    setTelemetry,
    setHandGesture,
    setHandTrackingLoading,
  ])

  return <video ref={videoRef} className="hidden" playsInline muted />
}
