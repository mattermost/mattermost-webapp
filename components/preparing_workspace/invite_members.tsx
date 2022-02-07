// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState, useMemo} from 'react';
import {CSSTransition} from 'react-transition-group';
import {FormattedMessage, useIntl} from 'react-intl';

import {UserProfile} from 'mattermost-redux/types/users';

import {t} from 'utils/i18n';
import {Constants} from 'utils/constants';
import {getSiteURL} from 'utils/url';

import UsersEmailsInput from 'components/widgets/inputs/users_emails_input';
import useCopyText from 'components/common/hooks/useCopyText';
import {trackEvent} from 'actions/telemetry_actions';
import {getAnalyticsCategory} from 'components/next_steps_view/step_helpers';

import {Animations, mapAnimationReasonToClass, Form, TransitionProps} from './steps';

import PageLine from './page_line';
import Title from './title';
import Description from './description';

import './invite_members.scss';

type Props = TransitionProps & {
    disableEdits: boolean;
    showInviteSuccess: boolean;
    className?: string;
    emails: Form['teamMembers']['invites'];
    setEmails: (emails: Form['teamMembers']['invites']) => void;
    teamInviteId: string;
}

const InviteMembers = (props: Props) => {
    const [email, setEmail] = useState('');
    const {formatMessage} = useIntl();
    let className = 'InviteMembers-body';
    if (props.className) {
        className += ' ' + props.className;
    }

    const placeholder = formatMessage({
        id: 'invite_modal.add_invites',
        defaultMessage: 'Enter a name or email address',
    });
    const errorProperties = {
        showError: false,
        errorMessageId: t(
            'invitation_modal.invite_members.exceeded_max_add_members_batch',
        ),
        errorMessageDefault: 'No more than **{text}** people can be invited at once',
        errorMessageValues: {
            text: Constants.MAX_ADD_MEMBERS_BATCH.toString(),
        },
    };

    const inviteURL = useMemo(() => {
        return `${getSiteURL()}/signup_user_complete/?id=${props.teamInviteId}`;
    }, [props.teamInviteId]);

    const copyText = useCopyText({
        trackCallback: () => trackEvent(getAnalyticsCategory(true), 'admin_setup_click_copy_invite_link'),
        text: inviteURL,
    });

    const copyButton = (
        <button
            onClick={copyText.onClick}
            data-testid='InviteView__copyInviteLink'
            aria-label='team invite link'
            className='InviteView__copyLink tertiary-button'
        >
            {!copyText.copiedRecently && (
                <>
                    <i className='icon icon-link-variant'/>
                    <FormattedMessage
                        id='invite_modal.copy_link'
                        defaultMessage='Copy invite link'
                    />
                </>
            )}
            {copyText.copiedRecently && (
                <>
                    <i className='icon icon-check'/>
                    <FormattedMessage
                        id='invite_modal.copied'
                        defaultMessage='Copied'
                    />
                </>
            )}
        </button>
    );

    let suppressNoOptionsMessage = true;
    if (props.emails.length > Constants.MAX_ADD_MEMBERS_BATCH) {
        errorProperties.showError = true;

        // We want to suppress the no options message, unless the message that is going to be displayed
        // is the max users warning
        suppressNoOptionsMessage = false;
    }
    return (
        <CSSTransition
            in={props.show}
            timeout={Animations.PAGE_SLIDE}
            classNames={mapAnimationReasonToClass('InviteMembers', props.direction)}
            mountOnEnter={true}
            unmountOnExit={true}
        >
            <div className={className}>
                <PageLine style={{height: '100px'}}/>
                {props.previous}
                <Title>
                    <FormattedMessage
                        id={'onboarding_wizard.invite_members.title'}
                        defaultMessage='Invite your team members'
                    />
                </Title>
                <Description>
                    <FormattedMessage
                        id={'onboarding_wizard.invite_members.description'}
                        defaultMessage='Collaboration is tough by yourself. Invite a few team members. Separate each email address with a space or comma.'
                    />
                </Description>
                {copyButton}
                <UsersEmailsInput
                    {...errorProperties}
                    usersLoader={() => Promise.resolve([])}
                    placeholder={placeholder}
                    ariaLabel={formatMessage({
                        id: 'invitation_modal.members.search_and_add.title',
                        defaultMessage: 'Invite People',
                    })}
                    onChange={(emails: Array<UserProfile | string>) => {
                        // There should not be any users found or passed,
                        // because the usersLoader should never return any.
                        // Filtering them out in case there are any
                        // and to resolve Typescript errors
                        props.setEmails(emails.filter((x) => typeof x === 'string') as string[]);
                    }}
                    value={props.emails}
                    onInputChange={setEmail}
                    inputValue={email}
                    emailInvitationsEnabled={true}
                    autoFocus={true}
                    validAddressMessageId={t('invitation_modal.members.users_emails_input.valid_email')}
                    validAddressMessageDefault={'Invite **{email}** as a team member'}
                    suppressNoOptionsMessage={suppressNoOptionsMessage}
                />
                <div>
                    <button
                        className='primary-button'
                        disabled={props.disableEdits}
                        onClick={props.next}
                    >
                        <FormattedMessage
                            id={'onboarding_wizard.invite_members.next'}
                            defaultMessage='Send invites'
                        />
                    </button>
                    <button
                        className='tertiary-button'
                        onClick={props.skip}
                    >
                        <FormattedMessage
                            id={'onboarding_wizard.invite_members.skip'}
                            defaultMessage="I'll do this later"
                        />
                    </button>
                </div>
                {/*TODO: <UsersEmailsInput> or something like it here*/}
                <PageLine style={{marginTop: '5px'}}/>
            </div>
        </CSSTransition>
    );
};

export default InviteMembers;
