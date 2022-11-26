// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {MouseEvent, memo} from 'react';
import {useIntl} from 'react-intl';

import {
    SortAlphabeticalAscendingIcon,
    ClockOutlineIcon,
    AccountMultipleOutlineIcon,
    AccountPlusOutlineIcon,
    DotsVerticalIcon,
} from '@mattermost/compass-icons/components';

import {ChannelCategory, CategorySorting} from '@mattermost/types/channel_categories';

import {Preferences} from 'mattermost-redux/constants';

import Constants from 'utils/constants';

import {trackEvent} from 'actions/telemetry_actions';

import {Menu, MenuItem, SubMenu, MenuDivider} from 'components/menu';

import type {PropsFromRedux} from './index';

type OwnProps = {
    category: ChannelCategory;
    handleOpenDirectMessagesModal: (e: MouseEvent<HTMLLIElement>) => void;
};

type Props = OwnProps & PropsFromRedux;

const SidebarCategorySortingMenu = (props: Props) => {
    const {formatMessage} = useIntl();

    function handleSortDirectMessages(event: MouseEvent, sorting: CategorySorting) {
        event.preventDefault();

        props.setCategorySorting(props.category.id, sorting);
        trackEvent('ui', `ui_sidebar_sort_dm_${sorting}`);
    }

    function handlelimitVisibleDMsGMs(event: MouseEvent, number: number) {
        event.preventDefault();

        props.savePreferences(props.currentUserId, [{
            user_id: props.currentUserId,
            category: Constants.Preferences.CATEGORY_SIDEBAR_SETTINGS,
            name: Preferences.LIMIT_VISIBLE_DMS_GMS,
            value: number.toString(),
        }]);
    }

    return (
        <Menu
            tooltipId={`SidebarCategoryMenuTooltip-${props.category.id}`}
            tooltipClassName='hidden-xs'
            tooltipText={formatMessage({id: 'sidebar_left.sidebar_category_menu.editCategory', defaultMessage: 'Category options'})}
            anchorClassName='SidebarMenu_menuButton'
            anchorNode={
                <DotsVerticalIcon
                    size={16}
                />
            }
            anchorAriaLabel={formatMessage({id: 'sidebar_left.sidebar_category_menu.dropdownAriaLabel', defaultMessage: 'Edit category menu'})}
            menuId={`SidebarCategoryMenu-${props.category.id}`}
            menuAriaLabel={formatMessage({id: 'sidebar_left.sidebar_category_menu.dropdownAriaLabel', defaultMessage: 'Edit category menu'})}
        >
            <SubMenu
                anchorId={`sortDM-${props.category.id}`}
                anchorNode={
                    <>
                        {props.category.sorting === CategorySorting.Alphabetical ? <SortAlphabeticalAscendingIcon size={16}/> : <ClockOutlineIcon size={16}/>}
                        {formatMessage({id: 'sidebar.sort', defaultMessage: 'Sort'})}
                    </>
                }
                menuId={`sortDM-subMenu-${props.category.id}`}
            >
                <MenuItem
                    id={`sortAlphabetical-${props.category.id}`}
                    onClick={(event) => handleSortDirectMessages(event, CategorySorting.Alphabetical)}
                >
                    {formatMessage({id: 'user.settings.sidebar.sortAlpha', defaultMessage: 'Alphabetically'})}
                </MenuItem>
                <MenuItem
                    id={`sortByMostRecent-${props.category.id}`}
                    onClick={(event) => handleSortDirectMessages(event, CategorySorting.Recency)}
                >
                    {formatMessage({id: 'sidebar.sortedByRecencyLabel', defaultMessage: 'Recent Activity'})}
                </MenuItem>
            </SubMenu>
            <SubMenu
                anchorId={`messagesCount-${props.category.id}`}
                anchorNode={
                    <>
                        <AccountMultipleOutlineIcon
                            size={16}
                        />
                        {formatMessage({id: 'sidebar.show', defaultMessage: 'Show'})}
                    </>
                }
                menuId={`messagesCount-subMenu-${props.category.id}`}
            >
                <MenuItem
                    id={`showAllDms-${props.category.id}`}
                    onClick={(event: MouseEvent) => handlelimitVisibleDMsGMs(event, 10000)}
                >
                    {formatMessage({id: 'sidebar.allDirectMessages', defaultMessage: 'All direct messages'})}
                </MenuItem>
                <MenuDivider/>
                {Constants.DM_AND_GM_SHOW_COUNTS.map((number) => (
                    <MenuItem
                        key={number}
                        id={`SidebarCategorySortingMenu-dmCount-${number}`}
                        onClick={(event: MouseEvent) => handlelimitVisibleDMsGMs(event, number)}
                    >
                        {number}
                    </MenuItem>
                ))}
            </SubMenu>
            <MenuDivider/>
            <MenuItem
                id={`openDM-${props.category.id}`}
                onClick={props.handleOpenDirectMessagesModal}
            >
                <AccountPlusOutlineIcon
                    size={16}
                />
                {formatMessage({id: 'sidebar.openDirectMessage', defaultMessage: 'Open a direct message'})}
            </MenuItem>
        </Menu>
    );
};

export default memo(SidebarCategorySortingMenu);
