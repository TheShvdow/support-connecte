import { Injectable, NgZone, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';

interface CardScene {
  renderer: THREE.WebGLRenderer;
  scene:    THREE.Scene;
  camera:   THREE.PerspectiveCamera;
  mesh:     THREE.LineSegments;
  rx: number; ry: number; rz: number;
}

@Injectable({ providedIn: 'root' })
export class CardThreeService {
  private platformId = inject(PLATFORM_ID);
  private scenes: CardScene[] = [];
  private animId = 0;
  private mouse = { x: 0, y: 0 };
  private onMove!: (e: MouseEvent) => void;

  constructor(private zone: NgZone) {}

  init(canvases: HTMLCanvasElement[]) {
    if (!isPlatformBrowser(this.platformId)) return;

    const cfgs = [
      { geo: new THREE.TorusKnotGeometry(1, 0.3, 80, 12), color: '#C41A1A', rx: 0.003, ry: 0.005, rz: 0.002, opacity: 0.25 },
      { geo: new THREE.OctahedronGeometry(1.5, 0),         color: '#0FB57E', rx: 0.005, ry: 0.003, rz: 0.004, opacity: 0.32 },
      { geo: new THREE.IcosahedronGeometry(1.4, 1),        color: '#7C3AED', rx: 0.004, ry: 0.006, rz: 0.003, opacity: 0.28 },
    ];

    this.scenes = canvases.map((canvas, i) => {
      const cfg = cfgs[i];
      const W = canvas.clientWidth  || 300;
      const H = canvas.clientHeight || 300;

      const scene  = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 100);
      camera.position.z = 4;

      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(W, H);
      renderer.setClearColor(0x000000, 0);

      const wire = new THREE.WireframeGeometry(cfg.geo);
      const mat  = new THREE.LineBasicMaterial({ color: cfg.color, opacity: cfg.opacity, transparent: true });
      const mesh = new THREE.LineSegments(wire, mat);
      scene.add(mesh);

      return { renderer, scene, camera, mesh, rx: cfg.rx, ry: cfg.ry, rz: cfg.rz };
    });

    this.onMove = (e: MouseEvent) => {
      this.mouse.x = (e.clientX / window.innerWidth  - 0.5) * 2;
      this.mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', this.onMove);
    this.zone.runOutsideAngular(() => this.loop());
  }

  private loop() {
    this.animId = requestAnimationFrame(() => this.loop());
    this.scenes.forEach(s => {
      s.mesh.rotation.x += s.rx + this.mouse.y * 0.0008;
      s.mesh.rotation.y += s.ry + this.mouse.x * 0.0008;
      s.mesh.rotation.z += s.rz;
      s.renderer.render(s.scene, s.camera);
    });
  }

  destroy() {
    if (!isPlatformBrowser(this.platformId)) return;
    cancelAnimationFrame(this.animId);
    window.removeEventListener('mousemove', this.onMove);
    this.scenes.forEach(s => {
      s.renderer.dispose();
      s.mesh.geometry.dispose();
      (s.mesh.material as THREE.LineBasicMaterial).dispose();
    });
    this.scenes = [];
  }
}
