// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {isEmail} from 'mattermost-redux/utils/helpers';
import {debounce} from 'mattermost-redux/actions/helpers';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import InviteIcon from 'components/widgets/icons/invite_icon';
import CloseCircleIcon from 'components/widgets/icons/close_circle_icon';
import UpgradeLink from 'components/widgets/links/upgrade_link';

import ChannelsInput from 'components/widgets/inputs/channels_input.jsx';
import UsersEmailsInput from 'components/widgets/inputs/users_emails_input.jsx';
import withGetCloudSubscription from '../../common/hocs/cloud/with_get_cloud_subscription';

import {Channel} from 'mattermost-redux/types/channels';
import {UserProfile} from 'mattermost-redux/types/users';

import './invitation_modal_guests_step.scss';

import {t} from 'utils/i18n.jsx';
import {localizeMessage} from 'utils/utils.jsx';

import {PropsFromRedux} from './index';

type OwnProps = {
    teamName: string;
    myInvitableChannels: Channel[];
    currentTeamId: string;
    searchProfiles: (term: string, options?: Record<string, unknown>) => Promise<{ data: UserProfile[] }>;
    searchChannels: (teamId: string, term: string) => Promise<Channel[]>;
    defaultChannels?: Channel[];
    defaultMessage?: string;
    onEdit: (hasChanges: boolean) => void;
    onSubmit: (users: string[], emails: string[], channels: Channel[], message: string, extraUserText: string, extraChannelText: string) => Promise<void>;
    emailInvitationsEnabled: boolean;
}

type Props = OwnProps & PropsFromRedux

type State = {
    customMessageOpen: boolean;
    customMessage: string;
    usersAndEmails: string[];
    channels: Channel[];
    usersInputValue: string;
    channelsInputValue: string;
    termWithoutResults?: string | null;
}

class InvitationModalGuestsStep extends React.PureComponent<Props, State> {
    private textareaRef = React.createRef<HTMLTextAreaElement>();

    constructor(props: Props) {
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

    onUsersEmailsChange = (usersAndEmails: string[]) => {
        this.setState({usersAndEmails});
        this.props.onEdit(usersAndEmails.length > 0 || this.state.channels.length > 0 || this.state.customMessage !== '' || this.state.usersInputValue !== '' || this.state.channelsInputValue !== '');
    }

    onChannelsChange = (channels: Channel[]) => {
        this.setState({channels});
        this.props.onEdit(this.state.usersAndEmails.length > 0 || channels.length > 0 || this.state.customMessage !== '' || this.state.usersInputValue !== '' || this.state.channelsInputValue !== '');
    }

    onMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        this.setState({customMessage: e.target.value});
        this.props.onEdit(this.state.usersAndEmails.length > 0 || this.state.channels.length > 0 || e.target.value !== '' || this.state.usersInputValue !== '' || this.state.channelsInputValue !== '');
    }

    onUsersInputChange = (usersInputValue: string) => {
        this.setState({usersInputValue});
        this.props.onEdit(this.state.usersAndEmails.length > 0 || this.state.channels.length > 0 || this.state.customMessage !== '' || usersInputValue !== '' || this.state.channelsInputValue !== '');
    }

