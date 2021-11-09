// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useMemo} from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage, useIntl} from 'react-intl';
import debounce from 'lodash/debounce';

import deepFreeze from 'mattermost-redux/utils/deep_freeze';
import {InviteToTeamTreatments} from 'mattermost-redux/constants/config';
import {Channel} from 'mattermost-redux/types/channels';
import {UserProfile} from 'mattermost-redux/types/users';
import {Team} from 'mattermost-redux/types/teams';

import {getSiteURL} from 'utils/url';
import {Constants} from 'utils/constants';

import {trackEvent} from 'actions/telemetry_actions';
import {getAnalyticsCategory} from 'components/next_steps_view/step_helpers';
import useCopyText from 'components/common/hooks/useCopyText';
import UsersEmailsInput from 'components/widgets/inputs/users_emails_input';
import UpgradeLink from 'components/widgets/links/upgrade_link';
import NotifyLink from 'components/widgets/links/notify_link';
import {t} from 'utils/i18n.jsx';
import {SubscriptionStats} from 'mattermost-redux/types/cloud';

import AddToChannels, {CustomMessageProps, InviteChannels, defaultCustomMessage, defaultInviteChannels} from './add_to_channels';
import InviteAs, {As} from './invite_as';
import './invite_view.scss';

export const defaultInviteState = deepFreeze({
    as: 'member',
    customMessage: defaultCustomMessage,
    sending: false,
    inviteChannels: defaultInviteChannels,
    usersEmails: [],
    usersEmailsSearch: '',
});

export type InviteState = {
    customMessage: CustomMessageProps;
    as: As;
    sending: boolean;
    inviteChannels: InviteChannels;
    usersEmails: Array<UserProfile | string>;
    usersEmailsSearch: string;
};

type Props = InviteState & {
    setInviteAs: (as: As) => void;
    invite: () => void;
    onChannelsChange: (channels: Channel[]) => void;
    onChannelsInputChange: (channelsInputValue: string) => void;
    onClose: () => void;
    currentTeam: Team;
    currentChannelName: string;
    inviteToTeamTreatment: InviteToTeamTreatments;
    setCustomMessage: (message: string) => void;
    toggleCustomMessage: () => void;
    channelsLoader: (value: string, callback?: (channels: Channel[]) => void) => Promise<Channel[]>;
    regenerateTeamInviteId: (teamId: string) => void;
    isAdmin: boolean;
    usersLoader: (value: string, callback: (users: UserProfile[]) => void) => Promise<UserProfile[]> | undefined;
    onChangeUsersEmails: (usersEmails: Array<UserProfile | string>) => void;
    isCloud: boolean;
    subscriptionStats?: SubscriptionStats | null;
    cloudUserLimit: string;
    emailInvitationsEnabled: boolean;
    onUsersInputChange: (usersEmailsSearch: string) => void;
    headerClass: string;
    footerClass: string;
}

function clearMinHeight() {
    const modalBody = document.querySelector('.modal-body') as HTMLDivElement;
    if (!modalBody) {
        return;
    }
    if (modalBody.style.minHeight) {
        modalBody.style.minHeight = '';
    }
}

const FOOTER_HEIGHT = 63;

const ensureInvitesVisible = debounce((options: UserProfile[]) => {
    if (options.length < 2) {
        clearMinHeight();
        return;
    }
    setTimeout(() => {
        const modalBody = document.querySelector('.modal-body') as HTMLDivElement;
        if (!modalBody) {
            return;
        }

        const bodyRect = modalBody.getBoundingClientRect();
        const menu = document.querySelector('.users-emails-input__menu');
        if (!menu) {
            return;
        }

        const menuRect = menu.getBoundingClientRect();

        if (menuRect.bottom > bodyRect.bottom) {
            let betterHeight = menuRect.bottom - bodyRect.top;
            if ((bodyRect.top + betterHeight + FOOTER_HEIGHT) > window.innerHeight) {
                betterHeight = window.innerHeight - bodyRect.top - FOOTER_HEIGHT;
            }
            modalBody.style.minHeight = `${betterHeight}px`;
        }
    }, 125);
});

