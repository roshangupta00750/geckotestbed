# Gecko Adhesion Laboratory Interface

A professional Three.js-powered web interface for scientific adhesion testing equipment. Features real-time 3D visualization, interactive sequence builder, and modern glassmorphism UI design.

![Gecko Adhesion Lab Interface](https://img.shields.io/badge/Status-Working-brightgreen)
![Three.js](https://img.shields.io/badge/Three.js-r128-blue)
![Flask](https://img.shields.io/badge/Flask-2.3.2-red)

## 🌟 Features

- **Real-time 3D Visualization** - Interactive testbed with live axis movement
- **Professional Interface** - Modern glassmorphism design with dark/light themes
- **Sequence Builder** - Create complex multi-axis movement patterns
- **Force Monitoring** - Live force sensor readings with color-coded gauges
- **Interactive Charts** - Real-time data visualization
- **Manual Controls** - Direct axis manipulation for testing
- **Data Export/Import** - Save and load experiment configurations
- **Safety Systems** - Motor check requirements and emergency stops

## 🎯 Demo

Access the live interface at: `http://localhost:5000`

![Interface Preview](screenshot.png)

## 🚀 Quick Start

### Prerequisites
- Python 3.7+
- Modern web browser with WebGL support

### Installation

1. **Clone the repository:**
```bash
git clone git@github.com:roshangupta00750/geckotestbed.git
cd geckotestbed
```

2. **Install Python dependencies:**
```bash
pip install -r requirements.txt
```

3. **Run the test server:**
```bash
python test_server.py
```

4. **Open your browser:**
```
http://localhost:5000
```

## 📁 Project Structure

```
geckotestbed/
├── README.md                    # Project documentation
├── test_server.py              # Flask development server
├── requirements.txt            # Python dependencies
└── static/                     # Web interface files
    ├── index-fixed-final.html  # Main interface
    ├── chartPanel.js           # Chart management
    ├── socket.js               # Real-time communication
    ├── utils.js                # Core utilities
    ├── stepBuilder.js          # Sequence creation
    ├── timeline.js             # Timeline visualization
    ├── main.js                 # Application logic
    ├── style.css               # Additional styles
    ├── chart.css               # Chart styling
    ├── threejs-enhanced.js     # Premium 3D visualizer
    ├── threejs-gecko-space.js  # Space theme visualizer
    ├── threejs-visualizer.js   # Basic scientific visualizer
    └── integration-enhanced.js # Three.js integration
```

## 🎮 Usage

### Basic Operation

1. **Motor Check**: Click "Motor Check" to enable sequence operations
2. **Manual Control**: Use axis buttons (X, Y, Z) for direct movement
3. **Sequence Builder**: 
   - Add steps using dropdown buttons
   - Configure triggers and conditions
   - Run complete sequences
4. **Force Monitoring**: Real-time force readings displayed in gauge
5. **Data Management**: Export/import experiment configurations

### Advanced Features

- **Theme Toggle**: Switch between dark and light modes
- **3D View Controls**: Reset camera, toggle animations
- **Calibration**: Adjust force sensor calibration factors
- **Emergency Stop**: Immediate halt for all operations

## 🔧 Technical Details

### Architecture
- **Frontend**: Vanilla JavaScript ES6 modules with Three.js
- **Backend**: Flask with Socket.IO for real-time communication
- **Styling**: CSS3 with custom properties for theming
- **3D Graphics**: Three.js with WebGL rendering

### Key Components
- **TestbedVisualizer**: 3D visualization engine
- **SequenceBuilder**: Movement pattern creation
- **ForceMonitor**: Real-time sensor data display
- **SocketManager**: Client-server communication

### Browser Support
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 🛠️ Development

### Running in Development Mode
```bash
python test_server.py
```

The server includes:
- Live reload capabilities
- Mock sensor data generation
- Complete API simulation
- Debug logging

### Customization

1. **Modify the interface**: Edit `static/index-fixed-final.html`
2. **Add Three.js effects**: Extend `static/threejs-enhanced.js`
3. **Update styling**: Modify embedded CSS or external stylesheets
4. **Add features**: Extend JavaScript modules in `/static/`

## 🎨 Themes

The interface supports multiple visualization themes:

- **Enhanced**: Professional scientific visualization
- **Space**: Cosmic theme with floating elements
- **Basic**: Clean, minimal scientific display

## 📊 Features in Detail

### Sequence Builder
- Multi-axis movement coordination
- Trigger-based start/stop conditions
- Force threshold monitoring
- Configurable step timing

### Force Monitoring
- Real-time sensor readings
- Color-coded force indicators
- Calibration factor adjustment
- Historical data tracking

### 3D Visualization
- Interactive camera controls
- Real-time axis movement
- Force vector visualization
- Professional lighting and materials

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under is not licenced as this is developed in Julius Maximillian University, Wurzburg- Germany. 

## 🐛 Troubleshooting

### Common Issues

1. **Three.js not loading**: Ensure internet connection for CDN resources
2. **Socket connection failed**: Check if server is running on port 5000
3. **Buttons not working**: Complete motor check sequence first
4. **Charts not displaying**: Verify Chart.js CDN is accessible

### Support

For issues and questions:
- Open an issue on GitHub
- Check browser console for error messages
- Verify all dependencies are installed

## 🙏 Acknowledgments

- Three.js community for excellent 3D graphics library
- Flask team for the web framework
- Chart.js for data visualization components

---

**Made with ❤️ for scientific research**
