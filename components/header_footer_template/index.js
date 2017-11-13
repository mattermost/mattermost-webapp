// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';

import {getConfig} from 'mattermost-redux/selectors/entities/general';

import NotLoggedIn from './header_footer_template.jsx';

function mapStateToProps(state, ownProps) {
    return {
        ...ownProps,
        config: getConfig(state)
    };
};

export default connect(mapStateToProps)(NotLoggedIn);
