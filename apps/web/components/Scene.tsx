'use client';

import { useRef, useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Outlines, Environment, Float } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Custom Shapes
function getToastShape() {
    const shape = new THREE.Shape();
    shape.moveTo(-1, -1.2);
    shape.lineTo(1, -1.2);
    shape.lineTo(1, 0.5);
    shape.quadraticCurveTo(1, 1.2, 0.5, 1.2);
    shape.quadraticCurveTo(0, 1.0, -0.5, 1.2);
    shape.quadraticCurveTo(-1, 1.2, -1, 0.5);
    shape.lineTo(-1, -1.2);
    return shape;
}

function getStarShape() {
    const shape = new THREE.Shape();
    const outerRadius = 1;
    const innerRadius = 0.5;
    const spikes = 5;
    for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i / (spikes * 2)) * Math.PI * 2;
        if (i === 0) shape.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
        else shape.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
    }
    shape.closePath();
    return shape;
}

function Toast() {
    const shape = useMemo(() => getToastShape(), []);
    const extrudeSettings = { depth: 0.4, bevelEnabled: true, bevelSegments: 3, steps: 2, bevelSize: 0.1, bevelThickness: 0.1 };

    return (
        <group>
            {/* Bread Body */}
            <mesh castShadow receiveShadow position={[0, 0, -0.2]}>
                <extrudeGeometry args={[shape, extrudeSettings]} />
                <meshToonMaterial color="#FDBA74" />
                <Outlines thickness={0.06} color="black" />
            </mesh>

            {/* Crust */}
            <mesh castShadow receiveShadow position={[0, 0, -0.25]} scale={[1.05, 1.05, 1.2]}>
                <extrudeGeometry args={[shape, extrudeSettings]} />
                <meshToonMaterial color="#C2410C" />
                <Outlines thickness={0.06} color="black" />
            </mesh>

            {/* Butter */}
            <mesh position={[0, 0.2, 0.3]} rotation={[0, 0, Math.PI / 8]} castShadow>
                <boxGeometry args={[0.7, 0.7, 0.15]} />
                <meshToonMaterial color="#FEF08A" />
                <Outlines thickness={0.06} color="black" />
            </mesh>

            {/* Face */}
            <group position={[0, -0.3, 0.25]}>
                <mesh position={[-0.4, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.1, 0.1, 0.1, 16]} />
                    <meshBasicMaterial color="black" />
                </mesh>
                <mesh position={[0.4, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.1, 0.1, 0.1, 16]} />
                    <meshBasicMaterial color="black" />
                </mesh>
                <mesh position={[0, -0.15, 0]} rotation={[0, 0, Math.PI]}>
                    <torusGeometry args={[0.15, 0.05, 16, 32, Math.PI]} />
                    <meshBasicMaterial color="black" />
                </mesh>
                <mesh position={[-0.6, -0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.15, 0.15, 0.05, 16]} />
                    <meshBasicMaterial color="#F87171" />
                </mesh>
                <mesh position={[0.6, -0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.15, 0.15, 0.05, 16]} />
                    <meshBasicMaterial color="#F87171" />
                </mesh>
            </group>
        </group>
    );
}

