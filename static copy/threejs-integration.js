/**
 * Integration module for Three.js visualizer with the existing dashboard
 * Connects real-time data updates to the 3D visualization
 */

class VisualizerIntegration {
    constructor() {
        this.visualizer = null;
        this.isInitialized = false;
        this.updateInterval = null;
    }
    
    async init() {
        if (this.isInitialized) return;
        
        try {
            // Wait for Three.js to load
            await this.waitForThreeJS();
            
            // Initialize the visualizer
            this.visualizer = new TestbedVisualizer('threejs-container');
            
            // Hook into existing data updates
            this.setupDataHooks();
            
            // Setup control integration
            this.setupControlIntegration();
            
            this.isInitialized = true;
            console.log('Three.js visualizer initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Three.js visualizer:', error);
        }
    }
    
    waitForThreeJS() {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 50;
            
            const checkThreeJS = () => {
                if (typeof THREE !== 'undefined' && typeof TestbedVisualizer !== 'undefined') {
                    resolve();
                } else if (attempts >= maxAttempts) {
                    reject(new Error('Three.js failed to load'));
                } else {
                    attempts++;
                    setTimeout(checkThreeJS, 100);
                }
            };
            
            checkThreeJS();
        });
    }
    
    setupDataHooks() {
        // Hook into step counter updates
        this.interceptStepUpdates();
        
        // Hook into force sensor updates
        this.interceptForceUpdates();
        
        // Hook into sequence state changes
        this.interceptSequenceUpdates();
    }
    
    interceptStepUpdates() {
        // Store original step update function
        const originalUpdateSteps = window.updateStepsDisplay || (() => {});
        
        // Override with our enhanced version
        window.updateStepsDisplay = (data) => {
            // Call original function
            originalUpdateSteps(data);
            
            // Update 3D visualization
            if (this.visualizer && data) {
                const steps = {
                    x: parseInt(document.getElementById('x-steps')?.textContent || '0'),
                    y: parseInt(document.getElementById('y-steps')?.textContent || '0'),
                    z: parseInt(document.getElementById('z-steps')?.textContent || '0')
                };
                this.visualizer.updatePositions(steps);
            }
        };
        
        // Also monitor step counter changes via DOM observation
        this.observeStepCounters();
    }
    
    observeStepCounters() {
        const stepElements = ['x-steps', 'y-steps', 'z-steps'];
        
        stepElements.forEach(elementId => {
            const element = document.getElementById(elementId);
            if (element) {
                const observer = new MutationObserver(() => {
                    const steps = {
                        x: parseInt(document.getElementById('x-steps')?.textContent || '0'),
                        y: parseInt(document.getElementById('y-steps')?.textContent || '0'),
                        z: parseInt(document.getElementById('z-steps')?.textContent || '0')
                    };
                    if (this.visualizer) {
                        this.visualizer.updatePositions(steps);
                    }
                });
                
                observer.observe(element, { 
                    childList: true, 
                    subtree: true, 
                    characterData: true 
                });
            }
        });
    }
    
    interceptForceUpdates() {
        // Store original force update function
        const originalUpdateForce = window.updateForceDisplay || (() => {});
        
        // Override with our enhanced version
        window.updateForceDisplay = (data) => {
            // Call original function
            originalUpdateForce(data);
            
            // Update 3D visualization
            if (this.visualizer && data) {
                this.visualizer.updateForces(data);
            }
        };
    }
    
    interceptSequenceUpdates() {
        // Monitor sequence state changes
        const sequenceButtons = document.querySelectorAll('#run-sequence, #stop-sequence');
        
        sequenceButtons.forEach(button => {
            button.addEventListener('click', () => {
                const isRunning = button.id === 'run-sequence';
                if (this.visualizer) {
                    this.visualizer.setSequenceHighlight(isRunning);
                }
            });
        });
        
        // Monitor sequence step additions
        const stepButtons = document.querySelectorAll('#add-action-x, #add-action-y, #add-action-z');
        stepButtons.forEach(button => {
            button.addEventListener('click', () => {
                const axis = button.id.split('-')[2].toUpperCase(); // Extract X, Y, or Z
                if (this.visualizer) {
                    this.visualizer.showAxis(axis, true);
                    setTimeout(() => this.visualizer.showAxis(axis, false), 1000);
                }
            });
        });
    }
    
    setupControlIntegration() {
        // Monitor manual control buttons
        const axisButtons = document.querySelectorAll('button[data-axis]');
        
        axisButtons.forEach(button => {
            const axis = button.dataset.axis;
            
            // Highlight axis when manually controlled
            button.addEventListener('mousedown', () => {
                if (this.visualizer) {
                    this.visualizer.showAxis(axis, true);
                }
            });
            
            button.addEventListener('mouseup', () => {
                if (this.visualizer) {
                    setTimeout(() => this.visualizer.showAxis(axis, false), 500);
                }
            });
            
            button.addEventListener('mouseleave', () => {
                if (this.visualizer) {
                    setTimeout(() => this.visualizer.showAxis(axis, false), 500);
                }
            });
        });
    }
    
    // Public methods for manual control
    updateSteps(x, y, z) {
        if (this.visualizer) {
            this.visualizer.updatePositions({ x, y, z });
        }
    }
    
    updateForce(fx, fy, fz) {
        if (this.visualizer) {
            this.visualizer.updateForces({ Fx: fx, Fy: fy, Fz: fz });
        }
    }
    
    highlightAxis(axis, duration = 1000) {
        if (this.visualizer) {
            this.visualizer.showAxis(axis, true);
            setTimeout(() => this.visualizer.showAxis(axis, false), duration);
        }
    }
    
    resetView() {
        if (this.visualizer) {
            this.visualizer.resetView();
        }
    }
    
    dispose() {
        if (this.visualizer) {
            this.visualizer.dispose();
        }
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.visualizerIntegration = new VisualizerIntegration();
});

// Export for global access
window.VisualizerIntegration = VisualizerIntegration;