// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {isDesktopApp} from 'utils/user_agent';

import PopoverBar from './popover_bar.jsx';

function mapStateToProps() {
    return {
        isDesktopApp: isDesktopApp(),
    };
}

export default connect(mapStateToProps)(PopoverBar);
