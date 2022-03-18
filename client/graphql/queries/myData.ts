// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ApiGraphQLTypes} from '../types';
import {User} from '../types/user';

export type MyQueryResponseType = {
    data: {
        user: ApiGraphQLTypes['user'];
        config: ApiGraphQLTypes['config'];
        license: ApiGraphQLTypes['license'];
        teamMembers: ApiGraphQLTypes['teamMembers'];
    };
};

export const myDataQuery = JSON.stringify({
    query: `
{
  user(id: "me") {
    id
    createAt
    deleteAt
    username
    authService
    email
    nickname
    firstName
    lastName
    position
    roles {
      id
      name
      permissions
    }
    props
    notifyProps
    lastPictureUpdateAt
    locale
    timezone
    isBot
    #status {
      #status
      #manual
      #dndEndTime
    #}
    preferences {
      name
      userId
      category
      value
    }
  }
}
`,
});

export function transformToRecievedMeReducerPayload(user: Partial<User>) {
    return {
        id: user.id || '',
        create_at: user.createAt || 0,
        delete_at: user.deleteAt || 0,
        username: user.username || '',
        auth_service: user.authService || '',
        email: user.email || '',
        nickname: user.nickname || '',
        first_name: user.firstName || '',
        last_name: user.lastName || '',
        position: user.position || '',
        roles: user.roles?.map((role) => role.name!).join(',') || '',
        props: user.props || {},
        notify_props: user.notifyProps || ({} as User['notifyProps']),
        last_picture_update: user.lastPictureUpdateAt || 0,
        locale: user.locale || '',
        timezone: user.timezone || undefined,
        is_bot: user.isBot || false,

        // below fields arent included in the response but where inside of user rest api types
        auth_data: '',
        email_verified: true,
        allow_marketing: true,
        last_activity_at: 0,
        bot_description: '',
        bot_last_icon_update: 0,
        terms_of_service_id: '',
        terms_of_service_create_at: 0,
        remote_id: '',
    };
}

export function transformToRecievedAllPreferencesReducerPayload(
    user: Partial<User>,
) {
    if (!(user.preferences && user.preferences.length > 0)) {
        return [];
    }

    return user.preferences.map((preference) => ({
        name: preference.name || '',
        user_id: preference.userId || '',
        category: preference.category || '',
        value: preference.value || '',
    }));
}
