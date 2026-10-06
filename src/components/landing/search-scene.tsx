"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

/** Decorative geography and connections; no case, user, or inference data. */
export function SearchScene() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let disposed = false;
    let release: (() => void) | undefined;

    void Promise.all([import("three"), import("./globe-data.json")])
      .then(([THREE, { default: geography }]) => {
        if (disposed) return;
        let renderer: InstanceType<typeof THREE.WebGLRenderer>;
        try {
          renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: "low-power",
          });
        } catch {
          return;
        }
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.setClearColor(0x09090b, 0);
        renderer.domElement.setAttribute("aria-hidden", "true");
        element.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 30);
        camera.position.set(0, 0.15, 6.75);
        camera.lookAt(0, 0, 0);
        const world = new THREE.Group();
        world.rotation.z = -0.12;
        scene.add(world);
        const radius = 1.7;
        const surface = (lon: number, lat: number, r = radius) => {
          const latitude = THREE.MathUtils.degToRad(lat);
          const longitude = THREE.MathUtils.degToRad(lon);
          return new THREE.Vector3(
            r * Math.cos(latitude) * Math.sin(longitude),
            r * Math.sin(latitude),
            r * Math.cos(latitude) * Math.cos(longitude),
          );
        };

        // A solid ocean surface hides the far hemisphere and adds a restrained rim light.
        world.add(new THREE.Mesh(
          new THREE.SphereGeometry(radius, 64, 48),
          new THREE.ShaderMaterial({
            vertexShader: `varying vec3 surfaceNormal; varying vec3 viewPosition;
              void main() {
                vec4 view = modelViewMatrix * vec4(position, 1.0);
                surfaceNormal = normalize(normalMatrix * normal);
                viewPosition = view.xyz;
                gl_Position = projectionMatrix * view;
              }`,
            fragmentShader: `varying vec3 surfaceNormal; varying vec3 viewPosition;
              void main() {
                vec3 normal = normalize(surfaceNormal);
                float light = max(dot(normal, normalize(vec3(-0.55, 0.7, 1.0))), 0.0);
                float rim = pow(1.0 - max(dot(normal, normalize(-viewPosition)), 0.0), 3.5);
                vec3 ocean = mix(vec3(0.032, 0.028, 0.05), vec3(0.08, 0.064, 0.12), light);
                gl_FragColor = vec4(ocean + vec3(0.24, 0.16, 0.4) * rim * 0.55, 1.0);
              }`,
          }),
        ));
        world.add(new THREE.Mesh(
          new THREE.SphereGeometry(radius * 1.055, 48, 32),
          new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            vertexShader: `varying vec3 surfaceNormal; varying vec3 viewPosition;
              void main() {
                vec4 view = modelViewMatrix * vec4(position, 1.0);
                surfaceNormal = normalize(normalMatrix * normal);
                viewPosition = view.xyz;
                gl_Position = projectionMatrix * view;
              }`,
            fragmentShader: `varying vec3 surfaceNormal; varying vec3 viewPosition;
              void main() {
                float rim = pow(1.0 - abs(dot(normalize(surfaceNormal), normalize(-viewPosition))), 4.0);
                gl_FragColor = vec4(0.46, 0.3, 0.77, rim * 0.38);
              }`,
          }),
        ));

        const land = new THREE.BufferGeometry().setFromPoints(
          geography.points.map(([lon, lat]) => surface(lon, lat, radius + 0.013)),
        );
        const dots = new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          uniforms: { pixelRatio: { value: renderer.getPixelRatio() }, pointSize: { value: 2.2 } },
          vertexShader: `uniform float pixelRatio; uniform float pointSize; varying float facing;
            void main() {
              vec4 view = modelViewMatrix * vec4(position, 1.0);
              facing = max(dot(normalize(normalMatrix * normalize(position)), normalize(-view.xyz)), 0.0);
              gl_Position = projectionMatrix * view;
              gl_PointSize = pointSize * pixelRatio * (0.75 + facing * 0.25);
            }`,
          fragmentShader: `varying float facing;
            void main() {
              float distance = length(gl_PointCoord - vec2(0.5));
              if (distance > 0.5 || facing < 0.01) discard;
              float alpha = smoothstep(0.5, 0.24, distance) * (0.45 + facing * 0.55);
              gl_FragColor = vec4(mix(vec3(0.5, 0.42, 0.65), vec3(0.78, 0.71, 0.93), facing), alpha);
            }`,
        });
        world.add(new THREE.Points(land, dots));

        const coastPositions: number[] = [];
        for (const ring of geography.coasts) {
          for (let i = 1; i < ring.length; i++) {
            const [lon, lat] = ring[i];
            const [previousLon, previousLat] = ring[i - 1];
            if (Math.abs(lon - previousLon) > 180) continue;
            coastPositions.push(...surface(previousLon, previousLat, radius + 0.016).toArray(), ...surface(lon, lat, radius + 0.016).toArray());
          }
        }
        world.add(new THREE.LineSegments(
          new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(coastPositions, 3)),
          new THREE.LineBasicMaterial({ color: 0xb8a4dd, transparent: true, opacity: 0.23, depthWrite: false }),
        ));

        // Fine latitude/longitude lines establish geography without a wireframe cage.
        const gridPositions: number[] = [];
        for (let latitude = -60; latitude <= 60; latitude += 30) {
          for (let longitude = -180; longitude < 180; longitude += 3) {
            gridPositions.push(...surface(longitude, latitude, radius + 0.004).toArray(), ...surface(longitude + 3, latitude, radius + 0.004).toArray());
          }
        }
        for (let longitude = -180; longitude < 180; longitude += 30) {
          for (let latitude = -90; latitude < 90; latitude += 3) {
            gridPositions.push(...surface(longitude, latitude, radius + 0.004).toArray(), ...surface(longitude, latitude + 3, radius + 0.004).toArray());
          }
        }
        world.add(new THREE.LineSegments(
          new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(gridPositions, 3)),
          new THREE.LineBasicMaterial({ color: 0x8b7da3, transparent: true, opacity: 0.12, depthWrite: false }),
        ));

        const locations = [[-0.12, 51.5], [77.2, 28.6], [103.8, 1.3], [36.8, -1.3], [-74, 40.7], [151.2, -33.9]];
        const markerGeometry = new THREE.SphereGeometry(0.024, 10, 8);
        const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xddd0ff });
        const ringGeometry = new THREE.RingGeometry(0.048, 0.057, 32);
        const markerRings = locations.map(([lon, lat]) => {
          const position = surface(lon, lat, radius + 0.025);
          const marker = new THREE.Mesh(markerGeometry, markerMaterial);
          marker.position.copy(position);
          world.add(marker);
          const ring = new THREE.Mesh(ringGeometry, new THREE.MeshBasicMaterial({ color: 0xa78bfa, transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false }));
          ring.position.copy(position);
          ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), position.clone().normalize());
          world.add(ring);
          return ring;
        });

        const routeMaterial = new THREE.LineBasicMaterial({ color: 0xa78bfa, transparent: true, opacity: 0.42, depthWrite: false });
        const packetGeometry = new THREE.SphereGeometry(0.021, 8, 8);
        const glowGeometry = new THREE.SphereGeometry(0.06, 10, 8);
        const glowMaterial = new THREE.MeshBasicMaterial({ color: 0xa78bfa, transparent: true, opacity: 0.14, blending: THREE.AdditiveBlending, depthWrite: false });
        const packets = [[0, 1], [0, 4], [1, 2], [3, 1], [2, 5]].map(([from, to], index) => {
          const start = surface(...locations[from] as [number, number], 1).normalize();
          const end = surface(...locations[to] as [number, number], 1).normalize();
          const angle = Math.acos(THREE.MathUtils.clamp(start.dot(end), -1, 1));
          const vertices = Array.from({ length: 65 }, (_, i) => {
            const progress = i / 64;
            const direction = start.clone().multiplyScalar(Math.sin((1 - progress) * angle)).addScaledVector(end, Math.sin(progress * angle)).divideScalar(Math.sin(angle));
            return direction.multiplyScalar(radius + 0.025 + Math.sin(Math.PI * progress) * 0.32);
          });
          const curve = new THREE.CatmullRomCurve3(vertices);
          world.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(vertices), routeMaterial));
          const head = new THREE.Mesh(packetGeometry, markerMaterial);
          const glow = new THREE.Mesh(glowGeometry, glowMaterial);
          world.add(head, glow);
          return { curve, head, glow, offset: index * 0.19 };
        });

        let frame = 0;
        let visible = false;
        let elapsed = 0;
        let lastTime = 0;
        const pointer = new THREE.Vector2();
        const easedPointer = new THREE.Vector2();
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
        const render = (now: number) => {
          frame = 0;
          if (disposed || !visible || document.hidden) return;
          if (!reduced.matches && lastTime) elapsed += Math.max(0, Math.min((now - lastTime) / 1000, 0.05));
          lastTime = now;
          easedPointer.lerp(reduced.matches ? new THREE.Vector2() : pointer, 0.06);
          world.rotation.y = -0.44 - elapsed * 0.035 + easedPointer.x * 0.1;
          world.rotation.x = 0.12 + easedPointer.y * 0.06;
          packets.forEach(({ curve, head, glow, offset }) => {
            const position = curve.getPoint((elapsed * 0.09 + offset) % 1);
            head.position.copy(position);
            glow.position.copy(position);
          });
          markerRings.forEach((ring, i) => ring.scale.setScalar(1 + Math.sin(elapsed * 0.8 + i) * 0.12));
          renderer.render(scene, camera);
          if (!reduced.matches) frame = requestAnimationFrame(render);
        };
        const resume = () => {
          cancelAnimationFrame(frame);
          frame = 0;
          lastTime = 0;
          render(performance.now());
        };
        const resize = () => {
          const width = element.clientWidth, height = element.clientHeight;
          if (!width || !height) return;
          renderer.setSize(width, height);
          camera.aspect = width / height;
          // Keep the globe and elevated arcs inside narrow and short mobile canvases.
          camera.position.z = 6.75 / Math.min(1, camera.aspect);
          camera.updateProjectionMatrix();
          dots.uniforms.pointSize.value = height < 350 ? 1.6 : 2.2;
          resume();
        };
        const move = (event: PointerEvent) => {
          if (reduced.matches || event.pointerType !== "mouse") return;
          const box = element.getBoundingClientRect();
          pointer.set((event.clientX - box.left) / box.width - 0.5, (event.clientY - box.top) / box.height - 0.5);
        };
        const leave = () => pointer.set(0, 0);
        const visibility = new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting;
          resume();
        });
        visibility.observe(element);
        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(element);
        document.addEventListener("visibilitychange", resume);
        reduced.addEventListener("change", resume);
        element.addEventListener("pointermove", move, { passive: true });
        element.addEventListener("pointerleave", leave);
        const lost = (event: Event) => {
          event.preventDefault();
          cancelAnimationFrame(frame);
          element.dataset.webgl = "unavailable";
        };
        renderer.domElement.addEventListener("webglcontextlost", lost);
        element.dataset.webgl = "ready";
        resize();
        release = () => {
          cancelAnimationFrame(frame);
          visibility.disconnect();
          resizeObserver.disconnect();
          document.removeEventListener("visibilitychange", resume);
          reduced.removeEventListener("change", resume);
          element.removeEventListener("pointermove", move);
          element.removeEventListener("pointerleave", leave);
          renderer.domElement.removeEventListener("webglcontextlost", lost);
          const geometries = new Set<InstanceType<typeof THREE.BufferGeometry>>();
          const materials = new Set<InstanceType<typeof THREE.Material>>();
          scene.traverse((object) => {
            if (object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Points) {
              geometries.add(object.geometry);
              (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => materials.add(material));
            }
          });
          geometries.forEach(geometry => geometry.dispose());
          materials.forEach(material => material.dispose());
          renderer.dispose();
          renderer.forceContextLoss();
          renderer.domElement.remove();
          delete element.dataset.webgl;
        };
      })
      .catch(() => {
        // The local world-globe illustration remains visible if initialization fails.
        element.dataset.webgl = "unavailable";
      });

    return () => {
      disposed = true;
      release?.();
    };
  }, []);

  return (
    <div className="world-globe relative h-full w-full" aria-hidden="true">
      <div ref={host} className="scene-canvas absolute inset-0" />
      <div className="scene-fallback absolute inset-0 flex items-center justify-center">
        <Image src="/assets/world-globe.svg" alt="" width={320} height={320} loading="eager" className="fallback-world" />
      </div>
    </div>
  );
}
