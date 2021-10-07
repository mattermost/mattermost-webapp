// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap'

import {InviteToTeamTreatments} from 'mattermost-redux/constants/config';
import deepFreeze from 'mattermost-redux/utils/deep_freeze';

import ResultView, {ResultState, defaultResultState} from './result_view';
import InviteView, {InviteState, defaultInviteState} from './invite_view';
import {As} from './invite_as';

type Props = {
    show: boolean,
    inviteToTeamTreatment: InviteToTeamTreatments,
}

type View = 'invite' | 'result' | 'error'

type State = {
    view: View,
    invite: InviteState,
    result: ResultState,
};

const defaultState: State = deepFreeze({
    view: 'invite',
    invite: defaultInviteState,
    result: defaultResultState,
});


export default class InvitationModal extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = defaultState;
    };

    handleHide = () => {
    }

    handleHidden = () => {
    }

    setInviteAs = (as: As) => {
        this.setState(state => ({...state, as}));
    }

    invite = () => {
    }

    render() {
        let view = (
            <InviteView
                setInviteAs={this.setInviteAs}
                invite={this.invite}
                {...this.state.invite}
            />
        );
        if (this.state.view === 'result') {
            view = <ResultView />
        }

        return <Modal
            id='invitationModal'
            dialogClassName='a11y__modal'
            show={this.props.show}
            onHide={this.handleHide}
            onExited={this.handleHidden}
            role='dialog'
            aria-labelledby='invitationModalLabel'
        >
            {view}
        </Modal>
    }
}
//            enforceFocus={this.state.enforceFocus}
