// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {PaidFeatures} from './constants';

// eslint-disable-next-line @typescript-eslint/ban-types
export function mapFeatureIdToTranslation(id: string, formatMessage: Function): string {
    switch (id) {
    case PaidFeatures.GUEST_ACCOUNTS:
        return formatMessage({id: 'webapp.mattermost.feature.guest_accounts', defaultMessage: 'Guest Accounts'});
    case PaidFeatures.CUSTOM_USER_GROUPS:
        return formatMessage({id: 'webapp.mattermost.feature.custom_user_groups', defaultMessage: 'Custom User groups'});
    case PaidFeatures.CREATE_MULTIPLE_TEAMS:
        return formatMessage({id: 'webapp.mattermost.feature.create_multiple_teams', defaultMessage: 'Create Multiple Teams'});
    case PaidFeatures.START_CALL:
        return formatMessage({id: 'webapp.mattermost.feature.start_call', defaultMessage: 'Start call'});
    case PaidFeatures.PLAYBOOKS_RETRO:
        return formatMessage({id: 'webapp.mattermost.feature.playbooks_retro', defaultMessage: 'Playbooks Retrospective'});
    case PaidFeatures.UNLIMITED_MESSAGES:
        return formatMessage({id: 'webapp.mattermost.feature.unlimited_messages', defaultMessage: 'Unlimited Messages'});
    case PaidFeatures.UNLIMITED_FILE_STORAGE:
        return formatMessage({id: 'webapp.mattermost.feature.unlimited_file_storage', defaultMessage: 'Unlimited File Storage'});
    case PaidFeatures.UNLIMITED_INTEGRATIONS:
        return formatMessage({id: 'webapp.mattermost.feature.unlimited_integrations', defaultMessage: 'Unlimited Integrations'});
    case PaidFeatures.UNLIMITED_BOARD_CARDS:
        return formatMessage({id: 'webapp.mattermost.feature.unlimited_board_cards', defaultMessage: 'Unlimited Board cards'});
    case PaidFeatures.ALL_PROFESSIONAL_FEATURES:
        return formatMessage({id: 'webapp.mattermost.feature.all_professional', defaultMessage: 'All Professional features'});
    case PaidFeatures.ALL_ENTERPRISE_FEATURES:
        return formatMessage({id: 'webapp.mattermost.feature.all_enterprise', defaultMessage: 'All Enterprise features'});
    default:
        return '';
    }
}
