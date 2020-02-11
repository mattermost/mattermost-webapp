// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';

import {GlobalState} from 'mattermost-redux/types/store';
import {ActionFunc} from 'mattermost-redux/types/actions';

import {openModal} from 'actions/views/modals';

import ChannelNavigator from './channel_navigator';

function mapStateToProps(state: GlobalState) {
    return {
    };
}

type Actions = {
    openModal: (modalData: any) => Promise<{data: boolean}>;
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            openModal,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ChannelNavigator);
