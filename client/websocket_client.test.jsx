// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import WebSocketClient from './websocket_client.jsx';
const FAKE_URL = 'ws://localhostt:9001';

describe('WebSocketClient', () => {
    test('should call for createPingEvent on conn open and  clear existing ping pong timers', () => {
        const clientSocket = new WebSocketClient();
        clientSocket.createPingEvent = jest.fn();
        clientSocket.initialize(FAKE_URL);
        clientSocket.conn.onopen();
        expect(clientSocket.createPingEvent).toHaveBeenCalled();
        expect(clearTimeout).toHaveBeenCalledWith(clientSocket.pongTimer);
        expect(clearInterval).toHaveBeenCalledWith(clientSocket.pingTimer);
    });

    test('should clear ping pong timers on close of connection', () => {
        const clientSocket = new WebSocketClient();
        clientSocket.initialize(FAKE_URL);
        clientSocket.conn.onclose();
        expect(clearTimeout).toHaveBeenCalledWith(clientSocket.pongTimer);
        expect(clearInterval).toHaveBeenCalledWith(clientSocket.pingTimer);
    });

    test('should clear ping pong timers on error of connection', () => {
        const clientSocket = new WebSocketClient();
        clientSocket.initialize(FAKE_URL);
        clientSocket.conn.onerror();
        expect(clearTimeout).toHaveBeenCalledWith(clientSocket.pongTimer);
        expect(clearInterval).toHaveBeenCalledWith(clientSocket.pingTimer);
    });

    test('should call for createPingEvent on onmessage and clear existing ping pong timers', () => {
        const clientSocket = new WebSocketClient();
        clientSocket.createPingEvent = jest.fn();
        clientSocket.initialize(FAKE_URL);
        clientSocket.conn.onmessage({data: '{}'});
        expect(clientSocket.createPingEvent).toHaveBeenCalled();
        expect(clearTimeout).toHaveBeenCalledWith(clientSocket.pongTimer);
        expect(clearInterval).toHaveBeenCalledWith(clientSocket.pingTimer);
    });

    test('should call sendMessage on call of createPingEvent', () => {
        const clientSocket = new WebSocketClient();
        clientSocket.sendMessage = jest.fn();
        clientSocket.createPingEvent();
        expect(clientSocket.sendMessage).not.toHaveBeenCalled();
        jest.runTimersToTime(10000);
        expect(clientSocket.sendMessage).toHaveBeenCalledWith('ping');
        clientSocket.clearPingPong();
    });

    test('should call conn.onclose if waitForPong is called and timer is not cleared', () => {
        const clientSocket = new WebSocketClient();
        clientSocket.conn = {
            onclose: jest.fn(),
        };

        clientSocket.waitForPong();
        expect(clientSocket.conn.onclose).not.toHaveBeenCalled();
        clientSocket.clearPingPong();
        jest.runTimersToTime(2000);
        expect(clientSocket.conn.onclose).not.toHaveBeenCalled();
        clientSocket.waitForPong();
        jest.runTimersToTime(2000);
        expect(clientSocket.conn.onclose).toHaveBeenCalled();
    });
});
