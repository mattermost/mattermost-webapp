// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {DispatchFunc} from 'mattermost-redux/types/actions';

import {flagPost, unflagPost} from 'actions/post_actions';

import PostFlagIcon from './post_flag_icon';

function mapDispatchToProps(dispatch: DispatchFunc) {
    return {
        actions: bindActionCreators({
            flagPost,
            unflagPost,
        }, dispatch as any),
    };
}

export default connect(null, mapDispatchToProps as any)(PostFlagIcon);
