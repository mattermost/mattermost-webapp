// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {CSSProperties} from 'react';
import {FormattedMessage} from 'react-intl';
import {ActionMeta, InputActionMeta} from 'react-select';
import classNames from 'classnames';

import {ServerError} from 'mattermost-redux/types/errors';
import {TeamInviteWithError, Team} from 'mattermost-redux/types/teams';
import {isEmail} from 'mattermost-redux/utils/helpers';

import {pageVisited, trackEvent} from 'actions/telemetry_actions';
import {getAnalyticsCategory} from 'components/next_steps_view/step_helpers';
import MultiInput from 'components/multi_input';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import {getSiteURL} from 'utils/url';
import * as Utils from 'utils/utils';

import {StepComponentProps} from '../../steps';

import './invite_members_step.scss';

type Props = StepComponentProps & {
    team: Team;
    isEmailInvitesEnabled: boolean;
    actions: {
        sendEmailInvitesToTeamGracefully: (teamId: string, emails: string[]) => Promise<{ data: TeamInviteWithError[]; error: ServerError }>;
        regenerateTeamInviteId: (teamId: string) => void;
    };
};

type State = {
    copiedLink: boolean;
    emails: SelectionType[];
    emailsSent?: number;
    emailInput: string;
    emailError?: string;
};

type SelectionType = {
    label: string;
    value: string;
    error: boolean;
}

const styles = {
    control: () => {
        return {
            alignItems: 'flex-start',
        };
    },
    valueContainer: (provided: CSSProperties) => {
        return {
            ...provided,
            padding: '0',
        };
    },
};

export default class InviteMembersStep extends React.PureComponent<Props, State> {
    inviteLinkRef: React.RefObject<HTMLInputElement>;
    timeout?: NodeJS.Timeout;

    constructor(props: Props) {
        super(props);

        this.inviteLinkRef = React.createRef();

        this.state = {
            copiedLink: false,
            emailInput: '',
            emails: [],
        };
    }

    componentDidMount() {
        if (this.props.expanded) {
            pageVisited(getAnalyticsCategory(this.props.isAdmin), 'pageview_invite_members');
        }

        if (!this.props.team.invite_id) {
            // force a regenerate if an invite ID hasn't been generated yet
            this.props.actions.regenerateTeamInviteId(this.props.team.id);
        }
    }

    componentDidUpdate(prevProps: Props) {
        if (prevProps.expanded !== this.props.expanded && this.props.expanded) {
            pageVisited(getAnalyticsCategory(this.props.isAdmin), 'pageview_invite_members');
        }
    }

    onInputChange = (value: string, change: InputActionMeta) => {
        if (!change) {
            return;
        }

        if (change.action === 'input-blur' || change.action === 'menu-close') {
            return;
        }

        if (this.state.emailInput === value) {
            return;
        }

        if (value.indexOf(' ') !== -1 || value.indexOf(',') !== -1) {
            const emails = value.split(/[\s,]+/).filter((email) => email.length).map((email) => ({label: email, value: email, error: !isEmail(email)}));
            const newEmails = [...this.state.emails, ...emails];

            this.setState({
                emails: newEmails,
                emailInput: '',
                emailError: newEmails.length > 10 ? Utils.localizeMessage('next_steps_view.invite_members_step.tooManyEmails', 'Invitations are limited to 10 email addresses.') : undefined,
            });
        } else {
            this.setState({emailInput: value});
        }
    }

    onChange = (value: SelectionType[], action: ActionMeta<SelectionType[]>) => {
        if (action.action !== 'remove-value' && action.action !== 'pop-value') {
            return;
        }

        if (!value.some((email) => email.error)) {
            this.setState({emailError: undefined});
        }

        if (value.length > 10) {
            this.setState({emailError: Utils.localizeMessage('next_steps_view.invite_members_step.tooManyEmails', 'Invitations are limited to 10 email addresses.')});
        }

        this.setState({emails: value});
    }

