// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {GlobalState} from 'types/store';
import {GenericAction} from 'mattermost-redux/types/actions';

import ChannelFilter from './channel_filter';

import {setUnreadFilterEnabled} from 'actions/views/channel_sidebar';
import {isUnreadFilterEnabled} from 'selectors/views/channel_sidebar';

function mapStateToProps(state: GlobalState) {
    return {
        unreadFilterEnabled: isUnreadFilterEnabled(state),
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            setUnreadFilterEnabled,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ChannelFilter);
