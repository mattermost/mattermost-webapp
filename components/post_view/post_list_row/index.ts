// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {GenericAction} from 'mattermost-redux/types/actions';

import {getShortcutReactToLastPostEmittedFrom} from 'selectors/emojis';
import {emitShortcutReactToLastPostFrom} from 'actions/post_actions';

import {GlobalState} from 'types/store';

import PostListRow from './post_list_row';
import {getUsage} from 'mattermost-redux/selectors/entities/usage';
import {getCloudLimits, getCloudLimitsLoaded} from 'mattermost-redux/selectors/entities/cloud';

function mapStateToProps(state: GlobalState) {
    const shortcutReactToLastPostEmittedFrom = getShortcutReactToLastPostEmittedFrom(state);
    const usage = getUsage(state);
    const limits = getCloudLimits(state);
    const limitsLoaded = getCloudLimitsLoaded(state);
    return {
        shortcutReactToLastPostEmittedFrom,
        usage,
        limits,
        limitsLoaded,
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
