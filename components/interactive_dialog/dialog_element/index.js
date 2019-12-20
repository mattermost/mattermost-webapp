// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {autocompleteChannels} from 'actions/channel_actions';
import {autocompleteUsers} from 'actions/user_actions';

import DialogElement from './dialog_element';

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            autocompleteChannels,
            autocompleteUsers,
        }, dispatch),
    };
}

export default connect(null, mapDispatchToProps)(DialogElement);
