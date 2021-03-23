// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {injectIntl, FormattedMessage} from 'react-intl';

import {debounce} from 'mattermost-redux/actions/helpers';
import {isEmail} from 'mattermost-redux/utils/helpers';

import {trackEvent} from 'actions/telemetry_actions';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import InviteMembersIcon from 'components/widgets/icons/invite_members_icon';
import UsersEmailsInput from 'components/widgets/inputs/users_emails_input.jsx';
import UpgradeLink from 'components/widgets/links/upgrade_link';
import NotifyLink from 'components/widgets/links/notify_link';

import LinkIcon from 'components/widgets/icons/link_icon';

import {getSiteURL} from 'utils/url';
import {t} from 'utils/i18n.jsx';
import {localizeMessage} from 'utils/utils.jsx';
import {Constants} from 'utils/constants';
import withGetCloudSubscription from '../../common/hocs/cloud/with_get_cloud_subcription';

import './invitation_modal_members_step.scss';

class InvitationModalMembersStep extends React.PureComponent {
    static propTypes = {
        teamName: PropTypes.string.isRequired,
        currentTeamId: PropTypes.string.isRequired,
        intl: PropTypes.any,
        inviteId: PropTypes.string.isRequired,
        searchProfiles: PropTypes.func.isRequired,
        emailInvitationsEnabled: PropTypes.bool.isRequired,
        onEdit: PropTypes.func.isRequired,
        onSubmit: PropTypes.func.isRequired,
        userLimit: PropTypes.string.isRequired,
        currentUsers: PropTypes.number.isRequired,
        userIsAdmin: PropTypes.bool.isRequired,
        isCloud: PropTypes.bool.isRequired,
        subscriptionStats: PropTypes.object,
        actions: PropTypes.shape({
            getSubscriptionStats: PropTypes.func.isRequired,
        }).isRequired,
    };

    constructor(props) {
        super(props);
        this.inviteLinkRef = React.createRef();
        this.timeout = null;
        this.state = {
            usersAndEmails: [],
            copiedLink: false,
            termWithoutResults: null,
            usersInputValue: '',
        };
    }

    copyLink = () => {
        if (this.props.isCloud) {
            trackEvent('cloud_invite_users', 'click_copy_link');
        }
        const input = this.inviteLinkRef.current;

        const textField = document.createElement('textarea');
        textField.innerText = input.value;
        textField.style.position = 'fixed';
        textField.style.opacity = 0;

        document.body.appendChild(textField);
        textField.select();

        try {
            this.setState({copiedLink: document.execCommand('copy')});
        } catch (err) {
            this.setState({copiedLink: false});
        }
        textField.remove();

        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(() => {
            this.setState({copiedLink: false});
        }, 3000);
    };

    debouncedSearchProfiles = debounce((term, callback) => {
        this.props.
            searchProfiles(term).
            then(({data}) => {
                callback(data);
                if (data.length === 0) {
                    this.setState({termWithoutResults: term});
                } else {
                    this.setState({termWithoutResults: null});
                }
            }).
            catch(() => {
                callback([]);
            });
    }, 150);

    usersLoader = (term, callback) => {
        if (
            this.state.termWithoutResults &&
            term.startsWith(this.state.termWithoutResults)
        ) {
            callback([]);
            return;
        }
        try {
            this.debouncedSearchProfiles(term, callback);
        } catch (error) {
            callback([]);
        }
    };

    onChange = (usersAndEmails) => {
        this.setState({usersAndEmails}, () => {
            if (this.shouldShowPickerError() && this.props.isCloud) {
                trackEvent('cloud_invite_users', 'warning_near_limit', {remaining: this.getRemainingUsers() - this.state.usersAndEmails.length});
            }
        });
        this.props.onEdit(
            usersAndEmails.length > 0 || this.state.usersInputValue,
        );
    };

    onUsersInputChange = (usersInputValue) => {
        this.setState({usersInputValue});
        this.props.onEdit(
            this.state.usersAndEmails.length > 0 || usersInputValue,
        );
    };

    submit = () => {
        if (this.props.isCloud) {
            trackEvent('cloud_invite_users', 'click_send_invitations', {num_invitations: this.state.usersAndEmails.length});
        }
        const users = [];
        const emails = [];
        for (const userOrEmail of this.state.usersAndEmails) {
            if (isEmail(userOrEmail)) {
                emails.push(userOrEmail);
            } else {
                users.push(userOrEmail);
            }
        }
        this.props.onSubmit(users, emails, this.state.usersInputValue);
    };

    getRemainingUsers = () => {
        const {subscriptionStats} = this.props;
        const {usersAndEmails} = this.state;
        return subscriptionStats && subscriptionStats.remaining_seats - usersAndEmails.length;
    }

