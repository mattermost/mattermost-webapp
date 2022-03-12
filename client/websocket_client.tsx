// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {SocketEvents} from 'utils/constants';

const MAX_WEBSOCKET_FAILS = 7;
const MIN_WEBSOCKET_RETRY_TIME = 3000; // 3 sec
const MAX_WEBSOCKET_RETRY_TIME = 300000; // 5 mins

export default class WebSocketClient {
    private conn: WebSocket | null;
    private connectionUrl: string | null;

    // responseSequence is the number to track a response sent
    // via the websocket. A response will always have the same sequence number
    // as the request.
    private responseSequence: number;

    // serverSequence is the incrementing sequence number from the
    // server-sent event stream.
    private serverSequence: number;
    private connectFailCount: number;
    private eventCallback: ((msg: any) => void) | null;
    private responseCallbacks: {[x: number]: ((msg: any) => void)};
    private firstConnectCallback: (() => void) | null;
    private reconnectCallback: (() => void) | null;
    private missedEventCallback: (() => void) | null;
    private errorCallback: ((event: Event) => void) | null;
    private closeCallback: ((connectFailCount: number) => void) | null;
    private connectionId: string | null;

    constructor() {
        this.conn = null;
        this.connectionUrl = null;
        this.responseSequence = 1;
        this.serverSequence = 0;
        this.connectFailCount = 0;
        this.eventCallback = null;
        this.responseCallbacks = {};
        this.firstConnectCallback = null;
        this.reconnectCallback = null;
        this.missedEventCallback = null;
        this.errorCallback = null;
        this.closeCallback = null;
        this.connectionId = '';
    }

    // on connect, only send auth cookie and blank state.
    // on hello, get the connectionID and store it.
    // on reconnect, send cookie, connectionID, sequence number.
    initialize(connectionUrl = this.connectionUrl, token?: string) {
        if (this.conn) {
            return;
        }

        if (connectionUrl == null) {
            console.log('websocket must have connection url'); //eslint-disable-line no-console
            return;
        }

        if (this.connectFailCount === 0) {
            console.log('websocket connecting to ' + connectionUrl); //eslint-disable-line no-console
        }

        // Add connection id, and last_sequence_number to the query param.
        // We cannot use a cookie because it will bleed across tabs.
        // We cannot also send it as part of the auth_challenge, because the session cookie is already sent with the request.
        this.conn = new WebSocket(`${connectionUrl}?connection_id=${this.connectionId}&sequence_number=${this.serverSequence}`);
        this.connectionUrl = connectionUrl;

        this.conn.onopen = () => {
            if (token) {
                this.sendMessage('authentication_challenge', {token});
            }

            if (this.connectFailCount > 0) {
                console.log('websocket re-established connection'); //eslint-disable-line no-console
                if (this.reconnectCallback) {
                    this.reconnectCallback();
                }
            } else if (this.firstConnectCallback) {
                this.firstConnectCallback();
            }

            this.connectFailCount = 0;
        };

        this.conn.onclose = () => {
            this.conn = null;
            this.responseSequence = 1;

            if (this.connectFailCount === 0) {
                console.log('websocket closed'); //eslint-disable-line no-console
            }

            this.connectFailCount++;

            if (this.closeCallback) {
                this.closeCallback(this.connectFailCount);
            }

            let retryTime = MIN_WEBSOCKET_RETRY_TIME;

            // If we've failed a bunch of connections then start backing off
            if (this.connectFailCount > MAX_WEBSOCKET_FAILS) {
                retryTime = MIN_WEBSOCKET_RETRY_TIME * this.connectFailCount * this.connectFailCount;
                if (retryTime > MAX_WEBSOCKET_RETRY_TIME) {
                    retryTime = MAX_WEBSOCKET_RETRY_TIME;
                }
            }

            setTimeout(
                () => {
                    this.initialize(connectionUrl, token);
                },
                retryTime,
            );
        };

        this.conn.onerror = (evt) => {
            if (this.connectFailCount <= 1) {
                console.log('websocket error'); //eslint-disable-line no-console
                console.log(evt); //eslint-disable-line no-console
            }

            if (this.errorCallback) {
                this.errorCallback(evt);
            }
        };

        this.conn.onmessage = (evt) => {
            const msg = JSON.parse(evt.data);
            if (msg.seq_reply) {
                // This indicates a reply to a websocket request.
                // We ignore sequence number validation of message responses
                // and only focus on the purely server side event stream.
                if (msg.error) {
                    console.log(msg); //eslint-disable-line no-console
                }

                if (this.responseCallbacks[msg.seq_reply]) {
                    this.responseCallbacks[msg.seq_reply](msg);
                    Reflect.deleteProperty(this.responseCallbacks, msg.seq_reply);
                }
            } else if (this.eventCallback) {
                // We check the hello packet, which is always the first packet in a stream.
                if (msg.event === SocketEvents.HELLO && this.missedEventCallback) {
                    console.log('got connection id ', msg.data.connection_id); //eslint-disable-line no-console
                    // If we already have a connectionId present, and server sends a different one,
                    // that means it's either a long timeout, or server restart, or sequence number is not found.
                    // Then we do the sync calls, and reset sequence number to 0.
                    if (this.connectionId !== '' && this.connectionId !== msg.data.connection_id) {
                        console.log('long timeout, or server restart, or sequence number is not found.'); //eslint-disable-line no-console
                        this.missedEventCallback();
                        this.serverSequence = 0;
                    }

                    // If it's a fresh connection, we have to set the connectionId regardless.
                    // And if it's an existing connection, setting it again is harmless, and keeps the code simple.
                    this.connectionId = msg.data.connection_id;
                }

                // Now we check for sequence number, and if it does not match,
                // we just disconnect and reconnect.
                if (msg.seq !== this.serverSequence) {
                    console.log('missed websocket event, act_seq=' + msg.seq + ' exp_seq=' + this.serverSequence); //eslint-disable-line no-console
                    // We are not calling this.close() because we need to auto-restart.
                    this.connectFailCount = 0;
                    this.responseSequence = 1;
                    this.conn?.close(); // Will auto-reconnect after MIN_WEBSOCKET_RETRY_TIME.
                    return;
                }
                this.serverSequence = msg.seq + 1;
                this.eventCallback(msg);
            }
        };
    }

