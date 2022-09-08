// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';
import {GlobalState} from 'types/store';

import OffTopicIntroMessage from './off_topic';

function mapStateToProps(state: GlobalState) {
    return {
        channel: getCurrentChannel(state) || {},
    };
}

export default connect(mapStateToProps)(OffTopicIntroMessage);
