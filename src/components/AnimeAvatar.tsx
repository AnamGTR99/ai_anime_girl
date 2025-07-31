import React, { useRef, useEffect, useImperativeHandle, forwardRef, useState } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { VRM, VRMUtils, VRMExpressionPresetName, VRMLoaderPlugin } from '@pixiv/three-vrm';

export interface AnimeAvatarHandle {
  setExpression: (expression: VRMExpressionPresetName) => void;
  setMouthOpen: (open: number) => void;
}

const VRM_URL = '/models/my-anime-girl.vrm'; // Local VRM file in public/models

const AnimeAvatar = forwardRef<AnimeAvatarHandle>((props, ref) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const vrmRef = useRef<VRM | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const frameIdRef = useRef<number | null>(null);
  const currentExpression = useRef<VRMExpressionPresetName>('neutral');
  const currentMouthOpen = useRef<number>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let renderer: THREE.WebGLRenderer;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let light: THREE.DirectionalLight;
    let running = true;

    // Idle animation state
    let idleTime = 0;
    let blinkTimer = 0;
    let isBlinking = false;
    let blinkDuration = 0.1; // seconds
    let nextBlink = 1.5 + Math.random() * 2.5; // seconds

    const width = 350;
    const height = 500;

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;

    scene = new THREE.Scene();
    sceneRef.current = scene;

    camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 20);
    camera.position.set(0, 1.4, 1.2);
    cameraRef.current = camera;

    light = new THREE.DirectionalLight(0xffffff, 1.2);
    light.position.set(1, 1, 1);
    scene.add(light);

    if (mountRef.current) {
      mountRef.current.innerHTML = '';
      mountRef.current.appendChild(renderer.domElement);
    }

    // Load VRM
    (async () => {
      const loader = new GLTFLoader();
      loader.register((parser: any) => new VRMLoaderPlugin(parser));
      loader.load(
        VRM_URL,
        (gltf: any) => {
          try {
            const vrmLoaded = gltf.userData.vrm;
            scene.add(vrmLoaded.scene);
            vrmRef.current = vrmLoaded;
            setError(null);
          } catch (e) {
            setError('Failed to parse VRM model.');
            console.error('VRM parse error:', e);
          }
        },
        undefined,
        (error: any) => {
          setError('Failed to load VRM model.');
          console.error('Failed to load VRM:', error);
        }
      );
    })();

    // Animation loop
    const animate = () => {
      if (!running) return;
      frameIdRef.current = requestAnimationFrame(animate);
      if (vrmRef.current) {
        // Idle animation (breathing/sway)
        idleTime += 1 / 60;
        const root = vrmRef.current.scene;
        if (root) {
          // Sway left/right
          root.rotation.y = Math.sin(idleTime * 0.5) * 0.05;
          // Breathing (up/down)
          root.position.y = Math.sin(idleTime * 0.8) * 0.02;
        }

        // Blinking logic
        blinkTimer += 1 / 60;
        const exp = vrmRef.current.expressionManager;
        if (exp) {
          if (isBlinking) {
            exp.setValue('blink', 1.0);
            if (blinkTimer > blinkDuration) {
              isBlinking = false;
              blinkTimer = 0;
              nextBlink = 1.5 + Math.random() * 2.5;
              exp.setValue('blink', 0.0);
            }
          } else {
            exp.setValue('blink', 0.0);
            if (blinkTimer > nextBlink) {
              isBlinking = true;
              blinkTimer = 0;
            }
          }
        }

        // Animate mouth
        if (exp) {
          exp.setValue('aa', currentMouthOpen.current); // 'aa' is the mouth open shape
          exp.setValue(currentExpression.current, 1.0);
        }
        vrmRef.current.update(1 / 60);
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      running = false;
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
      if (renderer) renderer.dispose();
      // No need to remove vrm from scene, as scene will be disposed
    };
  }, []);

  useImperativeHandle(ref, () => ({
    setExpression: (expression: VRMExpressionPresetName) => {
      currentExpression.current = expression;
    },
    setMouthOpen: (open: number) => {
      currentMouthOpen.current = open;
    }
  }), []);

  return (
    <div ref={mountRef} style={{ width: 350, height: 500, background: '#fff0fa', border: '2px solid #e573c7', borderRadius: 16, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {error && (
        <div style={{ position: 'absolute', top: 10, left: 10, right: 10, color: 'red', background: 'rgba(255,255,255,0.9)', padding: 8, borderRadius: 8, zIndex: 2, fontWeight: 600 }}>
          {error}
        </div>
      )}
    </div>
  );
});

export default AnimeAvatar; 