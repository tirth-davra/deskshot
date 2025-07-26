import { useState, useEffect, useRef, useContext } from "react";
import { useRouter } from "next/router";
import { ThemeContext } from "./_app";

const LOGO_URL = "/images/icon-512x512.png"; // Deskshot logo

function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

// Test data
const testProjects = [
  { id: 1, name: "Website Redesign", description: "Modernize company website" },
  { id: 2, name: "Mobile App Development", description: "iOS and Android app" },
  { id: 3, name: "Database Migration", description: "Move to cloud database" },
  {
    id: 4,
    name: "API Integration",
    description: "Third-party service integration",
  },
  {
    id: 5,
    name: "Security Audit",
    description: "Comprehensive security review",
  },
];

// Test task data
const testTasks = {
  1: [
    { id: 1, name: "Design Homepage Layout", projectId: 1 },
    { id: 2, name: "Create Navigation Menu", projectId: 1 },
    { id: 3, name: "Implement Contact Form", projectId: 1 },
    { id: 4, name: "Mobile Responsive Design", projectId: 1 },
  ],
  2: [
    { id: 5, name: "Setup React Native Project", projectId: 2 },
    { id: 6, name: "Design App UI/UX", projectId: 2 },
    { id: 7, name: "Implement User Authentication", projectId: 2 },
    { id: 8, name: "API Integration", projectId: 2 },
    { id: 9, name: "Testing & Bug Fixes", projectId: 2 },
  ],
  3: [
    { id: 10, name: "Backup Current Database", projectId: 3 },
    { id: 11, name: "Setup Cloud Database", projectId: 3 },
    { id: 12, name: "Data Migration Scripts", projectId: 3 },
    { id: 13, name: "Verify Data Integrity", projectId: 3 },
  ],
  4: [
    { id: 14, name: "Research API Providers", projectId: 4 },
    { id: 15, name: "Setup API Keys", projectId: 4 },
    { id: 16, name: "Implement API Calls", projectId: 4 },
    { id: 17, name: "Error Handling", projectId: 4 },
  ],
  5: [
    { id: 18, name: "Vulnerability Assessment", projectId: 5 },
    { id: 19, name: "Penetration Testing", projectId: 5 },
    { id: 20, name: "Security Report Generation", projectId: 5 },
    { id: 21, name: "Implement Security Fixes", projectId: 5 },
  ],
};

