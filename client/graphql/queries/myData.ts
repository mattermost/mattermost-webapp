// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ApiGraphQLTypes} from '../types';

export type MyDataQueryResponseType = {
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
  teamMembers (userId: "me") {
    team {
      id,
      displayName,
      name,
      updateAt,
      description,
      email,
      type,
      companyName,
      allowedDomains,
      inviteId,
      lastTeamIconUpdate,
      groupConstrained,
      allowOpenInvite,
    }
  }
}
`,
});

export function transformToRecievedMeReducerPayload(user: Partial<MyDataQueryResponseType['data']['user']>) {
    return {
        id: user?.id ?? '',
        create_at: user?.createAt ?? 0,
        delete_at: user?.deleteAt ?? 0,
        username: user?.username ?? '',
        auth_service: user?.authService ?? '',
        email: user?.email ?? '',
        nickname: user?.nickname ?? '',
        first_name: user?.firstName ?? '',
        last_name: user?.lastName ?? '',
        position: user?.position ?? '',
        roles: user?.roles?.map((role) => role.name!).join(',') ?? '',
        props: user?.props ?? {},
        notify_props: user?.notifyProps ?? {},
        last_picture_update: user?.lastPictureUpdateAt ?? 0,
        locale: user?.locale ?? '',
        timezone: user?.timezone,
        is_bot: user?.isBot ?? false,

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

export function transformToRecievedAllPreferencesReducerPayload(user: Partial<MyDataQueryResponseType['data']['user']>) {
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

export function transoformToRecievedTeamsListReducerPayload(teamsMembers: Partial<MyDataQueryResponseType['data']['teamMembers']>) {
    return teamsMembers.map((teamMember) => ({
        id: teamMember?.team?.id ?? '',
        update_at: teamMember?.team?.updateAt ?? 0,
        display_name: teamMember?.team?.displayName ?? '',
        name: teamMember?.team?.name ?? '',
        description: teamMember?.team?.description ?? '',
        email: teamMember?.team?.email ?? '',
        type: teamMember?.team?.type ?? 'I',
        company_name: teamMember?.team?.companyName ?? '',
        allowed_domains: teamMember?.team?.allowedDomains ?? '',
        invite_id: teamMember?.team?.inviteId ?? '',
        allow_open_invite: teamMember?.team?.allowOpenInvite ?? false,
        group_constrained: teamMember?.team?.groupConstrained ?? false,
        last_team_icon_update: teamMember?.team?.lastTeamIconUpdate ?? 0,

        // below fields arent included in the response but where inside of team rest api types
        create_at: 0,
        delete_at: 0,
        scheme_id: '',
        policy_id: '',
    }));
}
