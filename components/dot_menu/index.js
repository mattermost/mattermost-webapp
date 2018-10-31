// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {openModal} from 'actions/views/modals';
import {
    flagPost,
    unflagPost,
    pinPost,
    unpinPost,
    setEditingPost,
} from 'actions/post_actions.jsx';

import DotMenu from './dot_menu.jsx';

function mapStateToProps(state) {
    return {
        pluginMenuItems: state.plugins.components.PostDropdownMenu,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            flagPost,
            unflagPost,
            setEditingPost,
            pinPost,
            unpinPost,
            openModal,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(DotMenu);
