// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';

import {ActionFunc} from 'mattermost-redux/types/actions';

import {joinChannelById, switchToChannel} from 'actions/views/channel';

import {getIsMobileView} from 'selectors/views/browser';

import {GlobalState} from 'types/store';

import QuickSwitchModal, {Props} from './quick_switch_modal';

function mapStateToProps(state: GlobalState) {
    return {
        isMobileView: getIsMobileView(state),
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Props['actions']>({
            joinChannelById,
            switchToChannel,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(QuickSwitchModal);
