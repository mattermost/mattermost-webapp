// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

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
