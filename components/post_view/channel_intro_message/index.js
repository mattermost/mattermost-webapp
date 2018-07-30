// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {getCurrentLocale} from 'selectors/i18n';

import ChannelIntroMessage from './channel_intro_message.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);
    const enableUserCreation = config.EnableUserCreation === 'true';

    return {
        locale: getCurrentLocale(state),
        enableUserCreation,
    };
}

export default connect(mapStateToProps)(ChannelIntroMessage);
