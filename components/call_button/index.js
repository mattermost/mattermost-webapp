// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getCurrentChannel, getMyCurrentChannelMembership} from 'mattermost-redux/selectors/entities/channels';

import {getCurrentLocale} from 'selectors/i18n';

import CallButton from './call_button.jsx';

function mapStateToProps(state) {
    return {
        currentChannel: getCurrentChannel(state),
        locale: getCurrentLocale(state),
        pluginCallMethods: state.plugins.components.CallButton,
        channelMember: getMyCurrentChannelMembership(state),
    };
}

export default connect(mapStateToProps)(CallButton);
