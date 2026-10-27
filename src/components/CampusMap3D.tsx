import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { CampusBuilding } from '../types';
import { getCampusPath } from '../data/campusData';
import {
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Layers,
  Eye,
  Navigation,
  MapPin,
  Compass,
  Move,
  Focus,
} from 'lucide-react';
import { useEdu } from '../context/EduContext';

interface CampusMap3DProps {
  buildings: CampusBuilding[];
  selectedBuildingId: string | null;
  onSelectBuilding: (buildingId: string) => void;
  targetRoom?: string;
  className?: string;
}

export const CampusMap3D: React.FC<CampusMap3DProps> = ({
  buildings,
  selectedBuildingId,
  onSelectBuilding,
  targetRoom,
  className = 'w-full h-full min-h-[360px]',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredBuildingName, setHoveredBuildingName] = useState<string | null>(null);
  const [webGlAvailable, setWebGlAvailable] = useState<boolean>(true);
  const [cameraModeTip, setCameraModeTip] = useState<string>('Órbita The Sims');

  // References for camera controller
  // Target focal point in the campus (look-at target)
  const targetLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 1.2, 0));
  const currentLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 1.2, 0));

  // Spherical camera coordinate parameters: radius (distance), theta (azimuth), phi (polar angle)
  const cameraRadiusRef = useRef<number>(55);
  const cameraThetaRef = useRef<number>(Math.PI * 0.25); // 45 degrees isometric angle
  const cameraPhiRef = useRef<number>(Math.PI * 0.32); // ~57 degrees pitch

  const targetRadiusRef = useRef<number>(55);
  const targetThetaRef = useRef<number>(Math.PI * 0.25);
  const targetPhiRef = useRef<number>(Math.PI * 0.32);

  const selectedBuildingIdRef = useRef<string | null>(selectedBuildingId);
  const targetRoomRef = useRef<string | undefined>(targetRoom);
  const onSelectBuildingRef = useRef(onSelectBuilding);

  const { theme } = useEdu();
  const themeRef = useRef(theme);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    selectedBuildingIdRef.current = selectedBuildingId;
  }, [selectedBuildingId]);

  useEffect(() => {
    targetRoomRef.current = targetRoom;
  }, [targetRoom]);

  useEffect(() => {
    onSelectBuildingRef.current = onSelectBuilding;
  }, [onSelectBuilding]);

  // Smooth focus on selected building preserving current viewing angle
  useEffect(() => {
    if (selectedBuildingId) {
      const b = buildings.find((x) => x.id === selectedBuildingId);
      if (b) {
        const [bx, by, bz] = b.position3D;
        // Shift focal look-at target to building's center/entrance
        targetLookAtRef.current.set(bx, by + 2.0, bz);
        // Ideal close inspection distance adapted to building scale
        targetRadiusRef.current = 28;
        // Keep pitch at comfortable angle for building viewing
        targetPhiRef.current = THREE.MathUtils.clamp(targetPhiRef.current, 0.45, 0.85);
      }
    } else {
      // Default overview
      targetLookAtRef.current.set(0, 1.2, 0);
      targetRadiusRef.current = 55;
      targetPhiRef.current = Math.PI * 0.32;
    }
  }, [selectedBuildingId, buildings]);

  const handleResetView = useCallback(() => {
    targetLookAtRef.current.set(0, 1.2, 0);
    targetRadiusRef.current = 55;
    targetThetaRef.current = Math.PI * 0.25;
    targetPhiRef.current = Math.PI * 0.32;
    setCameraModeTip('Visão Geral do Campus');
    setTimeout(() => setCameraModeTip('Órbita The Sims'), 2000);
  }, []);

  const handleFocusDestination = useCallback(() => {
    if (selectedBuildingIdRef.current) {
      const b = buildings.find((x) => x.id === selectedBuildingIdRef.current);
      if (b) {
        const [bx, by, bz] = b.position3D;
        targetLookAtRef.current.set(bx, by + 2.0, bz);
        targetRadiusRef.current = 26;
        targetPhiRef.current = 0.55;
        setCameraModeTip(`Foco: ${b.shortName}`);
        setTimeout(() => setCameraModeTip('Órbita The Sims'), 2000);
      }
    } else {
      handleResetView();
    }
  }, [buildings, handleResetView]);

  const handleZoom = useCallback((delta: number) => {
    targetRadiusRef.current = THREE.MathUtils.clamp(
      targetRadiusRef.current + delta,
      16,
      88
    );
  }, []);

  const handleRotate = useCallback((angleDelta: number) => {
    targetThetaRef.current += angleDelta;
  }, []);

  const handlePitch = useCallback((pitchDelta: number) => {
    // Clamp polar angle (0.28 rad ≈ 16° to 1.35 rad ≈ 77°)
    targetPhiRef.current = THREE.MathUtils.clamp(
      targetPhiRef.current + pitchDelta,
      0.28,
      1.35
    );
  }, []);

  // Keyboard navigation listener (arrows, +, -, Home/R, F)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === 'ArrowLeft') {
        handleRotate(-0.1);
      } else if (e.key === 'ArrowRight') {
        handleRotate(0.1);
      } else if (e.key === 'ArrowUp') {
        handlePitch(-0.06);
      } else if (e.key === 'ArrowDown') {
        handlePitch(0.06);
      } else if (e.key === '+' || e.key === '=') {
        handleZoom(-5);
      } else if (e.key === '-' || e.key === '_') {
        handleZoom(5);
      } else if (e.key === 'Home' || e.key === 'r' || e.key === 'R') {
        handleResetView();
      } else if (e.key === 'f' || e.key === 'F') {
        handleFocusDestination();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleRotate, handlePitch, handleZoom, handleResetView, handleFocusDestination]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // WebGL support verification
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setWebGlAvailable(false);
        return;
      }
    } catch {
      setWebGlAvailable(false);
      return;
    }

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // Scene
    const scene = new THREE.Scene();
    // Warm tropical sky gradient background
    scene.background = new THREE.Color('#DCE8F4');
    scene.fog = new THREE.FogExp2('#DCE8F4', 0.0075);

    // Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.5, 300);

    // Initial position calculated from spherical coords
    const updateCamFromSpherical = (lerpFactor = 0.08) => {
      cameraRadiusRef.current = THREE.MathUtils.lerp(
        cameraRadiusRef.current,
        targetRadiusRef.current,
        lerpFactor
      );
      cameraThetaRef.current = THREE.MathUtils.lerp(
        cameraThetaRef.current,
        targetThetaRef.current,
        lerpFactor
      );
      cameraPhiRef.current = THREE.MathUtils.lerp(
        cameraPhiRef.current,
        targetPhiRef.current,
        lerpFactor
      );
      currentLookAtRef.current.lerp(targetLookAtRef.current, lerpFactor);

      const r = cameraRadiusRef.current;
      const th = cameraThetaRef.current;
      const ph = cameraPhiRef.current;

      const cx = currentLookAtRef.current.x + r * Math.sin(ph) * Math.sin(th);
      const cy = currentLookAtRef.current.y + r * Math.cos(ph);
      const cz = currentLookAtRef.current.z + r * Math.sin(ph) * Math.cos(th);

      camera.position.set(cx, cy, cz);
      camera.lookAt(currentLookAtRef.current);
    };

    updateCamFromSpherical(1.0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Shared Palette & Materials
    const palette = {
      grass: '#78A76E',
      grassAccent: '#8DB882',
      pavement: '#E2E8F0',
      pavementPlaza: '#EDF2F7',
      roadAsphalt: '#334155',
      roadCurb: '#CBD5E1',
      roadStripe: '#F8FAFC',
      foliumNavy: '#203A65',
      foliumNavyLight: '#2F4E85',
      glassCyan: '#38BDF8',
      glassNavy: '#1E3A5F',
      concreteWhite: '#FFFFFF',
      concreteSand: '#F1F5F9',
      roofGraphite: '#475569',
      woodDeck: '#B47B4E',
      waterCyan: '#0284C7',
      skylineFog: '#C5D6E8',
      palmTrunk: '#85583C',
      palmLeaf: '#2E7D32',
      treeLeafA: '#388E3C',
      treeLeafB: '#43A047',
    };

    // Procedural Textures
    const createStripedTileTexture = () => {
      const c = document.createElement('canvas');
      c.width = 128;
      c.height = 128;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = '#E8EEF5';
      ctx.fillRect(0, 0, 128, 128);
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, 128, 128);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.strokeRect(4, 4, 120, 120);

      const t = new THREE.CanvasTexture(c);
      t.wrapS = THREE.RepeatWrapping;
      t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(8, 8);
      return t;
    };

    const tileTexture = createStripedTileTexture();

    // Label Sprite Generator
    const createLabelSprite = (text: string, subtext?: string) => {
      const canvas = document.createElement('canvas');
      canvas.width = 384;
      canvas.height = 128;
      const ctx = canvas.getContext('2d')!;

      // Background rounded pill
      ctx.fillStyle = 'rgba(20, 36, 63, 0.94)';
      ctx.beginPath();
      ctx.roundRect(14, 16, 356, 96, 26);
      ctx.fill();

      // Border glow
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();

      ctx.font = 'bold 36px "Plus Jakarta Sans", system-ui, sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 192, subtext ? 50 : 64);

      if (subtext) {
        ctx.font = '600 20px "Plus Jakarta Sans", system-ui, sans-serif';
        ctx.fillStyle = '#93C5FD';
        ctx.fillText(subtext, 192, 84);
      }

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMat = new THREE.SpriteMaterial({ map: texture, depthTest: false });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(6.2, 2.1, 1);
      return sprite;
    };

    // Lights
    const ambientLight = new THREE.AmbientLight('#FFFFFF', 1.15);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight('#FFFFFF', '#94A3B8', 0.65);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight('#FFF9E6', 1.85);
    sunLight.position.set(45, 65, 35);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 180;
    sunLight.shadow.camera.left = -50;
    sunLight.shadow.camera.right = 50;
    sunLight.shadow.camera.top = 50;
    sunLight.shadow.camera.bottom = -50;
    sunLight.shadow.bias = -0.0004;
    scene.add(sunLight);

    // Auxiliary soft fill light from opposite angle
    const fillLight = new THREE.DirectionalLight('#BAE6FD', 0.45);
    fillLight.position.set(-35, 30, -35);
    scene.add(fillLight);

    // =========================================================================
    // 1. TERRAIN & INFRASTRUCTURE COMPOSITION
    // =========================================================================
    const campusRoot = new THREE.Group();
    scene.add(campusRoot);

    // Base Ground Plane
    const groundGeo = new THREE.PlaneGeometry(240, 240);
    const groundMat = new THREE.MeshStandardMaterial({
      color: '#CBD5E1',
      roughness: 0.9,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    campusRoot.add(ground);

    // Green Campus Park Lawn Base (with soft rounded borders)
    const parkGeo = new THREE.PlaneGeometry(80, 84);
    const parkMat = new THREE.MeshStandardMaterial({
      color: palette.grass,
      roughness: 0.85,
    });
    const parkMesh = new THREE.Mesh(parkGeo, parkMat);
    parkMesh.rotation.x = -Math.PI / 2;
    parkMesh.position.set(0, 0.02, 0);
    parkMesh.receiveShadow = true;
    campusRoot.add(parkMesh);

    // Perimeter Avenue (Miami style palm-lined outer boulevard)
    const createOuterRoads = () => {
      const roadGroup = new THREE.Group();
      const roadMat = new THREE.MeshStandardMaterial({
        color: palette.roadAsphalt,
        roughness: 0.7,
      });

      // North Avenue (in front of Main Gate)
      const northRoadGeo = new THREE.PlaneGeometry(160, 9);
      const northRoad = new THREE.Mesh(northRoadGeo, roadMat);
      northRoad.rotation.x = -Math.PI / 2;
      northRoad.position.set(0, 0.03, -37);
      northRoad.receiveShadow = true;
      roadGroup.add(northRoad);

      // South Avenue (behind South Gate)
      const southRoadGeo = new THREE.PlaneGeometry(160, 9);
      const southRoad = new THREE.Mesh(southRoadGeo, roadMat);
      southRoad.rotation.x = -Math.PI / 2;
      southRoad.position.set(0, 0.03, 37);
      southRoad.receiveShadow = true;
      roadGroup.add(southRoad);

      // Road Striping helper
      const stripeMat = new THREE.MeshBasicMaterial({ color: '#FEF08A' });
      for (let x = -70; x <= 70; x += 6) {
        const stripeGeo = new THREE.PlaneGeometry(3.5, 0.25);
        const s1 = new THREE.Mesh(stripeGeo, stripeMat);
        s1.rotation.x = -Math.PI / 2;
        s1.position.set(x, 0.035, -37);
        roadGroup.add(s1);

        const s2 = new THREE.Mesh(stripeGeo, stripeMat);
        s2.rotation.x = -Math.PI / 2;
        s2.position.set(x, 0.035, 37);
        roadGroup.add(s2);
      }

      campusRoot.add(roadGroup);
    };

    createOuterRoads();

    // Internal Walkways, Boulevard, and Plazas
    const walkwayMat = new THREE.MeshStandardMaterial({
      color: palette.pavement,
      map: tileTexture,
      roughness: 0.6,
    });

    // Central Boulevard Spine (North to South axis)
    const spineGeo = new THREE.PlaneGeometry(8, 68);
    const spineMesh = new THREE.Mesh(spineGeo, walkwayMat);
    spineMesh.rotation.x = -Math.PI / 2;
    spineMesh.position.set(0, 0.04, 0);
    spineMesh.receiveShadow = true;
    campusRoot.add(spineMesh);

    // Cross Boulevard connecting East and West wings
    const crossNorthGeo = new THREE.PlaneGeometry(54, 7);
    const crossNorth = new THREE.Mesh(crossNorthGeo, walkwayMat);
    crossNorth.rotation.x = -Math.PI / 2;
    crossNorth.position.set(0, 0.045, -6);
    crossNorth.receiveShadow = true;
    campusRoot.add(crossNorth);

    const crossSouthGeo = new THREE.PlaneGeometry(54, 7);
    const crossSouth = new THREE.Mesh(crossSouthGeo, walkwayMat);
    crossSouth.rotation.x = -Math.PI / 2;
    crossSouth.position.set(0, 0.045, 8);
    crossSouth.receiveShadow = true;
    campusRoot.add(crossSouth);

    // Central Civic Esplanade (surrounding the central water mirror)
    const centralPlazaGeo = new THREE.CylinderGeometry(9.5, 9.8, 0.15, 36);
    const centralPlazaMat = new THREE.MeshStandardMaterial({
      color: '#FFFFFF',
      roughness: 0.5,
    });
    const centralPlaza = new THREE.Mesh(centralPlazaGeo, centralPlazaMat);
    centralPlaza.position.set(0, 0.08, 1);
    centralPlaza.receiveShadow = true;
    campusRoot.add(centralPlaza);

    // Central Reflection Water Mirror / Fountain
    const fountainRimGeo = new THREE.CylinderGeometry(5.2, 5.5, 0.45, 36);
    const fountainRimMat = new THREE.MeshStandardMaterial({
      color: palette.foliumNavy,
      roughness: 0.3,
    });
    const fountainRim = new THREE.Mesh(fountainRimGeo, fountainRimMat);
    fountainRim.position.set(0, 0.28, 1);
    fountainRim.castShadow = true;
    fountainRim.receiveShadow = true;
    campusRoot.add(fountainRim);

    const waterGeo = new THREE.CylinderGeometry(4.8, 4.8, 0.4, 36);
    const waterMat = new THREE.MeshStandardMaterial({
      color: palette.waterCyan,
      roughness: 0.08,
      metalness: 0.35,
      transparent: true,
      opacity: 0.88,
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.position.set(0, 0.32, 1);
    campusRoot.add(waterMesh);

    // Fountain Center Jet Sculpture
    const jetGeo = new THREE.CylinderGeometry(0.5, 0.8, 1.4, 16);
    const jetMat = new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.3 });
    const jetMesh = new THREE.Mesh(jetGeo, jetMat);
    jetMesh.position.set(0, 0.9, 1);
    jetMesh.castShadow = true;
    campusRoot.add(jetMesh);

    // =========================================================================
    // 2. MAIN ENTRANCE (PORTÃO 1) & SOUTH ENTRANCE (PORTÃO 2)
    // =========================================================================
    const createMainGatehouse = () => {
      const gateGroup = new THREE.Group();
      gateGroup.position.set(0, 0, -30);

      // Semicircular Drop-Off Loop (Área de Desembarque)
      const dropOffGeo = new THREE.RingGeometry(8, 13.5, 32, 1, 0, Math.PI);
      const dropOffMat = new THREE.MeshStandardMaterial({
        color: palette.roadAsphalt,
        roughness: 0.8,
      });
      const dropOff = new THREE.Mesh(dropOffGeo, dropOffMat);
      dropOff.rotation.x = -Math.PI / 2;
      dropOff.position.set(0, 0.04, -2.5);
      dropOff.receiveShadow = true;
      gateGroup.add(dropOff);

      // Drop-off central landscaped island
      const islandGeo = new THREE.CircleGeometry(7.8, 32);
      const islandMat = new THREE.MeshStandardMaterial({ color: palette.grassAccent });
      const island = new THREE.Mesh(islandGeo, islandMat);
      island.rotation.x = -Math.PI / 2;
      island.position.set(0, 0.05, -2.5);
      island.receiveShadow = true;
      gateGroup.add(island);

      // Monumental Canopy Overhang (Curved Modern Tropical Wing)
      const canopyGeo = new THREE.BoxGeometry(16, 0.5, 6);
      const canopyMat = new THREE.MeshStandardMaterial({
        color: '#FFFFFF',
        roughness: 0.25,
      });
      const canopy = new THREE.Mesh(canopyGeo, canopyMat);
      canopy.position.set(0, 4.4, 0);
      canopy.castShadow = true;
      gateGroup.add(canopy);

      // Canopy Navy Fascia Top
      const fasciaGeo = new THREE.BoxGeometry(16.3, 0.25, 6.3);
      const fasciaMat = new THREE.MeshStandardMaterial({ color: palette.foliumNavy });
      const fascia = new THREE.Mesh(fasciaGeo, fasciaMat);
      fascia.position.set(0, 4.7, 0);
      gateGroup.add(fascia);

      // Support Slender Pillars
      const pillarGeo = new THREE.CylinderGeometry(0.2, 0.2, 4.4, 16);
      const pillarMat = new THREE.MeshStandardMaterial({ color: palette.foliumNavy, metalness: 0.4 });

      [-6.5, 6.5].forEach((px) => {
        [-2.2, 2.2].forEach((pz) => {
          const pil = new THREE.Mesh(pillarGeo, pillarMat);
          pil.position.set(px, 2.2, pz);
          pil.castShadow = true;
          gateGroup.add(pil);
        });
      });

      // Security / Reception Booth (Guarita de Acesso com Vidro)
      const boothGeo = new THREE.BoxGeometry(4.2, 3.2, 3.6);
      const boothMat = new THREE.MeshStandardMaterial({
        color: '#F8FAFC',
        roughness: 0.3,
      });
      const booth = new THREE.Mesh(boothGeo, boothMat);
      booth.position.set(0, 1.6, 0);
      booth.castShadow = true;
      gateGroup.add(booth);

      // Booth Glass Windows
      const glassMat = new THREE.MeshStandardMaterial({
        color: palette.glassCyan,
        roughness: 0.1,
        metalness: 0.6,
      });
      const boothGlass = new THREE.Mesh(new THREE.BoxGeometry(4.3, 1.2, 3.7), glassMat);
      boothGlass.position.set(0, 1.8, 0);
      gateGroup.add(boothGlass);

      // Pedestrian Turnstile Walkways
      const walkLeft = new THREE.Mesh(new THREE.PlaneGeometry(4, 8), walkwayMat);
      walkLeft.rotation.x = -Math.PI / 2;
      walkLeft.position.set(-4.5, 0.05, 0);
      gateGroup.add(walkLeft);

      const walkRight = new THREE.Mesh(new THREE.PlaneGeometry(4, 8), walkwayMat);
      walkRight.rotation.x = -Math.PI / 2;
      walkRight.position.set(4.5, 0.05, 0);
      gateGroup.add(walkRight);

      // Institutional Folium Signage Totem
      const totemGeo = new THREE.BoxGeometry(1.2, 3.8, 0.4);
      const totemMat = new THREE.MeshStandardMaterial({ color: palette.foliumNavy });
      const totem = new THREE.Mesh(totemGeo, totemMat);
      totem.position.set(8.5, 1.9, 2);
      totem.castShadow = true;
      gateGroup.add(totem);

      const label = createLabelSprite('PORTÃO 1', 'BOULEVARD PRINCIPAL');
      label.position.set(0, 5.8, 0);
      label.scale.set(6.8, 2.3, 1);
      gateGroup.add(label);

      campusRoot.add(gateGroup);
    };

    createMainGatehouse();

    // South Entrance (Portão 2)
    const createSouthGatehouse = () => {
      const gateGroup = new THREE.Group();
      gateGroup.position.set(0, 0, 30);

      const canopyGeo = new THREE.BoxGeometry(13, 0.45, 5);
      const canopyMat = new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.3 });
      const canopy = new THREE.Mesh(canopyGeo, canopyMat);
      canopy.position.set(0, 4.0, 0);
      canopy.castShadow = true;
      gateGroup.add(canopy);

      const pillarGeo = new THREE.CylinderGeometry(0.18, 0.18, 4.0, 16);
      const pillarMat = new THREE.MeshStandardMaterial({ color: palette.foliumNavy });
      [-5.2, 5.2].forEach((px) => {
        [-1.8, 1.8].forEach((pz) => {
          const pil = new THREE.Mesh(pillarGeo, pillarMat);
          pil.position.set(px, 2.0, pz);
          pil.castShadow = true;
          gateGroup.add(pil);
        });
      });

      const label = createLabelSprite('PORTÃO 2', 'ACESSO SUL & CONVIVÊNCIA');
      label.position.set(0, 5.4, 0);
      label.scale.set(6.4, 2.1, 1);
      gateGroup.add(label);

      campusRoot.add(gateGroup);
    };

    createSouthGatehouse();

    // =========================================================================
    // 3. VEGETATION & LANDSCAPING (PALMS & TREES & FLOWERBEDS)
    // =========================================================================
    const createPalmTree = (x: number, z: number, scale = 1.0) => {
      const palmGroup = new THREE.Group();
      palmGroup.position.set(x, 0, z);
      palmGroup.scale.set(scale, scale, scale);

      // Curved segmented trunk
      const trunkCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0.15, 2.5, 0),
        new THREE.Vector3(0.05, 5.0, 0.1),
        new THREE.Vector3(0, 6.8, 0.2),
      ]);
      const trunkGeo = new THREE.TubeGeometry(trunkCurve, 12, 0.28, 8, false);
      const trunkMat = new THREE.MeshStandardMaterial({
        color: palette.palmTrunk,
        roughness: 0.85,
      });
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.castShadow = true;
      palmGroup.add(trunk);

      // Crown of tropical fan fronds
      const leafMat = new THREE.MeshStandardMaterial({
        color: palette.palmLeaf,
        roughness: 0.6,
        side: THREE.DoubleSide,
      });

      const frondCount = 9;
      for (let i = 0; i < frondCount; i++) {
        const angle = (i / frondCount) * Math.PI * 2;
        const frondGroup = new THREE.Group();
        frondGroup.position.set(0, 6.8, 0.2);
        frondGroup.rotation.y = angle;
        frondGroup.rotation.z = 0.55 + Math.random() * 0.15;

        // Frond geometry
        const frondGeo = new THREE.ConeGeometry(0.75, 3.8, 4);
        frondGeo.translate(0, 1.9, 0);
        const frond = new THREE.Mesh(frondGeo, leafMat);
        frond.castShadow = true;
        frondGroup.add(frond);
        palmGroup.add(frondGroup);
      }

      // Stone Planter Ring Base
      const planterGeo = new THREE.CylinderGeometry(0.8, 0.9, 0.35, 16);
      const planterMat = new THREE.MeshStandardMaterial({ color: '#E2E8F0', roughness: 0.7 });
      const planter = new THREE.Mesh(planterGeo, planterMat);
      planter.position.y = 0.17;
      planter.receiveShadow = true;
      palmGroup.add(planter);

      return palmGroup;
    };

    const createShadeTree = (x: number, z: number, scale = 1.0, leafColor = palette.treeLeafA) => {
      const treeGroup = new THREE.Group();
      treeGroup.position.set(x, 0, z);
      treeGroup.scale.set(scale, scale, scale);

      const trunkGeo = new THREE.CylinderGeometry(0.24, 0.38, 2.2, 8);
      const trunkMat = new THREE.MeshStandardMaterial({ color: '#654321', roughness: 0.85 });
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 1.1;
      trunk.castShadow = true;
      treeGroup.add(trunk);

      const leafMat = new THREE.MeshStandardMaterial({
        color: leafColor,
        roughness: 0.75,
        flatShading: true,
      });

      // Layered cloud crown
      const c1 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.5, 1), leafMat);
      c1.position.y = 2.8;
      c1.castShadow = true;
      treeGroup.add(c1);

      const c2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.2, 1), leafMat);
      c2.position.set(0.6, 3.3, 0.4);
      c2.castShadow = true;
      treeGroup.add(c2);

      const c3 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.1, 1), leafMat);
      c3.position.set(-0.6, 3.1, -0.4);
      c3.castShadow = true;
      treeGroup.add(c3);

      return treeGroup;
    };

    // Plant Palm Trees along Alameda Central and plazas
    const palmPositions: [number, number, number][] = [
      // Along Central Boulevard (Portão 1 to Central Fountain)
      [-5.2, -26, 1.0],
      [5.2, -26, 1.0],
      [-5.2, -20, 1.05],
      [5.2, -20, 1.05],
      [-5.2, -14, 1.1],
      [5.2, -14, 1.1],
      // Surrounding Central Esplanade
      [-7.5, -3, 1.15],
      [7.5, -3, 1.15],
      [-7.5, 5, 1.15],
      [7.5, 5, 1.15],
      // Boulevard to South Gate
      [-5.2, 12, 1.05],
      [5.2, 12, 1.05],
      [-5.2, 18, 1.0],
      [5.2, 18, 1.0],
      [-5.2, 26, 1.0],
      [5.2, 26, 1.0],
      // Drop-off island
      [0, -32.5, 1.25],
    ];

    palmPositions.forEach(([px, pz, pscale]) => {
      campusRoot.add(createPalmTree(px, pz, pscale));
    });

    // Plant Shade Trees in green groves between buildings
    const treePositions: [number, number, number, string][] = [
      [-26, -16, 1.1, palette.treeLeafA],
      [-27, -10, 1.2, palette.treeLeafB],
      [-26, -2, 1.0, palette.treeLeafA],
      [-27, 4, 1.15, palette.treeLeafB],
      [-26, 14, 1.25, palette.treeLeafA],
      [26, -16, 1.1, palette.treeLeafB],
      [27, -10, 1.2, palette.treeLeafA],
      [26, -2, 1.05, palette.treeLeafB],
      [27, 4, 1.2, palette.treeLeafA],
      [26, 14, 1.15, palette.treeLeafB],
      // Near Reitoria and Convivência gardens
      [-10, -22, 1.0, palette.treeLeafA],
      [10, -22, 1.05, palette.treeLeafB],
      [-10, 24, 1.1, palette.treeLeafB],
      [10, 24, 1.0, palette.treeLeafA],
    ];

    treePositions.forEach(([tx, tz, tscale, tcolor]) => {
      campusRoot.add(createShadeTree(tx, tz, tscale, tcolor));
    });

    // =========================================================================
    // 4. MIAMI-INSPIRED URBAN FRAME & SKYLINE
    // =========================================================================
    const createUrbanFrame = () => {
      const cityGroup = new THREE.Group();

      const cityColors = ['#FFFFFF', '#F8FAFC', '#E2E8F0', '#F1F5F9', '#CBD5E1', '#E0F2FE'];
      const cityMatCache: Record<string, THREE.MeshStandardMaterial> = {};
      const getCityMat = (colorHex: string) => {
        if (!cityMatCache[colorHex]) {
          cityMatCache[colorHex] = new THREE.MeshStandardMaterial({
            color: colorHex,
            roughness: 0.5,
          });
        }
        return cityMatCache[colorHex];
      };

      const glassCityMat = new THREE.MeshStandardMaterial({
        color: '#60A5FA',
        roughness: 0.2,
        metalness: 0.5,
      });

      // Outer blocks surrounding the campus (East, West, North, South)
      interface CityBlockDef {
        x: number;
        z: number;
        w: number;
        h: number;
        d: number;
        color: string;
      }

      const outerBlocks: CityBlockDef[] = [
        // West outer urban corridor
        { x: -44, z: -20, w: 14, h: 14, d: 18, color: '#FFFFFF' },
        { x: -44, z: 0, w: 14, h: 19, d: 16, color: '#F8FAFC' },
        { x: -44, z: 20, w: 14, h: 12, d: 18, color: '#E2E8F0' },
        { x: -62, z: -10, w: 16, h: 26, d: 24, color: '#CBD5E1' },
        { x: -62, z: 15, w: 16, h: 22, d: 22, color: '#FFFFFF' },

        // East outer urban corridor
        { x: 44, z: -20, w: 14, h: 16, d: 18, color: '#FFFFFF' },
        { x: 44, z: 0, w: 14, h: 22, d: 16, color: '#F1F5F9' },
        { x: 44, z: 20, w: 14, h: 13, d: 18, color: '#FFFFFF' },
        { x: 62, z: -10, w: 16, h: 28, d: 24, color: '#E0F2FE' },
        { x: 62, z: 15, w: 16, h: 20, d: 22, color: '#CBD5E1' },

        // North horizon skyline
        { x: -35, z: -55, w: 18, h: 24, d: 16, color: '#CBD5E1' },
        { x: 0, z: -58, w: 22, h: 16, d: 14, color: '#FFFFFF' },
        { x: 35, z: -55, w: 18, h: 26, d: 16, color: '#F1F5F9' },

        // South horizon skyline
        { x: -35, z: 55, w: 18, h: 20, d: 16, color: '#F8FAFC' },
        { x: 0, z: 58, w: 22, h: 15, d: 14, color: '#CBD5E1' },
        { x: 35, z: 55, w: 18, h: 24, d: 16, color: '#FFFFFF' },
      ];

      outerBlocks.forEach((b) => {
        const blockGroup = new THREE.Group();
        blockGroup.position.set(b.x, 0, b.z);

        const geo = new THREE.BoxGeometry(b.w, b.h, b.d);
        const mat = getCityMat(b.color);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.y = b.h / 2;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        blockGroup.add(mesh);

        // Window band accents
        const bandCount = Math.floor(b.h / 3);
        for (let i = 1; i <= bandCount; i++) {
          const bandGeo = new THREE.BoxGeometry(b.w + 0.1, 0.8, b.d + 0.1);
          const band = new THREE.Mesh(bandGeo, glassCityMat);
          band.position.y = i * 2.8;
          blockGroup.add(band);
        }

        // Rooftop terrace parapet
        const roofGeo = new THREE.BoxGeometry(b.w * 0.5, 1.2, b.d * 0.5);
        const roofMesh = new THREE.Mesh(roofGeo, getCityMat(palette.roofGraphite));
        roofMesh.position.y = b.h + 0.6;
        blockGroup.add(roofMesh);

        cityGroup.add(blockGroup);
      });

      campusRoot.add(cityGroup);
    };

    createUrbanFrame();

    // =========================================================================
    // 5. ARCHITECTURAL MODELS OF CAMPUS BUILDINGS (CUSTOM STYLING)
    // =========================================================================
    const buildingMeshes: THREE.Mesh[] = [];
    const highlightPins: Record<string, THREE.Group> = {};
    const highlightHalos: Record<string, THREE.Mesh> = {};

    buildings.forEach((b) => {
      const group = new THREE.Group();
      const [bx, by, bz] = b.position3D;
      const [bw, bh, bd] = b.dimensions3D;

      group.position.set(bx, by, bz);
      group.userData = { buildingId: b.id, name: b.name, code: b.code };

      // Base Podium (elevated plaza level)
      const podiumGeo = new THREE.BoxGeometry(bw + 1.6, 0.45, bd + 1.6);
      const podiumMat = new THREE.MeshStandardMaterial({
        color: '#FFFFFF',
        roughness: 0.6,
      });
      const podium = new THREE.Mesh(podiumGeo, podiumMat);
      podium.position.y = 0.225;
      podium.receiveShadow = true;
      group.add(podium);

      // Glass Material for Facades
      const glassMat = new THREE.MeshStandardMaterial({
        color: '#38BDF8',
        roughness: 0.15,
        metalness: 0.75,
      });

      const frameMat = new THREE.MeshStandardMaterial({
        color: '#FFFFFF',
        roughness: 0.3,
      });

      const primaryColorMat = new THREE.MeshStandardMaterial({
        color: b.colorHex || palette.foliumNavy,
        roughness: 0.4,
      });

      // Clickable Raycast Body Reference
      let raycastBody: THREE.Mesh;

      // SPECIFIC ARCHITECTURAL STYLES
      if (b.id === 'bloco-a') {
        // Bloco A: Academic Glass & Engineering with horizontal louvers & cantilever
        const coreGeo = new THREE.BoxGeometry(bw, bh, bd);
        const coreMesh = new THREE.Mesh(coreGeo, frameMat);
        coreMesh.position.y = bh / 2 + 0.45;
        coreMesh.castShadow = true;
        coreMesh.receiveShadow = true;
        group.add(coreMesh);
        raycastBody = coreMesh;

        // Horizontal glass ribbons & sunshades (brise-soleil)
        const floors = 3;
        for (let f = 1; f <= floors; f++) {
          const yFloor = f * (bh / floors) - 0.5;
          const ribbonGeo = new THREE.BoxGeometry(bw + 0.4, 0.9, bd + 0.4);
          const ribbon = new THREE.Mesh(ribbonGeo, glassMat);
          ribbon.position.y = yFloor;
          group.add(ribbon);

          // Overhanging sunshade louver
          const louverGeo = new THREE.BoxGeometry(bw + 0.9, 0.15, bd + 0.9);
          const louver = new THREE.Mesh(louverGeo, primaryColorMat);
          louver.position.y = yFloor + 0.5;
          louver.castShadow = true;
          group.add(louver);
        }

        // Entrance Canopy facing East (towards central boulevard, X positive relative to building)
        const canopy = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.3, 4.5), primaryColorMat);
        canopy.position.set(bw / 2 + 1.4, 2.4, 0);
        canopy.castShadow = true;
        group.add(canopy);

        // Entrance pillars
        const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.4, 12), frameMat);
        p1.position.set(bw / 2 + 2.8, 1.2, -1.8);
        group.add(p1);
        const p2 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.4, 12), frameMat);
        p2.position.set(bw / 2 + 2.8, 1.2, 1.8);
        group.add(p2);
      } else if (b.id === 'bloco-b') {
        // Bloco B: Tech Pavilion & Information Networks with high-tech curtain wall
        const coreGeo = new THREE.BoxGeometry(bw, bh, bd);
        const coreMesh = new THREE.Mesh(coreGeo, glassMat);
        coreMesh.position.y = bh / 2 + 0.45;
        coreMesh.castShadow = true;
        coreMesh.receiveShadow = true;
        group.add(coreMesh);
        raycastBody = coreMesh;

        // White structural exoskeleton frames
        const frameGeo = new THREE.BoxGeometry(bw + 0.3, bh + 0.1, bd + 0.3);
        const wireMat = new THREE.MeshStandardMaterial({
          color: '#FFFFFF',
          wireframe: true,
          wireframeLinewidth: 2,
        });
        const exoMesh = new THREE.Mesh(frameGeo, wireMat);
        exoMesh.position.y = bh / 2 + 0.45;
        group.add(exoMesh);

        // Double-height illuminated atrium entrance facing West (towards central boulevard)
        const atrium = new THREE.Mesh(new THREE.BoxGeometry(3.4, 3.2, 4.8), frameMat);
        atrium.position.set(-bw / 2 - 1.2, 1.6, 0);
        atrium.castShadow = true;
        group.add(atrium);

        // Rooftop tech antennas & satellite dish
        const antennaGeo = new THREE.CylinderGeometry(0.06, 0.08, 3.2, 8);
        const ant1 = new THREE.Mesh(antennaGeo, primaryColorMat);
        ant1.position.set(2, bh + 2.0, 2);
        group.add(ant1);
        const ant2 = new THREE.Mesh(antennaGeo, primaryColorMat);
        ant2.position.set(-2, bh + 1.8, -2);
        group.add(ant2);
      } else if (b.id === 'bloco-c') {
        // Bloco C: Contemporary Laboratory & Robotics (modular volumes & workshop bays)
        const coreGeo = new THREE.BoxGeometry(bw, bh, bd);
        const coreMesh = new THREE.Mesh(coreGeo, frameMat);
        coreMesh.position.y = bh / 2 + 0.45;
        coreMesh.castShadow = true;
        coreMesh.receiveShadow = true;
        group.add(coreMesh);
        raycastBody = coreMesh;

        // Contrasting graphite service accents
        const ductGeo = new THREE.BoxGeometry(1.8, bh + 1.2, bd * 0.4);
        const duct = new THREE.Mesh(ductGeo, primaryColorMat);
        duct.position.set(-bw * 0.35, bh / 2 + 0.6, 0);
        duct.castShadow = true;
        group.add(duct);

        // Glazed makerspace garage entrance facing East
        const workshopCanopy = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.25, 4.2), primaryColorMat);
        workshopCanopy.position.set(bw / 2 + 1.2, 2.2, 0);
        workshopCanopy.castShadow = true;
        group.add(workshopCanopy);
      } else if (b.id === 'biblioteca') {
        // Biblioteca Central (BCU): Monumental glass atrium, grand portico, lantern skylight
        const coreGeo = new THREE.BoxGeometry(bw, bh, bd);
        const coreMesh = new THREE.Mesh(coreGeo, frameMat);
        coreMesh.position.y = bh / 2 + 0.45;
        coreMesh.castShadow = true;
        coreMesh.receiveShadow = true;
        group.add(coreMesh);
        raycastBody = coreMesh;

        // Raised Central Skylight / Lantern Atrium
        const lanternGeo = new THREE.BoxGeometry(bw * 0.55, 1.8, bd * 0.55);
        const lantern = new THREE.Mesh(lanternGeo, glassMat);
        lantern.position.set(0, bh + 1.35, 0);
        lantern.castShadow = true;
        group.add(lantern);

        // Monumental Portico Entrance facing West (towards central boulevard)
        const porticoGeo = new THREE.BoxGeometry(3.6, 4.4, 5.2);
        const portico = new THREE.Mesh(porticoGeo, primaryColorMat);
        portico.position.set(-bw / 2 - 1.2, 2.2, 0);
        portico.castShadow = true;
        group.add(portico);

        // Portico wide entrance steps
        const stepsGeo = new THREE.BoxGeometry(1.8, 0.4, 4.6);
        const steps = new THREE.Mesh(stepsGeo, frameMat);
        steps.position.set(-bw / 2 - 2.8, 0.2, 0);
        steps.receiveShadow = true;
        group.add(steps);
      } else if (b.id === 'reitoria') {
        // Reitoria PR-ADM: Stately civic centerpiece, grand colonnade, clock tower
        const coreGeo = new THREE.BoxGeometry(bw, bh, bd);
        const coreMesh = new THREE.Mesh(coreGeo, frameMat);
        coreMesh.position.y = bh / 2 + 0.45;
        coreMesh.castShadow = true;
        coreMesh.receiveShadow = true;
        group.add(coreMesh);
        raycastBody = coreMesh;

        // Front Colonnade Pillars facing South (towards boulevard)
        const colCount = 6;
        const colSpacing = (bw - 3) / (colCount - 1);
        for (let i = 0; i < colCount; i++) {
          const colX = -bw / 2 + 1.5 + i * colSpacing;
          const col = new THREE.Mesh(new THREE.BoxGeometry(0.5, bh - 0.4, 0.5), primaryColorMat);
          col.position.set(colX, bh / 2 + 0.45, bd / 2 + 0.4);
          col.castShadow = true;
          group.add(col);
        }

        // Clock / Emblem Tower on Rooftop
        const towerGeo = new THREE.BoxGeometry(3.8, 3.2, 3.8);
        const tower = new THREE.Mesh(towerGeo, primaryColorMat);
        tower.position.set(0, bh + 2.0, 0);
        tower.castShadow = true;
        group.add(tower);

        // Gold Emblem Accent
        const emblemGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.15, 16);
        const emblemMat = new THREE.MeshStandardMaterial({ color: '#F59E0B', metalness: 0.8 });
        const emblem = new THREE.Mesh(emblemGeo, emblemMat);
        emblem.rotation.x = Math.PI / 2;
        emblem.position.set(0, bh + 2.0, 2.0);
        group.add(emblem);
      } else {
        // Centro de Convivência (CC-VIV): Open airy terrace pavilion, glass dining hall
        const coreGeo = new THREE.BoxGeometry(bw, bh, bd);
        const coreMesh = new THREE.Mesh(coreGeo, frameMat);
        coreMesh.position.y = bh / 2 + 0.45;
        coreMesh.castShadow = true;
        coreMesh.receiveShadow = true;
        group.add(coreMesh);
        raycastBody = coreMesh;

        // Floor to ceiling glass dining front facing North (towards plaza)
        const diningGlass = new THREE.Mesh(new THREE.BoxGeometry(bw - 1.2, bh - 0.8, 0.4), glassMat);
        diningGlass.position.set(0, bh / 2 + 0.45, -bd / 2 - 0.1);
        group.add(diningGlass);

        // Outdoor Pergola Dining Terrace
        const terraceGeo = new THREE.BoxGeometry(bw * 0.7, 0.25, 4.5);
        const terrace = new THREE.Mesh(terraceGeo, new THREE.MeshStandardMaterial({ color: palette.woodDeck }));
        terrace.position.set(0, 0.25, -bd / 2 - 2.8);
        terrace.receiveShadow = true;
        group.add(terrace);

        // Terrace Parasols / Umbrellas
        [-3.5, 3.5].forEach((ux) => {
          const umbrellaPole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.2, 8), frameMat);
          umbrellaPole.position.set(ux, 1.2, -bd / 2 - 2.8);
          group.add(umbrellaPole);

          const umbrellaTop = new THREE.Mesh(
            new THREE.ConeGeometry(1.4, 0.6, 8),
            new THREE.MeshStandardMaterial({ color: '#F59E0B' })
          );
          umbrellaTop.position.set(ux, 2.4, -bd / 2 - 2.8);
          umbrellaTop.castShadow = true;
          group.add(umbrellaTop);
        });
      }

      // Configure Raycasting Data
      raycastBody.userData = { buildingId: b.id, name: b.name, code: b.code };
      buildingMeshes.push(raycastBody);

      // Building Outline Highlight Halo
      const haloGeo = new THREE.BoxGeometry(bw + 0.6, bh + 0.6, bd + 0.6);
      const haloMat = new THREE.MeshBasicMaterial({
        color: '#2563EB',
        transparent: true,
        opacity: 0.3,
        wireframe: true,
      });
      const haloMesh = new THREE.Mesh(haloGeo, haloMat);
      haloMesh.position.y = bh / 2 + 0.45;
      haloMesh.visible = false;
      group.add(haloMesh);
      highlightHalos[b.id] = haloMesh;

      // Permanent Institutional Code Badge (High Elevation Sprite)
      const labelSprite = createLabelSprite(b.code, b.shortName);
      labelSprite.position.set(0, bh + 2.8, 0);
      group.add(labelSprite);

      // Selected Pin Marker Group (Pulsing 3D Diamond / Arrow)
      const pinGroup = new THREE.Group();
      pinGroup.position.set(0, bh + 4.2, 0);
      pinGroup.visible = false;

      const pinGeo = new THREE.OctahedronGeometry(1.1, 0);
      const pinMat = new THREE.MeshStandardMaterial({
        color: '#2563EB',
        emissive: '#1D4ED8',
        emissiveIntensity: 0.9,
        roughness: 0.1,
        metalness: 0.6,
      });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinGroup.add(pinMesh);

      // Destination Pulsing Ground Ring
      const ringGeo = new THREE.RingGeometry(1.6, 2.1, 32);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: '#3B82F6',
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.y = -3.8;
      pinGroup.add(ringMesh);

      group.add(pinGroup);
      highlightPins[b.id] = pinGroup;

      campusRoot.add(group);
    });

    // =========================================================================
    // 6. ROUTE LINE VISUALIZATION
    // =========================================================================
    const routeLineGroup = new THREE.Group();
    scene.add(routeLineGroup);

    const updateRouteVisual = (buildingId: string | null) => {
      while (routeLineGroup.children.length > 0) {
        const obj = routeLineGroup.children[0];
        routeLineGroup.remove(obj);
        if (obj instanceof THREE.Line) {
          obj.geometry.dispose();
          (obj.material as THREE.Material).dispose();
        } else if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          (obj.material as THREE.Material).dispose();
        }
      }

      if (!buildingId) return;

      const pathData = getCampusPath(buildingId);
      if (!pathData || pathData.points3D.length < 2) return;

      const pts = pathData.points3D.map(([px, py, pz]) => new THREE.Vector3(px, py + 0.08, pz));
      const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const lineMat = new THREE.LineDashedMaterial({
        color: '#2563EB',
        dashSize: 1.4,
        gapSize: 0.6,
        linewidth: 4,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      line.computeLineDistances();
      routeLineGroup.add(line);

      // Start and End Points
      pts.forEach((pt, idx) => {
        if (idx === 0 || idx === pts.length - 1) {
          const markerGeo = new THREE.CylinderGeometry(0.75, 0.75, 0.18, 24);
          const markerMat = new THREE.MeshBasicMaterial({
            color: idx === 0 ? '#10B981' : '#2563EB',
            transparent: true,
            opacity: 0.95,
          });
          const marker = new THREE.Mesh(markerGeo, markerMat);
          marker.position.copy(pt);
          routeLineGroup.add(marker);
        }
      });
    };

    updateRouteVisual(selectedBuildingIdRef.current);

    // =========================================================================
    // 7. INTERACTION: THE SIMS CAMERA CONTROLLER & RAYCASTING
    // =========================================================================
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-999, -999);
    let hoveredMesh: THREE.Mesh | null = null;

    let isPointerDown = false;
    let pointerButton = 0; // 0 = left (orbit), 2 = right (pan)
    let prevPointerX = 0;
    let prevPointerY = 0;
    let touchStartDistance = 0;
    let hasMovedSignificantly = false;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isPointerDown = true;
      hasMovedSignificantly = false;

      if ('touches' in e) {
        if (e.touches.length === 1) {
          prevPointerX = e.touches[0].clientX;
          prevPointerY = e.touches[0].clientY;
        } else if (e.touches.length === 2) {
          touchStartDistance = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
        }
      } else {
        pointerButton = e.button;
        prevPointerX = e.clientX;
        prevPointerY = e.clientY;
      }
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      // Two-finger Pinch Zoom (Mobile)
      if ('touches' in e && e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        if (touchStartDistance > 0) {
          const delta = (touchStartDistance - dist) * 0.12;
          handleZoom(delta);
        }
        touchStartDistance = dist;
        return;
      }

      if (isPointerDown) {
        const deltaX = clientX - prevPointerX;
        const deltaY = clientY - prevPointerY;
        prevPointerX = clientX;
        prevPointerY = clientY;

        if (Math.hypot(deltaX, deltaY) > 3) {
          hasMovedSignificantly = true;
        }

        const isPan =
          pointerButton === 2 || // Right mouse
          pointerButton === 1 || // Middle mouse
          ('shiftKey' in e && (e as MouseEvent).shiftKey); // Shift + Left drag

        if (isPan) {
          // Pan camera target in XZ plane relative to camera azimuth
          const panSpeed = 0.045 * (targetRadiusRef.current / 40);
          const forward = new THREE.Vector3(
            -Math.sin(cameraThetaRef.current),
            0,
            -Math.cos(cameraThetaRef.current)
          );
          const right = new THREE.Vector3(
            Math.cos(cameraThetaRef.current),
            0,
            -Math.sin(cameraThetaRef.current)
          );

          targetLookAtRef.current.addScaledVector(right, -deltaX * panSpeed);
          targetLookAtRef.current.addScaledVector(forward, -deltaY * panSpeed);

          // Clamp pan within campus perimeter
          targetLookAtRef.current.x = THREE.MathUtils.clamp(targetLookAtRef.current.x, -45, 45);
          targetLookAtRef.current.z = THREE.MathUtils.clamp(targetLookAtRef.current.z, -45, 45);
        } else {
          // Orbit camera around current focal target
          const orbitSpeed = 0.0075;
          targetThetaRef.current -= deltaX * orbitSpeed;
          targetPhiRef.current = THREE.MathUtils.clamp(
            targetPhiRef.current - deltaY * 0.005,
            0.28,
            1.35
          );
        }
      }
    };

    const onPointerUp = () => {
      // If user merely tapped/clicked without dragging, raycast to select building
      if (isPointerDown && !hasMovedSignificantly && pointerButton === 0) {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(buildingMeshes);
        if (intersects.length > 0) {
          const hit = intersects[0].object as THREE.Mesh;
          const bId = hit.userData.buildingId;
          if (bId) {
            onSelectBuildingRef.current(bId);
          }
        }
      }
      isPointerDown = false;
      touchStartDistance = 0;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 4.5 : -4.5;
      handleZoom(zoomFactor);
    };

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault(); // Prevent browser context menu so right-click pan works cleanly
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', onPointerDown);
    domEl.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    domEl.addEventListener('touchstart', onPointerDown, { passive: true });
    domEl.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);
    domEl.addEventListener('wheel', onWheel, { passive: false });
    domEl.addEventListener('contextmenu', onContextMenu);

    // Resize observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h, false);
        }
      }
    });
    resizeObserver.observe(container);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();
    let prevActiveId: string | null = null;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Update smooth The Sims camera position
      updateCamFromSpherical(0.08);

      // Smooth Day/Night Lighting Transition based on global theme
      const isNight = themeRef.current === 'dark';
      const targetSkyColor = isNight ? new THREE.Color('#0A1128') : new THREE.Color('#DCE8F4');
      (scene.background as THREE.Color).lerp(targetSkyColor, 0.08);
      if (scene.fog) {
        scene.fog.color.lerp(targetSkyColor, 0.08);
      }

      const targetSunColor = isNight ? new THREE.Color('#7DD3FC') : new THREE.Color('#FFF9E6');
      sunLight.color.lerp(targetSunColor, 0.08);
      sunLight.intensity = THREE.MathUtils.lerp(sunLight.intensity, isNight ? 0.72 : 1.85, 0.08);

      const targetAmbientColor = isNight ? new THREE.Color('#334155') : new THREE.Color('#FFFFFF');
      ambientLight.color.lerp(targetAmbientColor, 0.08);
      ambientLight.intensity = THREE.MathUtils.lerp(ambientLight.intensity, isNight ? 0.8 : 1.15, 0.08);

      const targetHemiSky = isNight ? new THREE.Color('#1E293B') : new THREE.Color('#FFFFFF');
      const targetHemiGround = isNight ? new THREE.Color('#0F172A') : new THREE.Color('#94A3B8');
      hemiLight.color.lerp(targetHemiSky, 0.08);
      hemiLight.groundColor.lerp(targetHemiGround, 0.08);

      // Check external change in selected building
      const currentActiveId = selectedBuildingIdRef.current;
      if (currentActiveId !== prevActiveId) {
        prevActiveId = currentActiveId;
        updateRouteVisual(currentActiveId);
      }

      // Hover Raycast
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(buildingMeshes);

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        if (hoveredMesh !== hit) {
          if (hoveredMesh && hoveredMesh.userData.buildingId !== currentActiveId) {
            (hoveredMesh.material as THREE.MeshStandardMaterial).emissive?.setHex(0x000000);
          }
          hoveredMesh = hit;
          if (hit.userData.buildingId !== currentActiveId) {
            (hoveredMesh.material as THREE.MeshStandardMaterial).emissive?.setHex(0x1E3A8A);
            if ((hoveredMesh.material as THREE.MeshStandardMaterial).emissiveIntensity !== undefined) {
              (hoveredMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.35;
            }
          }
          setHoveredBuildingName(hit.userData.name);
          domEl.style.cursor = 'pointer';
        }
      } else {
        if (hoveredMesh) {
          if (hoveredMesh.userData.buildingId !== currentActiveId) {
            (hoveredMesh.material as THREE.MeshStandardMaterial).emissive?.setHex(0x000000);
          }
          hoveredMesh = null;
          setHoveredBuildingName(null);
          domEl.style.cursor = 'grab';
        }
      }

      // Animate Destination Highlights (Diamond Pin & Ground Ring)
      buildings.forEach((b) => {
        const isSelected = b.id === currentActiveId;
        const pin = highlightPins[b.id];
        const halo = highlightHalos[b.id];

        if (pin) {
          pin.visible = isSelected;
          if (isSelected) {
            pin.position.y = b.dimensions3D[1] + 4.2 + Math.sin(elapsedTime * 3.5) * 0.4;
            pin.rotation.y = elapsedTime * 1.8;
          }
        }

        if (halo) {
          halo.visible = isSelected;
          if (isSelected) {
            (halo.material as THREE.MeshBasicMaterial).opacity =
              0.25 + Math.sin(elapsedTime * 4) * 0.15;
          }
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();

      domEl.removeEventListener('mousedown', onPointerDown);
      domEl.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      domEl.removeEventListener('touchstart', onPointerDown);
      domEl.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
      domEl.removeEventListener('wheel', onWheel);
      domEl.removeEventListener('contextmenu', onContextMenu);

      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      tileTexture.dispose();
      renderer.dispose();
      if (domEl.parentNode) {
        domEl.parentNode.removeChild(domEl);
      }
    };
  }, [buildings, handleZoom]);

  if (!webGlAvailable) {
    return (
      <div className="w-full h-80 sm:h-96 flex flex-col items-center justify-center bg-slate-100 rounded-2xl p-6 text-center border border-slate-200">
        <Layers className="w-12 h-12 text-[#203A65] mb-3" />
        <h4 className="text-sm font-bold text-slate-800">Visualização Simplificada do Campus</h4>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          A aceleração 3D WebGL não está disponível no dispositivo. Utilize a visualização em lista para consultar as instalações.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`relative ${className} bg-[#DCE8F4] rounded-3xl overflow-hidden border border-slate-200/90 shadow-inner group select-none`}
    >
      {/* Three.js Canvas */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Campus Orientation & Badge */}
      <div className="absolute top-3.5 left-3.5 flex items-center space-x-2 bg-white/95 backdrop-blur-xs px-3.5 py-1.5 rounded-2xl border border-slate-200/90 shadow-xs text-slate-800 text-[11px] font-bold pointer-events-none">
        <div className="w-4 h-4 rounded-full bg-[#203A65] text-white flex items-center justify-center text-[9px] font-bold shadow-2xs">
          N
        </div>
        <span>Campus Folium • The Sims Mode</span>
      </div>

      {/* Building Hover Tooltip */}
      {hoveredBuildingName && (
        <div className="absolute top-3.5 left-1/2 -translate-x-1/2 bg-[#203A65] text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-xl pointer-events-none flex items-center space-x-1.5 animate-in fade-in zoom-in-95 border border-white/20">
          <Eye className="w-3.5 h-3.5 text-amber-300" />
          <span>{hoveredBuildingName}</span>
        </div>
      )}

      {/* Destination In Route Banner */}
      {targetRoom && (
        <div className="absolute bottom-3.5 left-3.5 bg-[#203A65] text-white px-4 py-2 rounded-2xl text-xs font-medium shadow-lg flex items-center space-x-2.5 border border-white/20 backdrop-blur-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span>
            Destino em rota: <strong className="font-bold text-emerald-200">{targetRoom}</strong>
          </span>
        </div>
      )}

      {/* Floating 3D Sims-style Camera Controls */}
      <div className="absolute top-3.5 right-3.5 flex flex-col space-y-1.5 bg-white/95 backdrop-blur-xs p-1.5 rounded-2xl border border-slate-200 shadow-md">
        <button
          onClick={() => handleZoom(-6)}
          className="p-2 text-slate-700 hover:text-[#203A65] hover:bg-[#EAF0F7] rounded-xl cursor-pointer transition-colors"
          title="Aproximar (Zoom In) [Tecla +]"
          aria-label="Aproximar visualização"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleZoom(6)}
          className="p-2 text-slate-700 hover:text-[#203A65] hover:bg-[#EAF0F7] rounded-xl cursor-pointer transition-colors"
          title="Afastar (Zoom Out) [Tecla -]"
          aria-label="Afastar visualização"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleRotate(-0.15)}
          className="p-2 text-slate-700 hover:text-[#203A65] hover:bg-[#EAF0F7] rounded-xl cursor-pointer transition-colors"
          title="Girar para a esquerda [Seta Esquerda]"
          aria-label="Girar câmera para a esquerda"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleRotate(0.15)}
          className="p-2 text-slate-700 hover:text-[#203A65] hover:bg-[#EAF0F7] rounded-xl cursor-pointer transition-colors"
          title="Girar para a direita [Seta Direita]"
          aria-label="Girar câmera para a direita"
        >
          <RotateCw className="w-4 h-4" />
        </button>
        <button
          onClick={handleFocusDestination}
          className="p-2 text-slate-700 hover:text-[#203A65] hover:bg-[#EAF0F7] rounded-xl cursor-pointer transition-colors"
          title="Focar no destino [Tecla F]"
          aria-label="Focar no destino selecionado"
        >
          <Focus className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetView}
          className="p-2 text-slate-700 hover:text-[#203A65] hover:bg-[#EAF0F7] rounded-xl cursor-pointer transition-colors text-[9px] font-extrabold flex items-center justify-center"
          title="Visão Geral do Campus [Tecla Home ou R]"
          aria-label="Restaurar visão geral"
        >
          RESET
        </button>
      </div>

      {/* The Sims Control Hint on bottom right */}
      <div className="absolute bottom-3.5 right-3.5 hidden sm:flex items-center space-x-2 text-[10px] text-slate-700 bg-white/90 px-3 py-1.5 rounded-2xl backdrop-blur-xs pointer-events-none border border-slate-200/80 shadow-2xs font-medium">
        <Move className="w-3 h-3 text-[#203A65]" />
        <span>Arraste com botão esquerdo para orbitar • Botão direito / Shift para mover • Roda para zoom</span>
      </div>
    </div>
  );
};
