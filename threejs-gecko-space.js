/**
 * Enhanced Three.js Visualizer with Gecko/Space Theme
 * Features floating gecko models, space particles, and cosmic background
 */

class GeckoSpaceVisualizer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        
        // Animation elements
        this.geckoModels = [];
        this.spaceParticles = null;
        this.cosmicRings = [];
        this.floatingOrbs = [];
        this.starField = null;
        
        // Testbed components (existing)
        this.testbed = {
            base: null,
            xAxis: null,
            yAxis: null,
            zAxis: null,
            sample: null,
            forceSensor: null
        };
        
        // Animation settings
        this.animationSpeed = 1.0;
        this.isAnimated = true;
        this.clock = new THREE.Clock();
        
        this.init();
    }
    
    init() {
        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.createLights();
        this.createControls();
        this.createSpaceEnvironment();
        this.createTestbed();
        this.createGeckoAnimations();
        this.startAnimation();
        
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    createScene() {
        this.scene = new THREE.Scene();
        
        // Space-themed background
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        
        // Create nebula-like gradient
        const gradient = ctx.createRadialGradient(512, 512, 0, 512, 512, 512);
        gradient.addColorStop(0, '#1a0033');
        gradient.addColorStop(0.3, '#0f0023');
        gradient.addColorStop(0.6, '#0a001a');
        gradient.addColorStop(1, '#000000');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1024, 1024);
        
        // Add stars
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * 1024;
            const y = Math.random() * 1024;
            const size = Math.random() * 3 + 1;
            const alpha = Math.random() * 0.8 + 0.2;
            
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.fillRect(x, y, size, size);
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        this.scene.background = texture;
        
        // Space fog
        this.scene.fog = new THREE.FogExp2(0x000011, 0.005);
    }
    
    createCamera() {
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
        this.camera.position.set(20, 15, 20);
        this.camera.lookAt(0, 5, 0);
    }
    
    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // Enhanced rendering for space theme
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.5;
        
        this.container.appendChild(this.renderer.domElement);
    }
    
    createLights() {
        // Ambient space lighting
        const ambientLight = new THREE.AmbientLight(0x4a4a8a, 0.3);
        this.scene.add(ambientLight);
        
        // Main directional light (like a distant star)
        const starlight = new THREE.DirectionalLight(0xffffff, 1.2);
        starlight.position.set(15, 20, 10);
        starlight.castShadow = true;
        starlight.shadow.mapSize.width = 2048;
        starlight.shadow.mapSize.height = 2048;
        this.scene.add(starlight);
        
        // Colored accent lights for space atmosphere
        const blueLight = new THREE.PointLight(0x4466ff, 0.6, 30);
        blueLight.position.set(-15, 10, -15);
        this.scene.add(blueLight);
        
        const purpleLight = new THREE.PointLight(0x8844ff, 0.4, 25);
        purpleLight.position.set(15, 8, 15);
        this.scene.add(purpleLight);
        
        // Gecko-themed green accent
        const geckoLight = new THREE.PointLight(0x44ff44, 0.3, 20);
        geckoLight.position.set(0, 12, 0);
        this.scene.add(geckoLight);
    }
    
    createControls() {
        if (typeof THREE.OrbitControls !== 'undefined') {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.maxDistance = 100;
            this.controls.minDistance = 8;
            this.controls.maxPolarAngle = Math.PI * 0.8;
            this.controls.autoRotate = false;
            this.controls.autoRotateSpeed = 0.2;
        }
    }
    
    createSpaceEnvironment() {
        // Create floating space particles
        this.createSpaceParticles();
        
        // Create cosmic rings around the scene
        this.createCosmicRings();
        
        // Create floating energy orbs
        this.createFloatingOrbs();
        
        // Create ground with space theme
        this.createSpaceGround();
    }
    
    createSpaceParticles() {
        const particleCount = 1000;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        for (let i = 0; i < particleCount; i++) {
            // Distribute particles in a large sphere around the scene
            const radius = 80 + Math.random() * 40;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.cos(phi);
            positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
            
            // Space colors: blues, purples, whites
            const colorType = Math.random();
            if (colorType < 0.4) {
                colors[i * 3] = 0.2 + Math.random() * 0.3; // R
                colors[i * 3 + 1] = 0.4 + Math.random() * 0.4; // G
                colors[i * 3 + 2] = 0.8 + Math.random() * 0.2; // B (blue)
            } else if (colorType < 0.7) {
                colors[i * 3] = 0.6 + Math.random() * 0.4; // R (purple)
                colors[i * 3 + 1] = 0.2 + Math.random() * 0.3; // G
                colors[i * 3 + 2] = 0.8 + Math.random() * 0.2; // B
            } else {
                colors[i * 3] = 0.8 + Math.random() * 0.2; // R (white)
                colors[i * 3 + 1] = 0.8 + Math.random() * 0.2; // G
                colors[i * 3 + 2] = 0.8 + Math.random() * 0.2; // B
            }
            
            sizes[i] = Math.random() * 3 + 1;
        }
        
        const particleGeometry = new THREE.BufferGeometry();
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const particleMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 }
            },
            vertexShader: `
                attribute float size;
                attribute vec3 color;
                varying vec3 vColor;
                uniform float time;
                
                void main() {
                    vColor = color;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * (300.0 / -mvPosition.z) * (1.0 + sin(time + position.x * 0.01) * 0.3);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                
                void main() {
                    float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
                    float alpha = 1.0 - smoothstep(0.0, 0.5, distanceToCenter);
                    gl_FragColor = vec4(vColor, alpha * 0.6);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            vertexColors: true
        });
        
        this.spaceParticles = new THREE.Points(particleGeometry, particleMaterial);
        this.scene.add(this.spaceParticles);
    }
    
    createCosmicRings() {
        for (let i = 0; i < 3; i++) {
            const ringGeometry = new THREE.RingGeometry(25 + i * 8, 26 + i * 8, 64);
            const ringMaterial = new THREE.MeshBasicMaterial({
                color: i === 0 ? 0x4466ff : i === 1 ? 0x8844ff : 0x44ff88,
                transparent: true,
                opacity: 0.1,
                side: THREE.DoubleSide
            });
            
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.5;
            ring.rotation.z = Math.random() * Math.PI * 2;
            ring.position.y = (Math.random() - 0.5) * 10;
            
            this.cosmicRings.push(ring);
            this.scene.add(ring);
        }
    }
    
    createFloatingOrbs() {
        for (let i = 0; i < 5; i++) {
            const orbGeometry = new THREE.SphereGeometry(0.5, 16, 12);
            const orbMaterial = new THREE.MeshBasicMaterial({
                color: Math.random() > 0.5 ? 0x44ff88 : 0x4466ff,
                transparent: true,
                opacity: 0.3
            });
            
            const orb = new THREE.Mesh(orbGeometry, orbMaterial);
            orb.position.set(
                (Math.random() - 0.5) * 40,
                Math.random() * 20 + 5,
                (Math.random() - 0.5) * 40
            );
            
            // Add orbital motion data
            orb.userData = {
                orbitRadius: 15 + Math.random() * 10,
                orbitSpeed: 0.01 + Math.random() * 0.02,
                orbitAngle: Math.random() * Math.PI * 2,
                bobSpeed: 0.02 + Math.random() * 0.03,
                bobAmount: 2 + Math.random() * 3
            };
            
            this.floatingOrbs.push(orb);
            this.scene.add(orb);
        }
    }
    
    createSpaceGround() {
        // Space platform with energy grid
        const groundGeometry = new THREE.PlaneGeometry(80, 80, 20, 20);
        const groundMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                color1: { value: new THREE.Color(0x001122) },
                color2: { value: new THREE.Color(0x002244) }
            },
            vertexShader: `
                varying vec2 vUv;
                uniform float time;
                
                void main() {
                    vUv = uv;
                    vec3 pos = position;
                    pos.z += sin(pos.x * 0.1 + time) * 0.2 + cos(pos.y * 0.1 + time) * 0.2;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                varying vec2 vUv;
                uniform float time;
                uniform vec3 color1;
                uniform vec3 color2;
                
                void main() {
                    vec2 grid = abs(fract(vUv * 10.0) - 0.5);
                    float line = smoothstep(0.0, 0.05, min(grid.x, grid.y));
                    
                    vec3 color = mix(color1, color2, sin(time * 0.5) * 0.5 + 0.5);
                    color += (1.0 - line) * 0.3;
                    
                    gl_FragColor = vec4(color, 0.7);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide
        });
        
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -3;
        ground.receiveShadow = true;
        this.scene.add(ground);
        
        // Store reference for animation
        this.spaceGround = ground;
    }
    
    createGeckoAnimations() {
        // Create simplified gecko-inspired floating elements
        this.createGeckoSpirits();
    }
    
    createGeckoSpirits() {
        // Create floating gecko-spirit entities
        for (let i = 0; i < 3; i++) {
            const spiritGroup = new THREE.Group();
            
            // Main body (elongated sphere)
            const bodyGeometry = new THREE.SphereGeometry(0.6, 12, 8);
            bodyGeometry.scale(1.5, 0.8, 1);
            const bodyMaterial = new THREE.MeshLambertMaterial({
                color: 0x44ff88,
                transparent: true,
                opacity: 0.4,
                emissive: 0x002200,
                emissiveIntensity: 0.3
            });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            spiritGroup.add(body);
            
            // Tail
            const tailGeometry = new THREE.ConeGeometry(0.2, 2, 8);
            const tailMaterial = new THREE.MeshLambertMaterial({
                color: 0x44ff88,
                transparent: true,
                opacity: 0.3,
                emissive: 0x002200,
                emissiveIntensity: 0.2
            });
            const tail = new THREE.Mesh(tailGeometry, tailMaterial);
            tail.position.set(-1.2, 0, 0);
            tail.rotation.z = Math.PI / 2;
            spiritGroup.add(tail);
            
            // Glowing spots
            for (let j = 0; j < 4; j++) {
                const spotGeometry = new THREE.SphereGeometry(0.1, 8, 6);
                const spotMaterial = new THREE.MeshBasicMaterial({
                    color: 0x88ffaa,
                    transparent: true,
                    opacity: 0.8
                });
                const spot = new THREE.Mesh(spotGeometry, spotMaterial);
                spot.position.set(
                    (Math.random() - 0.5) * 1.5,
                    (Math.random() - 0.5) * 0.8,
                    (Math.random() - 0.5) * 1
                );
                spiritGroup.add(spot);
            }
            
            // Position the spirit
            spiritGroup.position.set(
                (Math.random() - 0.5) * 30,
                8 + Math.random() * 10,
                (Math.random() - 0.5) * 30
            );
            
            // Add movement data
            spiritGroup.userData = {
                speed: 0.005 + Math.random() * 0.01,
                amplitude: 3 + Math.random() * 2,
                phase: Math.random() * Math.PI * 2,
                rotationSpeed: 0.02 + Math.random() * 0.01
            };
            
            this.geckoModels.push(spiritGroup);
            this.scene.add(spiritGroup);
        }
    }
    
    createTestbed() {
        // Create enhanced testbed with space theme
        const baseGeometry = new THREE.BoxGeometry(16, 1, 12);
        const baseMaterial = new THREE.MeshLambertMaterial({
            color: 0x2d2d44,
            emissive: 0x001122,
            emissiveIntensity: 0.1
        });
        
        this.testbed.base = new THREE.Mesh(baseGeometry, baseMaterial);
        this.testbed.base.position.y = -2;
        this.testbed.base.castShadow = true;
        this.testbed.base.receiveShadow = true;
        this.scene.add(this.testbed.base);
        
        // Create axis systems with enhanced materials
        this.createEnhancedAxes();
    }
    
    createEnhancedAxes() {
        // X-Axis with glow effect
        const xRailGeometry = new THREE.BoxGeometry(12, 0.4, 0.4);
        const xRailMaterial = new THREE.MeshLambertMaterial({
            color: 0x06b6d4,
            emissive: 0x003344,
            emissiveIntensity: 0.2
        });
        
        const xRail = new THREE.Mesh(xRailGeometry, xRailMaterial);
        xRail.position.set(0, 3, -3);
        xRail.castShadow = true;
        this.scene.add(xRail);
        
        // X-Axis Carriage
        const xCarriageGeometry = new THREE.BoxGeometry(1, 0.8, 0.8);
        const xCarriageMaterial = new THREE.MeshLambertMaterial({
            color: 0x3b82f6,
            emissive: 0x001122,
            emissiveIntensity: 0.3
        });
        
        this.testbed.xAxis = new THREE.Mesh(xCarriageGeometry, xCarriageMaterial);
        this.testbed.xAxis.position.set(0, 3, -3);
        this.testbed.xAxis.castShadow = true;
        this.scene.add(this.testbed.xAxis);
        
        // Similar enhancements for Y and Z axes...
        this.createYAxis();
        this.createZAxis();
        this.createForceSensor();
    }
    
    createYAxis() {
        const yRailGeometry = new THREE.BoxGeometry(0.4, 0.4, 8);
        const yRailMaterial = new THREE.MeshLambertMaterial({
            color: 0x10b981,
            emissive: 0x002200,
            emissiveIntensity: 0.2
        });
        
        const yRail = new THREE.Mesh(yRailGeometry, yRailMaterial);
        yRail.position.set(0, 3.5, 0);
        yRail.castShadow = true;
        this.scene.add(yRail);
        
        const yCarriageGeometry = new THREE.BoxGeometry(0.8, 0.8, 1);
        const yCarriageMaterial = new THREE.MeshLambertMaterial({
            color: 0x059669,
            emissive: 0x001100,
            emissiveIntensity: 0.3
        });
        
        this.testbed.yAxis = new THREE.Mesh(yCarriageGeometry, yCarriageMaterial);
        this.testbed.yAxis.position.set(0, 3.5, 0);
        this.testbed.yAxis.castShadow = true;
        this.scene.add(this.testbed.yAxis);
    }
    
    createZAxis() {
        const zRailGeometry = new THREE.BoxGeometry(0.4, 8, 0.4);
        const zRailMaterial = new THREE.MeshLambertMaterial({
            color: 0xf59e0b,
            emissive: 0x221100,
            emissiveIntensity: 0.2
        });
        
        const zRail = new THREE.Mesh(zRailGeometry, zRailMaterial);
        zRail.position.set(0, 7, 0);
        zRail.castShadow = true;
        this.scene.add(zRail);
        
        const zCarriageGeometry = new THREE.BoxGeometry(1, 0.8, 1);
        const zCarriageMaterial = new THREE.MeshLambertMaterial({
            color: 0xd97706,
            emissive: 0x110800,
            emissiveIntensity: 0.3
        });
        
        this.testbed.zAxis = new THREE.Mesh(zCarriageGeometry, zCarriageMaterial);
        this.testbed.zAxis.position.set(0, 5, 0);
        this.testbed.zAxis.castShadow = true;
        this.scene.add(this.testbed.zAxis);
    }
    
    createForceSensor() {
        const sensorGeometry = new THREE.CylinderGeometry(0.6, 0.6, 0.3);
        const sensorMaterial = new THREE.MeshLambertMaterial({
            color: 0x8b5cf6,
            emissive: 0x220044,
            emissiveIntensity: 0.4,
            transparent: true,
            opacity: 0.8
        });
        
        this.testbed.forceSensor = new THREE.Mesh(sensorGeometry, sensorMaterial);
        this.testbed.forceSensor.position.set(0, 4.2, 0);
        this.testbed.forceSensor.castShadow = true;
        this.scene.add(this.testbed.forceSensor);
    }
    
    startAnimation() {
        const animate = () => {
            requestAnimationFrame(animate);
            
            const delta = this.clock.getDelta();
            const elapsed = this.clock.getElapsedTime();
            
            if (this.isAnimated) {
                this.updateAnimations(elapsed, delta);
            }
            
            // Update controls
            if (this.controls) {
                this.controls.update();
            }
            
            this.renderer.render(this.scene, this.camera);
        };
        animate();
    }
    
    updateAnimations(elapsed, delta) {
        // Update space particles
        if (this.spaceParticles) {
            this.spaceParticles.material.uniforms.time.value = elapsed;
            this.spaceParticles.rotation.y += 0.001;
        }
        
        // Update cosmic rings
        this.cosmicRings.forEach((ring, index) => {
            ring.rotation.z += (0.005 + index * 0.002) * this.animationSpeed;
            ring.material.opacity = 0.1 + Math.sin(elapsed + index) * 0.05;
        });
        
        // Update floating orbs
        this.floatingOrbs.forEach((orb, index) => {
            const data = orb.userData;
            data.orbitAngle += data.orbitSpeed * this.animationSpeed;
            
            orb.position.x = Math.cos(data.orbitAngle) * data.orbitRadius;
            orb.position.z = Math.sin(data.orbitAngle) * data.orbitRadius;
            orb.position.y = 10 + Math.sin(elapsed * data.bobSpeed) * data.bobAmount;
            
            orb.rotation.x += 0.01;
            orb.rotation.y += 0.015;
        });
        
        // Update gecko spirits
        this.geckoModels.forEach((spirit, index) => {
            const data = spirit.userData;
            const time = elapsed + data.phase;
            
            spirit.position.x += Math.sin(time * data.speed) * 0.1;
            spirit.position.y += Math.cos(time * data.speed * 1.3) * 0.05;
            spirit.position.z += Math.sin(time * data.speed * 0.7) * 0.08;
            
            spirit.rotation.y += data.rotationSpeed * this.animationSpeed;
            
            // Gentle floating motion
            spirit.children.forEach((child, childIndex) => {
                if (childIndex > 0) { // Skip main body
                    child.rotation.z = Math.sin(time * 2 + childIndex) * 0.1;
                }
            });
        });
        
        // Update space ground
        if (this.spaceGround) {
            this.spaceGround.material.uniforms.time.value = elapsed;
        }
        
        // Update force sensor glow
        if (this.testbed.forceSensor) {
            this.testbed.forceSensor.material.emissiveIntensity = 0.4 + Math.sin(elapsed * 3) * 0.2;
        }
    }
    
    // Public interface methods (same as before)
    updatePositions(steps) {
        if (!steps) return;
        
        const stepScale = 0.008;
        
        if (this.testbed.xAxis) {
            this.testbed.xAxis.position.x = steps.x * stepScale;
        }
        if (this.testbed.yAxis) {
            this.testbed.yAxis.position.z = steps.y * stepScale;
        }
        if (this.testbed.zAxis) {
            this.testbed.zAxis.position.y = 5 + steps.z * stepScale;
        }
        if (this.testbed.forceSensor) {
            this.testbed.forceSensor.position.y = 4.2 + steps.z * stepScale;
        }
    }
    
    updateForces(forceData) {
        if (!forceData || !this.testbed.forceSensor) return;
        
        const intensity = Math.abs(forceData.Fz || 0) / 10;
        const color = new THREE.Color();
        
        if (intensity < 0.3) {
            color.setHex(0x44ff88);
        } else if (intensity < 0.7) {
            color.setHex(0xffaa44);
        } else {
            color.setHex(0xff4444);
        }
        
        this.testbed.forceSensor.material.color = color;
        this.testbed.forceSensor.material.emissiveIntensity = Math.min(intensity + 0.2, 0.8);
    }
    
    toggleAnimation() {
        this.isAnimated = !this.isAnimated;
        if (this.controls) {
            this.controls.autoRotate = this.isAnimated;
        }
    }
    
    resetView() {
        this.camera.position.set(20, 15, 20);
        this.camera.lookAt(0, 5, 0);
        if (this.controls) {
            this.controls.reset();
        }
    }
    
    onWindowResize() {
        if (!this.container) return;
        
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
    
    dispose() {
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        this.scene.traverse((object) => {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
    }
}

// Export for global access
window.GeckoSpaceVisualizer = GeckoSpaceVisualizer;