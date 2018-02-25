// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import ViewImagePopoverBar from './view_image_popover_bar.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);
    const enablePublicLink = config.EnablePublicLink === 'true';

    return {
        enablePublicLink,
    };
}

export default connect(mapStateToProps)(ViewImagePopoverBar);
