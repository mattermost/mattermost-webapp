// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Tooltip} from 'react-bootstrap';
import {useIntl, FormattedMessage} from 'react-intl';

import store from 'stores/redux_store.jsx';

import {InviteMembersBtnLocations} from 'mattermost-redux/constants/config';

import OverlayTrigger from 'components/overlay_trigger';
import ToggleModalButtonRedux from 'components/toggle_modal_button_redux';
import InvitationModal from 'components/invitation_modal';

import {trackEvent} from 'actions/telemetry_actions.jsx';

import {ModalIdentifiers} from 'utils/constants';

import {getInviteMembersButtonLocation} from 'mattermost-redux/selectors/entities/preferences';

type Props = {
    buttonType: string;
};

const InviteMembersButton: React.FC<Props> = (props: Props): JSX.Element | null => {
    const intl = useIntl();

    const inviteMembersButtonLocation = getInviteMembersButtonLocation(store.getState());

    const tooltip = (
        <Tooltip
            id='new-group-tooltip'
            className='hidden-xs'
        >
            <FormattedMessage
                id={'sidebar_left.inviteUsers'}
                defaultMessage='Invite Users'
            />
        </Tooltip>
    );

    const addTelemetry = () => {
        trackEvent('invite_members_button', props.buttonType);
    };

    const OpenModal = (props: {children: React.ReactNode}) => {
        return (
            <ToggleModalButtonRedux
                accessibilityLabel={intl.formatMessage({id: 'sidebar_left.inviteUsers', defaultMessage: 'Invite Users'})}
                id='introTextInvite'
                className='intro-links color--link cursor--pointer'
                modalId={ModalIdentifiers.INVITATION}
                dialogType={InvitationModal}
                onClick={addTelemetry}
            >
                {props.children}
            </ToggleModalButtonRedux>
        );
    };

    const userIcon = (
        <OverlayTrigger
            delayShow={500}
            placement='top'
            overlay={tooltip}
        >
            <OpenModal>
                <div
                    className='SidebarChannelNavigator_inviteUsers'
                    aria-label={intl.formatMessage({id: 'sidebar_left.sidebar_channel_navigator.inviteUsers', defaultMessage: 'Invite Users'})}
                >
                    <i className='icon-account-plus-outline'/>
                </div>
            </OpenModal>
        </OverlayTrigger>
    );

    const lhsButton = (
        <OpenModal>
            <li
                className='SidebarChannelNavigator_inviteMembersLhsButton'
                aria-label={intl.formatMessage({id: 'sidebar_left.sidebar_channel_navigator.inviteUsers', defaultMessage: 'Invite Members'})}
            >
                <i className='icon-plus-box'/>
                <FormattedMessage
                    id={'sidebar_left.inviteMembers'}
                    defaultMessage='Invite Members'
                />
            </li>
        </OpenModal>
    );

    const stickyButton = (
        <div
            className='SidebarChannelNavigator_inviteUsersSticky'
            aria-label={intl.formatMessage({id: 'sidebar_left.sidebar_channel_navigator.inviteUsers', defaultMessage: 'Invite Members'})}
        >
            <OpenModal>
                <i className='icon-account-plus-outline'/>
                <FormattedMessage
                    id={'sidebar_left.inviteMembers'}
                    defaultMessage='Invite Members'
                />
            </OpenModal>
        </div>
    );

    let inviteButton;

    switch (props.buttonType) {
    case InviteMembersBtnLocations.USER_ICON:
        inviteButton = userIcon;
        break;
    case InviteMembersBtnLocations.STICKY:
        inviteButton = stickyButton;
        break;
    case InviteMembersBtnLocations.LHS_BUTTON:
        inviteButton = lhsButton;
        break;
    default:
        inviteButton = null;
        break;
    }

    if (inviteMembersButtonLocation !== props.buttonType || inviteMembersButtonLocation === InviteMembersBtnLocations.NONE) {
        inviteButton = null;
    }

    return (
        <>
            {inviteButton}
        </>
    );
};

export default InviteMembersButton;
