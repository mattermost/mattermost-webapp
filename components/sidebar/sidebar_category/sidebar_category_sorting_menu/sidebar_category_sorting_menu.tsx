// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {MouseEvent, useState, memo} from 'react';
import {useIntl} from 'react-intl';

import {
    SortAlphabeticalAscendingIcon,
    ClockOutlineIcon,
    AccountMultipleOutlineIcon,
    AccountPlusOutlineIcon,
} from '@mattermost/compass-icons/components';

import {ChannelCategory, CategorySorting} from '@mattermost/types/channel_categories';

import {Preferences} from 'mattermost-redux/constants';

import {Menu as SubMenu} from 'types/store/plugins';

import Constants from 'utils/constants';

import {trackEvent} from 'actions/telemetry_actions';

import SidebarMenu from 'components/sidebar/sidebar_menu';
import Menu from 'components/widgets/menu/menu';

import type {PropsFromRedux} from './index';

type OwnProps = {
    category: ChannelCategory;
    handleOpenDirectMessagesModal: (e: MouseEvent<HTMLButtonElement>) => void;
    isCollapsed: boolean;
    isMenuOpen: boolean;
    onToggleMenu: (isMenuOpen: boolean) => void;
};

type Props = OwnProps & PropsFromRedux;

const SidebarCategorySortingMenu = (props: Props) => {
    const [openUp, setOpenUp] = useState(false);

    const {formatMessage} = useIntl();

    function handleSortDirectMessages(sorting: CategorySorting) {
        props.setCategorySorting(props.category.id, sorting);
        trackEvent('ui', `ui_sidebar_sort_dm_${sorting}`);
    }

    function handlelimitVisibleDMsGMs(number: number) {
        props.savePreferences(props.currentUserId, [{
            user_id: props.currentUserId,
            category: Constants.Preferences.CATEGORY_SIDEBAR_SETTINGS,
            name: Preferences.LIMIT_VISIBLE_DMS_GMS,
            value: number.toString(),
        }]);
    }

    const sortMenuItems: SubMenu[] = [{
        id: 'sortAlphabetical',
        direction: 'right',
        text: formatMessage({id: 'user.settings.sidebar.sortAlpha', defaultMessage: 'Alphabetically'}),
        action: () => handleSortDirectMessages(CategorySorting.Alphabetical),
    },
    {
        id: 'sortByMostRecent',
        direction: 'right',
        text: formatMessage({id: 'sidebar.sortedByRecencyLabel', defaultMessage: 'Recent Activity'}),
        action: () => handleSortDirectMessages(CategorySorting.Recency),
    }];

    const selectedDmCount = Constants.DM_AND_GM_SHOW_COUNTS.map((number): SubMenu => {
        return {
            id: `SidebarCategorySortingMenu-dmCount-${number}`,
            direction: 'right',
            text: `${number}`,
            action: () => handlelimitVisibleDMsGMs(number),
        };
    });

    const categoryMenuItems: SubMenu[] = [
        {
            id: 'showAllDms',
            direction: 'right',
            text: formatMessage({id: 'sidebar.allDirectMessages', defaultMessage: 'All direct messages'}),
            action: () => handlelimitVisibleDMsGMs(10000),
        },
        {
            id: 'ChannelMenu-moveToDivider',
            text: (<li className='MenuGroup menu-divider'/>),
        },
        ...selectedDmCount,
    ];

    function handleOpenDirectionChange(openUp: boolean) {
        setOpenUp(openUp);
    }

    function handleToggleMenu(open: boolean) {
        props.onToggleMenu(open);

        if (open) {
            trackEvent('ui', 'ui_sidebar_category_menu_opened');
        }
    }

    return (
        <SidebarMenu
            id={'SidebarCategorySortingMenu'}
            ariaLabel={formatMessage({id: 'sidebar_left.sidebar_category_menu.dropdownAriaLabel', defaultMessage: 'Category Menu'})}
            buttonAriaLabel={formatMessage({id: 'sidebar_left.sidebar_category_menu.dropdownAriaLabel', defaultMessage: 'Category Menu'})}
            isMenuOpen={props.isMenuOpen}
            onToggleMenu={handleToggleMenu}
            onOpenDirectionChange={handleOpenDirectionChange}
            tooltipText={formatMessage({id: 'sidebar_left.sidebar_category_menu.editCategory', defaultMessage: 'Category options'})}
            tabIndex={props.isCollapsed ? -1 : 0}
            additionalClass='additionalClass'
        >
            <>
                <Menu.Group>
                    <Menu.ItemSubMenu
                        id={'sortDirectMessages'}
                        subMenu={sortMenuItems}
                        text={formatMessage({id: 'sidebar.sort', defaultMessage: 'Sort'})}
                        selectedValueText={props.category.sorting === CategorySorting.Alphabetical ? formatMessage({id: 'user.settings.sidebar.sortAlpha', defaultMessage: 'Alphabetically'}) : formatMessage({id: 'user.settings.sidebar.recent', defaultMessage: 'Recent Activity'})}
                        icon={props.category.sorting === CategorySorting.Alphabetical ? <SortAlphabeticalAscendingIcon size={16}/> : <ClockOutlineIcon size={16}/>}
                        direction={'right'}
                        openUp={openUp}
                        styleSelectableItem={true}
                    />
                    <Menu.ItemSubMenu
                        id={'showMessageCount'}
                        subMenu={categoryMenuItems}
                        text={formatMessage({id: 'sidebar.show', defaultMessage: 'Show'})}
                        selectedValueText={props.selectedDmNumber === 10000 ? formatMessage({id: 'channel_notifications.levels.all', defaultMessage: 'All'}) : props.selectedDmNumber}
                        icon={<AccountMultipleOutlineIcon size={16}/>}
                        direction={'right'}
                        openUp={openUp}
                        styleSelectableItem={true}
                    />
                </Menu.Group>
                <Menu.Group>
                    <Menu.ItemAction
                        id={'openDirectMessageMenuItem'}
                        onClick={props.handleOpenDirectMessagesModal}
                        icon={<AccountPlusOutlineIcon size={16}/>}
                        text={formatMessage({id: 'sidebar.openDirectMessage', defaultMessage: 'Open a direct message'})}
                    />
                </Menu.Group>
            </>
        </SidebarMenu>
    );
};

export default memo(SidebarCategorySortingMenu);
