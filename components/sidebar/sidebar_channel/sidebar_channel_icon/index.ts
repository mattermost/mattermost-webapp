// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';
import {GenericAction} from 'mattermost-redux/types/actions';
import {Channel} from 'mattermost-redux/types/channels';

import {getPostDraft} from 'selectors/rhs';
import {StoragePrefixes} from 'utils/constants';
import {GlobalState} from 'types/store';

import SidebarChannelIcon from './sidebar_channel_icon';

type OwnProps = {
    channel?: Channel;
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
        }, dispatch),
    };
}

export default connect(null, mapDispatchToProps)(SidebarChannelIcon);
