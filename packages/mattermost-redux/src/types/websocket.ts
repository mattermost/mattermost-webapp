// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export type WebSocketBroadcast = {
    omit_users: Record<string, boolean>;
    user_id: string;
    channel_id: string;
    team_id: string;
}

export type WebSocketMessage<T> = {
    event: string;
    data: T;
    broadcast: WebSocketBroadcast;
    seq: number;
}

export type WebsocketStatus = {
    connected: boolean;
    lastConnectAt: number;
    lastDisconnectAt: number;
}
