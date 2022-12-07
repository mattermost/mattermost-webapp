// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect, ConnectedProps} from 'react-redux';

import {setCategoryMuted, setCategorySorting} from 'mattermost-redux/actions/channel_categories';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';

import {openModal} from 'actions/views/modals';

import {GlobalState} from 'types/store';

import SidebarCategoryMenu from './sidebar_category_menu';

function mapStateToProps(state: GlobalState) {
    return {
        currentTeamId: getCurrentTeamId(state),
    };
}

const mapDispatchToProps = {
    openModal,
    setCategoryMuted,
    setCategorySorting,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(SidebarCategoryMenu);