    onBlur = () => {
        if (this.state.emailInput) {
            const emails = this.state.emailInput.split(/[\s,]+/).filter((email) => email.length).map((email) => ({label: email, value: email, error: !isEmail(email)}));
            const newEmails = [...this.state.emails, ...emails];
            this.setState({emails: newEmails, emailInput: '', emailError: newEmails.length > 10 ? Utils.localizeMessage('next_steps_view.invite_members_step.tooManyEmails', 'Invitations are limited to 10 email addresses.') : undefined});
        }
    }

    sendEmailInvites = async () => {
        if (this.state.emails.some((email) => email.error)) {
            this.setState({emailError: Utils.localizeMessage('next_steps_view.invite_members_step.invalidEmail', 'One or more email addresses are invalid'), emailsSent: undefined});
            return;
        }

        trackEvent(getAnalyticsCategory(this.props.isAdmin), 'click_send_invitations', {num_invitations: this.state.emails.length});

        const emails = this.state.emails.map((value) => value.value);
        const {data, error} = await this.props.actions.sendEmailInvitesToTeamGracefully(this.props.team.id, emails);

        if (error || !data.length || data.some((result) => result.error)) {
            trackEvent(getAnalyticsCategory(this.props.isAdmin), 'error_sending_invitations');
            this.setState({emailError: Utils.localizeMessage('next_steps_view.invite_members_step.errorSendingEmails', 'There was a problem sending your invitations. Please try again.'), emailsSent: undefined});
            return;
        }

        trackEvent(getAnalyticsCategory(this.props.isAdmin), 'invitations_sent', {num_invitations_sent: data.length});

        this.setState({emailError: undefined, emailsSent: data.length}, () => {
            setTimeout(() => this.setState({emailsSent: undefined}), 4000);
        });
    }

    onSkip = () => {
        this.props.onSkip(this.props.id);
    }

    onFinish = () => {
        this.props.onFinish(this.props.id);
    }

    copyLink = () => {
        trackEvent(getAnalyticsCategory(this.props.isAdmin), 'click_copy_invite_link');

        const clipboard = navigator.clipboard;
        if (clipboard) {
            clipboard.writeText(this.getInviteURL());
            this.setState({copiedLink: true});
        } else {
            const textField = document.createElement('textarea');
            textField.innerText = this.getInviteURL();
            textField.style.position = 'fixed';
            textField.style.opacity = '0';

            document.body.appendChild(textField);
            textField.select();

            try {
                this.setState({copiedLink: document.execCommand('copy')});
            } catch (err) {
                this.setState({copiedLink: false});
            }
            textField.remove();
        }

        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(() => {
            this.setState({copiedLink: false});
        }, 4000);
    }

    getInviteURL = () => {
        return `${getSiteURL()}/signup_user_complete/?id=${this.props.team.invite_id}`;
    }