    onChannelsInputChange = (channelsInputValue: string) => {
        this.setState({channelsInputValue});
        this.props.onEdit(this.state.usersAndEmails.length > 0 || this.state.channels.length > 0 || this.state.customMessage !== '' || this.state.usersInputValue !== '' || channelsInputValue !== '');
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

    usersLoader = (term: string, callback: (options?: Array<Record<'username | email', string>>) => void) => {
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

    debouncedSearchChannels = debounce((term) => this.props.searchChannels(this.props.currentTeamId, term), 150);

    channelsLoader = async (value: string) => {
        if (!value) {
            return this.props.myInvitableChannels;
        }

        this.debouncedSearchChannels(value);
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

    getRemainingUsers = () => {
        const {subscriptionStats} = this.props;
        const {usersAndEmails} = this.state;
        return subscriptionStats && subscriptionStats.remaining_seats - usersAndEmails.length;
    }

    shouldShowPickerError = () => {
        const {
            userLimit,
            userIsAdmin,
            isCloud,
            subscriptionStats,
        } = this.props;

        if (subscriptionStats && subscriptionStats.is_paid_tier === 'true') {
            return false;
        }

        if (userLimit === '0' || !userIsAdmin || !isCloud) {
            return false;
        }

        // usersRemaining is calculated against the limit, the current users, and how many are being invited in the current flow
        const usersRemaining = this.getRemainingUsers();
        if (usersRemaining === 0 && this.state.usersInputValue !== '') {
            return true;
        } else if (usersRemaining < 0) {
            return true;
        }
        return false;
    };

    render() {
        let inputPlaceholder = localizeMessage('invitation_modal.guests.search-and-add.placeholder', 'Add guests or email addresses');
        let noMatchMessageId = t('invitation_modal.guests.users_emails_input.no_user_found_matching');
        let noMatchMessageDefault = 'No one found matching **{text}**, type email to invite';

        if (!this.props.emailInvitationsEnabled) {
            inputPlaceholder = localizeMessage('invitation_modal.guests.search-and-add.placeholder-email-disabled', 'Add guests');
            noMatchMessageId = t('invitation_modal.guests.users_emails_input.no_user_found_matching-email-disabled');
            noMatchMessageDefault = 'No one found matching **{text}**';
        }

        const {subscriptionStats} = this.props;
        const remainingUsers = subscriptionStats && subscriptionStats.remaining_seats;
        return (
            <div className='InvitationModalGuestsStep'>
                <div className='modal-icon'>
                    <InviteIcon/>
                </div>
                <h1 id='invitation_modal_title'>
                    <FormattedMarkdownMessage
                        id='invitation_modal.guests.title'
                        defaultMessage='Invite **Guests** to {teamName}'
                        values={{teamName: this.props.teamName}}
                    />
                </h1>
                <div
                    className='add-people'
                    data-testid='addPeople'
                >
                    <h5>
                        <FormattedMessage
                            id='invitation_modal.guests.add_people.title'
                            defaultMessage='Invite People'
                        />
                    </h5>
                    <div data-testid='emailPlaceholder'>
                        <UsersEmailsInput
                            usersLoader={this.usersLoader}
                            placeholder={inputPlaceholder}
                            ariaLabel={localizeMessage(
                                'invitation_modal.guests.add_people.title',
                                'Invite People',
                            )}
                            showError={this.shouldShowPickerError()}
                            errorMessageId={t(
                                'invitation_modal.invite_members.hit_cloud_user_limit',
                            )}
                            errorMessageDefault={
                                'You can only invite **{num} more {num, plural, one {member} other {members}}** to the team on the free tier.'
                            }
                            errorMessageValues={{
                                num: remainingUsers < 0 ? '0' : remainingUsers,
                            }}
                            extraErrorText={(<UpgradeLink/>)}
                            onChange={this.onUsersEmailsChange}
                            value={this.state.usersAndEmails}
                            onInputChange={this.onUsersInputChange}
                            inputValue={this.state.usersInputValue}
                            validAddressMessageId={t(
                                'invitation_modal.guests.users_emails_input.valid_email',
                            )}
                            validAddressMessageDefault='Invite **{email}** as a guest'
                            noMatchMessageId={noMatchMessageId}
                            noMatchMessageDefault={noMatchMessageDefault}
                            emailInvitationsEnabled={
                                this.props.emailInvitationsEnabled
                            }
                        />
                    </div>
                    <div className='help-text'>
                        {this.props.emailInvitationsEnabled && (
                            <FormattedMessage
                                id='invitation_modal.guests.add_people.description'
                                defaultMessage='Add existing guests or send email invites to new guests.'
                            />
                        )}
                        {!this.props.emailInvitationsEnabled && (
                            <FormattedMessage
                                id='invitation_modal.guests.add_people.description-email-disabled'
                                defaultMessage='Add existing guests.'
                            />
                        )}
                    </div>
                </div>
                <div
                    className='add-channels'
                    data-testid='channelPlaceholder'
                >
                    <h5>
                        <FormattedMessage
                            id='invitation_modal.guests.add_channels.title'
                            defaultMessage='Search and Add Channels'
                        />
                    </h5>
                    <div>
                        <FormattedMessage
                            id='invitation_modal.guests.add_channels.placeholder'
                            defaultMessage='Search and add channels'
                        >
                            {(placeholder) => (
                                <ChannelsInput
                                    placeholder={placeholder}
                                    ariaLabel={localizeMessage(
                                        'invitation_modal.guests.add_channels.title',
                                        'Search and Add Channels',
                                    )}
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
                <div
                    className='custom-message'
                    data-testid='customMessage'
                >
                    {!this.state.customMessageOpen && (
                        <a
                            onClick={this.openCustomMessage}
                            href='#'
                        >
                            <FormattedMessage
                                id='invitation_modal.guests.custom-message.link'
                                defaultMessage='Set a custom message'
                            />
                        </a>
                    )}
                    {this.state.customMessageOpen && (
                        <React.Fragment>
                            <div>
                                <FormattedMessage
                                    id='invitation_modal.guests.custom-message.title'
                                    defaultMessage='Custom message'
                                />
                                <CloseCircleIcon
                                    onClick={this.closeCustomMessage}
                                />
                            </div>
                            <textarea
                                ref={this.textareaRef}
                                onChange={this.onMessageChange}
                                value={this.state.customMessage}
                            />
                        </React.Fragment>
                    )}
                    <div className='help-text'>
                        <FormattedMessage
                            id='invitation_modal.guests.custom-message.description'
                            defaultMessage='Create a custom message to make your invite more personal.'
                        />
                    </div>
                </div>
                <div className='invite-guests'>
                    <button
                        className={
                            'btn ' +
                            (this.state.channels.length === 0 ||
                            this.state.usersAndEmails.length === 0 ? 'btn-inactive' : 'btn-primary')
                        }
                        disabled={
                            this.state.channels.length === 0 ||
                            this.state.usersAndEmails.length === 0
                        }
                        onClick={this.sendInvites}
                        id='inviteGuestButton'
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

export default withGetCloudSubscription(InvitationModalGuestsStep);
