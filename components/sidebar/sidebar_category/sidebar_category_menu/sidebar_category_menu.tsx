// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState, memo} from 'react';
import {useIntl} from 'react-intl';

import {ChannelCategory, CategorySorting} from '@mattermost/types/channel_categories';

import {CategoryTypes} from 'mattermost-redux/constants/channel_categories';

import {Menu as SubMenu} from 'types/store/plugins';

import {trackEvent} from 'actions/telemetry_actions';

import {ModalIdentifiers} from 'utils/constants';

import DeleteCategoryModal from 'components/delete_category_modal';
import EditCategoryModal from 'components/edit_category_modal';
import SidebarMenu from 'components/sidebar/sidebar_menu';
import Menu from 'components/widgets/menu/menu';

import type {PropsFromRedux} from './index';

type OwnProps = {
    category: ChannelCategory;
    isMenuOpen: boolean;
    onToggleMenu: (open: boolean) => void;
};

type Props = OwnProps & PropsFromRedux;

const SidebarCategoryMenu = (props: Props) => {
    const [openUp, setOpenUp] = useState(false);

    const {formatMessage} = useIntl();

    function toggleCategoryMute() {
        props.setCategoryMuted(props.category.id, !props.category.muted);
    }

    function handleDeleteCategory() {
        props.openModal({
            modalId: ModalIdentifiers.DELETE_CATEGORY,
            dialogType: DeleteCategoryModal,
            dialogProps: {
                category: props.category,
            },
        });
    }

    function handleRenameCategory() {
        props.openModal({
            modalId: ModalIdentifiers.EDIT_CATEGORY,
            dialogType: EditCategoryModal,
            dialogProps: {
                categoryId: props.category.id,
                initialCategoryName: props.category.display_name,
            },
        });
    }

    function handleCreateCategory() {
        props.openModal({
            modalId: ModalIdentifiers.EDIT_CATEGORY,
            dialogType: EditCategoryModal,
        });
        trackEvent('ui', 'ui_sidebar_category_menu_createCategory');
    }

    function handleSortChannels(sorting: CategorySorting) {
        props.setCategorySorting(props.category.id, sorting);
        trackEvent('ui', `ui_sidebar_sort_dm_${sorting}`);
    }

    function handleToggleMenu(open: boolean) {
        props.onToggleMenu(open);

        if (open) {
            trackEvent('ui', 'ui_sidebar_category_menu_opened');
        }
    }

    function handleOpenDirectionChange(openUp: boolean) {
        setOpenUp(openUp);
    }

    let muteUnmuteCategoryMenuItem: JSX.Element | null = null;
    if (props.category.type !== CategoryTypes.DIRECT_MESSAGES) {
        muteUnmuteCategoryMenuItem = (
            <Menu.ItemAction
                id={`mute-${props.category.id}`}
                onClick={toggleCategoryMute}
                icon={<i className='icon-bell-outline'/>}
                text={props.category.muted ?
                    formatMessage({id: 'sidebar_left.sidebar_category_menu.unmuteCategory', defaultMessage: 'Unmute Category'}) :
                    formatMessage({id: 'sidebar_left.sidebar_category_menu.muteCategory', defaultMessage: 'Mute Category'})
                }
            />
        );
    }

    let deleteCategoryMenuItem: JSX.Element | null = null;
    let renameCategoryMenuItem: JSX.Element | null = null;
    if (props.category.type === CategoryTypes.CUSTOM) {
        deleteCategoryMenuItem = (
            <Menu.ItemAction
                isDangerous={true}
                id={`delete-${props.category.id}`}
                onClick={handleDeleteCategory}
                icon={<i className='icon-trash-can-outline'/>}
                text={formatMessage({id: 'sidebar_left.sidebar_category_menu.deleteCategory', defaultMessage: 'Delete Category'})}
            />
        );

        renameCategoryMenuItem = (
            <Menu.ItemAction
                id={`rename-${props.category.id}`}
                onClick={handleRenameCategory}
                icon={<i className='icon-pencil-outline'/>}
                text={formatMessage({id: 'sidebar_left.sidebar_category_menu.renameCategory', defaultMessage: 'Rename Category'})}
            />
        );
    }

    const sortMenuItems: SubMenu[] = [{
        id: 'sortAlphabetical',
        direction: 'right' as any,
        text: formatMessage({id: 'user.settings.sidebar.sortAlpha', defaultMessage: 'Alphabetically'}),
        action: () => handleSortChannels(CategorySorting.Alphabetical),
    },
    {
        id: 'sortByMostRecent',
        direction: 'right' as any,
        text: formatMessage({id: 'sidebar.sortedByRecencyLabel', defaultMessage: 'Recent Activity'}),
        action: () => handleSortChannels(CategorySorting.Recency),
    },
    {
        id: 'sortManual',
        direction: 'right' as any,
        text: formatMessage({id: 'sidebar.sortedManually', defaultMessage: 'Manually'}),
        action: () => handleSortChannels(CategorySorting.Manual),
    }];

    let sortChannelsSelectedValue = formatMessage({id: 'sidebar.sortedManually', defaultMessage: 'Manually'});
    let sortChannelsIcon = <i className='icon-format-list-bulleted'/>;
    if (props.category.sorting === CategorySorting.Alphabetical) {
        sortChannelsSelectedValue = formatMessage({id: 'user.settings.sidebar.sortAlpha', defaultMessage: 'Alphabetically'});
        sortChannelsIcon = <i className='icon-sort-alphabetical-ascending'/>;
    } else if (props.category.sorting === CategorySorting.Recency) {
        sortChannelsSelectedValue = formatMessage({id: 'user.settings.sidebar.recent', defaultMessage: 'Recent Activity'});
        sortChannelsIcon = <i className='icon-clock-outline'/>;
    }

    return (
        <SidebarMenu
            id={`SidebarCategoryMenu-${props.category.id}`}
            ariaLabel={formatMessage({id: 'sidebar_left.sidebar_category_menu.dropdownAriaLabel', defaultMessage: 'Category Menu'})}
            buttonAriaLabel={formatMessage({id: 'sidebar_left.sidebar_category_menu.dropdownAriaLabel', defaultMessage: 'Category Menu'})}
            isMenuOpen={props.isMenuOpen}
            onOpenDirectionChange={handleOpenDirectionChange}
            onToggleMenu={handleToggleMenu}
            tooltipText={formatMessage({id: 'sidebar_left.sidebar_category_menu.editCategory', defaultMessage: 'Category options'})}
        >
            <Menu.Group>
                {muteUnmuteCategoryMenuItem}
                {renameCategoryMenuItem}
                {deleteCategoryMenuItem}
            </Menu.Group>
            <Menu.Group>
                <Menu.ItemSubMenu
                    id={'sortChannels'}
                    subMenu={sortMenuItems}
                    text={formatMessage({id: 'sidebar.sort', defaultMessage: 'Sort'})}
                    selectedValueText={sortChannelsSelectedValue}
                    icon={sortChannelsIcon}
                    direction={'right' as any}
                    openUp={openUp}
                    styleSelectableItem={true}
                />
            </Menu.Group>
            <Menu.Group>
                <Menu.ItemAction
                    id={`create-${props.category.id}`}
                    onClick={handleCreateCategory}
                    icon={<i className='icon-folder-plus-outline'/>}
                    text={formatMessage({id: 'sidebar_left.sidebar_category_menu.createCategory', defaultMessage: 'Create New Category'})}
                />
            </Menu.Group>
        </SidebarMenu>
    );
};

export default memo(SidebarCategoryMenu);
