// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {MessageAttachment} from './message_attachments';

export type IncomingWebhook = {
    id: string;
    create_at: number;
    update_at: number;
    delete_at: number;
    user_id: string;
    channel_id: string;
    team_id: string;
    display_name: string;
    description: string;
    username: string;
    icon_url: string;
    channel_locked: boolean;
};

export type OutgoingWebhook = {
    id: string;
    token: string;
    create_at: number;
    update_at: number;
    delete_at: number;
    creator_id: string;
    channel_id: string;
    team_id: string;
    trigger_words: string[];
    trigger_when: number;
    callback_urls: string[];
    display_name: string;
    description: string;
    content_type: string;
    username: string;
    icon_url: string;
};

export type Command = {
    'id': string;
    'token': string;
    'create_at': number;
    'update_at': number;
    'delete_at': number;
    'creator_id': string;
    'team_id': string;
    'trigger': string;
    'method': 'P' | 'G' | '';
    'username': string;
    'icon_url': string;
    'auto_complete': boolean;
    'auto_complete_desc': string;
    'auto_complete_hint': string;
    'display_name': string;
    'description': string;
    'url': string;
};

export type CommandArgs = {
    channel_id: string;
    team_id?: string;
    root_id?: string;
    parent_id?: string;
}

export type CommandResponse = {
    response_type: string;
    text: string;
    username: string;
    channel_id: SVGAnimatedString;
    icon_url: string;
    type: string;
    props: Record<string, any>;
    goto_location: string;
    trigger_id: string;
    skip_slack_parsing: boolean;
    attachments: MessageAttachment[];
    extra_responses: CommandResponse[];
};

export type OAuthApp = {
    'id': string;
    'creator_id': string;
    'create_at': number;
    'update_at': number;
    'client_secret': string;
    'name': string;
    'description': string;
    'icon_url': string;
    'callback_urls': string[];
    'homepage': string;
    'is_trusted': boolean;
};

export type DialogSubmission = {
    url: string;
    callback_id: string;
    state: string;
    user_id: string;
    channel_id: string;
    team_id: string;
    submission: {
        [x: string]: string;
    };
    cancelled: boolean;
};

export type SubmitDialogResponse = {
    error?: string;
    errors?: Record<string, string>;
};
