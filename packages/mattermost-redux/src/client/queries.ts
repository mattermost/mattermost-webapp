// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

const myDataQueryString = `
{
    config
    license
    user(id: "me") {
      id
      create_at: createAt
      delete_at: deleteAt
      username
      auth_service: authService
      email
      nickname
      first_name: firstName
      last_name: lastName
      position
      roles {
        id
        name
        permissions
      }
      props
      notify_props: notifyProps
      last_picture_update: lastPictureUpdateAt
      locale
      timezone
      is_bot: isBot
      preferences {
        name
        user_id: userId
        category
        value
      }
    }
    teamMembers(userId: "me") {
      team {
        id
        display_name: displayName
        name
        update_at: updateAt
        description
        email
        type
        company_name: companyName
        allowed_domains: allowedDomains
        invite_id: inviteId
        last_team_icon_update: lastTeamIconUpdate
        group_constrained: groupConstrained
        allow_open_invite: allowOpenInvite
      }
      user {
        id
      }
      roles {
        name
      }
      delete_at: deleteAt
      scheme_guest: schemeGuest
      scheme_user: schemeUser
      scheme_admin: schemeAdmin
    }
}`;

export const myDataQuery = JSON.stringify({query: myDataQueryString});
