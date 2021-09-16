// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {createSelector} from 'reselect';

import {Preferences} from 'mattermost-redux/constants';
import {getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';
import {getTheme, getBool} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentRelativeTeamUrl} from 'mattermost-redux/selectors/entities/teams';
import {makeAddLastViewAtToProfiles} from 'mattermost-redux/selectors/entities/utils';
import {getUser, getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import {getIsRhsExpanded, getIsRhsOpen} from 'selectors/rhs';
import {GlobalState} from 'types/store';
import Constants from 'utils/constants';
import * as Utils from 'utils/utils';

import PostMessageView from './post_message_view';

const getTeammateId = createSelector(
    'getTeammateId',
    getCurrentChannel,
    getCurrentUserId,
    (channel, currentUserId) => {
        if (channel.type !== Constants.DM_CHANNEL) {
            return null;
        }

        return Utils.getUserIdFromChannelId(channel.name, currentUserId);
    },
);

function makeMapStateToProps() {
    const addLastViewAtToProfiles = makeAddLastViewAtToProfiles();

    return function mapStateToProps(state: GlobalState) {
        const teammateId = getTeammateId(state);
        const currentUserId = getCurrentUserId(state);
        const currentUser = getUser(state, currentUserId);

        let teammate;
        let profilesWithLastViewAtInChannel;
        if (teammateId) {
            teammate = getUser(state, teammateId);
            const profilesInChannel = [teammate, currentUser];
            profilesWithLastViewAtInChannel = addLastViewAtToProfiles(state, profilesInChannel);
        }

        return {
            teammate,
            currentUser,
            profilesWithLastViewAtInChannel,
            enableFormatting: getBool(state, Preferences.CATEGORY_ADVANCED_SETTINGS, 'formatting', true),
            isRHSExpanded: getIsRhsExpanded(state),
            isRHSOpen: getIsRhsOpen(state),
            pluginPostTypes: state.plugins.postTypes,
            theme: getTheme(state),
            currentRelativeTeamUrl: getCurrentRelativeTeamUrl(state),
        };
    };
}

export default connect(makeMapStateToProps)(PostMessageView);
