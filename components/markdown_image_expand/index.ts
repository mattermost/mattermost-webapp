// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {GlobalState} from 'mattermost-redux/types/store';
import {connect} from 'react-redux';

import {isEmbedVisible} from 'selectors/posts';

import MarkdownImageExpand, {Props} from './markdown_image_expand';

const mapStateToProps = (state: GlobalState, ownProps: Props) => {
    return {
        isEmbedVisible: isEmbedVisible(state, ownProps.postId),
    };
};

export default connect(mapStateToProps)(MarkdownImageExpand);
