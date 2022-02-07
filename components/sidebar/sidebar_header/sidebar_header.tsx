// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {useSelector} from 'react-redux';
import styled from 'styled-components';

import Flex from '@mattermost/compass-components/utilities/layout/Flex';
import Heading from '@mattermost/compass-components/components/heading';

import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {getInt} from 'mattermost-redux/selectors/entities/preferences';
import {getChannelsNameMapInCurrentTeam} from 'mattermost-redux/selectors/entities/channels';

import {GlobalState} from 'types/store';
import Constants, {Preferences, TutorialSteps} from 'utils/constants';
import * as Utils from 'utils/utils.jsx';

import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import MainMenu from 'components/main_menu';
import MenuTutorialTip from 'components/tutorial/menu_tutorial_tip';
import AddChannelDropdown from 'components/sidebar/add_channel_dropdown';

type SidebarHeaderContainerProps = {
    id?: string;
}

type SidebarHeaderProps = {
}

const SidebarHeaderContainer = styled(Flex).attrs(() => ({
    element: 'header',
    row: true,
    justify: 'space-between',
    alignment: 'center',
}))<SidebarHeaderContainerProps>`
    height: 52px;
    padding: 0 16px;

    .dropdown-menu {
        position: absolute;
        transform: translate(0, 0);
        margin-left: 0;
        min-width: 210px;
        max-width: 210px;
    }

    #SidebarContainer & .AddChannelDropdown_dropdownButton {
        border-radius: 16px;
        font-size: 18px;
    }
`;

const HEADING_WIDTH = 200;
const CHEVRON_WIDTH = 26;
const ADD_CHANNEL_DROPDOWN_WIDTH = 28;
const TITLE_WIDTH = (HEADING_WIDTH - CHEVRON_WIDTH - ADD_CHANNEL_DROPDOWN_WIDTH).toString();

const SidebarHeading = styled(Heading).attrs(() => ({
    element: 'h1',
    margin: 'none',
    size: 200,
}))<SidebarHeaderProps>`
    color: var(--sidebar-header-text-color);
    cursor: pointer;
    display: flex;

    .title {
        max-width: ${TITLE_WIDTH}px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        display: inline-block;
    }

    .icon-chevron-down {
        margin-left: -3px;
        margin-right: -1px;
    }

    #SidebarContainer & {
        font-family: Metropolis, sans-serif;
    }
`;

export type Props = {
    showNewChannelModal: () => void;
    showMoreChannelsModal: () => void;
    showCreateUserGroupModal: () => void;
    invitePeopleModal: () => void;
    showCreateCategoryModal: () => void;
    canCreateChannel: boolean;
    canJoinPublicChannel: boolean;
    handleOpenDirectMessagesModal: (e: Event) => void;
    unreadFilterEnabled: boolean;
    userGroupsEnabled: boolean;
    canCreateCustomGroups: boolean;
}

const SidebarHeader: React.FC<Props> = (props: Props): JSX.Element => {
    const currentTeam = useSelector((state: GlobalState) => getCurrentTeam(state));
    const currentUser = useSelector((state: GlobalState) => getCurrentUser(state));
    const tipStep = useSelector((state: GlobalState) => getInt(state, Preferences.TUTORIAL_STEP, currentUser.id));
    const isMobile = Utils.isMobile();

    const showMenuTip = tipStep === TutorialSteps.MENU_POPOVER && !isMobile;
    const showAddChannelTip = tipStep === TutorialSteps.ADD_CHANNEL_POPOVER && !isMobile;
    const channelsByName = useSelector((state: GlobalState) => getChannelsNameMapInCurrentTeam(state));
    const townSquareDisplayName = channelsByName[Constants.DEFAULT_CHANNEL]?.display_name || '';
    const offTopicDisplayName = channelsByName[Constants.OFFTOPIC_CHANNEL]?.display_name || '';

    const [menuToggled, setMenuToggled] = useState(false);

    const handleMenuToggle = () => {
        setMenuToggled(!menuToggled);
    };

    return (
        <>
            <SidebarHeaderContainer
                id={'sidebar-header-container'}
            >
                <OverlayTrigger
                    delayShow={Constants.OVERLAY_TIME_DELAY}
                    placement='bottom'
                    overlay={currentTeam.description?.length ? (
                        <Tooltip id='team-name__tooltip'>{currentTeam.description}</Tooltip>
                    ) : <></>}
                >
                    <MenuWrapper
                        onToggle={handleMenuToggle}
                        className='SidebarHeaderMenuWrapper'
                    >
                        <SidebarHeading>
                            <span className='title'>{currentTeam.display_name}</span>
                            <i className='icon icon-chevron-down'/>
                            {showMenuTip && (
                                <MenuTutorialTip
                                    stopPropagation={true}
                                    onBottom={false}
                                    inHeading={true}
                                />
                            )}
                        </SidebarHeading>
                        <MainMenu id='sidebarDropdownMenu'/>
                    </MenuWrapper>
                </OverlayTrigger>
                <AddChannelDropdown
                    showNewChannelModal={props.showNewChannelModal}
                    showMoreChannelsModal={props.showMoreChannelsModal}
                    invitePeopleModal={props.invitePeopleModal}
                    showCreateCategoryModal={props.showCreateCategoryModal}
                    canCreateChannel={props.canCreateChannel}
                    canJoinPublicChannel={props.canJoinPublicChannel}
                    handleOpenDirectMessagesModal={props.handleOpenDirectMessagesModal}
                    unreadFilterEnabled={props.unreadFilterEnabled}
                    townSquareDisplayName={townSquareDisplayName}
                    offTopicDisplayName={offTopicDisplayName}
                    showTutorialTip={showAddChannelTip}
                    canCreateCustomGroups={props.canCreateCustomGroups}
                    showCreateUserGroupModal={props.showCreateUserGroupModal}
                    userGroupsEnabled={props.userGroupsEnabled}
                />
            </SidebarHeaderContainer>
        </>
    );
};

export default SidebarHeader;
