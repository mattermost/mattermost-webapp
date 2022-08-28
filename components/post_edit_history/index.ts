// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';
import {GlobalState} from 'types/store';

import PostEditHistory from './post_edit_history';

function mapStateToProps(state: GlobalState) {
    return {
        channelDisplayName: getCurrentChannel(state).display_name,
    };
}

export default connect(mapStateToProps)(PostEditHistory);
