// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import ReactSelect from 'react-select';
import classNames from 'classnames';

import {TeamInviteWithError} from 'mattermost-redux/types/teams';

import {getSiteURL} from 'utils/url';
import * as Utils from 'utils/utils';

import {StepComponentProps} from '../../steps';

import './invite_members_step.scss';

type Props = StepComponentProps & {
    teamId: string;
    actions: {
        sendEmailInvitesToTeamGracefully: (teamId: string, emails: string[]) => Promise<{data: TeamInviteWithError[]}>;
    };
};

type State = {
    copiedLink: boolean;
};

export default class InviteMembersStep extends React.PureComponent<Props, State> {
    inviteLinkRef: React.RefObject<HTMLInputElement>;
    timeout?: NodeJS.Timeout;
    values: {label: string; value: string}[];

    constructor(props: Props) {
        super(props);

        this.inviteLinkRef = React.createRef();
        this.values = [];

        this.state = {
            copiedLink: false,
        };
    }

    private handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        let fullNameError;
        if (!event.target.value) {
            fullNameError = Utils.localizeMessage('next_steps_view.complete_profile_step.nameCannotBeBlank', 'Your name can’t be blank');
        }

        this.setState({fullName: event.target.value, fullNameError});
    }

    inputChange = (value: string) => {
        this.values.push({label: value, value});
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
                        <ReactSelect
                            isMulti={true}
                            delimiter={','}
                            isClearable={false}
                            onInputChange={this.inputChange}
                            value={this.values}
                            openMenuOnFocus={false}
                            menuIsOpen={false}
                        />
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
