import React, { useRef, useState, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, Html, useGLTF } from '@react-three/drei'
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
function Avatar({ clothingType = 'shirt' }) {
  const meshRef = useRef()

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005
    }
  })

  return (
    <group ref={meshRef}>
      {/* Simple human-like figure */}
      <mesh position={[0, -1, 0]}>
        <capsuleGeometry args={[0.3, 1.6]} />
        <meshStandardMaterial color="#f5f5dc" />
      </mesh>

      {/* Clothing overlay */}
      <mesh position={[0, -0.3, 0.31]}>
        <boxGeometry args={[0.7, 1.2, 0.02]} />
        <meshStandardMaterial
          color={clothingType === 'shirt' ? '#ff6b6b' : '#4ecdc4'}
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
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

function ARViewer({ mode, product, onClose }) {
  const [isPlaying, setIsPlaying] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggleAnimation = () => {
    setIsPlaying(!isPlaying)
  }

  const resetView = () => {
    // Reset controls would go here
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  return (
    <div className={`fixed inset-0 bg-black z-50 ${isFullscreen ? 'fullscreen' : ''}`}>
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

      {/* 3D Canvas */}
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
            {/* Lighting */}
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <pointLight position={[-10, -10, -5]} intensity={0.5} />

            {/* Environment */}
            <Environment preset="studio" />

            {/* 3D Content */}
            {mode === 'body' && <Avatar clothingType={product?.category?.toLowerCase()} />}
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

      {/* Instructions */}
      <div className='absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-4 text-white'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
          <div className='flex items-center gap-2'>
            <span className='text-purple-400'>🖱️</span>
            <span>Click and drag to rotate</span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-purple-400'>🔍</span>
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