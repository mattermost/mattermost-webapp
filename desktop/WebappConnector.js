import { EventEmitter } from "events";

/**
 * Class to handle interfacing with the desktop app
 */
export default class WebappConnector extends EventEmitter {
  /**
   * Sends data to the desktop app for the provided event
   * @param {string} event
   * @param  {...any} data 
   */
  send(event, ...data) {
    if(window.desktopBridge && window.desktopBridge.ready) {
      window.desktopBridge.desktop.receive(event, ...data);
    }
  }

  /**
   * Receives data from the desktop app for the provided event
   * @param {string} event 
   * @param  {...any} data
   * @emits {event} the provided event and data is emitted to listeners
   */
  receive(event, ...data) {
    const serializedData = JSON.stringify([event, ...data]);
    this.emit(...JSON.parse(serializedData));
  }
}