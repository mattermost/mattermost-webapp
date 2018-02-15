// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import AnnouncementBar from './announcement_bar.jsx';

const mapStateToProps = (state) => ({
    isLoggedIn: Boolean(getCurrentUserId(state))
});

export default connect(mapStateToProps)(AnnouncementBar);
