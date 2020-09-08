// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/// <reference types="cypress" />

declare namespace Cypress {
    type AdminConfig = import('mattermost-redux/types/config').AdminConfig;
    type AnalyticsRow = import('mattermost-redux/types/admin').AnalyticsRow;
    type Bot = import('mattermost-redux/types/bots').Bot;
    type Channel = import('mattermost-redux/types/channels').Channel;
    type ClientLicense = import('mattermost-redux/types/config').ClientLicense;
    type ChannelMembership = import('mattermost-redux/types/channels').ChannelMembership;
    type ChannelType = import('mattermost-redux/types/channels').ChannelType;
    type Permissions = Array<string>;
    type PreferenceType = import('mattermost-redux/types/preferences').PreferenceType;
    type Role = import('mattermost-redux/types/roles').Role;
    type Scheme = import('mattermost-redux/types/schemes').Scheme;
    type Team = import('mattermost-redux/types/teams').Team;
    type TeamMembership = import('mattermost-redux/types/teams').TeamMembership;
    type TermsOfService = import('mattermost-redux/types/terms_of_service').TermsOfService;
    type UserProfile = import('mattermost-redux/types/users').UserProfile;
    type UserStatus = import('mattermost-redux/types/users').UserStatus;
}
