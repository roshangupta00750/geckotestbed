/**
 * Enhanced Integration for the Modern UI
 * Connects the premium 3D visualizer with the glass morphism interface
 */

class EnhancedIntegration {
    constructor() {
        this.visualizer = null;
        this.isInitialized = false;
        this.dataSimulation = null;
    }
    
    async init() {
        if (this.isInitialized) return;
        
        try {
            // Wait for Three.js and enhanced visualizer
            await this.waitForDependencies();
            
            // Initialize the enhanced visualizer
            this.visualizer = new EnhancedTestbedVisualizer('threejs-main-container');
            
            // Setup data simulation (since no backend)
            this.startDataSimulation();
            
            // Setup UI integration
            this.setupUIIntegration();
            
            this.isInitialized = true;
            console.log('Enhanced Three.js visualizer initialized successfully');
            
            // Add to global scope for external access
            window.enhancedVisualizer = this.visualizer;
            
        } catch (error) {
            console.error('Failed to initialize enhanced visualizer:', error);
        }
    }
    
    waitForDependencies() {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 100;
            
            const checkDependencies = () => {
                if (typeof THREE !== 'undefined' && typeof EnhancedTestbedVisualizer !== 'undefined') {
                    resolve();
                } else if (attempts >= maxAttempts) {
                    reject(new Error('Dependencies failed to load'));
                } else {
                    attempts++;
                    setTimeout(checkDependencies, 50);
                }
            };
            
            checkDependencies();
        });
    }
    
    startDataSimulation() {
        // Simulate realistic sensor data for demo purposes
        let stepX = 0, stepY = 0, stepZ = 0;
        let forceZ = 0;
        let time = 0;
        
        this.dataSimulation = setInterval(() => {
            time += 0.1;
            
            // Simulate gradual movement
            if (Math.random() < 0.3) {
                stepX += Math.floor((Math.random() - 0.5) * 10);
                stepY += Math.floor((Math.random() - 0.5) * 8);
                stepZ += Math.floor((Math.random() - 0.5) * 5);
            }
            
            // Simulate force readings with realistic physics
            forceZ = (Math.sin(time * 0.5) * 8 + Math.cos(time * 0.3) * 3 + Math.random() * 2).toFixed(2);
            const forceX = (Math.sin(time * 0.7) * 2 + Math.random() * 0.5).toFixed(2);
            const forceY = (Math.cos(time * 0.4) * 1.5 + Math.random() * 0.3).toFixed(2);
            
            // Update visualizer
            if (this.visualizer) {
                this.visualizer.updatePositions({
                    x: stepX,
                    y: stepY,
                    z: stepZ
                });
                
                this.visualizer.updateForces({
                    Fx: parseFloat(forceX),
                    Fy: parseFloat(forceY),
                    Fz: parseFloat(forceZ)
                });
            }
            
            // Update UI elements
            this.updateUIElements({
                steps: { x: stepX, y: stepY, z: stepZ },
                forces: { fx: forceX, fy: forceY, fz: forceZ }
            });
            
        }, 200); // 5 FPS updates for smooth data flow
    }
    
    updateUIElements(data) {
        // Update step displays
        const stepElements = [
            { id: 'x-steps-modern', value: data.steps.x },
            { id: 'y-steps-modern', value: data.steps.y },
            { id: 'z-steps-modern', value: data.steps.z },
            { id: 'pos-x-display', value: data.steps.x },
            { id: 'pos-y-display', value: data.steps.y },
            { id: 'pos-z-display', value: data.steps.z }
        ];
        
        stepElements.forEach(({ id, value }) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
                this.addUpdateAnimation(element);
            }
        });
        
        // Update force displays
        const forceElements = [
            { id: 'fzTacho-modern', value: data.forces.fz },
            { id: 'fx-modern', value: data.forces.fx },
            { id: 'fy-modern', value: data.forces.fy },
            { id: 'force-display', value: data.forces.fz }
        ];
        
        forceElements.forEach(({ id, value }) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
                this.addUpdateAnimation(element);
            }
        });
        
        // Update force gauge
        this.updateForceGauge(parseFloat(data.forces.fz));
        
        // Add log entries occasionally
        if (Math.random() < 0.1) {
            this.addLogEntry(`Position updated: X=${data.steps.x}, Y=${data.steps.y}, Z=${data.steps.z}`);
        }
        
        if (Math.random() < 0.05) {
            this.addLogEntry(`Force reading: ${data.forces.fz}N`);
        }
    }
    
    addUpdateAnimation(element) {
        // Add subtle pulse animation on data updates
        element.style.transform = 'scale(1.05)';
        element.style.transition = 'transform 0.15s ease-out';
        
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 150);
    }
    
    updateForceGauge(fzValue) {
        const gauge = document.getElementById('force-gauge-modern');
        if (!gauge) return;
        
        const maxForce = 20;
        const normalizedValue = Math.abs(fzValue) / maxForce;
        const progress = Math.min(normalizedValue * 270, 270);
        
        gauge.style.setProperty('--progress', `${progress}deg`);
        
        // Add color changes based on force
        const gaugeValue = gauge.querySelector('.gauge-value');
        if (gaugeValue) {
            if (normalizedValue < 0.3) {
                gaugeValue.style.color = '#10b981';
            } else if (normalizedValue < 0.7) {
                gaugeValue.style.color = '#f59e0b';
            } else {
                gaugeValue.style.color = '#ef4444';
            }
        }
    }
    
    addLogEntry(message) {
        const logContainer = document.getElementById('log-container-modern');
        if (!logContainer) return;
        
        const timestamp = new Date().toLocaleTimeString();
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.textContent = `[${timestamp}] ${message}`;
        
        // Add to top of log
        logContainer.insertBefore(entry, logContainer.firstChild);
        
        // Keep only last 20 entries
        while (logContainer.children.length > 20) {
            logContainer.removeChild(logContainer.lastChild);
        }
        
        // Scroll to top
        logContainer.scrollTop = 0;
    }
    
    setupUIIntegration() {
        // Setup axis control integration
        this.setupAxisControls();
        
        // Setup navigation integration
        this.setupNavigation();
        
        // Setup sequence controls
        this.setupSequenceControls();
        
        // Setup view controls
        this.setupViewControls();
    }
    
    setupAxisControls() {
        document.querySelectorAll('button[data-axis]').forEach(btn => {
            const axis = btn.dataset.axis;
            const dir = btn.dataset.dir;
            
            const start = () => {
                // Visual feedback
                btn.style.background = '#6366f1';
                btn.style.transform = 'scale(0.9)';
                btn.style.boxShadow = '0 4px 20px rgba(99, 102, 241, 0.6)';
                
                // Highlight axis in 3D
                if (this.visualizer) {
                    this.highlightAxis(axis, true);
                }
                
                // Simulate movement
                this.simulateAxisMovement(axis, dir);
            };
            
            const stop = () => {
                // Reset visual feedback
                btn.style.background = '';
                btn.style.transform = '';
                btn.style.boxShadow = '';
                
                // Remove axis highlight
                if (this.visualizer) {
                    setTimeout(() => this.highlightAxis(axis, false), 500);
                }
            };
            
            btn.addEventListener('mousedown', start);
            btn.addEventListener('touchstart', start);
            btn.addEventListener('mouseup', stop);
            btn.addEventListener('mouseleave', stop);
            btn.addEventListener('touchend', stop);
        });
    }
    
    simulateAxisMovement(axis, direction) {
        // Simulate axis movement for demo
        const increment = direction === '1' ? 5 : -5;
        // Implementation would depend on your specific axis control logic
        console.log(`Moving ${axis} axis in direction ${direction}`);
    }
    
    highlightAxis(axis, highlight) {
        // This would integrate with the Three.js visualizer
        // to highlight the specific axis being controlled
        console.log(`${highlight ? 'Highlighting' : 'Unhighlighting'} ${axis} axis`);
    }
    
    setupNavigation() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const view = item.dataset.view;
                if (view) {
                    this.switchView(view);
                }
            });
        });
    }
    
    switchView(view) {
        console.log(`Switching to view: ${view}`);
        // Implementation for different view modes
        // Could change camera position, show/hide elements, etc.
    }
    
    setupSequenceControls() {
        const sequenceButtons = [
            'add-action-x', 'add-action-y', 'add-action-z',
            'run-sequence', 'stop-sequence', 'emergency-stop'
        ];
        
        sequenceButtons.forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.addEventListener('click', () => {
                    this.handleSequenceAction(buttonId);
                });
            }
        });
    }
    
    handleSequenceAction(action) {
        console.log(`Sequence action: ${action}`);
        
        // Add visual feedback
        switch (action) {
            case 'run-sequence':
                this.addLogEntry('Starting sequence execution...');
                break;
            case 'stop-sequence':
                this.addLogEntry('Sequence stopped by user');
                break;
            case 'emergency-stop':
                this.addLogEntry('EMERGENCY STOP ACTIVATED');
                break;
            default:
                this.addLogEntry(`Added ${action.split('-')[2]} axis step to sequence`);
        }
    }
    
    setupViewControls() {
        // These functions are already globally available
        // Just need to ensure they're properly connected
        window.resetView = () => {
            if (this.visualizer) {
                this.visualizer.resetView();
                this.addLogEntry('Camera view reset');
            }
        };
    }
    
    dispose() {
        if (this.dataSimulation) {
            clearInterval(this.dataSimulation);
        }
        
        if (this.visualizer) {
            this.visualizer.dispose();
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.enhancedIntegration = new EnhancedIntegration();
});

// Export for global access
window.EnhancedIntegration = EnhancedIntegration;