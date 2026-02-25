import React, { useRef, useState, Suspense, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, ContactShadows, Html } from '@react-three/drei'
import { FaPlay, FaPause, FaUndo, FaExpand } from 'react-icons/fa'

// 3D Model Component
function Model({ url, scale = 1, position = [0, 0, 0] }) {
  const { scene } = useGLTF(url)
  const meshRef = useRef()

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005
    }
  })

  return (
    <primitive
      ref={meshRef}
      object={scene}
      scale={scale}
      position={position}
    />
  )
}

// Avatar/Model for body try-on
function Avatar({ productImage, clothingType = 'shirt' }) {
  const groupRef = useRef()

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005
    }
  })

  // Get product image URL
  const imgUrl = productImage || ''
  const hasImage = imgUrl.length > 0

  return (
    <group ref={groupRef}>
      {/* Simple human-like figure */}
      <mesh position={[0, -1, 0]}>
        <capsuleGeometry args={[0.3, 1.6]} />
        <meshStandardMaterial color="#f5f5dc" />
      </mesh>

      {/* Base clothing plane */}
      <mesh position={[0, -0.3, 0.31]}>
        <planeGeometry args={[0.8, 1.4]} />
        <meshStandardMaterial color="white" transparent opacity={0.9} />
      </mesh>
      
      {/* Product Image Overlay using Html */}
      {hasImage && (
        <Html position={[0, -0.3, 0.32]} transform scale={0.4}>
          <div style={{ 
            backgroundColor: 'white', 
            padding: '10px', 
            borderRadius: '10px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <img 
              src={imgUrl} 
              alt="Product" 
              style={{ 
                width: '250px', 
                height: 'auto', 
                objectFit: 'contain',
                display: 'block'
              }} 
            />
          </div>
        </Html>
      )}
    </group>
  )
}

// Camera AR Mode with AI Body Detection + 3D Texture Mapping
function CameraAR({ productImage }) {
  const videoRef = useRef(null)
  const containerRef = useRef(null)
  const rendererRef = useRef(null)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const meshRef = useRef(null)
  const animationRef = useRef(null)
  const [stream, setStream] = useState(null)
  const [error, setError] = useState(null)
  const [bodyLandmarks, setBodyLandmarks] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const poseInstanceRef = useRef(null)
  const textureRef = useRef(null)

  // Initialize Three.js
  useEffect(() => {
    let scene, camera, renderer, mesh, texture

    const initThree = async () => {
      try {
        const THREE = await import('three')
        
        // Create scene
        scene = new THREE.Scene()
        sceneRef.current = scene
        
        // Create camera (orthographic for 2D overlay)
        const width = containerRef.current?.clientWidth || 1280
        const height = containerRef.current?.clientHeight || 720
        camera = new THREE.OrthographicCamera(0, width, 0, height, 0.1, 1000)
        camera.position.z = 100
        cameraRef.current = camera
        
        // Create renderer
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
        renderer.setSize(width, height)
        renderer.setPixelRatio(window.devicePixelRatio)
        
        if (containerRef.current) {
          containerRef.current.appendChild(renderer.domElement)
        }
        rendererRef.current = renderer
        
        // Create cloth mesh (plane geometry for shirt/clothing)
        const geometry = new THREE.PlaneGeometry(200, 280, 32, 32)
        
        // Load product texture
        if (productImage) {
          const loader = new THREE.TextureLoader()
          texture = loader.load(productImage)
          texture.wrapS = THREE.RepeatWrapping
          texture.wrapT = THREE.RepeatWrapping
          textureRef.current = texture
        }
        
        const material = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          opacity: 0.9,
          side: THREE.DoubleSide
        })
        
        mesh = new THREE.Mesh(geometry, material)
        mesh.visible = false
        scene.add(mesh)
        meshRef.current = mesh
        
        // Animation loop
        const animate = () => {
          animationRef.current = requestAnimationFrame(animate)
          renderer.render(scene, camera)
        }
        animate()
        
      } catch (err) {
        console.error('Three.js init error:', err)
      }
    }
    
    initThree()
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (rendererRef.current) {
        rendererRef.current.dispose()
      }
    }
  }, [])

  // Update texture when product image changes
  useEffect(() => {
    const updateTexture = async () => {
      if (!meshRef.current || !productImage) return
      
      try {
        const THREE = await import('three')
        const loader = new THREE.TextureLoader()
        loader.load(productImage, (texture) => {
          texture.wrapS = THREE.RepeatWrapping
          texture.wrapT = THREE.RepeatWrapping
          meshRef.current.material.map = texture
          meshRef.current.material.needsUpdate = true
        })
      } catch (err) {
        console.error('Texture load error:', err)
      }
    }
    
    updateTexture()
  }, [productImage])

  // Update mesh position based on body landmarks
  useEffect(() => {
    if (!bodyLandmarks || !meshRef.current || !containerRef.current) return
    
    const updateMeshPosition = () => {
      const containerWidth = containerRef.current.clientWidth
      const containerHeight = containerRef.current.clientHeight
      
      // Get key body landmarks
      const leftShoulder = bodyLandmarks[11]
      const rightShoulder = bodyLandmarks[12]
      const leftHip = bodyLandmarks[23]
      const rightHip = bodyLandmarks[24]
      
      if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) {
        meshRef.current.visible = false
        return
      }
      
      // Calculate position (convert from 0-1 to screen coordinates)
      // Note: MediaPipe coordinates are Y-flipped relative to Three.js
      const midX = ((1 - (leftShoulder.x + rightShoulder.x) / 2)) * containerWidth
      const midY = ((leftShoulder.y + rightShoulder.y) / 2) * containerHeight
      
      // Calculate dimensions based on shoulder width
      const shoulderWidth = Math.abs(rightShoulder.x - leftShoulder.x) * containerWidth
      const torsoHeight = Math.abs(leftHip.y - leftShoulder.y) * containerHeight * 2
      
      const meshWidth = Math.max(shoulderWidth * 1.2, 150)
      const meshHeight = meshWidth * 1.4
      
      // Calculate rotation
      const dx = rightShoulder.x - leftShoulder.x
      const dy = rightShoulder.y - leftShoulder.y
      const rotation = Math.atan2(dy, dx)
      
      // Update mesh
      meshRef.current.position.set(midX, containerHeight - midY, 0)
      meshRef.current.rotation.z = -rotation
      meshRef.current.scale.set(meshWidth / 200, meshHeight / 280, 1)
      meshRef.current.visible = true
    }
    
    updateMeshPosition()
    
    const interval = setInterval(updateMeshPosition, 16) // ~60fps
    return () => clearInterval(interval)
  }, [bodyLandmarks])

  useEffect(() => {
    let pose = null

    const startCamera = async () => {
      try {
        // Import MediaPipe Pose dynamically
        const { Pose } = await import('@mediapipe/pose')
        const { Camera } = await import('@mediapipe/camera_utils')
        
        // Initialize Pose model
        pose = new Pose({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
          }
        })
        
        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        })

        pose.onResults((results) => {
          setIsLoading(false)
          if (results.poseLandmarks) {
            setBodyLandmarks(results.poseLandmarks)
          }
        })

        poseInstanceRef.current = pose

        // Get camera stream
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: 1280, height: 720 } 
        })
        setStream(mediaStream)
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
          
          // Start Camera processing
          const camera = new Camera(videoRef.current, {
            onFrame: async () => {
              if (videoRef.current && pose) {
                await pose.send({ image: videoRef.current })
              }
            },
            width: 1280,
            height: 720
          })
          camera.start()
        }
      } catch (err) {
        console.error('Camera/Pose error:', err)
        setError('Camera access denied or AI model failed to load. Please allow camera permissions.')
        setIsLoading(false)
      }
    }
    
    startCamera()
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
      if (poseInstanceRef.current) {
        poseInstanceRef.current.close()
      }
    }
  }, [])

  // Calculate product position based on body landmarks
  const getProductPosition = () => {
    if (!bodyLandmarks) return { x: 50, y: 50, width: 200, height: 250, rotation: 0 }
    
    // Get left and right shoulder positions
    const leftShoulder = bodyLandmarks[11]
    const rightShoulder = bodyLandmarks[12]
    const leftHip = bodyLandmarks[23]
    const rightHip = bodyLandmarks[24]

    if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) {
      return { x: 50, y: 50, width: 200, height: 250, rotation: 0 }
    }

    // Calculate center position
    const centerX = ((1 - leftShoulder.x) + (1 - rightShoulder.x)) / 2 * 100
    const centerY = ((leftShoulder.y + rightShoulder.y) / 2) * 100

    // Calculate width from shoulder distance
    const shoulderDistance = Math.abs(leftShoulder.x - rightShoulder.x)
    const width = Math.max(shoulderDistance * 800, 150)
    const height = width * 1.3

    // Calculate rotation from shoulder angle
    const rotation = Math.atan2(rightShoulder.y - leftShoulder.y, rightShoulder.x - leftShoulder.x) * (180 / Math.PI)

    return { x: centerX, y: centerY, width, height, rotation }
  }

  const pos = getProductPosition()

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white bg-gradient-to-br from-purple-600 to-pink-600">
        <div className="text-6xl mb-4">🤖</div>
        <p className="text-xl mb-4 text-center px-4">{error}</p>
        <p className="text-sm text-white/70 mb-6">Make sure you're using HTTPS or localhost</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-white text-purple-600 rounded-lg font-bold hover:scale-105 transition-transform"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-xl font-bold">Loading AI Body Detection...</p>
            <p className="text-sm text-white/70 mt-2">Please wait</p>
          </div>
        </div>
      )}

      {/* Camera Video */}
      <video 
        ref={videoRef}
        autoPlay 
        playsInline 
        muted
        className="w-full h-full object-cover"
        style={{ transform: 'scaleX(-1)' }}
      />
      
      {/* Product Image Overlay - AI Positioned */}
      {productImage && !isLoading && (
        <div
          className="absolute pointer-events-none transition-all duration-100"
          style={{ 
            left: `${pos.x}%`,
            top: `${pos.y}%`,
            width: `${pos.width}px`,
            height: `${pos.height}px`,
            transform: `translate(-50%, -50%) rotate(${pos.rotation}deg) scaleX(-1)`,
            opacity: bodyLandmarks ? 0.9 : 0
          }}
        >
          <img 
            src={productImage} 
            alt="Product" 
            className="w-full h-full object-contain"
            style={{ 
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))'
            }}
          />
        </div>
      )}
      
      {/* Status indicators */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        <div className={`backdrop-blur-sm rounded-full px-3 py-1 text-sm flex items-center gap-2 ${bodyLandmarks ? 'bg-green-500/80' : 'bg-yellow-500/80'} text-white`}>
          <div className={`w-2 h-2 rounded-full ${bodyLandmarks ? 'bg-white animate-pulse' : 'bg-red-400'}`}></div>
          {bodyLandmarks ? 'AI Tracking Active' : 'Detecting Body...'}
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg p-3 text-white text-center">
        <p className="text-sm">🤖 AI body detection se product apne aap aapke body par fit hoga!</p>
        <p className="text-xs text-white/70 mt-1">Full body camera mein dikhayein</p>
      </div>
    </div>
  )
}

