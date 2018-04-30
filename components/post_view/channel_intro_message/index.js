// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {getLicense} from 'mattermost-redux/selectors/entities/general';

import ChannelIntroMessage from './channel_intro_message.jsx';

function mapStateToProps(state) {
    const license = getLicense(state);

    return {
        isLicensed: license.IsLicensed === 'true',
    };
}

export default connect(mapStateToProps)(ChannelIntroMessage);
