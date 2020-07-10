// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/// <reference types="cypress" />

declare namespace Cypress {
    type Bot = import('mattermost-redux/types/bots').Bot;
    type Channel = import('mattermost-redux/types/channels').Channel;
    type ChannelMembership = import('mattermost-redux/types/channels').ChannelMembership;
    type ChannelType = import('mattermost-redux/types/channels').ChannelType;
    type PreferenceType = import('mattermost-redux/types/preferences').PreferenceType;
    type Team = import('mattermost-redux/types/teams').Team;
    type TeamMembership = import('mattermost-redux/types/teams').TeamMembership;
    type UserProfile = import('mattermost-redux/types/users').UserProfile;
}