// Room environment for furniture
function Room() {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#e8e8e8" />
      </mesh>

      {/* Walls */}
      <mesh position={[0, 1, -5]}>
        <planeGeometry args={[10, 4]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>

      <mesh position={[-5, 1, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[10, 4]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>
    </group>
  )
}

function ARViewer({ mode, product, isOpen, onClose }) {
  const [isPlaying, setIsPlaying] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)

  console.log('ARViewer rendering with:', { mode, product: product?.name, isOpen })

  const toggleAnimation = () => {
    setIsPlaying(!isPlaying)
  }

  const resetView = () => {
    // Reset controls would go here
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  // Don't render if not open
  if (!isOpen) {
    console.log('ARViewer not rendering - isOpen is false');
    return null;
  }
  
  console.log('ARViewer IS rendering with mode:', mode);

  return (
    <div className={`fixed inset-0 bg-black z-[9999] ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* Header */}
      <div className='absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 z-10'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <h2 className='text-xl font-bold'>
              {mode === 'body' ? 'Virtual Try-On' : mode === 'room' ? 'Room View' : 'AR Experience'}
            </h2>
            <span className='text-sm bg-white/20 px-2 py-1 rounded-full'>
              {product?.name || 'Product'}
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <button
              onClick={toggleAnimation}
              className='p-2 hover:bg-white/20 rounded-lg transition-colors'
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>
            <button
              onClick={resetView}
              className='p-2 hover:bg-white/20 rounded-lg transition-colors'
              title="Reset View"
            >
              <FaUndo />
            </button>
            <button
              onClick={toggleFullscreen}
              className='p-2 hover:bg-white/20 rounded-lg transition-colors'
              title="Fullscreen"
            >
              <FaExpand />
            </button>
            <button
              onClick={onClose}
              className='p-2 hover:bg-white/20 rounded-lg transition-colors'
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      {/* Render Camera AR or 3D Canvas based on mode */}
      {mode === 'camera' ? (
        <div className="w-full h-full pt-16 bg-black">
          <CameraAR productImage={product?.image1} />
        </div>
      ) : (
      /* 3D Canvas */
      <div className='w-full h-full pt-16'>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
        >
          <Suspense fallback={
            <Html center>
              <div className='text-white text-center'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4'></div>
                <p>Loading AR Experience...</p>
              </div>
            </Html>
          }>
            {/* Lighting - using simple lights instead of Environment to avoid network issues */}
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
            <pointLight position={[-10, -10, -5]} intensity={0.5} />
            <hemisphereLight intensity={0.5} />

            {/* 3D Content */}
            {console.log('Rendering mode:', mode, 'Product image:', product?.image1)}
            {mode === 'body' && <Avatar productImage={product?.image1} clothingType={product?.category?.toLowerCase()} />}
            {mode === 'room' && (
              <>
                <Room />
                {/* Sample furniture - in real app, this would be the actual product model */}
                <mesh position={[0, -1, 0]}>
                  <boxGeometry args={[1, 0.8, 0.6]} />
                  <meshStandardMaterial color="#8b4513" />
                </mesh>
              </>
            )}

            {/* Controls */}
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              autoRotate={isPlaying}
              autoRotateSpeed={0.5}
            />

            {/* Contact shadows for better realism */}
            <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={8} blur={2.5} />
          </Suspense>
        </Canvas>
      </div>
      )}

      {/* Instructions */}
      <div className='absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-4 text-white'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
          <div className='flex items-center gap-2'>
            <span className='text-purple-400'></span>
            <span>Click and drag to rotate</span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-purple-400'></span>
            <span>Scroll to zoom</span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-purple-400'>↻</span>
            <span>Auto-rotation {isPlaying ? 'ON' : 'OFF'}</span>
          </div>
        </div>
      </div>

      {/* Loading indicator for models */}
      <div className='absolute top-20 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white text-sm'>
        <div className='flex items-center gap-2'>
          <div className='w-2 h-2 bg-green-400 rounded-full animate-pulse'></div>
          <span>AR Ready</span>
        </div>
      </div>
    </div>
  )
}

export default ARViewer