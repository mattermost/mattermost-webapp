// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';

import {ActionFunc} from 'mattermost-redux/types/actions';

import {openModal} from 'actions/views/modals';
import {browserHistory} from 'utils/browser_history';

import ChannelNavigator from './channel_navigator';

// TODO: For Phase 1. Will revisit history in Phase 2
function goBack() {
    return () => {
        browserHistory.goBack();
        return {data: null};
    };
}

function goForward() {
    return () => {
        browserHistory.goForward();
        return {data: null};
    };
}

function mapStateToProps() {
    return {
        canGoBack: true, // TODO: Phase 1 only
        canGoForward: true,
    };
}

type Actions = {
    openModal: (modalData: any) => Promise<{data: boolean}>;
    goBack: () => void;
    goForward: () => void;
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            openModal,
            goBack,
            goForward,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ChannelNavigator);
