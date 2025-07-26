import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'

const handler = {
  send(channel: string, value: unknown) {
    ipcRenderer.send(channel, value)
  },
  on(channel: string, callback: (...args: unknown[]) => void) {
    const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
      callback(...args)
    ipcRenderer.on(channel, subscription)

    return () => {
      ipcRenderer.removeListener(channel, subscription)
    }
  },
  async getScreenSources() {
    return await ipcRenderer.invoke('get-screen-sources')
  },
  async showNotification(title: string, body: string, icon: string, imageData?: string) {
    return await ipcRenderer.invoke('show-notification', title, body, icon, imageData)
  }
}

contextBridge.exposeInMainWorld('ipc', handler)
contextBridge.exposeInMainWorld('electronAPI', {
  getScreenSources: handler.getScreenSources,
  showNotification: handler.showNotification
})

export type IpcHandler = typeof handler
