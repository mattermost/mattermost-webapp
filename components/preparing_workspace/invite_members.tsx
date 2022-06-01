// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState, useMemo, useEffect} from 'react';
import {CSSTransition} from 'react-transition-group';
import {FormattedMessage, useIntl} from 'react-intl';

import {UserProfile} from 'mattermost-redux/types/users';

import {t} from 'utils/i18n';
import {Constants} from 'utils/constants';

import UsersEmailsInput from 'components/widgets/inputs/users_emails_input';

import {Animations, mapAnimationReasonToClass, Form, PreparingWorkspacePageProps} from './steps';

import Title from './title';
import Description from './description';
import PageBody from './page_body';
import SingleColumnLayout from './single_column_layout';

import './invite_members.scss';
import InviteMembersLink from './invite_members_link';

type Props = PreparingWorkspacePageProps & {
    disableEdits: boolean;
    className?: string;
    emails: Form['teamMembers']['invites'];
    setEmails: (emails: Form['teamMembers']['invites']) => void;
    teamInviteId: string;
    formUrl: Form['url'];
    configSiteUrl?: string;
    browserSiteUrl: string;
    inferredProtocol: 'http' | 'https' | null;
    showInviteLink: boolean;
}

const InviteMembers = (props: Props) => {
    const [email, setEmail] = useState('');
    const {formatMessage} = useIntl();
    let className = 'InviteMembers-body';
    if (props.className) {
        className += ' ' + props.className;
    }

    useEffect(() => {
        if (props.show) {
            props.onPageView();
        }
    }, [props.show]);

    const placeholder = formatMessage({
        id: 'onboarding_wizard.invite_members.placeholder',
        defaultMessage: 'Enter email addresses',
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
        let urlBase = '';
        if (props.configSiteUrl && !props.configSiteUrl.includes('localhost')) {
            urlBase = props.configSiteUrl;
        } else if (props.formUrl && !props.formUrl.includes('localhost')) {
            urlBase = props.formUrl;
        } else {
            urlBase = props.browserSiteUrl;
        }
        if (props.inferredProtocol) {
            urlBase = props.inferredProtocol + '://' + urlBase;
        }
        return `${urlBase}/signup_user_complete/?id=${props.teamInviteId}`;
    }, [props.teamInviteId, props.configSiteUrl, props.browserSiteUrl, props.formUrl]);

    let suppressNoOptionsMessage = true;
    if (props.emails.length > Constants.MAX_ADD_MEMBERS_BATCH) {
        errorProperties.showError = true;

        // We want to suppress the no options message, unless the message that is going to be displayed
        // is the max users warning
        suppressNoOptionsMessage = false;
    }

    let description = (
        <FormattedMessage
            id={'onboarding_wizard.invite_members.description'}
            defaultMessage='Collaboration is tough by yourself. Invite a few team members. Separate each email address with a space or comma.'
        />
    );
    if (props.showInviteLink) {
        description = (
            <FormattedMessage
                id={'onboarding_wizard.invite_members.description_link'}
                defaultMessage='Collaboration is tough by yourself. Invite a few team members using the invitation link below.'
            />
        );
    }

    let inviteInteraction = (
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
    );

    if (props.showInviteLink) {
        inviteInteraction = <InviteMembersLink inviteURL={inviteURL}/>;
    }

    return (
        <CSSTransition
            in={props.show}
            timeout={Animations.PAGE_SLIDE}
            classNames={mapAnimationReasonToClass('InviteMembers', props.transitionDirection)}
            mountOnEnter={true}
            unmountOnExit={true}
        >
            <div className={className}>
                <SingleColumnLayout
                    style={{
                        maxWidth: '550px',
                    }}
                >
                    {props.previous}
                    <Title>
                        <FormattedMessage
                            id={'onboarding_wizard.invite_members.title'}
                            defaultMessage='Invite your team members'
                        />
                    </Title>
                    <Description>
                        {description}
                    </Description>
                    <PageBody>
                        {inviteInteraction}
                    </PageBody>
                    <div className='InviteMembers__submit'>
                        <button
                            className='primary-button'
                            disabled={props.disableEdits || (!props.showInviteLink && props.emails.length === 0)}
                            onClick={props.next}
                        >
                            {
                                props.showInviteLink ?
                                    (
                                        <FormattedMessage
                                            id={'onboarding_wizard.invite_members.next_link'}
                                            defaultMessage='Finish setup'
                                        />
                                    ) :
                                    (
                                        <FormattedMessage
                                            id={'onboarding_wizard.invite_members.next'}
                                            defaultMessage='Send invites'
                                        />
                                    )
                            }
                        </button>
                        {!props.showInviteLink && (
                            <button
                                className='tertiary-button'
                                onClick={props.skip}
                            >
                                <FormattedMessage
                                    id={'onboarding_wizard.invite_members.skip'}
                                    defaultMessage="I'll do this later"
                                />
                            </button>
                        )}
                    </div>
                </SingleColumnLayout>
            </div>
        </CSSTransition>
    );
};

export default InviteMembers;
