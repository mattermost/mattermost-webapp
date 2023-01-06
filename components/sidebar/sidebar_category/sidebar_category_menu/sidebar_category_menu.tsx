// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, MouseEvent} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';

import {
    BellOutlineIcon,
    TrashCanOutlineIcon,
    PencilOutlineIcon,
    FormatListBulletedIcon,
    SortAlphabeticalAscendingIcon,
    ClockOutlineIcon,
    FolderPlusOutlineIcon,
    DotsVerticalIcon,
    ChevronRightIcon,
} from '@mattermost/compass-icons/components';

import {ChannelCategory, CategorySorting} from '@mattermost/types/channel_categories';

import {CategoryTypes} from 'mattermost-redux/constants/channel_categories';

import {trackEvent} from 'actions/telemetry_actions';

import {ModalIdentifiers} from 'utils/constants';

import DeleteCategoryModal from 'components/delete_category_modal';
import EditCategoryModal from 'components/edit_category_modal';
import * as Menu from 'components/menu';

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
            <Menu.Item
                id={`mute-${props.category.id}`}
                onClick={toggleCategoryMute}
                leadingElement={<BellOutlineIcon size={18}/>}
                labels={
                    props.category.muted ? (
                        <FormattedMessage
                            id='sidebar_left.sidebar_category_menu.unmuteCategory'
                            defaultMessage='Unmute Category'
                        />
                    ) : (
                        <FormattedMessage
                            id='sidebar_left.sidebar_category_menu.muteCategory'
                            defaultMessage='Mute Category'
                        />
                    )
                }
            />
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
            <Menu.Item
                id={`delete-${props.category.id}`}
                isDestructive={true}
                onClick={handleDeleteCategory}
                leadingElement={<TrashCanOutlineIcon size={18}/>}
                labels={
                    <FormattedMessage
                        id='sidebar_left.sidebar_category_menu.deleteCategory'
                        defaultMessage='Delete Category'
                    />
                }
            />
        );

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

        renameCategoryMenuItem = (
            <Menu.Item
                id={`rename-${props.category.id}`}
                onClick={handleRenameCategory}
                leadingElement={<PencilOutlineIcon size={18}/>}
                labels={
                    <FormattedMessage
                        id='sidebar_left.sidebar_category_menu.renameCategory'
                        defaultMessage='Rename Category'
                    />
                }
            />
        );
    }

    function handleSortChannels(event: MouseEvent<HTMLLIElement>, sorting: CategorySorting) {
        event.preventDefault();

        props.setCategorySorting(props.category.id, sorting);
        trackEvent('ui', `ui_sidebar_sort_dm_${sorting}`);
    }

    let sortChannelsSelectedValue = (
        <FormattedMessage
            id='sidebar.sortedManually'
            defaultMessage='Manually'
        />
    );
    let sortChannelsIcon = <FormatListBulletedIcon size={18}/>;
    if (props.category.sorting === CategorySorting.Alphabetical) {
        sortChannelsSelectedValue = (
            <FormattedMessage
                id='user.settings.sidebar.sortAlpha'
                defaultMessage='Alphabetically'
            />
        );
        sortChannelsIcon = <SortAlphabeticalAscendingIcon size={18}/>;
    } else if (props.category.sorting === CategorySorting.Recency) {
        sortChannelsSelectedValue = (
            <FormattedMessage
                id='user.settings.sidebar.recent'
                defaultMessage='Recent Activity'
            />
        );
        sortChannelsIcon = <ClockOutlineIcon size={18}/>;
    }

    const sortChannelsMenuItem = (
        <Menu.SubMenu
            id={`sortChannels-${props.category.id}`}
            leadingElement={sortChannelsIcon}
            labels={
                <FormattedMessage
                    id='sidebar.sort'
                    defaultMessage='Sort'
                />
            }
            trailingElements={
                <>
                    {sortChannelsSelectedValue}
                    <ChevronRightIcon size={16}/>
                </>
            }
            menuId={`sortChannels-${props.category.id}-menu`}
        >
            <Menu.Item
                id={`sortAplhabetical-${props.category.id}`}
                labels={
                    <FormattedMessage
                        id='user.settings.sidebar.sortAlpha'
                        defaultMessage='Alphabetically'
                    />
                }
                onClick={(event) => handleSortChannels(event, CategorySorting.Alphabetical)}
            />
            <Menu.Item
                id={`sortByMostRecent-${props.category.id}`}
                labels={
                    <FormattedMessage
                        id='sidebar.sortedByRecencyLabel'
                        defaultMessage='Recent Activity'
                    />
                }
                onClick={(event) => handleSortChannels(event, CategorySorting.Recency)}
            />
            <Menu.Item
                id={`sortManual-${props.category.id}`}
                labels={
                    <FormattedMessage
                        id='sidebar.sortedManually'
                        defaultMessage='Manually'
                    />
                }
                onClick={(event) => handleSortChannels(event, CategorySorting.Manual)}
            />
        </Menu.SubMenu>
    );

    function handleCreateCategory(event: MouseEvent<HTMLLIElement>) {
        event.preventDefault();
        props.openModal({
            modalId: ModalIdentifiers.EDIT_CATEGORY,
            dialogType: EditCategoryModal,
        });
        trackEvent('ui', 'ui_sidebar_category_menu_createCategory');
    }

    const createNewCategoryMenuItem = (
        <Menu.Item
            id={`create-${props.category.id}`}
            onClick={handleCreateCategory}
            leadingElement={<FolderPlusOutlineIcon size={18}/>}
            labels={
                <FormattedMessage
                    id='sidebar_left.sidebar_category_menu.createCategory'
                    defaultMessage='Create New Category'
                />
            }
        />
    );

    return (
        <Menu.Container
            triggerId={`SidebarCategoryMenu-Button-${props.category.id}`}
            triggerElement={<DotsVerticalIcon size={16}/>}
            triggerClassName='SidebarMenu_menuButton'
            triggerAriaLabel={formatMessage({id: 'sidebar_left.sidebar_category_menu.dropdownAriaLabel', defaultMessage: 'Category Menu'})}
            triggerTooltipId={`SidebarCategoryMenu-ButtonTooltip-${props.category.id}`}
            triggerTooltipText={formatMessage({id: 'sidebar_left.sidebar_category_menu.editCategory', defaultMessage: 'Category options'})}
            triggerTooltipClassName='hidden-xs'
            menuId={`SidebarChannelMenu-MenuList-${props.category.id}`}
            menuAriaLabel={formatMessage({id: 'sidebar_left.sidebar_category_menu.dropdownAriaLabel', defaultMessage: 'Category Menu'})}
        >
            {muteUnmuteCategoryMenuItem}
            {renameCategoryMenuItem}
            {deleteCategoryMenuItem}
            <Menu.Divider/>
            {sortChannelsMenuItem}
            <Menu.Divider/>
            {createNewCategoryMenuItem}
        </Menu.Container>
    );
};

export default memo(SidebarCategoryMenu);
