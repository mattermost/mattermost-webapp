// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {isEmail} from 'mattermost-redux/utils/helpers';
import {debounce} from 'mattermost-redux/actions/helpers';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import InviteIcon from 'components/widgets/icons/invite_icon';
import CloseCircleIcon from 'components/widgets/icons/close_circle_icon';

import ChannelsInput from 'components/widgets/inputs/channels_input.jsx';
import UsersEmailsInput from 'components/widgets/inputs/users_emails_input.jsx';

import BackIcon from 'components/widgets/icons/back_icon';

import './invitation_modal_guests_step.scss';

import {t} from 'utils/i18n.jsx';

export default class InvitationModalGuestsStep extends React.Component {
    static propTypes = {
        goBack: PropTypes.func,
        myInvitableChannels: PropTypes.array.isRequired,
        currentTeamId: PropTypes.string.isRequired,
        searchProfiles: PropTypes.func.isRequired,
        defaultChannels: PropTypes.array,
        defaultMessage: PropTypes.string,
        onEdit: PropTypes.func.isRequired,
        onSubmit: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props);
        this.textareaRef = React.createRef();
        this.state = {
            customMessageOpen: Boolean(props.defaultMessage),
            customMessage: props.defaultMessage || '',
            usersAndEmails: [],
            channels: props.defaultChannels || [],
            usersInputValue: '',
            channelsInputValue: '',
        };
    }

    onUsersEmailsChange = (usersAndEmails) => {
        this.setState({usersAndEmails});
        this.props.onEdit(usersAndEmails.length > 0 || this.state.channels.length > 0 || this.state.customMessage !== '' || this.state.usersInputValue || this.state.channelsInputValue);
    }

    onChannelsChange = (channels) => {
        this.setState({channels});
        this.props.onEdit(this.state.usersAndEmails.length > 0 || channels.length > 0 || this.state.customMessage !== '' || this.state.usersInputValue || this.state.channelsInputValue);
    }

    onMessageChange = (e) => {
        this.setState({customMessage: e.target.value});
        this.props.onEdit(this.state.usersAndEmails.length > 0 || this.state.channels.length > 0 || e.target.value !== '' || this.state.usersInputValue || this.state.channelsInputValue);
    }

    onUsersInputChange = (usersInputValue) => {
        this.setState({usersInputValue});
        this.props.onEdit(this.state.usersAndEmails.length > 0 || this.state.channels.length > 0 || this.state.customMessage !== '' || usersInputValue || this.state.channelsInputValue);
    }

    onChannelsInputChange = (channelsInputValue) => {
        this.setState({channelsInputValue});
        this.props.onEdit(this.state.usersAndEmails.length > 0 || this.state.channels.length > 0 || this.state.customMessage !== '' || this.state.usersInputValue || channelsInputValue);
    }

    debouncedSearchProfiles = debounce((term, callback) => {
        this.props.searchProfiles(term).then(({data}) => {
            callback(data);
            if (data.length === 0) {
                this.setState({termWithoutResults: term});
            } else {
                this.setState({termWithoutResults: null});
            }
        }).catch(() => {
            callback([]);
        });
    }, 150);

    usersLoader = (term, callback) => {
        if (this.state.termWithoutResults && term.startsWith(this.state.termWithoutResults)) {
            callback([]);
            return;
        }
        try {
            this.debouncedSearchProfiles(term, callback);
        } catch (error) {
            callback([]);
        }
    }

    channelsLoader = async (value) => {
        if (!value) {
            return this.props.myInvitableChannels;
        }
        return this.props.myInvitableChannels.filter((channel) => {
            return channel.display_name.toLowerCase().startsWith(value.toLowerCase()) || channel.name.toLowerCase().startsWith(value.toLowerCase());
        });
    }

    openCustomMessage = () => {
        this.setState({customMessageOpen: true});
        setTimeout(() => {
            if (this.textareaRef.current) {
                this.textareaRef.current.focus();
            }
        });
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
        this.props.onSubmit(users, emails, this.state.channels, this.state.customMessageOpen ? this.state.customMessage : '', this.state.usersInputValue, this.state.channelsInputValue);
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
                            defaultMessage='Invite People'
                        />
                    </h2>
                    <div>
                        <FormattedMessage
                            id='invitation_modal.guests.search-and-add.placeholder'
                            defaultMessage='Add guests or email addresses'
                        >
                            {(placeholder) => (
                                <UsersEmailsInput
                                    usersLoader={this.usersLoader}
                                    placeholder={placeholder}
                                    onChange={this.onUsersEmailsChange}
                                    value={this.state.usersAndEmails}
                                    onInputChange={this.onUsersInputChange}
                                    inputValue={this.state.usersInputValue}
                                    validAddressMessageId={t('invitation_modal.guests.users_emails_input.valid_email')}
                                    validAddressMessageDefault='Invite **{email}** as a guest'
                                    noMatchMessageId={t('invitation_modal.guests.users_emails_input.no_user_found_matching')}
                                    noMatchMessageDefault='No one found matching **{text}**, type email to invite'
                                />
                            )}
                        </FormattedMessage>
                    </div>
                    <div className='help-text'>
                        <FormattedMessage
                            id='invitation_modal.guests.add_people.description'
                            defaultMessage='Search and add guests or email invite new users.'
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
                            defaultMessage='Search and add channels'
                        >
                            {(placeholder) => (
                                <ChannelsInput
                                    placeholder={placeholder}
                                    channelsLoader={this.channelsLoader}
                                    onChange={this.onChannelsChange}
                                    onInputChange={this.onChannelsInputChange}
                                    inputValue={this.state.channelsInputValue}
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
                                ref={this.textareaRef}
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
                        className={'btn ' + (this.state.channels.length === 0 || this.state.usersAndEmails.length === 0 ? 'btn-inactive' : 'btn-primary')}
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
