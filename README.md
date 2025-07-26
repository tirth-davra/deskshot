<p align="center"><img src="https://i.imgur.com/a9QWW0v.png"></p>

# Deskshot - Time Tracking App

A desktop application for time tracking built with Electron, Next.js, and TypeScript.

## Features

- Time tracking with screenshots
- Desktop notifications
- Cross-platform support (Windows, macOS, Linux)
- Modern UI with Tailwind CSS

## Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Development Mode

```bash
npm run dev
```

This will start the development server and open the Electron app.

## Building for Distribution

### Windows Installer

To create a Windows installer (.exe):

```bash
# Build the app
npm run build

# Create Windows installer
npm run make
```

This will generate:
- `dist/Deskshot-Setup-1.0.0.exe` - Windows installer
- `dist/win-unpacked/` - Unpacked application folder

### Portable Version

To create a portable version (no installation required):

```bash
npm run build
npm run make:portable
```

This will generate:
- `dist/Deskshot-1.0.0.exe` - Portable executable

### All Platforms

To build for all platforms (Windows, macOS, Linux):

```bash
npm run build
npm run make:all
```

## Build Configuration

The app is configured with electron-builder for professional distribution:

### Key Features

- **App ID**: `com.deskshot.app`
- **Product Name**: `Deskshot`
- **Output Directory**: `dist/`
- **Resources**: `resources/`
- **Windows Target**: NSIS installer
- **Icons**: Proper app icons for window, installer, and taskbar

### Windows Installer Features

- Custom installation directory selection
- Desktop and Start Menu shortcuts
- Proper uninstaller
- App data cleanup on uninstall
- Professional installer branding

### File Structure

```
time-tracking/
├── main/                 # Electron main process
├── renderer/             # Next.js frontend
├── resources/            # Build resources
│   ├── icon.ico         # Windows icon
│   └── icon.icns        # macOS icon
├── dist/                # Build output (generated)
├── electron-builder.yml # Build configuration
└── package.json         # Project configuration
```

## Distribution

### Sharing the App

1. **For Windows Users**: Share the `Deskshot-Setup-1.0.0.exe` file
2. **For Portable Use**: Share the `Deskshot-1.0.0.exe` file
3. **For Developers**: Share the `win-unpacked` folder

### Installation Process

1. Run the installer as administrator
2. Choose installation directory (optional)
3. Install completes with desktop/start menu shortcuts
4. App runs from installed location

### Requirements

- Windows 10/11 (64-bit)
- No additional dependencies required
- Works on systems without development environment

## Development Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development mode |
| `npm run build` | Build the application |
| `npm run make` | Create Windows installer |
| `npm run make:portable` | Create portable version |
| `npm run make:all` | Build for all platforms |

## Troubleshooting

### Build Issues

1. **Icon not found**: Ensure `resources/icon.ico` exists
2. **Permission errors**: Run as administrator on Windows
3. **Antivirus warnings**: Common with Electron apps, add to exclusions

### Runtime Issues

1. **App won't start**: Check Windows Event Viewer for errors
2. **Screenshots not working**: Ensure screen capture permissions
3. **Notifications not showing**: Check Windows notification settings

## License

Copyright © 2025 Yoshihide Shiono
