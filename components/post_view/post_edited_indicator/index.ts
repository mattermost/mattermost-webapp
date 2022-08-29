// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {bindActionCreators, Dispatch} from 'redux';

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

import {selectPost, updateRhsState} from 'actions/views/rhs';

import {Post} from '@mattermost/types/posts';

import PostEditedIndicator from './post_edited_indicator';

type OwnProps = {
    postId?: string;
    editedAt?: number;
}

type StateProps = {
    postOwner: boolean;
    isMilitaryTime: boolean;
    timeZone?: string;
    post: Post;
}

type DispatchProps = {
    actions: {
        selectPost: (post: Post) => void;
        updateRhsState: (rhsState: string) => void;
    };
}

export type Props = OwnProps & StateProps & DispatchProps;

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
        return {isMilitaryTime, timeZone, postOwner, post};
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            selectPost,
            updateRhsState,
        }, dispatch),
    };
}

export default connect<StateProps, DispatchProps, OwnProps, GlobalState>(makeMapStateToProps, mapDispatchToProps)(PostEditedIndicator);
