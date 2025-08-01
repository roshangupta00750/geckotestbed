/**
 * Enhanced Three.js Visualizer for the Modern Interface
 * Premium 3D visualization with advanced effects and animations
 */

class EnhancedTestbedVisualizer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.composer = null;
        
        // Enhanced components
        this.testbed = {
            base: null,
            xAxis: null,
            yAxis: null,
            zAxis: null,
            sample: null,
            forceSensor: null,
            particles: null,
            forceField: null
        };
        
        // Animation system
        this.mixer = null;
        this.clock = new THREE.Clock();
        this.animations = [];
        
        // Effects
        this.isWireframe = false;
        this.isAnimated = true;
        
        // Data
        this.positions = { x: 0, y: 0, z: 0 };
        this.forces = { fx: 0, fy: 0, fz: 0 };
        
        this.init();
    }
    
    init() {
        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.createLights();
        this.createControls();
        this.createEnvironment();
        this.createTestbed();
        this.createParticleSystem();
        this.createPostProcessing();
        this.startAnimation();
        
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    createScene() {
        this.scene = new THREE.Scene();
        
        // Advanced background with gradient
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(0.5, '#16213e');
        gradient.addColorStop(1, '#0a0a0f');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);
        
        const texture = new THREE.CanvasTexture(canvas);
        this.scene.background = texture;
        
        // Advanced fog
        this.scene.fog = new THREE.FogExp2(0x0a0a0f, 0.008);
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
        
        // Enhanced rendering features
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        
        // Enable physically based rendering
        this.renderer.physicallyCorrectLights = true;
        
        this.container.appendChild(this.renderer.domElement);
    }
    
    createLights() {
        // Ambient light with color temperature
        const ambientLight = new THREE.AmbientLight(0x4a5bb8, 0.2);
        this.scene.add(ambientLight);
        
        // Main directional light (sun-like)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
        directionalLight.position.set(15, 20, 10);
        directionalLight.castShadow = true;
        
        // Enhanced shadow settings
        directionalLight.shadow.mapSize.width = 4096;
        directionalLight.shadow.mapSize.height = 4096;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 100;
        directionalLight.shadow.camera.left = -30;
        directionalLight.shadow.camera.right = 30;
        directionalLight.shadow.camera.top = 30;
        directionalLight.shadow.camera.bottom = -30;
        directionalLight.shadow.bias = -0.0001;
        
        this.scene.add(directionalLight);
        
        // Accent lights for visual interest
        const accentLight1 = new THREE.PointLight(0x6366f1, 0.8, 25);
        accentLight1.position.set(-10, 8, -10);
        this.scene.add(accentLight1);
        
        const accentLight2 = new THREE.PointLight(0x8b5cf6, 0.6, 20);
        accentLight2.position.set(10, 6, 10);
        this.scene.add(accentLight2);
        
        // Rim light for dramatic effect
        const rimLight = new THREE.SpotLight(0x00f2fe, 0.5, 30, Math.PI / 6, 0.1);
        rimLight.position.set(0, 25, 0);
        rimLight.target.position.set(0, 0, 0);
        this.scene.add(rimLight);
        this.scene.add(rimLight.target);
    }
    
    createControls() {
        if (typeof THREE.OrbitControls !== 'undefined') {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.03;
            this.controls.maxDistance = 80;
            this.controls.minDistance = 5;
            this.controls.maxPolarAngle = Math.PI * 0.85;
            this.controls.autoRotate = false;
            this.controls.autoRotateSpeed = 0.5;
        }
    }
    
    createEnvironment() {
        // Ground plane with reflection
        const groundGeometry = new THREE.PlaneGeometry(60, 60);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x151520,
            metalness: 0.1,
            roughness: 0.8,
            envMapIntensity: 0.5
        });
        
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -3;
        ground.receiveShadow = true;
        this.scene.add(ground);
        
        // Grid helper with custom styling
        const gridHelper = new THREE.GridHelper(40, 40, 0x6366f1, 0x333344);
        gridHelper.position.y = -2.9;
        gridHelper.material.opacity = 0.3;
        gridHelper.material.transparent = true;
        this.scene.add(gridHelper);
        
        // Coordinate axes with labels
        const axesHelper = new THREE.AxesHelper(3);
        axesHelper.position.set(-15, -2, -15);
        this.scene.add(axesHelper);
    }
    
    createTestbed() {
        // Enhanced base platform
        const baseGeometry = new THREE.BoxGeometry(16, 1, 12);
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0x2d2d44,
            metalness: 0.3,
            roughness: 0.4,
            envMapIntensity: 0.8
        });
        
        this.testbed.base = new THREE.Mesh(baseGeometry, baseMaterial);
        this.testbed.base.position.y = -2;
        this.testbed.base.castShadow = true;
        this.testbed.base.receiveShadow = true;
        this.scene.add(this.testbed.base);
        
        // Enhanced support structure
        this.createSupportStructure();
        this.createAxisSystem();
        this.createForceSensor();
        this.createSample();
    }
    
    createSupportStructure() {
        const pillarGeometry = new THREE.CylinderGeometry(0.3, 0.4, 6);
        const pillarMaterial = new THREE.MeshStandardMaterial({
            color: 0x374151,
            metalness: 0.6,
            roughness: 0.2
        });
        
        const positions = [
            [-7, 1, -5], [7, 1, -5], [-7, 1, 5], [7, 1, 5]
        ];
        
        positions.forEach((pos, index) => {
            const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
            pillar.position.set(...pos);
            pillar.castShadow = true;
            pillar.receiveShadow = true;
            this.scene.add(pillar);
            
            // Add connecting beams
            if (index < 2) {
                const beamGeometry = new THREE.BoxGeometry(14, 0.3, 0.3);
                const beamMaterial = new THREE.MeshStandardMaterial({
                    color: 0x4b5563,
                    metalness: 0.5,
                    roughness: 0.3
                });
                const beam = new THREE.Mesh(beamGeometry, beamMaterial);
                beam.position.set(0, 4, pos[2]);
                beam.castShadow = true;
                this.scene.add(beam);
            }
        });
    }
    
    createAxisSystem() {
        // X-Axis Rail (enhanced)
        const xRailGeometry = new THREE.BoxGeometry(12, 0.4, 0.4);
        const xRailMaterial = new THREE.MeshStandardMaterial({
            color: 0x06b6d4,
            metalness: 0.7,
            roughness: 0.1,
            emissive: 0x001a1f,
            emissiveIntensity: 0.1
        });
        
        const xRail = new THREE.Mesh(xRailGeometry, xRailMaterial);
        xRail.position.set(0, 3, -3);
        xRail.castShadow = true;
        this.scene.add(xRail);
        
        // X-Axis Carriage
        const xCarriageGeometry = new THREE.BoxGeometry(1, 0.8, 0.8);
        const xCarriageMaterial = new THREE.MeshStandardMaterial({
            color: 0x3b82f6,
            metalness: 0.8,
            roughness: 0.2,
            emissive: 0x001122,
            emissiveIntensity: 0.2
        });
        
        this.testbed.xAxis = new THREE.Mesh(xCarriageGeometry, xCarriageMaterial);
        this.testbed.xAxis.position.set(0, 3, -3);
        this.testbed.xAxis.castShadow = true;
        this.scene.add(this.testbed.xAxis);
        
        // Y-Axis Rail
        const yRailGeometry = new THREE.BoxGeometry(0.4, 0.4, 8);
        const yRailMaterial = new THREE.MeshStandardMaterial({
            color: 0x10b981,
            metalness: 0.7,
            roughness: 0.1,
            emissive: 0x001f0a,
            emissiveIntensity: 0.1
        });
        
        const yRail = new THREE.Mesh(yRailGeometry, yRailMaterial);
        yRail.position.set(0, 3.5, 0);
        yRail.castShadow = true;
        this.scene.add(yRail);
        
        // Y-Axis Carriage
        const yCarriageGeometry = new THREE.BoxGeometry(0.8, 0.8, 1);
        const yCarriageMaterial = new THREE.MeshStandardMaterial({
            color: 0x059669,
            metalness: 0.8,
            roughness: 0.2,
            emissive: 0x001f0a,
            emissiveIntensity: 0.2
        });
        
        this.testbed.yAxis = new THREE.Mesh(yCarriageGeometry, yCarriageMaterial);
        this.testbed.yAxis.position.set(0, 3.5, 0);
        this.testbed.yAxis.castShadow = true;
        this.scene.add(this.testbed.yAxis);
        
        // Z-Axis Rail (vertical)
        const zRailGeometry = new THREE.BoxGeometry(0.4, 8, 0.4);
        const zRailMaterial = new THREE.MeshStandardMaterial({
            color: 0xf59e0b,
            metalness: 0.7,
            roughness: 0.1,
            emissive: 0x1f1000,
            emissiveIntensity: 0.1
        });
        
        const zRail = new THREE.Mesh(zRailGeometry, zRailMaterial);
        zRail.position.set(0, 7, 0);
        zRail.castShadow = true;
        this.scene.add(zRail);
        
        // Z-Axis Carriage
        const zCarriageGeometry = new THREE.BoxGeometry(1, 0.8, 1);
        const zCarriageMaterial = new THREE.MeshStandardMaterial({
            color: 0xd97706,
            metalness: 0.8,
            roughness: 0.2,
            emissive: 0x1f1000,
            emissiveIntensity: 0.2
        });
        
        this.testbed.zAxis = new THREE.Mesh(zCarriageGeometry, zCarriageMaterial);
        this.testbed.zAxis.position.set(0, 5, 0);
        this.testbed.zAxis.castShadow = true;
        this.scene.add(this.testbed.zAxis);
    }
    
    createForceSensor() {
        // Enhanced force sensor
        const sensorGeometry = new THREE.CylinderGeometry(0.6, 0.6, 0.3);
        const sensorMaterial = new THREE.MeshStandardMaterial({
            color: 0x8b5cf6,
            metalness: 0.9,
            roughness: 0.1,
            emissive: 0x2a0845,
            emissiveIntensity: 0.3,
            transparent: true,
            opacity: 0.9
        });
        
        this.testbed.forceSensor = new THREE.Mesh(sensorGeometry, sensorMaterial);
        this.testbed.forceSensor.position.set(0, 4.2, 0);
        this.testbed.forceSensor.castShadow = true;
        this.scene.add(this.testbed.forceSensor);
        
        // Sensor glow effect
        const glowGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.1);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x8b5cf6,
            transparent: true,
            opacity: 0.2
        });
        
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.set(0, 4.05, 0);
        this.scene.add(glow);
    }
    
    createSample() {
        // Enhanced sample/specimen
        const sampleGeometry = new THREE.SphereGeometry(0.4, 32, 24);
        const sampleMaterial = new THREE.MeshStandardMaterial({
            color: 0xdc2626,
            metalness: 0.1,
            roughness: 0.3,
            emissive: 0x450a0a,
            emissiveIntensity: 0.2,
            transparent: true,
            opacity: 0.8
        });
        
        this.testbed.sample = new THREE.Mesh(sampleGeometry, sampleMaterial);
        this.testbed.sample.position.set(0, 3.5, 0);
        this.testbed.sample.castShadow = true;
        this.scene.add(this.testbed.sample);
    }
    
    createParticleSystem() {
        // Particle system for environmental effects
        const particleCount = 200;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 50;
            positions[i * 3 + 1] = Math.random() * 20;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
            
            colors[i * 3] = Math.random() * 0.5 + 0.5;
            colors[i * 3 + 1] = Math.random() * 0.5 + 0.5;
            colors[i * 3 + 2] = 1;
            
            sizes[i] = Math.random() * 2 + 1;
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
                    gl_PointSize = size * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                
                void main() {
                    float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
                    float alpha = 1.0 - smoothstep(0.0, 0.5, distanceToCenter);
                    gl_FragColor = vec4(vColor, alpha * 0.3);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending
        });
        
        this.testbed.particles = new THREE.Points(particleGeometry, particleMaterial);
        this.scene.add(this.testbed.particles);
    }
    
    createPostProcessing() {
        // Note: This would require additional Three.js post-processing libraries
        // For now, we'll use basic renderer enhancements
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
    
    startAnimation() {
        const animate = () => {
            requestAnimationFrame(animate);
            
            const delta = this.clock.getDelta();
            const elapsed = this.clock.getElapsedTime();
            
            // Update controls
            if (this.controls) {
                this.controls.update();
            }
            
            // Animate particles
            if (this.testbed.particles) {
                this.testbed.particles.material.uniforms.time.value = elapsed;
                this.testbed.particles.rotation.y += 0.001;
            }
            
            // Animate sample rotation
            if (this.testbed.sample && this.isAnimated) {
                this.testbed.sample.rotation.y += 0.02;
                this.testbed.sample.rotation.x = Math.sin(elapsed * 0.5) * 0.1;
            }
            
            // Animate force sensor
            if (this.testbed.forceSensor) {
                this.testbed.forceSensor.rotation.y += 0.01;
                const intensity = Math.abs(this.forces.fz) / 10;
                this.testbed.forceSensor.material.emissiveIntensity = 0.3 + intensity * 0.5;
            }
            
            this.renderer.render(this.scene, this.camera);
        };
        animate();
    }
    
    // Enhanced public methods
    updatePositions(steps) {
        if (!steps) return;
        
        const stepScale = 0.008;
        this.positions = { ...steps };
        
        // Smooth animations
        if (this.testbed.xAxis) {
            this.animatePosition(this.testbed.xAxis, 'x', steps.x * stepScale);
        }
        if (this.testbed.yAxis) {
            this.animatePosition(this.testbed.yAxis, 'z', steps.y * stepScale);
        }
        if (this.testbed.zAxis) {
            this.animatePosition(this.testbed.zAxis, 'y', 5 + steps.z * stepScale);
        }
        if (this.testbed.forceSensor) {
            this.animatePosition(this.testbed.forceSensor, 'y', 4.2 + steps.z * stepScale);
        }
    }
    
    animatePosition(object, axis, targetValue) {
        const currentValue = object.position[axis];
        const diff = targetValue - currentValue;
        object.position[axis] += diff * 0.1; // Smooth interpolation
    }
    
    updateForces(forceData) {
        if (!forceData) return;
        
        this.forces = { ...forceData };
        
        if (this.testbed.forceSensor) {
            const intensity = Math.abs(forceData.Fz || 0) / 10;
            const color = new THREE.Color();
            
            if (intensity < 0.3) {
                color.setHex(0x10b981);
            } else if (intensity < 0.7) {
                color.setHex(0xf59e0b);
            } else {
                color.setHex(0xdc2626);
            }
            
            this.testbed.forceSensor.material.color = color;
            this.testbed.forceSensor.material.emissiveIntensity = Math.min(intensity, 0.8);
        }
    }
    
    toggleWireframe() {
        this.isWireframe = !this.isWireframe;
        
        this.scene.traverse((object) => {
            if (object.isMesh && object.material) {
                object.material.wireframe = this.isWireframe;
            }
        });
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

// Global functions for the new interface
window.toggleWireframe = function() {
    if (window.enhancedVisualizer) {
        window.enhancedVisualizer.toggleWireframe();
    }
};

window.toggleAnimation = function() {
    if (window.enhancedVisualizer) {
        window.enhancedVisualizer.toggleAnimation();
    }
};

// Export
window.EnhancedTestbedVisualizer = EnhancedTestbedVisualizer;