// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export const meQuery = `
{
    config
    license
    user(id:"me") {
        id
        authService
        deleteAt
        email
        #updateAt
        firstName
        lastName
        lastPictureUpdateAt
        locale
        nickname
        position
        roles {
            id
            name
            permissions
        }
        username
        notifyProps
        props
        timezone
        isBot
        status {
            status
        }
        preferences{
            category
            name
            value
            userId
        }
        sessions {
            createAt
            expiresAt
        }
    }
    teamMembers(userId:"me") {
        deleteAt
        roles {
            id
            name
            permissions
        }
        team {
            id
            description
            displayName
            name
            type
            allowedDomains
            lastTeamIconUpdate
            groupConstrained
            allowOpenInvite
            updateAt
        }
        sidebarCategories {
            id
            displayName
            sorting
            # sortOrder
            muted
            collapsed
            type
            channelIds
        }
        user {
            id
        }
    }
    channelMembers(userId:"me") {
        msgCount
        mentionCount
        lastViewedAt
        notifyProps
        roles {
            id
            name
            permissions
        }
        channel {
            id
            header
            purpose
            type
            createAt
            creatorId
            deleteAt
            displayName
            groupConstrained
            name
            shared
            lastPostAt
            totalMsgCount
            team {
                id
            }
            # stats {
            #   guestCount
            #   memberCount
            #   pinnedPostCount
            # }
        }
        user {
            id
        }
    }
}
`;