export default function Home() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const router = useRouter();
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [time, setTime] = useState(0);
  const [screenshots, setScreenshots] = useState([]); // {url, timestamp}
  const [mediaStream, setMediaStream] = useState(null);
  const [activeProject, setActiveProject] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  const [selectedProjectForTasks, setSelectedProjectForTasks] = useState(null);
  const [totalTime, setTotalTime] = useState(0); // Total time across all sessions
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const screenshotIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Authentication check
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [router]);

  // Timer logic
  useEffect(() => {
    if (isRunning && !isPaused) {
      timerRef.current = setInterval(() => {
        setTime((t) => t + 1);
        setTotalTime((t) => t + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, isPaused]);

  // Screenshot interval logic (every 10 min, demo: 10 sec)
  useEffect(() => {
    if (isRunning && !isPaused && mediaStream) {
      screenshotIntervalRef.current = setInterval(() => {
        captureScreenshot();
      }, 10000); // 10 seconds for demo; change to 600000 for 10 min
    } else {
      clearInterval(screenshotIntervalRef.current);
    }
    return () => clearInterval(screenshotIntervalRef.current);
  }, [isRunning, isPaused, mediaStream]);

  // Start tracking for a specific project
  const startProjectTracking = async (project) => {
    setActiveProject(project);
    setActiveTask(null);
    setSelectedProjectForTasks(null); // Clear task view when starting project tracking

    if (!mediaStream) {
      try {
        // Get screen sources using Electron's desktopCapturer
        const sources = await window.electronAPI.getScreenSources();
        if (!sources || sources.length === 0) {
          alert("No screen sources found.");
          return;
        }

        // Use the first screen source (primary monitor)
        const source = sources[0];
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            mandatory: {
              chromeMediaSource: "desktop",
              chromeMediaSourceId: source.id,
              minWidth: 1920,
              maxWidth: 1920,
              minHeight: 1080,
              maxHeight: 1080,
            },
          } as any,
        });
        setMediaStream(stream);
      } catch (err) {
        console.error("Screen capture error:", err);
        alert("Screen capture failed. Please try again.");
        return;
      }
    }
    setIsRunning(true);
    setIsPaused(false);
  };

  // Start tracking for a specific task
  const startTaskTracking = async (task) => {
    setActiveTask(task);
    setActiveProject(null);

    if (!mediaStream) {
      try {
        // Get screen sources using Electron's desktopCapturer
        const sources = await window.electronAPI.getScreenSources();
        if (!sources || sources.length === 0) {
          alert("No screen sources found.");
          return;
        }

        // Use the first screen source (primary monitor)
        const source = sources[0];
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            mandatory: {
              chromeMediaSource: "desktop",
              chromeMediaSourceId: source.id,
              minWidth: 1920,
              maxWidth: 1920,
              minHeight: 1080,
              maxHeight: 1080,
            },
          } as any,
        });
        setMediaStream(stream);
      } catch (err) {
        console.error("Screen capture error:", err);
        alert("Screen capture failed. Please try again.");
        return;
      }
    }
    setIsRunning(true);
    setIsPaused(false);
  };

  // View tasks for a project
  const viewProjectTasks = (project) => {
    setSelectedProjectForTasks(project);
  };

  // Go back to projects list
  const goBackToProjects = () => {
    setSelectedProjectForTasks(null);
    // Don't clear activeTask here - keep the tracking state
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    router.push("/login");
  };

  // Pause tracking
  const pauseTracking = () => {
    setIsPaused(true);
  };

  // Resume tracking
  const resumeTracking = () => {
    setIsPaused(false);
  };

  // Stop tracking
  const stopTracking = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTime(0);
    setActiveProject(null);
    setActiveTask(null);
    setSelectedProjectForTasks(null); // Clear task view when stopping
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
    }
  };

  // Screenshot capture logic
  const captureScreenshot = async () => {
    if (!mediaStream) return;
    const video = document.createElement("video");
    video.srcObject = mediaStream;
    await video.play();
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const url = canvas.toDataURL("image/png");
    const timestamp = new Date();
    setScreenshots((prev) => [{ url, timestamp }, ...prev]);

    // Show system-level notification with image preview
    try {
      await window.electronAPI.showNotification(
        "Screen Captured",
        `at ${timestamp.toLocaleTimeString()}`,
        LOGO_URL,
        url // Pass the captured image data
      );
      console.log("Electron notification with image sent successfully");
    } catch (error) {
      console.error("Error showing notification:", error);
    }

    video.pause();
    video.srcObject = null;
  };

  // Progress bar (10 min = 600 sec, demo: 10 sec)
  const progress = (time % 10) / 10; // for demo; use 600 for real

  // Get current date
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-green-100 dark:from-gray-900 dark:via-gray-800 dark:to-green-900 flex">
      {/* Theme Switcher */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={toggleTheme}
          className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-200"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </button>
      </div>

      {/* Left Section - Projects (70%) */}
      <div className="w-[70%] p-8">
        {/* Welcome Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
              Welcome, John Doe
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Manage your projects and track your time efficiently
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors"
            title="Logout"
          >
            Logout
          </button>
        </div>

        {/* Projects List or Tasks List */}
        {!selectedProjectForTasks ? (
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
              Your Projects List
            </h2>

            <div className="space-y-4">
              {testProjects.map((project) => (
                <div
                  key={project.id}
                  className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border transition-all ${
                    activeProject?.id === project.id ||
                    (activeTask && activeTask.projectId === project.id)
                      ? "border-green-500 shadow-green-500/20"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">
                        {project.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {activeTask && activeTask.projectId === project.id
                          ? `Tracking: ${activeTask.name}`
                          : project.description}
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => startProjectTracking(project)}
                        disabled={isRunning}
                        className={`p-3 rounded-lg transition-all ${
                          isRunning
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : activeProject?.id === project.id ||
                              (activeTask &&
                                activeTask.projectId === project.id)
                            ? "bg-green-500 hover:bg-green-600 text-white"
                            : "bg-gray-600 hover:bg-gray-700 text-white"
                        }`}
                        title={
                          activeProject?.id === project.id ||
                          (activeTask && activeTask.projectId === project.id)
                            ? "Tracking..."
                            : "Start Tracker"
                        }
                      >
                        {activeProject?.id === project.id ? (
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </button>

                      <button
                        onClick={() => viewProjectTasks(project)}
                        className="p-3 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-all"
                        title="View Tasks"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                          <path
                            fillRule="evenodd"
                            d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-6">
            {/* Back Button */}
            <div className="mb-6">
              <button
                onClick={goBackToProjects}
                className="flex items-center gap-2 text-gray-800 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium">Back to Projects</span>
              </button>
            </div>

            {/* Task List Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
                Task List
              </h2>
              <div className="inline-block bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                {selectedProjectForTasks.name}
              </div>
            </div>

            {/* Tasks List */}
            <div className="space-y-4">
              {testTasks[selectedProjectForTasks.id]?.map((task) => (
                <div
                  key={task.id}
                  className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border transition-all ${
                    activeTask?.id === task.id
                      ? "border-green-500 shadow-green-500/20"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
          <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                        {task.name}
                      </h3>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => startTaskTracking(task)}
                        disabled={isRunning && activeTask?.id !== task.id}
                        className={`p-3 rounded-lg transition-all ${
                          isRunning && activeTask?.id !== task.id
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : activeTask?.id === task.id
                            ? "bg-green-500 hover:bg-green-600 text-white"
                            : "bg-gray-600 hover:bg-gray-700 text-white"
                        }`}
                        title={
                          activeTask?.id === task.id
                            ? "Tracking..."
                            : "Start Tracker"
                        }
                      >
                        {activeTask?.id === task.id ? (
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Section - Tracker (30%) */}
      <div className="w-[30%] p-6">
        {/* Current Date */}
        <div className="mb-6">
          <p className="text-gray-800 dark:text-white text-lg font-medium">{currentDate}</p>
        </div>

        {/* Total Time Tracker */}
        <div className="mb-8">
          <h3 className="text-gray-800 dark:text-white text-lg font-semibold mb-2">
            Total Time Tracker Running
          </h3>
          <div className="text-3xl font-mono font-bold text-green-400">
            {formatTime(totalTime)}
          </div>
        </div>

        {/* Deskshot Tracker */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 mt-11">
          {/* Active Project/Task Info */}
          {(activeProject || activeTask) && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
              <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                Tracking: {activeProject?.name || activeTask?.name}
              </p>
            </div>
          )}

        {/* Screenshot Preview (last) */}
        {screenshots[0] && (
            <div className="mb-4 flex justify-center">
              <div className="rounded-lg overflow-hidden border-2 border-green-200 dark:border-green-700 shadow-md">
              <img
                src={screenshots[0].url}
                alt="Last Screenshot"
                  className="w-full h-24 object-cover"
              />
            </div>
          </div>
        )}

        {/* Timer */}
          <div className="text-center mb-4">
            <div className="text-3xl font-mono font-bold text-gray-800 dark:text-white mb-2">
            {formatTime(time)}
          </div>
        </div>

        {/* Progress Bar */}
          <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full mb-4 overflow-hidden">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-green-400 to-green-600 transition-all"
            style={{ width: `${progress * 100}%` }}
          ></div>
        </div>

        {/* Controls */}
          <div className="flex gap-2 justify-center mb-4">
          {!isRunning ? (
            <button
                onClick={() => {
                  if (activeProject) {
                    startProjectTracking(activeProject);
                  } else if (activeTask) {
                    startTaskTracking(activeTask);
                  }
                }}
                disabled={!activeProject && !activeTask}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  !activeProject && !activeTask
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600 text-white"
                }`}
            >
              Start Tracking
            </button>
          ) : isPaused ? (
            <button
              onClick={resumeTracking}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all"
            >
              Resume
            </button>
          ) : (
            <button
              onClick={pauseTracking}
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-4 py-2 rounded-lg font-semibold text-sm transition-all"
            >
              Pause
            </button>
          )}
          <button
            onClick={stopTracking}
              className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg font-semibold text-sm transition-all"
          >
            Stop
          </button>
        </div>

        {/* Screenshot Gallery */}
          <div>
            <div className="flex items-center mb-2">
              <span className="font-semibold text-gray-700 dark:text-gray-200 text-sm">
              Screenshots
            </span>
              <span className="ml-1 text-xs text-gray-400">(last 3)</span>
          </div>
          {screenshots.length === 0 ? (
              <div className="text-gray-400 text-xs">No screenshots yet.</div>
          ) : (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {screenshots.slice(0, 3).map((shot, idx) => (
                <div
                  key={idx}
                    className="relative group rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm flex-shrink-0"
                >
                  <img
                    src={shot.url}
                    alt={`Screenshot ${idx + 1}`}
                      className="w-16 h-12 object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs text-center rounded-b opacity-0 group-hover:opacity-100 transition-opacity py-1">
                    {shot.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
