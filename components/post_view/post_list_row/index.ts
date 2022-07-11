// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {GenericAction} from 'mattermost-redux/types/actions';

import {getShortcutReactToLastPostEmittedFrom} from 'selectors/emojis';
import {emitShortcutReactToLastPostFrom} from 'actions/post_actions';

import {GlobalState} from 'types/store';

import PostListRow, {PostListRowProps} from './post_list_row';
import {getUsage} from 'mattermost-redux/selectors/entities/usage';
import {getCloudLimits, getCloudLimitsLoaded} from 'mattermost-redux/selectors/entities/cloud';
import {getLimitedViews} from 'mattermost-redux/selectors/entities/posts';
import { getCurrentChannelId } from 'mattermost-redux/selectors/entities/common';

import {PostListRowListIds} from 'utils/constants';

type OwnProps = Pick<PostListRowProps, 'channel' | 'listId'>

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const shortcutReactToLastPostEmittedFrom = getShortcutReactToLastPostEmittedFrom(state);
    const usage = getUsage(state);
    const limits = getCloudLimits(state);
    const limitsLoaded = getCloudLimitsLoaded(state);

    let channelLimitExceeded = false;
    if (ownProps.listId === PostListRowListIds.OLDER_MESSAGES_LOADER && limitsLoaded) {
        let currentChannelId = ownProps.channel?.id || '';
        if (!currentChannelId) {
            currentChannelId = getCurrentChannelId(state);
        }
        channelLimitExceeded = Boolean(getLimitedViews(state).channels[currentChannelId]);
    }
    return {
        shortcutReactToLastPostEmittedFrom,
        usage,
        limits,
        limitsLoaded,
        channelLimitExceeded,
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            emitShortcutReactToLastPostFrom,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PostListRow);
