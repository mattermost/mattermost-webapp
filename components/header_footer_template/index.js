// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import NotLoggedIn from './header_footer_template.jsx';

function mapStateToProps(state) {
    return {
        config: getConfig(state),
    };
}

export default connect(mapStateToProps)(NotLoggedIn);
