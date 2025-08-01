/**
 * Three.js 3D Visualization for Gecko Adhesion Testbed
 * Real-time visualization of testbed components, axes movement, and force data
 */

class TestbedVisualizer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        
        // Testbed components
        this.testbed = {
            base: null,
            xAxis: null,
            yAxis: null,
            zAxis: null,
            sample: null,
            forceSensor: null
        };
        
        // Current positions (in steps)
        this.positions = {
            x: 0,
            y: 0,
            z: 0
        };
        
        // Force data
        this.forces = {
            fx: 0,
            fy: 0,
            fz: 0
        };
        
        // Animation
        this.animationId = null;
        
        this.init();
    }
    
    init() {
        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.createLights();
        this.createControls();
        this.createTestbed();
        this.createAxes();
        this.startAnimation();
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    createScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0f0f23); // Match dashboard background
        
        // Add subtle fog for depth
        this.scene.fog = new THREE.Fog(0x0f0f23, 10, 50);
    }
    
    createCamera() {
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.camera.position.set(15, 10, 15);
        this.camera.lookAt(0, 0, 0);
    }
    
    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true 
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        
        this.container.appendChild(this.renderer.domElement);
    }
    
    createLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);
        
        // Main directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -20;
        directionalLight.shadow.camera.right = 20;
        directionalLight.shadow.camera.top = 20;
        directionalLight.shadow.camera.bottom = -20;
        this.scene.add(directionalLight);
        
        // Secondary light for fill
        const fillLight = new THREE.DirectionalLight(0x4f46e5, 0.3);
        fillLight.position.set(-5, 5, -5);
        this.scene.add(fillLight);
        
        // Point light for accent
        const pointLight = new THREE.PointLight(0x7c3aed, 0.5, 20);
        pointLight.position.set(0, 8, 0);
        this.scene.add(pointLight);
    }
    
    createControls() {
        // Import OrbitControls if available
        if (typeof THREE.OrbitControls !== 'undefined') {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.maxDistance = 50;
            this.controls.minDistance = 5;
            this.controls.maxPolarAngle = Math.PI * 0.8;
        }
    }
    
    createTestbed() {
        // Create testbed base platform
        const baseGeometry = new THREE.BoxGeometry(12, 0.5, 8);
        const baseMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x2d2d44,
            transparent: true,
            opacity: 0.9
        });
        this.testbed.base = new THREE.Mesh(baseGeometry, baseMaterial);
        this.testbed.base.position.y = -2;
        this.testbed.base.receiveShadow = true;
        this.scene.add(this.testbed.base);
        
        // Create support pillars
        const pillarGeometry = new THREE.CylinderGeometry(0.2, 0.2, 4);
        const pillarMaterial = new THREE.MeshLambertMaterial({ color: 0x374151 });
        
        const pillarPositions = [
            [-5, 0, -3], [5, 0, -3], [-5, 0, 3], [5, 0, 3]
        ];
        
        pillarPositions.forEach(pos => {
            const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
            pillar.position.set(...pos);
            pillar.castShadow = true;
            this.scene.add(pillar);
        });
    }
    
    createAxes() {
        // X-Axis Rail (horizontal, left-right)
        const xRailGeometry = new THREE.BoxGeometry(10, 0.3, 0.3);
        const xRailMaterial = new THREE.MeshLambertMaterial({ color: 0x06b6d4 });
        const xRail = new THREE.Mesh(xRailGeometry, xRailMaterial);
        xRail.position.set(0, 2, -2);
        xRail.castShadow = true;
        this.scene.add(xRail);
        
        // X-Axis Carriage
        const xCarriageGeometry = new THREE.BoxGeometry(0.8, 0.6, 0.6);
        const xCarriageMaterial = new THREE.MeshLambertMaterial({ color: 0x3b82f6 });
        this.testbed.xAxis = new THREE.Mesh(xCarriageGeometry, xCarriageMaterial);
        this.testbed.xAxis.position.set(0, 2, -2);
        this.testbed.xAxis.castShadow = true;
        this.scene.add(this.testbed.xAxis);
        
        // Y-Axis Rail (horizontal, front-back)
        const yRailGeometry = new THREE.BoxGeometry(0.3, 0.3, 6);
        const yRailMaterial = new THREE.MeshLambertMaterial({ color: 0x10b981 });
        const yRail = new THREE.Mesh(yRailGeometry, yRailMaterial);
        yRail.position.set(0, 2.5, 0);
        yRail.castShadow = true;
        this.scene.add(yRail);
        
        // Y-Axis Carriage
        const yCarriageGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.8);
        const yCarriageMaterial = new THREE.MeshLambertMaterial({ color: 0x059669 });
        this.testbed.yAxis = new THREE.Mesh(yCarriageGeometry, yCarriageMaterial);
        this.testbed.yAxis.position.set(0, 2.5, 0);
        this.testbed.yAxis.castShadow = true;
        this.scene.add(this.testbed.yAxis);
        
        // Z-Axis Rail (vertical)
        const zRailGeometry = new THREE.BoxGeometry(0.3, 6, 0.3);
        const zRailMaterial = new THREE.MeshLambertMaterial({ color: 0xf59e0b });
        const zRail = new THREE.Mesh(zRailGeometry, zRailMaterial);
        zRail.position.set(0, 5, 0);
        zRail.castShadow = true;
        this.scene.add(zRail);
        
        // Z-Axis Carriage with Force Sensor
        const zCarriageGeometry = new THREE.BoxGeometry(0.8, 0.6, 0.8);
        const zCarriageMaterial = new THREE.MeshLambertMaterial({ color: 0xd97706 });
        this.testbed.zAxis = new THREE.Mesh(zCarriageGeometry, zCarriageMaterial);
        this.testbed.zAxis.position.set(0, 3, 0);
        this.testbed.zAxis.castShadow = true;
        this.scene.add(this.testbed.zAxis);
        
        // Force Sensor (attached to Z-axis)
        const sensorGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.2);
        const sensorMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x8b5cf6,
            emissive: 0x2a0845,
            emissiveIntensity: 0.2
        });
        this.testbed.forceSensor = new THREE.Mesh(sensorGeometry, sensorMaterial);
        this.testbed.forceSensor.position.set(0, 2.5, 0);
        this.testbed.forceSensor.castShadow = true;
        this.scene.add(this.testbed.forceSensor);
        
        // Sample/Specimen (what gets tested)
        const sampleGeometry = new THREE.SphereGeometry(0.3, 16, 12);
        const sampleMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xdc2626,
            emissive: 0x450a0a,
            emissiveIntensity: 0.1
        });
        this.testbed.sample = new THREE.Mesh(sampleGeometry, sampleMaterial);
        this.testbed.sample.position.set(0, 2, 0);
        this.testbed.sample.castShadow = true;
        this.scene.add(this.testbed.sample);
        
        // Create coordinate axes for reference
        this.createCoordinateAxes();
    }
    
    createCoordinateAxes() {
        const axesHelper = new THREE.AxesHelper(2);
        axesHelper.position.set(-8, -1.5, -6);
        this.scene.add(axesHelper);
        
        // Add labels
        const loader = new THREE.FontLoader();
        // Note: You'd need to load a font for text labels
        // For now, we'll use colored arrows as indicators
    }
    
    updatePositions(steps) {
        if (!steps) return;
        
        // Convert steps to world coordinates (scale factor for visualization)
        const stepScale = 0.005; // Adjust based on your step resolution
        
        // Update positions
        this.positions.x = steps.x || 0;
        this.positions.y = steps.y || 0;
        this.positions.z = steps.z || 0;
        
        // Update X-axis carriage position
        if (this.testbed.xAxis) {
            this.testbed.xAxis.position.x = this.positions.x * stepScale;
        }
        
        // Update Y-axis carriage position
        if (this.testbed.yAxis) {
            this.testbed.yAxis.position.z = this.positions.y * stepScale;
        }
        
        // Update Z-axis carriage and force sensor position
        if (this.testbed.zAxis) {
            this.testbed.zAxis.position.y = 3 + (this.positions.z * stepScale);
        }
        if (this.testbed.forceSensor) {
            this.testbed.forceSensor.position.y = 2.5 + (this.positions.z * stepScale);
        }
    }
    
    updateForces(forceData) {
        if (!forceData) return;
        
        this.forces.fx = forceData.Fx || 0;
        this.forces.fy = forceData.Fy || 0;
        this.forces.fz = forceData.Fz || 0;
        
        // Visualize force with color changes and effects
        if (this.testbed.forceSensor) {
            const forceIntensity = Math.abs(this.forces.fz) / 10; // Normalize
            const color = new THREE.Color();
            
            // Color based on force magnitude
            if (forceIntensity < 0.3) {
                color.setHex(0x10b981); // Green for low force
            } else if (forceIntensity < 0.7) {
                color.setHex(0xf59e0b); // Yellow for medium force
            } else {
                color.setHex(0xdc2626); // Red for high force
            }
            
            this.testbed.forceSensor.material.color = color;
            this.testbed.forceSensor.material.emissiveIntensity = Math.min(forceIntensity, 0.5);
        }
        
        // Add force vector visualization
        this.updateForceVectors();
    }
    
    updateForceVectors() {
        // Remove existing force vectors
        const existingVectors = this.scene.children.filter(child => child.userData.isForceVector);
        existingVectors.forEach(vector => this.scene.remove(vector));
        
        // Create new force vectors if force is significant
        const vectorScale = 0.1;
        const minForce = 0.5;
        
        if (Math.abs(this.forces.fz) > minForce) {
            const vectorGeometry = new THREE.ConeGeometry(0.1, Math.abs(this.forces.fz) * vectorScale, 8);
            const vectorMaterial = new THREE.MeshLambertMaterial({ 
                color: this.forces.fz > 0 ? 0x10b981 : 0xdc2626 
            });
            const vector = new THREE.Mesh(vectorGeometry, vectorMaterial);
            
            // Position vector at force sensor
            vector.position.copy(this.testbed.forceSensor.position);
            vector.position.y += this.forces.fz > 0 ? 1 : -1;
            vector.rotation.x = this.forces.fz > 0 ? 0 : Math.PI;
            vector.userData.isForceVector = true;
            
            this.scene.add(vector);
        }
    }
    
    startAnimation() {
        const animate = () => {
            this.animationId = requestAnimationFrame(animate);
            
            // Update controls
            if (this.controls) {
                this.controls.update();
            }
            
            // Add subtle animations
            if (this.testbed.sample) {
                this.testbed.sample.rotation.y += 0.01;
            }
            
            // Render
            this.renderer.render(this.scene, this.camera);
        };
        animate();
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
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        // Clean up geometries and materials
        this.scene.traverse((object) => {
            if (object.geometry) {
                object.geometry.dispose();
            }
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
    }
    
    // Public methods for external integration
    setSequenceHighlight(isRunning) {
        // Highlight active components during sequence execution
        const highlightColor = isRunning ? 0x4f46e5 : null;
        
        Object.values(this.testbed).forEach(component => {
            if (component && component.material) {
                if (highlightColor) {
                    component.material.emissive.setHex(0x1a1a2e);
                    component.material.emissiveIntensity = 0.3;
                } else {
                    component.material.emissive.setHex(0x000000);
                    component.material.emissiveIntensity = 0;
                }
            }
        });
    }
    
    showAxis(axis, highlight = true) {
        const component = this.testbed[`${axis.toLowerCase()}Axis`];
        if (component) {
            component.material.emissive.setHex(highlight ? 0x4f46e5 : 0x000000);
            component.material.emissiveIntensity = highlight ? 0.4 : 0;
        }
    }
    
    resetView() {
        if (this.controls) {
            this.controls.reset();
        }
        this.camera.position.set(15, 10, 15);
        this.camera.lookAt(0, 0, 0);
    }
}

// Export for use in main application
window.TestbedVisualizer = TestbedVisualizer;