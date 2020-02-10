// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {GlobalState} from 'mattermost-redux/types/store';
import {GenericAction} from 'mattermost-redux/types/actions';

import SidebarCategory from './sidebar_category';

function MOCK_setCollapsedState(categoryId: string, isCollapsed: boolean) {
    return (dispatch: any, getState: any) => {};
}

function mapStateToProps(state: GlobalState) {
    return {
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            setCollapsedState: MOCK_setCollapsedState,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SidebarCategory);
