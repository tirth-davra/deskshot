import { IpcHandler } from '../main/preload'

declare global {
  interface Window {
    ipc: IpcHandler
    electronAPI: {
      getScreenSources: () => Promise<any[]>
      showNotification: (title: string, body: string, icon: string, imageData?: string) => Promise<boolean>
    }
  }
}
