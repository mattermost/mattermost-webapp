// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators, Dispatch} from 'redux';

// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {GlobalState} from 'mattermost-redux/types/store';
import {connect} from 'react-redux';

import {GenericAction} from 'mattermost-redux/types/actions';

import {toggleEmbedVisibility} from 'actions/post_actions';
import {isEmbedVisible} from 'selectors/posts';

import MarkdownImageExpand, {Props} from './markdown_image_expand';

const mapStateToProps = (state: GlobalState, ownProps: Props) => {
    return {
        isEmbedVisible: isEmbedVisible(state, ownProps.postId),
    };
};

const mapDispatchToProps = (dispatch: Dispatch<GenericAction>) => {
    return {
        actions: bindActionCreators({toggleEmbedVisibility}, dispatch),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(MarkdownImageExpand);
