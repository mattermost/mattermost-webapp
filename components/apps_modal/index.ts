// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';

import {GlobalState} from 'mattermost-redux/types/store';
import {ActionFunc, GenericAction} from 'mattermost-redux/types/actions';
import {AppCall, AppCallResponse, AppModalState} from 'mattermost-redux/types/apps';

import {doAppCall} from 'actions/apps';
import {getEmojiMap} from 'selectors/emojis';

import AppsModal from './apps_modal';

type Actions = {
    doAppCall: (call: AppCall) => Promise<{data: AppCallResponse}>
};

function mapStateToProps(state: GlobalState, ownProps: {modal?: AppModalState}) {
    const emojiMap = getEmojiMap(state);
    if (!ownProps.modal) {
        return {emojiMap};
    }

    return {
        modal: ownProps.modal,
        emojiMap,
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            doAppCall,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AppsModal);
