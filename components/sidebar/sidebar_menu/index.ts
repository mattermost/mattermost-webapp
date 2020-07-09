
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getDraggingState} from 'selectors/views/channel_sidebar';
import {GlobalState} from 'types/store';

import SidebarMenu from './sidebar_menu';

function mapStateToProps(state: GlobalState) {
    return {
        draggingState: getDraggingState(state),
    };
}

export default connect(mapStateToProps)(SidebarMenu);
