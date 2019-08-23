// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {debounce} from 'mattermost-redux/actions/helpers';
import {isEmail} from 'mattermost-redux/utils/helpers';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import InviteIcon from 'components/widgets/icons/invite_icon';
import UsersEmailsInput from 'components/widgets/inputs/users_emails_input.jsx';

import BackIcon from 'components/widgets/icons/back_icon';
import LinkIcon from 'components/widgets/icons/link_icon';

import {getSiteURL} from 'utils/url.jsx';
import {t} from 'utils/i18n.jsx';

import './invitation_modal_members_step.scss';

export default class InvitationModalMembersStep extends React.Component {
    static propTypes = {
        inviteId: PropTypes.string.isRequired,
        goBack: PropTypes.func,
        searchProfiles: PropTypes.func.isRequired,
        onEdit: PropTypes.func.isRequired,
        onSubmit: PropTypes.func.isRequired,
    }

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

    onChange = (usersAndEmails) => {
        this.setState({usersAndEmails});
        this.props.onEdit(usersAndEmails.length > 0 || this.state.usersInputValue);
    }

    onUsersInputChange = (usersInputValue) => {
        this.setState({usersInputValue});
        this.props.onEdit(this.state.usersAndEmails.length > 0 || usersInputValue);
    }

    submit = () => {
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
    }

    render() {
        const inviteUrl = getSiteURL() + '/signup_user_complete/?id=' + this.props.inviteId;
        return (
            <div className='InvitationModalMembersStep'>
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
                        id='invitation_modal.members.title'
                        defaultMessage='Invite **Members**'
                    />
                </h1>
                <div className='share-link'>
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
                        />
                        <button
                            className='share-link-input-button'
                            onClick={this.copyLink}
                        >
                            <LinkIcon/>
                            {!this.state.copiedLink &&
                                <FormattedMessage
                                    id='invitation_modal.members.share_link.copy_button'
                                    defaultMessage='Copy Link'
                                />
                            }
                            {this.state.copiedLink &&
                                <FormattedMessage
                                    id='invitation_modal.members.share_link.link_copied'
                                    defaultMessage='Link Copied'
                                />
                            }
                        </button>
                    </div>
                    <div className='help-text'>
                        <FormattedMessage
                            id='invitation_modal.members.share_link.description'
                            defaultMessage='Share this link to grant member access to this team.'
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
                <div className='search-and-add'>
                    <h2>
                        <FormattedMessage
                            id='invitation_modal.members.search_and_add.title'
                            defaultMessage='Invite People'
                        />
                    </h2>
                    <div data-testid='inputPlaceholder'>
                        <FormattedMessage
                            id='invitation_modal.members.search-and-add.placeholder'
                            defaultMessage='Add members or email addresses'
                        >
                            {(placeholder) => (
                                <UsersEmailsInput
                                    usersLoader={this.usersLoader}
                                    placeholder={placeholder}
                                    onChange={this.onChange}
                                    value={this.state.usersAndEmails}
                                    validAddressMessageId={t('invitation_modal.members.users_emails_input.valid_email')}
                                    validAddressMessageDefault='Invite **{email}** as a team member'
                                    noMatchMessageId={t('invitation_modal.members.users_emails_input.no_user_found_matching')}
                                    noMatchMessageDefault='No one found matching **{text}**, type email to invite'
                                    onInputChange={this.onUsersInputChange}
                                    inputValue={this.state.usersInputValue}
                                />
                            )}
                        </FormattedMessage>
                    </div>
                    <div className='help-text'>
                        <FormattedMessage
                            id='invitation_modal.members.search-and-add.description'
                            defaultMessage='Search and add members from other teams or email invite new users.'
                        />
                    </div>
                </div>
                <div className='invite-members'>
                    <button
                        className={'btn ' + (this.state.usersAndEmails.length === 0 ? 'btn-inactive' : 'btn-primary')}
                        onClick={this.submit}
                        disabled={this.state.usersAndEmails.length === 0}
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
