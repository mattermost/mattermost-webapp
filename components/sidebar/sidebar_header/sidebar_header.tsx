// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {useSelector} from 'react-redux';
import styled from 'styled-components';
import {Tooltip} from 'react-bootstrap';

import Flex from '@mattermost/compass-components/utilities/layout/Flex';
import Heading from '@mattermost/compass-components/components/heading';
import IconButton from '@mattermost/compass-components/components/icon-button';

import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {getInt} from 'mattermost-redux/selectors/entities/preferences';

import {GlobalState} from 'types/store';
import Constants, {Preferences, TutorialSteps} from 'utils/constants';
import * as Utils from 'utils/utils.jsx';

import OverlayTrigger from 'components/overlay_trigger';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import MainMenu from 'components/main_menu';
import MenuTutorialTip from 'components/tutorial/menu_tutorial_tip';

const SidebarHeaderContainer = styled(Flex).attrs(() => ({
    element: 'header',
    row: true,
    justify: 'space-between',
    alignment: 'center',
}))`
    height: 52px;
    padding: 0 16px;

    .dropdown-menu {
        position: absolute;
        transform: translate(-100%, 4px);
        margin-left: 100%;
        min-width: 210px;
        max-width: 210px;
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

const SidebarHeader: React.FC = (): JSX.Element => {
    const currentTeam = useSelector((state: GlobalState) => getCurrentTeam(state));
    const currentUser = useSelector((state: GlobalState) => getCurrentUser(state));
    const showTutorialTip = useSelector((state: GlobalState) => getInt(state, Preferences.TUTORIAL_STEP, currentUser.id)) === TutorialSteps.MENU_POPOVER && !Utils.isMobile();

    const [menuToggled, setMenuToggled] = useState(false);

    const handleMenuToggle = () => {
        setMenuToggled(!menuToggled);
    };

    return (
        <>
            {showTutorialTip && <MenuTutorialTip onBottom={false}/>}
            <SidebarHeaderContainer>
                <OverlayTrigger
                    delayShow={Constants.OVERLAY_TIME_DELAY}
                    placement='bottom'
                    overlay={currentTeam.description?.length ? <Tooltip id='team-name__tooltip'>{currentTeam.description}</Tooltip> : <></>}
                >
                    <SidebarHeading>
                        {currentTeam.display_name}
                    </SidebarHeading>
                </OverlayTrigger>
                <MenuWrapper onToggle={handleMenuToggle}>
                    <IconButton
                        icon='dots-vertical'
                        size='sm'
                        compact={true}
                        inverted={true}
                        toggled={menuToggled}
                        onClick={() => {}}
                    />
                    <MainMenu id='sidebarDropdownMenu'/>
                </MenuWrapper>
            </SidebarHeaderContainer>
        </>
    );
};

export default SidebarHeader;
