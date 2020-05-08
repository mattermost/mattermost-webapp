// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {IntlShape, injectIntl} from 'react-intl';

import {CategoryTypes} from 'mattermost-redux/constants/channel_categories';
import {ChannelType, Channel} from 'mattermost-redux/types/channels';
import {ChannelCategory} from 'mattermost-redux/types/channel_categories';

import SidebarMenu from 'components/sidebar/sidebar_menu';
import Menu from 'components/widgets/menu/menu';
import EditCategoryModal from 'components/edit_category_modal';
import DeleteCategoryModal from 'components/delete_category_modal';
import NewChannelFlow from 'components/new_channel_flow';
import Constants from 'utils/constants';

type Props = {
    currentTeamId: string;
    category: ChannelCategory;
    canCreatePublicChannel: boolean;
    canCreatePrivateChannel: boolean;
    onToggle: (open: boolean) => void;
    intl: IntlShape;
    actions: {
        createCategory: (teamId: string, categoryName: string) => {data: ChannelCategory};
        deleteCategory: (categoryId: string) => void;
        renameCategory: (categoryId: string, newName: string) => void;
        addChannelToCategory: (categoryId: string, channelId: string) => void;
    };
};

type State = {
    showNewChannelModal: boolean;
    showCreateCategoryModal: boolean;
    showDeleteCategoryModal: boolean;
    showRenameCategoryModal: boolean;
}

class SidebarCategoryMenu extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            showNewChannelModal: false,
            showCreateCategoryModal: false,
            showDeleteCategoryModal: false,
            showRenameCategoryModal: false,
        };
    }

    deleteCategory = () => {
        this.setState({showDeleteCategoryModal: true});
    }

    renameCategory = () => {
        this.setState({showRenameCategoryModal: true});
    }

    createCategory = () => {
        this.setState({showCreateCategoryModal: true});
    }

    handleCreatedNewChannel = (channel: Channel) => {
        this.props.actions.addChannelToCategory(this.props.category.id, channel.id);
        this.setState({showNewChannelModal: false});
    }

    hideCreateCategoryModal = () => {
        this.setState({showCreateCategoryModal: false});
    }

    hideDeleteCategoryModal = () => {
        this.setState({showDeleteCategoryModal: false});
    }

    hideRenameCategoryModal = () => {
        this.setState({showRenameCategoryModal: false});
    }

    handleCreateCategory = (categoryName: string) => {
        this.props.actions.createCategory(this.props.currentTeamId, categoryName);
    }

    handleDeleteCategory = (category: ChannelCategory) => {
        this.props.actions.deleteCategory(category.id);
    }

    handleRenameCategory = (categoryName: string) => {
        this.props.actions.renameCategory(this.props.category.id, categoryName);
    }

    createChannel = () => {
        this.setState({showNewChannelModal: true});
    }

    renderModals = () => {
        const {intl, category} = this.props;

        let createCategoryModal;
        if (this.state.showCreateCategoryModal) {
            createCategoryModal = (
                <EditCategoryModal
                    onHide={this.hideCreateCategoryModal}
                    editCategory={this.handleCreateCategory}
                    modalHeaderText={intl.formatMessage({id: 'create_category_modal.createCategory', defaultMessage: 'Create Category'})}
                    editButtonText={intl.formatMessage({id: 'create_category_modal.create', defaultMessage: 'Create'})}
                />
            );
        }

        let renameCategoryModal;
        if (this.state.showRenameCategoryModal) {
            renameCategoryModal = (
                <EditCategoryModal
                    onHide={this.hideRenameCategoryModal}
                    editCategory={this.handleRenameCategory}
                    modalHeaderText={intl.formatMessage({id: 'rename_category_modal.renameCategory', defaultMessage: 'Rename Category'})}
                    editButtonText={intl.formatMessage({id: 'rename_category_modal.rename', defaultMessage: 'Rename'})}
                    initialCategoryName={category.display_name}
                />
            );
        }

        let deleteCategoryModal;
        if (this.state.showDeleteCategoryModal) {
            deleteCategoryModal = (
                <DeleteCategoryModal
                    category={category}
                    deleteCategory={this.handleDeleteCategory}
                    onHide={this.hideDeleteCategoryModal}
                />
            );
        }

        return (
            <React.Fragment>
                <NewChannelFlow
                    show={this.state.showNewChannelModal}
                    canCreatePublicChannel={this.props.canCreatePublicChannel}
                    canCreatePrivateChannel={this.props.canCreatePrivateChannel}
                    channelType={this.props.canCreatePublicChannel ? Constants.OPEN_CHANNEL as ChannelType : Constants.PRIVATE_CHANNEL as ChannelType}
                    onModalDismissed={this.handleCreatedNewChannel}
                />
                {createCategoryModal}
                {renameCategoryModal}
                {deleteCategoryModal}
            </React.Fragment>
        );
    }

    renderDropdownItems = () => {
        const {intl, category} = this.props;

        let deleteCategory;
        let renameCategory;
        if (category.type === CategoryTypes.CUSTOM) {
            deleteCategory = (
                <Menu.ItemAction
                    isDangerous={true}
                    id={`delete-${category.id}`}
                    onClick={this.deleteCategory}
                    icon={<i className='icon-trash-can-outline'/>}
                    text={intl.formatMessage({id: 'sidebar_left.sidebar_category_menu.deleteCategory', defaultMessage: 'Delete Category'})}
                />
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
        if (category.type !== CategoryTypes.FAVORITES && (this.props.canCreatePrivateChannel || this.props.canCreatePublicChannel)) {
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
                    {renameCategory}
                    {createChannel}
                    {deleteCategory}
                </Menu.Group>
                <Menu.Group>
                    <Menu.ItemAction
                        id={`create-${category.id}`}
                        onClick={this.createCategory}
                        icon={<i className='icon-folder-plus-outline'/>}
                        text={intl.formatMessage({id: 'sidebar_left.sidebar_category_menu.createCategory', defaultMessage: 'Create Category'})}
                    />
                </Menu.Group>
            </React.Fragment>
        );
    }

    render() {
        const {intl, category} = this.props;

        return (
            <React.Fragment>
                <SidebarMenu
                    id={`SidebarCategoryMenu-${category.id}`}
                    ariaLabel={intl.formatMessage({id: 'sidebar_left.sidebar_category_menu.dropdownAriaLabel', defaultMessage: 'Category Menu'})}
                    buttonAriaLabel={intl.formatMessage({id: 'sidebar_left.sidebar_category_menu.dropdownAriaLabel', defaultMessage: 'Category Menu'})}
                    tooltipText={intl.formatMessage({id: 'sidebar_left.sidebar_category_menu.editCategory', defaultMessage: 'Category options'})}
                    onToggle={this.props.onToggle}
                >
                    {this.renderDropdownItems()}
                </SidebarMenu>
                {this.renderModals()}
            </React.Fragment>
        );
    }
}

export default injectIntl(SidebarCategoryMenu);
