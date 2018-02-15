// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {Preferences} from 'mattermost-redux/constants';
import {get} from 'mattermost-redux/selectors/entities/preferences';

import PostHeader from './post_header.jsx';

const mapStateToProps = (state) => ({
    displayNameType: get(state, Preferences.CATEGORY_DISPLAY_SETTINGS, 'name_format', 'false')
});

export default connect(mapStateToProps)(PostHeader);
