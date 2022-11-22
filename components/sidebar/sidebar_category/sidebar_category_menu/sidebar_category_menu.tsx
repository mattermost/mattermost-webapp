// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, MouseEvent} from 'react';
import {useIntl} from 'react-intl';

import {
    BellOutlineIcon,
    TrashCanOutlineIcon,
    PencilOutlineIcon,
    FormatListBulletedIcon,
    SortAlphabeticalAscendingIcon,
    ClockOutlineIcon,
    FolderPlusOutlineIcon,
    DotsVerticalIcon,
} from '@mattermost/compass-icons/components';

import {ChannelCategory, CategorySorting} from '@mattermost/types/channel_categories';

import {CategoryTypes} from 'mattermost-redux/constants/channel_categories';

import {trackEvent} from 'actions/telemetry_actions';

import {ModalIdentifiers} from 'utils/constants';

import DeleteCategoryModal from 'components/delete_category_modal';
import EditCategoryModal from 'components/edit_category_modal';
import {Menu, MenuItem, SubMenu, MenuDivider} from 'components/menu';

import type {PropsFromRedux} from './index';

type OwnProps = {
    category: ChannelCategory;
};

type Props = OwnProps & PropsFromRedux;

const SidebarCategoryMenu = (props: Props) => {
    const {formatMessage} = useIntl();

    let muteUnmuteCategoryMenuItem: JSX.Element | null = null;
    if (props.category.type !== CategoryTypes.DIRECT_MESSAGES) {
        function toggleCategoryMute(event: MouseEvent<HTMLLIElement>) {
            event.preventDefault();

            props.setCategoryMuted(props.category.id, !props.category.muted);
        }

        muteUnmuteCategoryMenuItem = (
            <MenuItem
                id={`mute-${props.category.id}`}
                onClick={toggleCategoryMute}
            >
                <BellOutlineIcon
                    size={16}
                    color='currentColor'
                />
                {props.category.muted ? formatMessage({id: 'sidebar_left.sidebar_category_menu.unmuteCategory', defaultMessage: 'Unmute Category'}) : formatMessage({id: 'sidebar_left.sidebar_category_menu.muteCategory', defaultMessage: 'Mute Category'})}
            </MenuItem>
        );
    }

    let deleteCategoryMenuItem: JSX.Element | null = null;
    let renameCategoryMenuItem: JSX.Element | null = null;
    if (props.category.type === CategoryTypes.CUSTOM) {
        function handleDeleteCategory(event: MouseEvent<HTMLLIElement>) {
            event.preventDefault();

            props.openModal({
                modalId: ModalIdentifiers.DELETE_CATEGORY,
                dialogType: DeleteCategoryModal,
                dialogProps: {
                    category: props.category,
                },
            });
        }

        deleteCategoryMenuItem = (
            <MenuItem
                id={`delete-${props.category.id}`}
                onClick={handleDeleteCategory}

            // isDangerous={true}
            >
                <TrashCanOutlineIcon
                    size={16}
                    color='currentColor'
                />
                {formatMessage({id: 'sidebar_left.sidebar_category_menu.deleteCategory', defaultMessage: 'Delete Category'})}
            </MenuItem>
        );

        function handleRenameCategory(event: MouseEvent<HTMLLIElement>) {
            event.preventDefault();

            props.openModal({
                modalId: ModalIdentifiers.EDIT_CATEGORY,
                dialogType: EditCategoryModal,
                dialogProps: {
                    categoryId: props.category.id,
                    initialCategoryName: props.category.display_name,
                },
            });
        }

        renameCategoryMenuItem = (
            <MenuItem
                id={`rename-${props.category.id}`}
                onClick={handleRenameCategory}
            >
                <PencilOutlineIcon
                    size={16}
                    color='currentColor'
                />
                {formatMessage({id: 'sidebar_left.sidebar_category_menu.renameCategory', defaultMessage: 'Rename Category'})}
            </MenuItem>
        );
    }

    function handleSortChannels(event: MouseEvent<HTMLLIElement>, sorting: CategorySorting) {
        event.preventDefault();

        props.setCategorySorting(props.category.id, sorting);
        trackEvent('ui', `ui_sidebar_sort_dm_${sorting}`);
    }

    // let sortChannelsSelectedValue = formatMessage({id: 'sidebar.sortedManually', defaultMessage: 'Manually'});
    let sortChannelsIcon = (
        <FormatListBulletedIcon
            size={16}
            color='currentColor'
        />
    );
    if (props.category.sorting === CategorySorting.Alphabetical) {
        // sortChannelsSelectedValue = formatMessage({id: 'user.settings.sidebar.sortAlpha', defaultMessage: 'Alphabetically'});
        sortChannelsIcon = (
            <SortAlphabeticalAscendingIcon
                size={16}
                color='currentColor'
            />
        );
    } else if (props.category.sorting === CategorySorting.Recency) {
        // sortChannelsSelectedValue = formatMessage({id: 'user.settings.sidebar.recent', defaultMessage: 'Recent Activity'});
        sortChannelsIcon = (
            <ClockOutlineIcon
                size={16}
                color='currentColor'
            />
        );
    }

    function handleCreateCategory(event: MouseEvent<HTMLLIElement>) {
        event.preventDefault();

        props.openModal({
            modalId: ModalIdentifiers.EDIT_CATEGORY,
            dialogType: EditCategoryModal,
        });
        trackEvent('ui', 'ui_sidebar_category_menu_createCategory');
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
                    color='currentColor'
                />
            }
            anchorAriaLabel={formatMessage({id: 'sidebar_left.sidebar_category_menu.dropdownAriaLabel', defaultMessage: 'Edit category menu'})}
            menuId={`SidebarCategoryMenu-${props.category.id}`}
            menuAriaLabel={formatMessage({id: 'sidebar_left.sidebar_category_menu.dropdownAriaLabel', defaultMessage: 'Edit category menu'})}
        >
            {muteUnmuteCategoryMenuItem}
            {renameCategoryMenuItem}
            {deleteCategoryMenuItem}
            <MenuDivider/>
            <SubMenu
                anchorId={`sort-${props.category.id}`}
                anchorNode={
                    <>
                        {sortChannelsIcon}
                        {formatMessage({id: 'sidebar.sort', defaultMessage: 'Sort'})}
                    </>
                }
            >
                <MenuItem
                    id={`sortAlphabetical-${props.category.id}`}
                    onClick={(event) => handleSortChannels(event, CategorySorting.Alphabetical)}
                >
                    {formatMessage({id: 'user.settings.sidebar.sortAlpha', defaultMessage: 'Alphabetically'})}
                </MenuItem>
                <MenuItem
                    id={`sortByMostRecent-${props.category.id}`}
                    onClick={(event) => handleSortChannels(event, CategorySorting.Recency)}
                >
                    {formatMessage({id: 'sidebar.sortedByRecencyLabel', defaultMessage: 'Recent Activity'})}
                </MenuItem>
                <MenuItem
                    id={`sortManual-${props.category.id}`}
                    onClick={(event) => handleSortChannels(event, CategorySorting.Manual)}
                >
                    {formatMessage({id: 'sidebar.sortedManually', defaultMessage: 'Manually'})}
                </MenuItem>
            </SubMenu>
            <MenuDivider/>
            <MenuItem
                id={`create-${props.category.id}`}
                onClick={handleCreateCategory}
            >
                <FolderPlusOutlineIcon
                    size={16}
                    color='currentColor'
                />
                {formatMessage({id: 'sidebar_left.sidebar_category_menu.createCategory', defaultMessage: 'Create New Category'})}
            </MenuItem>
        </Menu>
    );
};

export default memo(SidebarCategoryMenu);
