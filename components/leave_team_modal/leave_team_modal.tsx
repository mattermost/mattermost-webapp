// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import {ActionFunc} from 'mattermost-redux/types/actions';

import Constants from 'utils/constants';
import {isKeyPressed} from 'utils/utils';

type Props = {
    currentUserId: string;
    currentTeamId: string;
    onHide: () => void;
    show: boolean;
    actions: {
        leaveTeam: (teamId: string, userId: string) => ActionFunc;
        toggleSideBarRightMenu: () => void;
    };

}

export default class LeaveTeamModal extends React.PureComponent<Props> {
    componentDidMount() {
        if (this.props.show) {
            document.addEventListener('keypress', this.handleKeyPress);
        }
    }

    componentWillUnmount() {
        document.removeEventListener('keypress', this.handleKeyPress);
    }

    handleKeyPress = (e: KeyboardEvent) => {
        if (isKeyPressed(e, Constants.KeyCodes.ENTER)) {
            this.handleSubmit();
        }
    };

    handleSubmit = () => {
        this.props.onHide();
        this.props.actions.leaveTeam(this.props.currentTeamId, this.props.currentUserId);
        this.props.actions.toggleSideBarRightMenu();
    };

    render() {
        return (
            <Modal
                dialogClassName='a11y__modal'
                className='modal-confirm'
                show={this.props.show}
                onHide={this.props.onHide}
                id='leaveTeamModal'
                role='dialog'
                aria-labelledby='leaveTeamModalLabel'
            >
                <Modal.Header closeButton={false}>
                    <Modal.Title
                        componentClass='h1'
                        id='leaveTeamModalLabel'
                    >
                        <FormattedMessage
                            id='leave_team_modal.title'
                            defaultMessage='Leave the team?'
                        />
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <FormattedMessage
                        id='leave_team_modal.desc'
                        defaultMessage='You will be removed from all public and private channels.  If the team is private you will not be able to rejoin the team.  Are you sure?'
                    />
                </Modal.Body>
                <Modal.Footer>
                    <button
                        type='button'
                        className='btn btn-link'
                        onClick={this.props.onHide}
                        id='leaveTeamNo'
                    >
                        <FormattedMessage
                            id='leave_team_modal.no'
                            defaultMessage='No'
                        />
                    </button>
                    <button
                        type='button'
                        className='btn btn-danger'
                        onClick={this.handleSubmit}
                        id='leaveTeamYes'
                    >
                        <FormattedMessage
                            id='leave_team_modal.yes'
                            defaultMessage='Yes'
                        />
                    </button>
                </Modal.Footer>
            </Modal>
        );
    }
}
