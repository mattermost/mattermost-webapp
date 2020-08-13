// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {CSSProperties} from 'react';
import {FormattedMessage} from 'react-intl';
import {ActionMeta, ValueType, InputActionMeta, components} from 'react-select';
import classNames from 'classnames';

import {TeamInviteWithError} from 'mattermost-redux/types/teams';
import {isEmail} from 'mattermost-redux/utils/helpers';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import {getSiteURL} from 'utils/url';
import * as Utils from 'utils/utils';

import {StepComponentProps} from '../../steps';

import './invite_members_step.scss';
import MultiInput from 'components/multi_input';

type Props = StepComponentProps & {
    teamId: string;
    actions: {
        sendEmailInvitesToTeamGracefully: (teamId: string, emails: string[]) => Promise<{data: TeamInviteWithError[]}>;
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
    placeholder: () => {
        return {
            margin: '0',
            opacity: '0.64',
        };
    },
    valueContainer: (provided: CSSProperties) => {
        return {
            ...provided,
            padding: '0',
        };
    },
};

const MultiValueContainer = (props: any) => {
    return (
        <div className={classNames('InviteMembersStep__emailContainer', {error: props.data.error})}>
            <components.MultiValueContainer {...props}/>
        </div>
    );
};

const MultiValueRemove = (props: any) => {
    return (
        <div className='InviteMembersStep__removeEmailButton'>
            <components.MultiValueRemove {...props}>
                <i className='icon icon-close-circle'/>
            </components.MultiValueRemove>
        </div>
    );
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

        if (this.state.emails.length >= 10) {
            this.setState({emailError: Utils.localizeMessage('next_steps_view.invite_members_step.tooManyEmails', 'Invitations are limited to 10 email addresses.')});
            return;
        }

        if (value.indexOf(' ') !== -1 || value.indexOf(',') !== -1) {
            const emails = value.split(/[\s,]+/).filter((email) => email.length).map((email) => ({label: email, value: email, error: !isEmail(email)}));
            this.setState({emails: [...this.state.emails, ...emails], emailInput: '', emailError: undefined});
        } else {
            this.setState({emailInput: value, emailError: undefined});
        }
    }

    onChange = (value: ValueType<SelectionType[]>, action: ActionMeta<SelectionType[]>) => {
        if (action.action !== 'remove-value' && action.action !== 'pop-value') {
            return;
        }

        if (!(value as SelectionType[]).some((email) => email.error)) {
            this.setState({emailError: undefined});
        }

        this.setState({emails: value as SelectionType[]});
    }

    sendEmailInvites = async () => {
        if (this.state.emails.some((email) => email.error)) {
            this.setState({emailError: Utils.localizeMessage('next_steps_view.invite_members_step.invalidEmail', 'One or more email addresses are invalid'), emailsSent: undefined});
            return;
        }

        const emails = this.state.emails.map((value) => value.value);
        const {data} = await this.props.actions.sendEmailInvitesToTeamGracefully(this.props.teamId, emails);

        if (!data.length || data.some((result) => result.error)) {
            this.setState({emailError: Utils.localizeMessage('next_steps_view.invite_members_step.errorSendingEmails', 'There was a problem sending your invitations. Please try again.'), emailsSent: undefined});
            return;
        }

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

        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(() => {
            this.setState({copiedLink: false});
        }, 4000);
    }

    getInviteURL = () => {
        return `${getSiteURL()}/signup_user/`;
    }

    render() {
        return (
            <div className='NextStepsView__stepWrapper'>
                <div className='InviteMembersStep'>
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
                            components={{
                                Menu: () => null,
                                IndicatorsContainer: () => null,
                                MultiValueContainer,
                                MultiValueRemove,
                            }}
                            onInputChange={this.onInputChange}
                            onChange={this.onChange}
                            value={this.state.emails}
                            inputValue={this.state.emailInput}
                            legend={Utils.localizeMessage('next_steps_view.invite_members_step.emailAddresses', 'Email addresses')}
                            placeholder={Utils.localizeMessage('next_steps_view.invite_members_step.enterEmailAddresses', 'Enter email addresses')}
                            styles={styles}
                            className={'InviteMembersStep__reactSelect'}
                        />
                        <div className='InviteMembersStep__send'>
                            <button
                                className={classNames('InviteMembersStep__sendButton', {disabled: !this.state.emails.length || Boolean(this.state.emailsSent) || this.state.emailError})}
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
                    <div className='InviteMembersStep__shareInviteLink'>
                        <h3>
                            <FormattedMessage
                                id='next_steps_view.invite_members_step.orShareThisLink'
                                defaultMessage='Or share this link to invite members'
                            />
                        </h3>
                        <div className='InviteMembersStep__shareLinkBlock'>
                            <input
                                ref={this.inviteLinkRef}
                                className='InviteMembersStep__shareLinkInput'
                                type='text'
                                readOnly={true}
                                value={this.getInviteURL()}
                                aria-label={Utils.localizeMessage({id: 'next_steps_view.invite_members_step.shareLinkInput', defaultMessage: 'team invite link'})}
                                data-testid='shareLinkInput'
                            />
                            <button
                                className={classNames('InviteMembersStep__shareLinkInputButton', {copied: this.state.copiedLink})}
                                onClick={this.copyLink}
                                data-testid='shareLinkInputButton'
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
                    {/* <button
                        className='NextStepsView__button cancel'
                        onClick={this.onSkip}
                    >
                        <FormattedMessage
                            id='next_steps_view.skipForNow'
                            defaultMessage='Skip for now'
                        />
                    </button> */}
                    <button
                        className={'NextStepsView__button confirm'}
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
