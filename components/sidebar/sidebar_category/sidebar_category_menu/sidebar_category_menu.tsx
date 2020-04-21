// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {IntlShape, injectIntl} from 'react-intl';

import {CategoryTypes} from 'mattermost-redux/constants/channel_categories';
import {ChannelCategory} from 'mattermost-redux/types/channel_categories';

import SidebarMenu from 'components/sidebar/sidebar_menu';
import Menu from 'components/widgets/menu/menu';

type Props = {
    category: ChannelCategory;

    //currentUserId: string;
    isMuted: boolean;
    intl: IntlShape;
    actions: {

    };
};

class SidebarCategoryMenu extends React.PureComponent<Props> {
    unmuteCategory = () => {

    }

    muteCategory = () => {

    }

    deleteCategory = () => {

    }

    renameCategory = () => {

    }

    createCategory = () => {

    }

    createChannel = () => {

    }

    renderDropdownItems = () => {
        const {intl, isMuted, category} = this.props;

        // TODO: Add different translation for Direct Messages
        let muteCategory;
        if (isMuted) {
            muteCategory = (
                <Menu.ItemAction
                    id={`unmute-${category.id}`}
                    onClick={this.unmuteCategory}
                    icon={<i className='icon-bell-off-outline'/>}
                    text={intl.formatMessage({id: 'sidebar_left.sidebar_category_menu.unmuteCategory', defaultMessage: 'Unmute Category'})}
                />
            );
        } else {
            muteCategory = (
                <Menu.ItemAction
                    id={`mute-${category.id}`}
                    onClick={this.muteCategory}
                    icon={<i className='icon-bell-outline'/>}
                    text={intl.formatMessage({id: 'sidebar_left.sidebar_category_menu.muteCategory', defaultMessage: 'Mute Category'})}
                />
            );
        }

        let deleteCategory;
        let renameCategory;
        if (category.type === CategoryTypes.CUSTOM) {
            deleteCategory = (
                <Menu.Group>
                    <Menu.ItemAction
                        id={`delete-${category.id}`}
                        onClick={this.deleteCategory}
                        icon={<i className='icon-bell-outline'/>}
                        text={intl.formatMessage({id: 'sidebar_left.sidebar_category_menu.deleteCategory', defaultMessage: 'Delete Category'})}
                    />
                </Menu.Group>
            );

            renameCategory = (
                <Menu.ItemAction
                    id={`rename-${category.id}`}
                    onClick={this.renameCategory}
                    icon={<i className='icon-pencil-outline'/>}
                    text={intl.formatMessage({id: 'sidebar_left.sidebar_category_menu.renameCategory', defaultMessage: 'Rename Category'})}
                />
            );
        }

        let createChannel;
        if (category.type !== CategoryTypes.FAVORITES) {
            createChannel = (
                <Menu.ItemAction
                    id={`createChannel-${category.id}`}
                    onClick={this.createChannel}
                    icon={<i className='icon-plus'/>}
                    text={intl.formatMessage({id: 'sidebar_left.sidebar_category_menu.createChannel', defaultMessage: 'Create Channel'})}
                />
            );
        }

        return (
            <React.Fragment>
                <Menu.Group>
                    {muteCategory}
                    {renameCategory}
                    {createChannel}
                </Menu.Group>
                <Menu.Group>
                    <Menu.ItemAction
                        id={`create-${category.id}`}
                        onClick={this.createCategory}
                        icon={<i className='icon-folder-plus-outline'/>}
                        text={intl.formatMessage({id: 'sidebar_left.sidebar_category_menu.createCategory', defaultMessage: 'Create Category'})}
                    />
                </Menu.Group>
                {deleteCategory}
            </React.Fragment>
        );
    }

    render() {
        const {intl, category} = this.props;

        return (
            <SidebarMenu
                id={`SidebarCategoryMenu-${category.id}`}
                ariaLabel={intl.formatMessage({id: 'sidebar_left.sidebar_category_menu.dropdownAriaLabel', defaultMessage: 'Category Menu'})}
                buttonAriaLabel={intl.formatMessage({id: 'sidebar_left.sidebar_category_menu.dropdownAriaLabel', defaultMessage: 'Category Menu'})}
                tooltipText={intl.formatMessage({id: 'sidebar_left.sidebar_category_menu.editChannel', defaultMessage: 'Edit category'})}
            >
                {this.renderDropdownItems()}
            </SidebarMenu>
        );
    }
}

export default injectIntl(SidebarCategoryMenu);