    setEventCallback(callback: (msg: any) => void) {
        this.eventCallback = callback;
    }

    setFirstConnectCallback(callback: () => void) {
        this.firstConnectCallback = callback;
    }

    setReconnectCallback(callback: () => void) {
        this.reconnectCallback = callback;
    }

    setMissedEventCallback(callback: () => void) {
        this.missedEventCallback = callback;
    }

    setErrorCallback(callback: (event: Event) => void) {
        this.errorCallback = callback;
    }

    setCloseCallback(callback: (connectFailCount: number) => void) {
        this.closeCallback = callback;
    }

    close() {
        this.connectFailCount = 0;
        this.responseSequence = 1;
        if (this.conn && this.conn.readyState === WebSocket.OPEN) {
            this.conn.onclose = () => {}; //eslint-disable-line no-empty-function
            this.conn.close();
            this.conn = null;
            console.log('websocket closed'); //eslint-disable-line no-console
        }
    }

    sendMessage(action: string, data: any, responseCallback?: () => void) {
        const msg = {
            action,
            seq: this.responseSequence++,
            data,
        };

        if (responseCallback) {
            this.responseCallbacks[msg.seq] = responseCallback;
        }

        if (this.conn && this.conn.readyState === WebSocket.OPEN) {
            this.conn.send(JSON.stringify(msg));
        } else if (!this.conn || this.conn.readyState === WebSocket.CLOSED) {
            this.conn = null;
            this.initialize();
        }
    }

    userTyping(channelId: string, parentId: string, callback?: () => void) {
        const data = {
            channel_id: channelId,
            parent_id: parentId,
        };
        this.sendMessage('user_typing', data, callback);
    }

    subscribe(subscriptionID: string) {
        this.sendMessage('subscribe', {
            subscription_id: subscriptionID,
        });
    }

    unsubscribe(subscriptionID: string) {
        this.sendMessage('unsubscribe', {
            subscription_id: subscriptionID,
        });
    }

    userUpdateActiveStatus(userIsActive: boolean, manual: boolean, callback?: () => void) {
        const data = {
            user_is_active: userIsActive,
            manual,
        };
        this.sendMessage('user_update_active_status', data, callback);
    }

    getStatuses(callback?: () => void) {
        this.sendMessage('get_statuses', null, callback);
    }

    getStatusesByIds(userIds: string[], callback?: () => void) {
        const data = {
            user_ids: userIds,
        };
        this.sendMessage('get_statuses_by_ids', data, callback);
    }
}