    shouldShowPickerError = () => {
        const {userLimit, isCloud, subscriptionStats} = this.props;

        if (subscriptionStats && subscriptionStats.is_paid_tier === 'true') {
            return false;
        }

        if (userLimit === '0' || !isCloud) {
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
        const inviteUrl =
            getSiteURL() + '/signup_user_complete/?id=' + this.props.inviteId;

        let placeholder = localizeMessage(
            'invitation_modal.members.search-and-add.placeholder',
            'Add members or email addresses',
        );
        let noMatchMessageId = t(
            'invitation_modal.members.users_emails_input.no_user_found_matching',
        );
        let noMatchMessageDefault =
            'No one found matching **{text}**, type email to invite';

        if (!this.props.emailInvitationsEnabled) {
            placeholder = localizeMessage(
                'invitation_modal.members.search-and-add.placeholder-email-disabled',
                'Add members',
            );
            noMatchMessageId = t(
                'invitation_modal.members.users_emails_input.no_user_found_matching-email-disabled',
            );
            noMatchMessageDefault = 'No one found matching **{text}**';
        }

        const {subscriptionStats} = this.props;
        const remainingUsers = subscriptionStats && subscriptionStats.remaining_seats;
        const inviteMembersButtonDisabled = this.state.usersAndEmails.length > Constants.MAX_ADD_MEMBERS_BATCH || this.state.usersAndEmails.length === 0;

        const errorProperties = {
            showError: this.shouldShowPickerError(),
            errorMessageId: t(
                'invitation_modal.invite_members.hit_cloud_user_limit',
            ),
            errorMessageDefault: 'You can only invite **{num} more {num, plural, one {member} other {members}}** to the team on the free tier.',
            errorMessageValues: {
                num: remainingUsers < 0 ? '0' : remainingUsers,
            },
            extraErrorText: (this.props.userIsAdmin ? <UpgradeLink telemetryInfo='click_upgrade_users_emails_input'/> : <NotifyLink/>),
        };

        if (this.state.usersAndEmails.length > Constants.MAX_ADD_MEMBERS_BATCH) {
            errorProperties.showError = true;
            errorProperties.errorMessageId = t(
                'invitation_modal.invite_members.exceeded_max_add_members_batch',
            );
            errorProperties.errorMessageDefault = 'No more than **{text}** people can be invited at once';
            errorProperties.errorMessageValues.text = Constants.MAX_ADD_MEMBERS_BATCH;
        }

        return (
            <div className='InvitationModalMembersStep'>
                <div className='modal-icon'>
                    <InviteMembersIcon/>
                </div>
                <h1 id='invitation_modal_title'>
                    <FormattedMarkdownMessage
                        id='invitation_modal.members.title'
                        defaultMessage='Invite **Members** to {teamName}'
                        values={{teamName: this.props.teamName}}
                    />
                </h1>
                <div
                    className='share-link'
                    data-testid='shareLink'
                >
                    <h2>
                        <FormattedMessage
                            id='invitation_modal.members.share_link.title'
                            defaultMessage='Share This Link'
                        />
                    </h2>
                    <div className='share-link-input-block'>
                        <input
                            ref={this.inviteLinkRef}
                            className='share-link-input'
                            type='text'
                            readOnly={true}
                            value={inviteUrl}
                            aria-label={this.props.intl.formatMessage({
                                id: 'invitation_modal.members.share_link.input',
                                defaultMessage: 'team invite link',
                            })}
                            data-testid='shareLinkInput'
                        />
                        <button
                            className='share-link-input-button'
                            onClick={this.copyLink}
                            data-testid='shareLinkInputButton'
                        >
                            <LinkIcon/>
                            {!this.state.copiedLink && (
                                <FormattedMessage
                                    id='invitation_modal.members.share_link.copy_button'
                                    defaultMessage='Copy Link'
                                />
                            )}
                            {this.state.copiedLink && (
                                <FormattedMessage
                                    id='invitation_modal.members.share_link.link_copied'
                                    defaultMessage='Link Copied'
                                />
                            )}
                        </button>
                    </div>
                    <div className='help-text'>
                        <FormattedMessage
                            id='invitation_modal.members.share_link.description'
                            defaultMessage='Share this link to invite people to this team.'
                        />
                    </div>
                </div>
                <div className='invitation-modal-or'>
                    <hr/>
                    <div>
                        <FormattedMessage
                            id='invitation_modal.members.or'
                            defaultMessage='OR'
                        />
                    </div>
                </div>
                <div
                    className='search-and-add'
                    data-testid='searchAdd'
                >
                    <h2>
                        <FormattedMessage
                            id='invitation_modal.members.search_and_add.title'
                            defaultMessage='Add or Invite People'
                        />
                    </h2>
                    <div data-testid='inputPlaceholder'>
                        <UsersEmailsInput
                            {...errorProperties}
                            usersLoader={this.usersLoader}
                            placeholder={placeholder}
                            ariaLabel={localizeMessage(
                                'invitation_modal.members.search_and_add.title',
                                'Invite People',
                            )}
                            onChange={this.onChange}
                            value={this.state.usersAndEmails}
                            validAddressMessageId={t(
                                'invitation_modal.members.users_emails_input.valid_email',
                            )}
                            validAddressMessageDefault='Invite **{email}** as a team member'
                            noMatchMessageId={noMatchMessageId}
                            noMatchMessageDefault={noMatchMessageDefault}
                            onInputChange={this.onUsersInputChange}
                            inputValue={this.state.usersInputValue}
                            emailInvitationsEnabled={
                                this.props.emailInvitationsEnabled
                            }
                        />
                    </div>
                    <div className='help-text'>
                        {this.props.emailInvitationsEnabled && (
                            <FormattedMessage
                                id='invitation_modal.members.search-and-add.description'
                                defaultMessage='Add existing members or send email invites to new members.'
                            />
                        )}
                        {!this.props.emailInvitationsEnabled && (
                            <FormattedMessage
                                id='invitation_modal.members.search-and-add.description-email-disabled'
                                defaultMessage='Add existing members to this team.'
                            />
                        )}
                    </div>
                </div>
                <div className='invite-members'>
                    <button
                        className={
                            'btn ' +
                            (inviteMembersButtonDisabled ?
                                'btn-inactive' :
                                'btn-primary')
                        }
                        onClick={this.submit}
                        disabled={inviteMembersButtonDisabled}
                        id='inviteMembersButton'
                    >
                        <FormattedMessage
                            id='invitation_modal.members.invite_button'
                            defaultMessage='Invite Members'
                        />
                    </button>
                </div>
            </div>
        );
    }
}

export default injectIntl(withGetCloudSubscription(InvitationModalMembersStep));
