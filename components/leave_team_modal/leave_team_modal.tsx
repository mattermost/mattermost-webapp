// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import {ActionFunc} from 'mattermost-redux/types/actions';
import {Channel} from 'mattermost-redux/types/channels';
import {UserProfile} from 'mattermost-redux/types/users';

import * as Utils from 'utils/utils.jsx';
import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';

import Constants from 'utils/constants';

// import {t} from 'utils/i18n';
import {isKeyPressed} from 'utils/utils';

type Props = {
    currentUser: UserProfile;
    currentUserId: string;
    currentTeamId: string;
    publicChannels: Channel[];
    privateChannels: Channel[];
    onHide: () => void;
    show: boolean;
    actions: {
        leaveTeam: (teamId: string, userId: string) => ActionFunc;
        toggleSideBarRightMenu: () => void;
    };
};

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
        this.props.actions.leaveTeam(
            this.props.currentTeamId,
            this.props.currentUserId,
        );
        this.props.actions.toggleSideBarRightMenu();
    };

    render() {
        const {currentUser} = this.props;
        const isGuest = Utils.isGuest(currentUser);
        const numOfPublicChannels = this.props.publicChannels.length;
        const numOfPrivateChannels = this.props.privateChannels.length;
        let modalMessage;
        if (isGuest) {
            if (numOfPublicChannels !== 0 && numOfPrivateChannels !== 0) {
                modalMessage = (
                    <FormattedMarkdownMessage
                        id='leave_team_modal_guest.desc'
                        defaultMessage="** You will be removed from {num_of_public_channels} public { num_of_public_channels,plural,one {channel} other {channels}} and {num_of_private_channels} private { num_of_private_channels,plural,one {channel} other {channels}} on this team.** You won't be able to rejoin it without an invitation from another team member. Are you sure?"
                        values={{
                            num_of_public_channels: numOfPublicChannels,
                            num_of_private_channels: numOfPrivateChannels,
                        }}
                    />
                );
            } else if (numOfPublicChannels === 0) {
                modalMessage = (
                    <FormattedMarkdownMessage
                        id='leave_team_modal_guest_only_private.desc'
                        defaultMessage="** You will be removed from {num_of_private_channels} private { num_of_private_channels,plural,one {channel} other {channels}} on this team.** You won't be able to rejoin it without an invitation from another team member. Are you sure?"
                        values={{
                            num_of_public_channels: numOfPublicChannels,
                            num_of_private_channels: numOfPrivateChannels,
                        }}
                    />
                );
            } else {
                modalMessage = (
                    <FormattedMarkdownMessage
                        id='leave_team_modal_guest_only_public.desc'
                        defaultMessage="** You will be removed from {num_of_public_channels} public { num_of_public_channels,plural,one {channel} other {channels}} on this team.** You won't be able to rejoin it without an invitation from another team member. Are you sure?"
                        values={{
                            num_of_public_channels: numOfPublicChannels,
                            num_of_private_channels: numOfPrivateChannels,
                        }}
                    />);
            }
        } else if (numOfPublicChannels !== 0 && numOfPrivateChannels !== 0) {
            modalMessage = (
                <FormattedMarkdownMessage
                    id='leave_team_modal.desc'
                    defaultMessage="**You will be removed from {num_of_public_channels} public { num_of_public_channels,plural,one {channel} other {channels} } and {num_of_private_channels} private {num_of_private_channels,one {channel} other {channels}} on this team.** If the team is private you won't be able to rejoin it without an invitation from another team member. Are you sure?"

                    values={{
                        num_of_public_channels: numOfPublicChannels,
                        num_of_private_channels: numOfPrivateChannels,
                    }}
                />);
        } else if (numOfPublicChannels === 0) {
            modalMessage = (
                <FormattedMarkdownMessage
                    id='leave_team_modal_private.desc'
                    defaultMessage="**You will be removed from {num_of_private_channels} private {num_of_private_channels,one {channel} other {channels}} on this team.** If the team is private you won't be able to rejoin it without an invitation from another team member. Are you sure?"
                    values={{
                        num_of_public_channels: numOfPublicChannels,
                        num_of_private_channels: numOfPrivateChannels,
                    }}
                />);
        } else {
            modalMessage = (
                <FormattedMarkdownMessage
                    id='leave_team_modal_public.desc'
                    defaultMessage='**You will be removed from {num_of_public_channels} public { num_of_public_channels,plural,one {channel} other {channels} } on this team.** Are you sure?'
                    values={{
                        num_of_public_channels: numOfPublicChannels,
                        num_of_private_channels: numOfPrivateChannels,
                    }}
                />
            );
        }

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
                    {modalMessage}
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
