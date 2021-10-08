// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';

import {ActionFunc} from 'mattermost-redux/types/actions';
import {Post} from 'mattermost-redux/types/posts';
import {makeGetCommentCountForPost} from 'mattermost-redux/selectors/entities/posts';

import {GlobalState} from 'types/store';
import {deleteAndRemovePost} from 'actions/post_actions.jsx';

import DeletePostModal from './delete_post_modal';

type Actions = {
    deleteAndRemovePost: (post: Post) => Promise<{data: boolean}>;
};

type Props = {
    channelName: string;
    teamName: string;
    post: Post;
    commentCount: number;
    isRHS: boolean;
    onHide: () => void;
    actions: {
        deleteAndRemovePost: (post: Post) => Promise<{data: boolean}>;
    };
    location: {
        pathname: string;
    };
}

function makeMapStateToProps() {
    const getReplyCount = makeGetCommentCountForPost();

    return (state: GlobalState, ownProps: Props) => {
        const post = ownProps.post;

        return {
            commentCount: getReplyCount(state, post),
        };
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            deleteAndRemovePost,
        }, dispatch),
    };
}

export default withRouter(connect<any, any, any>(makeMapStateToProps, mapDispatchToProps)(DeletePostModal));