function Bell() {
    return (
        <group>
            <mesh castShadow receiveShadow position={[0, 0.2, 0]}>
                <cylinderGeometry args={[0.1, 0.8, 1.2, 32]} />
                <meshToonMaterial color="#FBBF24" />
                <Outlines thickness={0.06} color="black" />
            </mesh>
            <mesh castShadow receiveShadow position={[0, 0.8, 0]}>
                <sphereGeometry args={[0.4, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshToonMaterial color="#FBBF24" />
                <Outlines thickness={0.06} color="black" />
            </mesh>
            <mesh castShadow receiveShadow position={[0, -0.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.8, 0.1, 16, 32]} />
                <meshToonMaterial color="#F59E0B" />
                <Outlines thickness={0.06} color="black" />
            </mesh>
            <mesh castShadow receiveShadow position={[0, -0.6, 0]}>
                <sphereGeometry args={[0.2, 32, 32]} />
                <meshToonMaterial color="#B45309" />
                <Outlines thickness={0.06} color="black" />
            </mesh>
            <mesh castShadow receiveShadow position={[0, 1.1, 0]}>
                <torusGeometry args={[0.15, 0.05, 16, 32]} />
                <meshToonMaterial color="#F59E0B" />
                <Outlines thickness={0.06} color="black" />
            </mesh>
        </group>
    );
}

function Star() {
    const shape = useMemo(() => getStarShape(), []);
    const extrudeSettings = { depth: 0.2, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.05, bevelThickness: 0.05 };

    return (
        <mesh castShadow receiveShadow>
            <extrudeGeometry args={[shape, extrudeSettings]} />
            <meshToonMaterial color="#34D399" />
            <Outlines thickness={0.06} color="black" />
        </mesh>
    );
}

function Spark({ color = "#60A5FA" }: { color?: string }) {
    return (
        <mesh castShadow receiveShadow>
            <icosahedronGeometry args={[1, 0]} />
            <meshToonMaterial color={color} />
            <Outlines thickness={0.06} color="black" />
        </mesh>
    );
}

function Composition() {
    const groupRef = useRef<THREE.Group>(null);

    useEffect(() => {
        if (groupRef.current) {
            gsap.to(groupRef.current.rotation, {
                y: Math.PI * 2,
                scrollTrigger: {
                    trigger: 'body',
                    start: 'top top',
                    end: 'bottom bottom',
                    scrub: true,
                },
                ease: 'none',
            });

            gsap.to(groupRef.current.position, {
                y: -2,
                scrollTrigger: {
                    trigger: 'body',
                    start: 'top top',
                    end: 'bottom bottom',
                    scrub: true,
                },
                ease: 'none',
            });
        }
    }, []);

    const items = [
        { component: <Toast />, position: [0, 0, 0], scale: 1.2, rotation: [0, 0, 0], speed: 2, rotationIntensity: 0.5, floatIntensity: 1 },
        { component: <Bell />, position: [3.5, 2, -2], scale: 0.8, rotation: [0.2, -0.4, 0.3], speed: 3, rotationIntensity: 1, floatIntensity: 2 },
        { component: <Star />, position: [-3.5, 1.5, -1], scale: 0.6, rotation: [0, 0, 0.5], speed: 2.5, rotationIntensity: 2, floatIntensity: 1.5 },
        { component: <Spark color="#F472B6" />, position: [3, -2.5, 1], scale: 0.4, rotation: [0, 0, 0], speed: 4, rotationIntensity: 1, floatIntensity: 2 },
        { component: <Spark color="#60A5FA" />, position: [-3, -2, 2], scale: 0.3, rotation: [0, 0, 0], speed: 3.5, rotationIntensity: 1.5, floatIntensity: 1.5 },
        { component: <Spark color="#A78BFA" />, position: [0, 3.5, -3], scale: 0.5, rotation: [0, 0, 0], speed: 2, rotationIntensity: 1, floatIntensity: 2 },
    ];

    return (
        <group ref={groupRef}>
            {items.map((item, i) => (
                <Float key={i} speed={item.speed} rotationIntensity={item.rotationIntensity} floatIntensity={item.floatIntensity}>
                    <group position={item.position as [number, number, number]} scale={item.scale} rotation={item.rotation as [number, number, number]}>
                        {item.component}
                    </group>
                </Float>
            ))}
        </group>
    );
}

export default function Scene() {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none">
            <Canvas
                shadows={{ type: THREE.PCFShadowMap }}
                camera={{ position: [0, 0, 10], fov: 45 }}
                gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
                dpr={[1, 1.5]}
                performance={{ min: 0.5 }}
            >
                <ambientLight intensity={0.6} />
                <directionalLight
                    position={[5, 10, 5]}
                    intensity={2.5}
                    castShadow
                    shadow-mapSize-width={1024}
                    shadow-mapSize-height={1024}
                    shadow-camera-far={20}
                    shadow-camera-left={-10}
                    shadow-camera-right={10}
                    shadow-camera-top={10}
                    shadow-camera-bottom={-10}
                />
                <directionalLight position={[-5, -5, -5]} intensity={0.5} />
                <Composition />
                <Environment preset="city" />
            </Canvas>
        </div>
    );
}
