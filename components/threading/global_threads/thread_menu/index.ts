// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {memo} from 'react';
import {bindActionCreators, Dispatch, compose} from 'redux';
import {connect} from 'react-redux';

import {GenericAction} from 'mattermost-redux/types/actions';
import {getPostThread} from 'mattermost-redux/actions/posts';
import {makeGetPostsForThread} from 'mattermost-redux/selectors/entities/posts';

import {GlobalState} from 'types/store';

import ThreadMenu, {Props} from './thread_menu';

function makeMapStateToProps() {
    const getPostsForThread = makeGetPostsForThread();

    return (state: GlobalState, ownProps: Props) => {
        const {threadId} = ownProps;
        return {
            postsInThread: getPostsForThread(state, threadId),
        };
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            getPostThread,
        }, dispatch),
    };
}

export default compose(
    connect(makeMapStateToProps, mapDispatchToProps),
    memo,
)(ThreadMenu) as React.FunctionComponent<Omit<Props, 'actions' | 'postsInThread'>>;

