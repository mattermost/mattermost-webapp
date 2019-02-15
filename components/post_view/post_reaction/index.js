// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {addReaction} from 'actions/post_actions.jsx';

import PostReaction from './post_reaction';

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            addReaction,
        }, dispatch),
    };
}

export default connect(null, mapDispatchToProps)(PostReaction);
