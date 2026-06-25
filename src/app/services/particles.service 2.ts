import { Injectable, NgZone, OnDestroy } from '@angular/core';
import * as THREE from 'three';

interface Particle {
  x: number; y: number; z: number;
  vx: number; vy: number;
  ox: number; oy: number;
}

@Injectable({ providedIn: 'root' })
export class ParticlesService {
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private points!: THREE.Points;
  private particles: Particle[] = [];
  private positions!: Float32Array;
  private animId = 0;
  private mouse = { x: 0, y: 0 };
  private canvas!: HTMLCanvasElement;
  private onMouseMove!: (e: MouseEvent) => void;
  private onResize!: () => void;

  constructor(private zone: NgZone) {}

  init(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const W = canvas.clientWidth;
    const H = canvas.clientHeight;

    // Scene
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000);
    this.camera.position.z = 5;

    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(W, H);
    this.renderer.setClearColor(0x000000, 0);

    // Particles
    const COUNT = 130;
    this.positions = new Float32Array(COUNT * 3);
    this.particles = [];

    const colors = [
      new THREE.Color('#C41A1A'),
      new THREE.Color('#0FB57E'),
      new THREE.Color('#7C3AED'),
      new THREE.Color('#0F1729'),
    ];
    const colorArr = new Float32Array(COUNT * 3);

    for (let i = 0; i < COUNT; i++) {
      const px = (Math.random() - 0.5) * 14;
      const py = (Math.random() - 0.5) * 8;
      const pz = (Math.random() - 0.5) * 2;
      this.particles.push({ x: px, y: py, z: pz, vx: 0, vy: 0, ox: px, oy: py });
      this.positions[i * 3]     = px;
      this.positions[i * 3 + 1] = py;
      this.positions[i * 3 + 2] = pz;

      const c = colors[Math.floor(Math.random() * colors.length)];
      colorArr[i * 3]     = c.r;
      colorArr[i * 3 + 1] = c.g;
      colorArr[i * 3 + 2] = c.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colorArr, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.07,
      vertexColors: true,
      transparent: true,
      opacity: 0.55,
      sizeAttenuation: true,
    });

    this.points = new THREE.Points(geo, mat);
    this.scene.add(this.points);

    // Events
    this.onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
      this.mouse.y = -((e.clientY - rect.top)  / rect.height - 0.5) * 2;
    };
    this.onResize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    };
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('resize', this.onResize);

    this.zone.runOutsideAngular(() => this.loop());
  }

  private loop() {
    this.animId = requestAnimationFrame(() => this.loop());

    const pos = this.points.geometry.attributes['position'].array as Float32Array;
    const t = Date.now() * 0.0004;

    this.particles.forEach((p, i) => {
      // Slow drift
      p.x = p.ox + Math.sin(t + i * 0.4) * 0.18;
      p.y = p.oy + Math.cos(t + i * 0.3) * 0.14;

      // Mouse repulsion
      const dx = p.x - this.mouse.x * 6;
      const dy = p.y - this.mouse.y * 4;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 1.5) {
        const force = (1.5 - dist) / 1.5 * 0.4;
        p.x += (dx / dist) * force;
        p.y += (dy / dist) * force;
      }

      pos[i * 3]     = p.x;
      pos[i * 3 + 1] = p.y;
      pos[i * 3 + 2] = p.z;
    });

    this.points.geometry.attributes['position'].needsUpdate = true;
    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    cancelAnimationFrame(this.animId);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('resize', this.onResize);
    this.renderer?.dispose();
    this.points?.geometry.dispose();
    (this.points?.material as THREE.PointsMaterial).dispose();
  }
}
