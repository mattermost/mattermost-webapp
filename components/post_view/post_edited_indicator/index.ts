// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getCurrentUserId} from 'mattermost-redux/selectors/entities/common';
import {makeGetUserTimezone} from 'mattermost-redux/selectors/entities/timezone';
import {getUserCurrentTimezone} from 'mattermost-redux/utils/timezone_utils';
import {getBool} from 'mattermost-redux/selectors/entities/preferences';
import {getPost} from 'mattermost-redux/selectors/entities/posts';

import {Preferences} from 'utils/constants';
import {isPostOwner} from 'utils/post_utils';

import {areTimezonesEnabledAndSupported} from '../../../selectors/general';
import {GlobalState} from '../../../types/store';
import {Props as TimestampProps} from '../../timestamp/timestamp';

import PostEditedIndicator from './post_edited_indicator';

type OwnProps = {
    postId?: string;
    editedAt?: number;
}

type StateProps = {
    postOwner: boolean;
    isMilitaryTime: boolean;
    timeZone?: string;
}

export type Props = OwnProps & StateProps;

function makeMapStateToProps() {
    const getUserTimezone = makeGetUserTimezone();

    return (state: GlobalState, ownProps: OwnProps): StateProps => {
        const currentUserId = getCurrentUserId(state);
        const post = getPost(state, ownProps.postId || '');

        let timeZone: TimestampProps['timeZone'];

        if (areTimezonesEnabledAndSupported(state)) {
            timeZone = getUserCurrentTimezone(getUserTimezone(state, currentUserId)) ?? undefined;
        }
        const postOwner = isPostOwner(state, post);

        const isMilitaryTime = getBool(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.USE_MILITARY_TIME, false);
        return {isMilitaryTime, timeZone, postOwner};
    };
}

export default connect<StateProps, null, OwnProps, GlobalState>(makeMapStateToProps)(PostEditedIndicator);
