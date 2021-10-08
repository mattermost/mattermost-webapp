// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {IntlShape} from 'react-intl';

import {AppCallRequest, AppCallResponse, AppCallType, AppContext} from 'mattermost-redux/types/apps';
import {Post} from 'mattermost-redux/types/posts';

export type DoAppCallResult<Res=unknown> = {
    data?: AppCallResponse<Res>;
    error?: AppCallResponse<Res>;
}

export interface DoAppCall<Res=unknown> {
    (call: AppCallRequest, type: AppCallType, intl: IntlShape): Promise<DoAppCallResult<Res>>;
}

export interface PostEphemeralCallResponseForPost {
    (response: AppCallResponse, message: string, post: Post): void;
}

export interface PostEphemeralCallResponseForChannel {
    (response: AppCallResponse, message: string, channelID: string): void;
}

export interface PostEphemeralCallResponseForContext {
    (response: AppCallResponse, message: string, context: AppContext): void;
}
