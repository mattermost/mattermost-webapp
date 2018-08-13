// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage, injectIntl, intlShape} from 'react-intl';
import PropTypes from 'prop-types';

import WebrtcStore from 'stores/webrtc_store.jsx';
import Constants, {WebrtcActionTypes} from 'utils/constants.jsx';
import {isKeyPressed} from 'utils/utils';

class LeaveTeamModal extends React.PureComponent {
    static propTypes = {

        /**
         * Current user id.
         */
        currentUserId: PropTypes.string.isRequired,

        /**
         * Current team id.
         */
        currentTeamId: PropTypes.string.isRequired,

        /**
         * hide action
         */

        onHide: PropTypes.func.isRequired,

        /**
         * show or hide modal
         */

        show: PropTypes.bool.isRequired,

        /**
         * is the user busy in a video call
         */

        isBusy: PropTypes.bool.isRequired,

        intl: intlShape.isRequired,

        actions: PropTypes.shape({

            /**
             * An action to remove user from team
             */

            removeUserFromTeam: PropTypes.func.isRequired,

            /**
             * An action to toggle the right menu
             */

            toggleSideBarRightMenu: PropTypes.func.isRequired,
        }),
    };

    componentDidMount() {
        if (this.props.show) {
            document.addEventListener('keypress', this.handleKeyPress);
        }
    }

    componentWillUnmount() {
        document.removeEventListener('keypress', this.handleKeyPress);
    }

    handleKeyPress = (e) => {
        if (isKeyPressed(e, Constants.KeyCodes.ENTER)) {
            this.handleSubmit(e);
        }
    };

    handleSubmit = (e) => {
        this.props.onHide();

        if (this.props.isBusy) {
            WebrtcStore.emitChanged({action: WebrtcActionTypes.IN_PROGRESS});
            e.preventDefault();
            return;
        }
        this.props.actions.removeUserFromTeam(this.props.currentTeamId, this.props.currentUserId);
        this.props.actions.toggleSideBarRightMenu();
    };

    render() {
        return (
            <Modal
                className='modal-confirm'
                show={this.props.show}
                onHide={this.props.onHide}
            >
                <Modal.Header closeButton={false}>
                    <Modal.Title>
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
                        className='btn btn-default'
                        onClick={this.props.onHide}
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

export default injectIntl(LeaveTeamModal);
