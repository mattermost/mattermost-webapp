// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {useSelector} from 'react-redux';
import styled from 'styled-components';
import {Tooltip} from 'react-bootstrap';

import Flex from '@mattermost/compass-components/utilities/layout/Flex';
import Heading from '@mattermost/compass-components/components/heading';
import IconButton from '@mattermost/compass-components/components/icon-button';

import {AddChannelButtonTreatments} from 'mattermost-redux/constants/config';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {getInt, getAddChannelButtonTreatment} from 'mattermost-redux/selectors/entities/preferences';
import {getChannelsNameMapInCurrentTeam} from 'mattermost-redux/selectors/entities/channels';

import {GlobalState} from 'types/store';
import Constants, {Preferences, TutorialSteps} from 'utils/constants';
import * as Utils from 'utils/utils.jsx';

import OverlayTrigger from 'components/overlay_trigger';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import MainMenu from 'components/main_menu';
import MenuTutorialTip from 'components/tutorial/menu_tutorial_tip';
import AddChannelDropdown from 'components/sidebar/add_channel_dropdown';

type SidebarHeaderContainerProps = {
    menuInHeading: boolean;
}

const SidebarHeaderContainer = styled(Flex).attrs(() => ({
    element: 'header',
    row: true,
    justify: 'space-between',
    alignment: 'center',
}))<SidebarHeaderContainerProps>`
    height: 42px;
    margin: ${(p) => (p.menuInHeading ? '0' : '5px 16px')};
    ${(p) => (p.menuInHeading ? 'cursor: pointer;' : '')}

    .dropdown-menu {
        position: absolute;
        transform: translate(${(p) => (p.menuInHeading ? '0' : '-100%')}, 4px);
        margin-left: ${(p) => (p.menuInHeading ? '0' : '100')}%;
        min-width: 210px;
        max-width: 210px;
    }

    #SidebarContainer & .AddChannelDropdown_dropdownButton {
        border-radius: 16px;
        font-size: 18px;
    }
`;

const SidebarHeading = styled(Heading).attrs(() => ({
    element: 'h1',
    size: 200,
    margin: 'none',
}))`
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--sidebar-header-text-color);

    #SidebarContainer & {
        font-family: Metropolis, sans-serif;
    }
`;

export type Props = {
    showNewChannelModal: () => void;
    showMoreChannelsModal: () => void;
    invitePeopleModal: () => void;
    showCreateCategoryModal: () => void;
    canCreateChannel: boolean;
    canJoinPublicChannel: boolean;
    handleOpenDirectMessagesModal: (e: Event) => void;
    unreadFilterEnabled: boolean;
}

const SidebarHeader: React.FC<Props> = (props: Props): JSX.Element => {
    const currentTeam = useSelector((state: GlobalState) => getCurrentTeam(state));
    const currentUser = useSelector((state: GlobalState) => getCurrentUser(state));
    const tipStep = useSelector((state: GlobalState) => getInt(state, Preferences.TUTORIAL_STEP, currentUser.id));
    const isMobile = Utils.isMobile();

    const showMenuTip = tipStep === TutorialSteps.MENU_POPOVER && !isMobile;
    const showAddChannelTip = tipStep === TutorialSteps.ADD_CHANNEL_POPOVER && !isMobile;
    const addChannelButton = useSelector((state: GlobalState) => getAddChannelButtonTreatment(state));
    const hasAddChannelTreatment = Boolean(addChannelButton) && addChannelButton !== AddChannelButtonTreatments.NONE;
    const channelsByName = useSelector((state: GlobalState) => getChannelsNameMapInCurrentTeam(state));
    const townSquareDisplayName = channelsByName[Constants.DEFAULT_CHANNEL]?.display_name || '';
    const offTopicDisplayName = channelsByName[Constants.OFFTOPIC_CHANNEL]?.display_name || '';

    const [menuToggled, setMenuToggled] = useState(false);

    const handleMenuToggle = () => {
        setMenuToggled(!menuToggled);
    };

    let menu = (
        <MenuWrapper onToggle={handleMenuToggle}>
            <IconButton
                icon='dots-vertical'
                size='sm'
                compact={true}
                inverted={true}
                active={menuToggled}
                onClick={() => {}}
            />
            <MainMenu id='sidebarDropdownMenu'/>
        </MenuWrapper>
    );

    if (hasAddChannelTreatment) {
        menu = (
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
                addChannelButton={addChannelButton}
            />
        );
    }

    let sidebarHeadingContent: JSX.Element | string = currentTeam.display_name;

    if (hasAddChannelTreatment) {
        sidebarHeadingContent = (
            <>
                {currentTeam.display_name}
                <i className='icon icon-chevron-down'/>
                {showMenuTip && (
                    <MenuTutorialTip
                        onBottom={false}
                        inHeading={true}
                    />
                )}
            </>
        );
    }

    let sidebarHeader = (
        <>
            {(showMenuTip && !hasAddChannelTreatment) ? <MenuTutorialTip onBottom={false}/> : null}
            <SidebarHeaderContainer menuInHeading={hasAddChannelTreatment}>
                <OverlayTrigger
                    delayShow={Constants.OVERLAY_TIME_DELAY}
                    placement='bottom'
                    overlay={currentTeam.description?.length ? <Tooltip id='team-name__tooltip'>{currentTeam.description}</Tooltip> : <></>}
                >
                    <SidebarHeading>
                        {sidebarHeadingContent}
                    </SidebarHeading>
                </OverlayTrigger>
                {menu}
            </SidebarHeaderContainer>
        </>
    );

    if (hasAddChannelTreatment) {
        sidebarHeader = (
            <MenuWrapper
                onToggle={handleMenuToggle}
                className='SidebarHeaderMenuWrapper'
            >
                {sidebarHeader}
                <MainMenu id='sidebarDropdownMenu'/>
            </MenuWrapper>
        );
    }

    return sidebarHeader;
};

export default SidebarHeader;
