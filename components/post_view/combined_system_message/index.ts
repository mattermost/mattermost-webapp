// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {createSelector} from 'reselect';

import {Preferences} from 'mattermost-redux/constants';

import {makeGetPostsForIds} from 'mattermost-redux/selectors/entities/posts';
import {getBool} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';

import {GlobalState} from 'mattermost-redux/types/store';

import {memoizeResult} from 'mattermost-redux/utils/helpers';
import {getPostIdsForCombinedUserActivityPost} from 'mattermost-redux/utils/post_list';

import CombinedSystemMessage from './combined_system_message';

type OwnProps = {
    combinedPostId: string;
}

function makeMapStateToProps() {
    const getPostIds = memoizeResult(getPostIdsForCombinedUserActivityPost);
    const getPostsForIds = makeGetPostsForIds();

    const getProfiles = createSelector(
        'CSMgetProfiles',
        (state: GlobalState) => state.entities.users.profiles,
        (profiles) => Object.values(profiles),
    );

    return (state: GlobalState, ownProps: OwnProps) => {
        const postIds = getPostIds(ownProps.combinedPostId);
        const posts = getPostsForIds(state, postIds);

        const currentUser = getCurrentUser(state);

        return {
            currentUserId: currentUser.id,
            currentUsername: currentUser.username,
            posts,
            showJoinLeave: getBool(state, Preferences.CATEGORY_ADVANCED_SETTINGS, Preferences.ADVANCED_FILTER_JOIN_LEAVE, true),
            // userProfiles: getProfilesByIdsAndUsernames(state, {allUserIds, allUsernames}),
            userProfiles: getProfiles(state),
        };
    };
}

export default connect(makeMapStateToProps)(CombinedSystemMessage);
