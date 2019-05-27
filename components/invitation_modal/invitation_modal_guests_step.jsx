// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {isEmail} from 'mattermost-redux/utils/helpers';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import InviteIcon from 'components/svg/invite_icon';
import CloseCircleIcon from 'components/svg/close_circle_icon';

import ChannelsInput from 'components/widgets/inputs/channels_input.jsx';
import UsersEmailsInput from 'components/widgets/inputs/users_emails_input.jsx';

import BackIcon from 'components/svg/back_icon';

import './invitation_modal_guests_step.scss';

import debouncePromise from 'utils/debounce_promise.jsx';
import {t} from 'utils/i18n.jsx';

export default class InvitationModalGuestsStep extends React.Component {
    static propTypes = {
        goBack: PropTypes.func,
        myInvitableChannels: PropTypes.array.isRequired,
        currentTeamId: PropTypes.string.isRequired,
        searchProfiles: PropTypes.func.isRequired,
        onEdit: PropTypes.func.isRequired,
        onSubmit: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props);
        this.state = {
            customMessageOpen: false,
            customMessage: '',
            usersAndEmails: [],
            channels: [],
        };
    }

    onUsersEmailsChange = (usersAndEmails) => {
        this.setState({usersAndEmails});
        this.props.onEdit();
    }

    onChannelsChange = (channels) => {
        this.setState({channels});
        this.props.onEdit();
    }

    onMessageChange = (e) => {
        this.setState({customMessage: e.target.value});
        this.props.onEdit();
    }

    usersLoader = async (term) => {
        if (isEmail(term)) {
            return [];
        }
        try {
            const {data} = await this.props.searchProfiles(term);
            return data;
        } catch (error) {
            return [];
        }
    }
    debouncedUsersLoader = debouncePromise(this.usersLoader, 150);

    channelsLoader = async (value) => {
        if (!value) {
            return this.props.myInvitableChannels;
        }
        return this.props.myInvitableChannels.filter((channel) => {
            return channel.display_name.toLowerCase().indexOf(value.toLowerCase()) === 0;
        });
    }

    openCustomMessage = () => {
        this.setState({customMessageOpen: true});
    }

    closeCustomMessage = () => {
        this.setState({customMessageOpen: false});
    }

    sendInvites = () => {
        const users = [];
        const emails = [];
        for (const userOrEmail of this.state.usersAndEmails) {
            if (isEmail(userOrEmail)) {
                emails.push(userOrEmail);
            } else {
                users.push(userOrEmail);
            }
        }
        this.props.onSubmit(users, emails, this.state.channels, this.state.customMessageOpen ? this.state.customMessage : '');
    }

    render() {
        return (
            <div className='InvitationModalGuestsStep'>
                {this.props.goBack &&
                    <BackIcon
                        className='back'
                        onClick={this.props.goBack}
                    />}
                <div className='modal-icon'>
                    <InviteIcon/>
                </div>
                <h1>
                    <FormattedMarkdownMessage
                        id='invitation_modal.guests.title'
                        defaultMessage='Invite **Guests**'
                    />
                </h1>
                <div className='add-people'>
                    <h2>
                        <FormattedMessage
                            id='invitation_modal.guests.add_people.title'
                            defaultMessage='Add People'
                        />
                    </h2>
                    <div>
                        <FormattedMessage
                            id='invitation_modal.guests.search-and-add.placeholder'
                            defaultMessage='Add guests or email addresses'
                        >
                            {(placeholder) => (
                                <UsersEmailsInput
                                    usersLoader={this.debouncedUsersLoader}
                                    placeholder={placeholder}
                                    onChange={this.onUsersEmailsChange}
                                    value={this.state.usersAndEmails}
                                    validAddressMessageId={t('invitation_modal.guests.users_emails_input.valid_email')}
                                    validAddressMessageDefault='Invite **{email}** as a guest'
                                    noOptionsMessageId={t('invitation_modal.guests.users_emails_input.empty')}
                                    noOptionsMessageDefault='No guest found outside, type email to invite'
                                    noMatchMessageId={t('invitation_modal.guests.users_emails_input.no_user_found_matching')}
                                    noMatchMessageDefault='No one found matching **{text}**, type email to invite'
                                />
                            )}
                        </FormattedMessage>
                    </div>
                    <div className='help-text'>
                        <FormattedMessage
                            id='invitation_modal.guests.add_people.description'
                            defaultMessage='Email an invitation to new users.'
                        />
                    </div>
                </div>
                <div className='add-channels'>
                    <h2>
                        <FormattedMessage
                            id='invitation_modal.guests.add_channels.title'
                            defaultMessage='Search and Add Channels'
                        />
                    </h2>
                    <div>
                        <FormattedMessage
                            id='invitation_modal.guests.add_channels.placeholder'
                            defaultMessage='Search and add Channels'
                        >
                            {(placeholder) => (
                                <ChannelsInput
                                    placeholder={placeholder}
                                    channelsLoader={this.channelsLoader}
                                    onChange={this.onChannelsChange}
                                    value={this.state.channels}
                                />
                            )}
                        </FormattedMessage>
                    </div>
                    <div className='help-text'>
                        <FormattedMessage
                            id='invitation_modal.guests.add-channels.description'
                            defaultMessage='Specify the channels the guests have access to.'
                        />
                    </div>
                </div>
                <div className='custom-message'>
                    {!this.state.customMessageOpen &&
                        <a onClick={this.openCustomMessage}>
                            <FormattedMessage
                                id='invitation_modal.guests.custom-message.link'
                                defaultMessage='Set a custom message'
                            />
                        </a>
                    }
                    {this.state.customMessageOpen &&
                        <React.Fragment>
                            <div>
                                <FormattedMessage
                                    id='invitation_modal.guests.custom-message.title'
                                    defaultMessage='Custom message'
                                />
                                <CloseCircleIcon onClick={this.closeCustomMessage}/>
                            </div>
                            <textarea
                                onChange={this.onMessageChange}
                                value={this.state.customMessage}
                            />
                        </React.Fragment>
                    }
                    <div className='help-text'>
                        <FormattedMessage
                            id='invitation_modal.guests.custom-message.description'
                            defaultMessage='Create a custom message to make your invite more personal.'
                        />
                    </div>
                </div>
                <div className='invite-guests'>
                    <button
                        className='btn btn-primary'
                        disabled={this.state.channels.length === 0 || this.state.usersAndEmails.length === 0}
                        onClick={this.sendInvites}
                    >
                        <FormattedMessage
                            id='invitation_modal.guests.invite_button'
                            defaultMessage='Invite Guests'
                        />
                    </button>
                </div>
            </div>
        );
    }
}
