// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {Dispatch, bindActionCreators} from 'redux';

import {ChannelCategory} from 'mattermost-redux/types/channel_categories';
import {GlobalState} from 'mattermost-redux/types/store';

import SidebarCategoryMenu from './sidebar_category_menu';

type OwnProps = {
    category: ChannelCategory;
}

function makeMapStateToProps() {
    return (state: GlobalState, ownProps: OwnProps) => {
        return {
            isMuted: false, // TODO
        };
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
        }, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(SidebarCategoryMenu);
