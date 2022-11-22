// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {connect, ConnectedProps} from 'react-redux';
import {Permissions, Preferences as PreferencesRedux} from 'mattermost-redux/constants';
import {getLicense} from 'mattermost-redux/selectors/entities/general';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {haveIChannelPermission, haveICurrentChannelPermission} from 'mattermost-redux/selectors/entities/roles';
import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/channels';
import {getBool, isCustomGroupsEnabled} from 'mattermost-redux/selectors/entities/preferences';

import {Preferences} from 'utils/constants';
import {isCustomEmojiEnabled} from 'selectors/emojis';
import {GlobalState} from 'types/store';

import Wysiwyg from './wysiwyg';

function mapStateToProps(state: GlobalState) {
    const teamId = getCurrentTeamId(state);
    const channelId = getCurrentChannelId(state);
    const useCustomEmojis = isCustomEmojiEnabled(state);
    const useSpecialMentions = haveIChannelPermission(state, teamId, channelId, Permissions.USE_CHANNEL_MENTIONS);

    const license = getLicense(state);
    const isLDAPEnabled = license?.IsLicensed === 'true' && license?.LDAPGroups === 'true';
    const useLDAPGroupMentions = isLDAPEnabled && haveICurrentChannelPermission(state, Permissions.USE_GROUP_MENTIONS);
    const useChannelMentions = haveIChannelPermission(state, teamId, channelId, Permissions.USE_CHANNEL_MENTIONS);
    const useCustomGroupMentions = isCustomGroupsEnabled(state) && haveICurrentChannelPermission(state, Permissions.USE_GROUP_MENTIONS);

    return {
        teamId,
        channelId,
        useCustomEmojis,
        useSpecialMentions,
        useLDAPGroupMentions,
        useChannelMentions,
        useCustomGroupMentions,
        ctrlSend: getBool(state, Preferences.CATEGORY_ADVANCED_SETTINGS, 'send_on_ctrl_enter'),
        codeBlockOnCtrlEnter: getBool(state, PreferencesRedux.CATEGORY_ADVANCED_SETTINGS, 'code_block_ctrl_enter', true),
    };
}

const connector = connect(mapStateToProps);

export type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(Wysiwyg);
