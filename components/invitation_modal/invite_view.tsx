// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useMemo} from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage, useIntl} from 'react-intl';

import deepFreeze from 'mattermost-redux/utils/deep_freeze';
import {InviteToTeamTreatments} from 'mattermost-redux/constants/config';
import {Channel} from 'mattermost-redux/types/channels';
import {UserProfile} from 'mattermost-redux/types/users';
import {Team} from 'mattermost-redux/types/teams';

import {getSiteURL} from 'utils/url';

import InviteAs, {As} from './invite_as';
import AddToChannels, {CustomMessageProps, InviteChannels, defaultCustomMessage, defaultInviteChannels} from './add_to_channels';
import InviteInput from './invite_input';
import {trackEvent} from 'actions/telemetry_actions'
import {getAnalyticsCategory} from 'components/next_steps_view/step_helpers';
import useCopyText from 'components/common/hooks/useCopyText';
import UsersEmailsInput, {EmailInvite} from 'components/widgets/inputs/users_emails_input';

export const defaultInviteState = deepFreeze({
    as: 'member',
    customMessage: defaultCustomMessage,
    to: [],
    sending: false,
    inviteChannels: defaultInviteChannels,
    usersEmails: [],
});

export type InviteState = {
    customMessage: CustomMessageProps;
    to: string[];
    as: As;
    sending: boolean;
    inviteChannels: InviteChannels;
    usersEmails: Array<UserProfile | EmailInvite>
};

type Props = InviteState & {
    setInviteAs: (as: As) => void;
    invite: () => void;
    onChannelsChange: (channels: Channel[]) => void;
    onChannelsInputChange: (channelsInputValue: string) => void;
    currentTeam: Team;
    currentChannelName: string;
    inviteToTeamTreatment: InviteToTeamTreatments;
    setCustomMessage: (message: string) => void;
    toggleCustomMessage: () => void;
    channelsLoader: (value: string, callback?: (channels: Channel[]) => void) => Promise<Channel[]>;
    regenerateTeamInviteId: (teamId: string) => void;
    isAdmin: boolean;
    usersLoader: (value: string, callback: (users: UserProfile[]) => void) => Promise<UserProfile[]>; 
    onChangeUsersEmails: (usersEmails: Array<UserProfile | EmailInvite>) => void;
}


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

    let copyButton = (
        <button
            onClick={copyText.onClick}
            data-testid='InviteView__copyInviteLink'
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

    return (
        <>
            <Modal.Header>
                <FormattedMessage
                    id='invite_modal.title'
                    defaultMessage={'Invite {as} to {team_name}'}
                    values={{
                        as: (
                            props.as === 'member' ?
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
            </Modal.Header>
            <Modal.Body>
                <UsersEmailsInput
                    usersLoader={props.usersLoader}
                    placeholder={formatMessage({
                        id: 'invite_modal.add_invites',
                        defaultMessage: 'Enter a name or email address'
                    })}
                    ariaLabel={formatMessage({
                        id: 'invitation_modal.members.search_and_add.title',
                        defaultMessage: 'Invite People',
                    })}
                    onChange={props.onChangeUsersEmails}
                />
                <InviteAs
                    as={props.as}
                    setInviteAs={props.setInviteAs}
                    inviteToTeamTreatment={props.inviteToTeamTreatment}
                />
                <InviteInput
                />
                {props.as === 'guest' && (
                    <AddToChannels
                        setCustomMessage={props.setCustomMessage}
                        toggleCustomMessage={props.toggleCustomMessage}
                        customMessage={props.customMessage}
                        onChannelsChange={props.onChannelsChange}
                        onChannelsInputChange={props.onChannelsInputChange}
                        inviteChannels={props.inviteChannels}
                        channelsLoader={props.channelsLoader}
                        currentChannelName={props.currentChannelName}
                    />
                )}
            </Modal.Body>
            <Modal.Footer>
                {copyButton}
                <button
                    disabled={true}
                    onClick={props.invite}
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
