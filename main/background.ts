import path from "path";
import { app, ipcMain, desktopCapturer, BrowserWindow, screen } from "electron";
import serve from "electron-serve";
import { createWindow } from "./helpers";

const isProd = process.env.NODE_ENV === "production";

if (isProd) {
  serve({ directory: "app" });
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`);
}

// Global notification management
let notificationQueue: Array<{
  title: string;
  body: string;
  icon: string;
  imageData?: string;
  timestamp: number;
}> = [];
let isShowingNotification = false;
let globalNotifWindow: BrowserWindow | null = null;

// Clean up global notification window
const cleanupNotificationWindow = () => {
  if (globalNotifWindow && !globalNotifWindow.isDestroyed()) {
    globalNotifWindow.close();
  }
  globalNotifWindow = null;
  isShowingNotification = false;
};

// Process notification queue
const processNotificationQueue = async () => {
  if (isShowingNotification || notificationQueue.length === 0) {
    return;
  }

  const notification = notificationQueue.shift();
  if (!notification) return;

  isShowingNotification = true;

  try {
    await showNotificationWindow(notification);
  } catch (error) {
    console.error("Failed to show notification:", error);
    // Try fallback notification
    try {
      await showFallbackNotification(notification);
    } catch (fallbackError) {
      console.error("Fallback notification also failed:", fallbackError);
    }
  } finally {
    isShowingNotification = false;
    // Process next notification if any
    setTimeout(processNotificationQueue, 100);
  }
};

// Show custom notification window
const showNotificationWindow = async (notification: {
  title: string;
  body: string;
  icon: string;
  imageData?: string;
  timestamp: number;
}) => {
  return new Promise<void>((resolve, reject) => {
    // Clean up any existing notification window
    cleanupNotificationWindow();

    // Create new notification window with robust settings
    globalNotifWindow = new BrowserWindow({
      width: 450,
      height: 200,
      icon: path.join(__dirname, "../resources/icon.ico"),
      frame: false,
      resizable: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      show: false,
      focusable: false,
      minimizable: false,
      maximizable: false,
      closable: false,
      fullscreenable: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: true,
        allowRunningInsecureContent: false,
        preload: path.join(__dirname, "preload.js"),
      },
    });

    // Set window properties for maximum visibility
    globalNotifWindow.setVisibleOnAllWorkspaces(true, {
      visibleOnFullScreen: true,
    });
    globalNotifWindow.setAlwaysOnTop(true, "screen-saver");
    globalNotifWindow.setIgnoreMouseEvents(false);
    globalNotifWindow.setMenuBarVisibility(false);

    // Position the notification in the top-right corner
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;
    globalNotifWindow.setPosition(width - 470, 20);

    // Create HTML content for the notification
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: white;
              border-radius: 12px;
              box-shadow: 0 8px 32px rgba(0,0,0,0.12);
              overflow: hidden;
              opacity: 0;
              transition: opacity 0.3s ease-in;
              user-select: none;
              -webkit-user-select: none;
            }
            body.loaded {
              opacity: 1;
            }
            .notification {
              display: flex;
              align-items: center;
              padding: 16px;
              height: 168px;
            }
            .logo-section {
              display: flex;
              align-items: center;
              margin-right: 12px;
              min-width: 120px;
            }
            .logo {
              width: 32px;
              height: 32px;
              border-radius: 50%;
              background: #10b981;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 12px;
              margin-right: 8px;
              flex-shrink: 0;
            }
            .title {
              font-weight: 600;
              font-size: 14px;
              color: #1f2937;
              margin-bottom: 4px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .time {
              font-size: 11px;
              color: #6b7280;
            }
            .preview-section {
              flex: 1;
              margin: 0 12px;
              min-width: 0;
            }
            .preview-image {
              width: 100%;
              height: 120px;
              object-fit: cover;
              border-radius: 8px;
              border: 1px solid #e5e7eb;
              display: block;
            }
            .controls {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 8px;
              min-width: 40px;
              flex-shrink: 0;
            }
            .close-btn {
              background: none;
              border: none;
              font-size: 18px;
              color: #6b7280;
              cursor: pointer;
              padding: 4px;
              border-radius: 4px;
              transition: background-color 0.2s;
            }
            .close-btn:hover {
              background: #f3f4f6;
            }
            .progress-bar {
              width: 4px;
              height: 60px;
              background: #e5e7eb;
              border-radius: 2px;
              overflow: hidden;
            }
            .progress-fill {
              width: 100%;
              background: linear-gradient(to top, #10b981, #34d399);
              border-radius: 2px;
              animation: fill 5s linear;
            }
            @keyframes fill {
              from { height: 0%; }
              to { height: 100%; }
            }
            .trash-btn {
              background: none;
              border: none;
              font-size: 14px;
              color: #6b7280;
              cursor: pointer;
              padding: 4px;
              border-radius: 4px;
              transition: background-color 0.2s;
            }
            .trash-btn:hover {
              background: #f3f4f6;
            }
            .error-fallback {
              display: flex;
              align-items: center;
              justify-content: center;
              height: 120px;
              background: #f3f4f6;
              border-radius: 8px;
              border: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="notification">
            <div class="logo-section">
              <div class="logo">DS</div>
              <div>
                <div class="title">${notification.title}</div>
                <div class="time">${notification.body}</div>
              </div>
            </div>
            <div class="preview-section">
              ${
                notification.imageData
                  ? `<img src="${notification.imageData}" class="preview-image" alt="Screenshot preview" onload="document.body.classList.add('loaded')" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">`
                  : ""
              }
              <div class="error-fallback" style="display: ${
                notification.imageData ? "none" : "flex"
              }">
                Screenshot Preview
              </div>
            </div>
            <div class="controls">
              <button class="close-btn" onclick="window.close()">×</button>
              <div class="progress-bar">
                <div class="progress-fill"></div>
              </div>
              <button class="trash-btn" onclick="window.close()">🗑</button>
            </div>
          </div>
          <script>
            // Show content immediately if image is already loaded or if no image
            if (!document.images[0] || document.images[0].complete) {
              document.body.classList.add('loaded');
            }
            
            // Auto-close after 5 seconds
            const closeTimer = setTimeout(() => {
              window.close();
            }, 5000);
            
            // Clean up timer if window is closed manually
            window.addEventListener('beforeunload', () => {
              clearTimeout(closeTimer);
            });
          </script>
        </body>
      </html>
    `;

    // Load the HTML content
    globalNotifWindow.loadURL(
      `data:text/html;charset=utf-8,${encodeURIComponent(html)}`
    );

    // Handle window events
    globalNotifWindow.once("ready-to-show", () => {
      if (globalNotifWindow && !globalNotifWindow.isDestroyed()) {
        globalNotifWindow.showInactive();
        resolve();
      }
    });

    globalNotifWindow.once("closed", () => {
      cleanupNotificationWindow();
      resolve();
    });

    globalNotifWindow.webContents.on(
      "did-fail-load",
      (event, errorCode, errorDescription) => {
        console.error(
          "Notification window failed to load:",
          errorCode,
          errorDescription
        );
        cleanupNotificationWindow();
        reject(new Error(`Failed to load notification: ${errorDescription}`));
      }
    );

    // Auto-close after 5 seconds as backup
    setTimeout(() => {
      if (globalNotifWindow && !globalNotifWindow.isDestroyed()) {
        globalNotifWindow.close();
      }
    }, 5000);

    // Handle window errors
    globalNotifWindow.webContents.on("crashed" as any, () => {
      console.error("Notification window crashed");
      cleanupNotificationWindow();
      reject(new Error("Notification window crashed"));
    });
  });
};

// Fallback to system notification
const showFallbackNotification = async (notification: {
  title: string;
  body: string;
  icon: string;
  imageData?: string;
  timestamp: number;
}) => {
  const { Notification } = require("electron");
  const path = require("path");

  // Convert relative icon path to absolute path
  let iconPath = notification.icon;
  if (notification.icon.startsWith("/")) {
    iconPath = path.join(
      __dirname,
      "..",
      "renderer",
      "public",
      notification.icon.substring(1)
    );
  }

  const notif = new Notification({
    title: notification.title,
    body: notification.body,
    icon: iconPath,
    silent: false,
    timeoutType: "default",
  });

  notif.show();
};

(async () => {
  await app.whenReady();

  const mainWindow = createWindow("main", {
    width: 1000,
    height: 600,
    icon: path.join(__dirname, "../resources/icon.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
  });

  // Enable screen capture permissions
  mainWindow.webContents.session.setPermissionRequestHandler(
    (webContents, permission, callback) => {
      const allowedPermissions = [
        "media",
        "display-capture",
        "desktop-capture",
      ];
      if (allowedPermissions.includes(permission)) {
        callback(true);
      } else {
        callback(false);
      }
    }
  );

  if (isProd) {
    await mainWindow.loadURL("app://./home");
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/home`);
    mainWindow.webContents.openDevTools();
  }
})();

app.on("window-all-closed", () => {
  // Clean up notification window before quitting
  cleanupNotificationWindow();
  app.quit();
});

// Clean up on app quit
app.on("before-quit", () => {
  cleanupNotificationWindow();
});

ipcMain.on("message", async (event, arg) => {
  event.reply("message", `${arg} World!`);
});

ipcMain.handle("get-screen-sources", async () => {
  return await desktopCapturer.getSources({
    types: ["screen"],
    thumbnailSize: { width: 1920, height: 1080 },
  });
});

ipcMain.handle(
  "show-notification",
  async (event, title, body, icon, imageData) => {
    console.log("Notification request received:", {
      title,
      body,
      icon,
      hasImage: !!imageData,
    });

    // Add notification to queue
    notificationQueue.push({
      title,
      body,
      icon,
      imageData,
      timestamp: Date.now(),
    });

    // Process queue
    processNotificationQueue();

    return true;
  }
);
