// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getConfig} from 'mattermost-redux/selectors/entities/general';

import EditPostTimeLimitButton from './edit_post_time_limit_button';

function mapStateToProps(state, ownProps) {
    const {PostEditTimeLimit} = getConfig(state);

    return {
        ...ownProps,
        timeLimit: parseInt(PostEditTimeLimit, 10),
    };
}

export default connect(mapStateToProps)(EditPostTimeLimitButton);