    render() {
        return (
            <div className='NextStepsView__stepWrapper'>
                <div className='InviteMembersStep'>
                    {this.props.isEmailInvitesEnabled &&
                        <div className='InviteMembersStep__emailInvitations'>
                            <h3>
                                <FormattedMessage
                                    id='next_steps_view.invite_members_step.sendInvitationsViaEmail'
                                    defaultMessage='Send invitations via email'
                                />
                            </h3>
                            <FormattedMessage
                                id='next_steps_view.invite_members_step.youCanInviteUpTo'
                                defaultMessage='You can invite up to 10 team members using a space or comma between addresses'
                            />
                            <MultiInput
                                onBlur={this.onBlur}
                                onInputChange={this.onInputChange}
                                onChange={this.onChange}
                                value={this.state.emails}
                                inputValue={this.state.emailInput}
                                legend={Utils.localizeMessage('next_steps_view.invite_members_step.emailAddresses', 'Email addresses')}
                                placeholder={Utils.localizeMessage('next_steps_view.invite_members_step.enterEmailAddresses', 'Enter email addresses')}
                                styles={styles}
                                name='InviteMembersStep__membersListInput'
                            />
                            <div className='InviteMembersStep__send'>
                                <button
                                    data-testid='InviteMembersStep__sendButton'
                                    className={classNames('NextStepsView__button InviteMembersStep__sendButton secondary', {disabled: !this.state.emails.length || Boolean(this.state.emailsSent) || this.state.emailError})}
                                    disabled={!this.state.emails.length || Boolean(this.state.emailsSent) || Boolean(this.state.emailError)}
                                    onClick={this.sendEmailInvites}
                                >
                                    <i className='icon icon-send'/>
                                    <FormattedMessage
                                        id='next_steps_view.invite_members_step.send'
                                        defaultMessage='Send'
                                    />
                                </button>
                                <div className={classNames('InviteMembersStep__invitationResults', {error: this.state.emailError})}>
                                    {this.state.emailsSent &&
                                        <>
                                            <i className='icon icon-check'/>
                                            <FormattedMarkdownMessage
                                                id='next_steps_view.invite_members_step.invitationsSent'
                                                defaultMessage='{num} invitations sent'
                                                values={{num: this.state.emailsSent}}
                                            />
                                        </>
                                    }
                                    {this.state.emailError &&
                                        <>
                                            <i className='icon icon-alert-outline'/>
                                            <span>{this.state.emailError}</span>
                                        </>
                                    }
                                </div>
                            </div>
                        </div>
                    }
                    <div className='InviteMembersStep__shareInviteLink'>
                        <h3>
                            {this.props.isEmailInvitesEnabled &&
                                <FormattedMessage
                                    id='next_steps_view.invite_members_step.orShareThisLink'
                                    defaultMessage='Or share this link to invite members'
                                />
                            }
                            {!this.props.isEmailInvitesEnabled &&
                                <FormattedMessage
                                    id='next_steps_view.invite_members_step.shareThisLink'
                                    defaultMessage='Share this link to invite members'
                                />
                            }
                        </h3>
                        <div className='InviteMembersStep__shareLinkBlock'>
                            <input
                                ref={this.inviteLinkRef}
                                className='InviteMembersStep__shareLinkInput form-control'
                                type='text'
                                readOnly={true}
                                value={this.getInviteURL()}
                                aria-label={Utils.localizeMessage({id: 'next_steps_view.invite_members_step.shareLinkInput', defaultMessage: 'team invite link'})}
                                data-testid='InviteMembersStep__shareLinkInput'
                            />
                            <button
                                className={classNames('NextStepsView__button InviteMembersStep__shareLinkInputButton secondary', {copied: this.state.copiedLink})}
                                onClick={this.copyLink}
                                data-testid='InviteMembersStep__shareLinkInputButton'
                            >
                                {!this.state.copiedLink &&
                                    <>
                                        <i className='icon icon-link-variant'/>
                                        <FormattedMessage
                                            id='next_steps_view.invite_members_step.copy_button'
                                            defaultMessage='Copy Link'
                                        />
                                    </>
                                }
                                {this.state.copiedLink &&
                                    <>
                                        <i className='icon icon-check'/>
                                        <FormattedMessage
                                            id='next_steps_view.invite_members_step.link_copied'
                                            defaultMessage='Copied'
                                        />
                                    </>
                                }
                            </button>
                        </div>
                    </div>
                </div>
                <div className='NextStepsView__wizardButtons'>
                    <button
                        data-testid='InviteMembersStep__finishButton'
                        className={'NextStepsView__button NextStepsView__finishButton primary'}
                        onClick={this.onFinish}
                    >
                        <FormattedMessage
                            id='next_steps_view.invite_members_step.finish'
                            defaultMessage='Finish'
                        />
                    </button>
                </div>
            </div>
        );
    }
}
