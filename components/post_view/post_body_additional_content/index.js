// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {toggleEmbedVisibility} from 'actions/post_actions';

import {isEmbedVisible} from 'selectors/posts';

import PostBodyAdditionalContent from './post_body_additional_content';

function mapStateToProps(state, ownProps) {
    return {
        isEmbedVisible: isEmbedVisible(state, ownProps.post.id),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            toggleEmbedVisibility,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PostBodyAdditionalContent);