export default function InviteView(props: Props) {
    useEffect(() => {
        if (!props.currentTeam.invite_id) {
            props.regenerateTeamInviteId(props.currentTeam.id);
        }
    }, [props.currentTeam.id, props.currentTeam.invite_id, props.regenerateTeamInviteId]);

    const {formatMessage} = useIntl();

    const inviteURL = useMemo(() => {
        return `${getSiteURL()}/signup_user_complete/?id=${props.currentTeam.invite_id}`;
    }, [props.currentTeam.invite_id]);

    const copyText = useCopyText({
        trackCallback: () => trackEvent(getAnalyticsCategory(props.isAdmin), 'click_copy_invite_link'),
        text: inviteURL,
    });

    const copyButton = (
        <button
            onClick={copyText.onClick}
            data-testid='InviteView__copyInviteLink'
            className='btn btn-cancel style--none InviteView__copyLink'
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

    // remainingUsers is calculated against the limit, the current users, and how many are being invited in the current flow
    const remainingUsers = (
        (props.subscriptionStats?.remaining_seats || 0) - props.usersEmails.length
    );

    const shouldShowPickerError = (() => {
        if (props.subscriptionStats?.is_paid_tier === 'true') {
            return false;
        }

        if (props.cloudUserLimit === '0' || !props.isCloud) {
            return false;
        }

        if (remainingUsers === 0 && props.usersEmailsSearch !== '') {
            return true;
        } else if (remainingUsers < 0) {
            return true;
        }
        return false;
    })();

    const errorMessageValues: Record<string, string> = {
        num: remainingUsers < 0 ? '0' : remainingUsers.toString(),
    };
    const errorProperties = {
        showError: shouldShowPickerError,
        errorMessageId: t(
            'invitation_modal.invite_members.hit_cloud_user_limit',
        ),
        errorMessageDefault: 'You can only invite **{num} more {num, plural, one {member} other {members}}** to the team on the free tier.',
        errorMessageValues,
        extraErrorText: (props.isAdmin ? <UpgradeLink telemetryInfo='click_upgrade_users_emails_input'/> : <NotifyLink/>),
    };

    if (props.usersEmails.length > Constants.MAX_ADD_MEMBERS_BATCH) {
        errorProperties.showError = true;
        errorProperties.errorMessageId = t(
            'invitation_modal.invite_members.exceeded_max_add_members_batch',
        );
        errorProperties.errorMessageDefault = 'No more than **{text}** people can be invited at once';
        errorProperties.errorMessageValues.text = Constants.MAX_ADD_MEMBERS_BATCH.toString();
    }

    let placeholder = formatMessage({
        id: 'invite_modal.add_invites',
        defaultMessage: 'Enter a name or email address',
    });
    let noMatchMessageId = t(
        'invitation_modal.members.users_emails_input.no_user_found_matching',
    );
    let noMatchMessageDefault =
        'No one found matching **{text}**. Enter their email to invite them.';

    if (!props.emailInvitationsEnabled) {
        placeholder = formatMessage({
            id: 'invitation_modal.members.search-and-add.placeholder-email-disabled',
            defaultMessage: 'Add members',
        });
        noMatchMessageId = t(
            'invitation_modal.members.users_emails_input.no_user_found_matching-email-disabled',
        );
        noMatchMessageDefault = 'No one found matching **{text}**';
    }

    const canInvite = useMemo(() => {
        if (props.as === As.GUEST) {
            return props.inviteChannels.channels.length > 0 && props.usersEmails.length > 0;
        }
        return props.usersEmails.length > 0;
    }, [props.as, props.inviteChannels.channels, props.usersEmails]);

    return (
        <>
            <Modal.Header className={props.headerClass}>
                <h1>
                    <FormattedMessage
                        id='invite_modal.title'
                        defaultMessage={'Invite {as} to {team_name}'}
                        values={{
                            as: (
                                props.as === As.MEMBER ?
                                    <FormattedMessage
                                        id='invite_modal.members'
                                        defaultMessage='members'
                                    /> :
                                    <FormattedMessage
                                        id='invite_modal.guests'
                                        defaultMessage='guests'
                                    />
                            ),
                            team_name: props.currentTeam.display_name,
                        }}
                    />
                </h1>
                <button
                    className='icon icon-close'
                    aria-label='Close'
                    title='Close'
                    onClick={props.onClose}
                />
            </Modal.Header>
            <Modal.Body>
                <div className='InviteView__sectionTitle'>
                    <FormattedMessage
                        id='invite_modal.to'
                        defaultMessage='To:'
                    />
                </div>
                <UsersEmailsInput
                    {...errorProperties}
                    usersLoader={(value: string, cb: (users: UserProfile[]) => void) => {
                        if (value === '') {
                            clearMinHeight();
                        }
                        return props.usersLoader(value, cb);
                    }}
                    onUsersLoad={ensureInvitesVisible}
                    placeholder={placeholder}
                    ariaLabel={formatMessage({
                        id: 'invitation_modal.members.search_and_add.title',
                        defaultMessage: 'Invite People',
                    })}
                    onChange={props.onChangeUsersEmails}
                    value={props.usersEmails}
                    validAddressMessageId={t(
                        'invitation_modal.members.users_emails_input.valid_email',
                    )}
                    onBlur={clearMinHeight}
                    validAddressMessageDefault='Invite **{email}** as a team member'
                    noMatchMessageId={noMatchMessageId}
                    noMatchMessageDefault={noMatchMessageDefault}
                    onInputChange={props.onUsersInputChange}
                    inputValue={props.usersEmailsSearch}
                    emailInvitationsEnabled={props.emailInvitationsEnabled}
                />
                <InviteAs
                    as={props.as}
                    setInviteAs={props.setInviteAs}
                    inviteToTeamTreatment={props.inviteToTeamTreatment}
                    titleClass='InviteView__sectionTitle'
                />
                {props.as === As.GUEST && (
                    <AddToChannels
                        setCustomMessage={props.setCustomMessage}
                        toggleCustomMessage={props.toggleCustomMessage}
                        customMessage={props.customMessage}
                        onChannelsChange={props.onChannelsChange}
                        onChannelsInputChange={props.onChannelsInputChange}
                        inviteChannels={props.inviteChannels}
                        channelsLoader={props.channelsLoader}
                        currentChannelName={props.currentChannelName}
                        titleClass='InviteView__sectionTitle'
                    />
                )}
            </Modal.Body>
            <Modal.Footer className={'InviteView__footer ' + props.footerClass}>
                {copyButton}
                <button
                    disabled={!canInvite}
                    onClick={props.invite}
                    className={'btn btn-primary'}
                    id='inviteMembersButton'
                >
                    <FormattedMessage
                        id='invite_modal.invite'
                        defaultMessage='Invite'
                    />
                </button>
            </Modal.Footer>
        </>
    );
}
