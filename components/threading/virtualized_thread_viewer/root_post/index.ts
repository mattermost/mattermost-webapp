// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getPost} from 'mattermost-redux/selectors/entities/posts';

import {GlobalState} from 'types/store';

import RootPost, {OwnProps} from './root_post';

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    return {
        post: getPost(state, ownProps.id),
    };
}

export default connect(mapStateToProps)(RootPost);
