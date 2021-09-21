// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {IntlShape, injectIntl} from 'react-intl';

import {CategoryTypes} from 'mattermost-redux/constants/channel_categories';
import {ChannelCategory, CategorySorting} from 'mattermost-redux/types/channel_categories';

import {trackEvent} from 'actions/telemetry_actions';
import DeleteCategoryModal from 'components/delete_category_modal';
import EditCategoryModal from 'components/edit_category_modal';
import SidebarMenu from 'components/sidebar/sidebar_menu';
import SidebarMenuType from 'components/sidebar/sidebar_menu/sidebar_menu';
import Menu from 'components/widgets/menu/menu';
import {ModalIdentifiers} from 'utils/constants';
import {Props as SubmenuItemProps} from 'components/widgets/menu/menu_items/submenu_item';
import MoreChannels from '../../../more_channels';
import NewChannelFlow from '../../../new_channel_flow';
import MoreDirectChannels from '../../../more_direct_channels';

type Props = {
    currentTeamId: string;
    category: ChannelCategory;
    isMenuOpen: boolean;
    onToggleMenu: (open: boolean) => void;
    intl: IntlShape;
    actions: {
        openModal: (modalData: {modalId: string; dialogType: any; dialogProps?: any}) => Promise<{
            data: boolean;
        }>;
        setCategoryMuted: (categoryId: string, muted: boolean) => Promise<void>;
        setCategorySorting: (categoryId: string, sorting: CategorySorting) => void;
    };
};

type State = {
    showDeleteCategoryModal: boolean;
    showDirectChannelsModal: boolean;
    openUp: boolean;
}

class SidebarCategoryMenu extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            showDeleteCategoryModal: false,
            showDirectChannelsModal: false,
            openUp: false,
        };
    }

    toggleCategoryMute = () => {
        this.props.actions.setCategoryMuted(this.props.category.id, !this.props.category.muted);
    }

    deleteCategory = () => {
        this.props.actions.openModal({
            modalId: ModalIdentifiers.DELETE_CATEGORY,
            dialogType: DeleteCategoryModal,
            dialogProps: {
                category: this.props.category,
            },
        });
    }
    showMoreChannelsModal = () => {
        const {category} = this.props;
        this.props.actions.openModal({
            modalId: ModalIdentifiers.MORE_CHANNELS,
            dialogType: MoreChannels,
            dialogProps: {
                category: category.type === CategoryTypes.CUSTOM || category.type === CategoryTypes.FAVORITES ? category : undefined,
                morePublicChannelsModalType: 'public',
            },
        });
    }
    showNewChannelModal = () => {
        const {category} = this.props;
        this.props.actions.openModal({
            modalId: ModalIdentifiers.NEW_CHANNEL_FLOW,
            dialogType: NewChannelFlow,
            dialogProps: {category: category.type === CategoryTypes.CUSTOM || category.type === CategoryTypes.FAVORITES ? category : undefined},
        });
    }
    handleOpenDirectMessagesModal = (e: Event) => {
        e.preventDefault();
        if (this.state.showDirectChannelsModal) {
            this.hideMoreDirectChannelsModal();
        } else {
            this.showMoreDirectChannelsModal();
        }
    }
    showMoreDirectChannelsModal = () => {
        this.setState({showDirectChannelsModal: true});
    }

    hideMoreDirectChannelsModal = () => {
        this.setState({showDirectChannelsModal: false});
    }

    renameCategory = () => {
        this.props.actions.openModal({
            modalId: ModalIdentifiers.EDIT_CATEGORY,
            dialogType: EditCategoryModal,
            dialogProps: {
                categoryId: this.props.category.id,
                initialCategoryName: this.props.category.display_name,
            },
        });
    }

    createCategory = () => {
        this.props.actions.openModal({
            modalId: ModalIdentifiers.EDIT_CATEGORY,
            dialogType: EditCategoryModal,
        });
        trackEvent('ui', 'ui_sidebar_category_menu_createCategory');
    }

    handleSortChannels = (sorting: CategorySorting) => {
        const {category} = this.props;

        this.props.actions.setCategorySorting(category.id, sorting);
        trackEvent('ui', `ui_sidebar_sort_dm_${sorting}`);
    }

    onToggleMenu = (open: boolean) => {
        this.props.onToggleMenu(open);

        if (open) {
            trackEvent('ui', 'ui_sidebar_category_menu_opened');
        }
    }

    renderDropdownItems = () => {
        const {intl, category} = this.props;

        let muteUnmuteCategory;
        if (category.type !== CategoryTypes.DIRECT_MESSAGES) {
            let text;
            if (category.muted) {
                text = intl.formatMessage({id: 'sidebar_left.sidebar_category_menu.unmuteCategory', defaultMessage: 'Unmute Category'});
            } else {
                text = intl.formatMessage({id: 'sidebar_left.sidebar_category_menu.muteCategory', defaultMessage: 'Mute Category'});
            }

            muteUnmuteCategory = (
                <Menu.ItemAction
                    id={`mute-${category.id}`}
                    onClick={this.toggleCategoryMute}
                    icon={<i className='icon-bell-outline'/>}
                    text={text}
                />
            );
        }

        const sortMenuItems: SubmenuItemProps[] = [{
            id: 'sortAlphabetical',
            direction: 'right' as any,
            text: intl.formatMessage({id: 'user.settings.sidebar.sortAlpha', defaultMessage: 'Alphabetically'}),
            action: () => this.handleSortChannels(CategorySorting.Alphabetical),
        },
        {
            id: 'sortByMostRecent',
            direction: 'right' as any,
            text: intl.formatMessage({id: 'sidebar.sortedByRecencyLabel', defaultMessage: 'Recent Activity'}),
            action: () => this.handleSortChannels(CategorySorting.Recency),
        },
        {
            id: 'sortManual',
            direction: 'right' as any,
            text: intl.formatMessage({id: 'sidebar.sortedManually', defaultMessage: 'Manually'}),
            action: () => this.handleSortChannels(CategorySorting.Manual),
        }];

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

        let selectedValueText;

        switch (category.sorting) {
        case CategorySorting.Alphabetical:
            selectedValueText = intl.formatMessage({id: 'user.settings.sidebar.sortAlpha', defaultMessage: 'Alphabetically'});
            break;
        case CategorySorting.Recency:
            selectedValueText = intl.formatMessage({id: 'user.settings.sidebar.recent', defaultMessage: 'Recent Activity'});
            break;
        default:
            selectedValueText = intl.formatMessage({id: 'sidebar.sortedManually', defaultMessage: 'Manually'});
        }

        let icon;

        switch (category.sorting) {
        case CategorySorting.Alphabetical:
            icon = <i className='icon-sort-alphabetical-ascending'/>;
            break;
        case CategorySorting.Recency:
            icon = <i className='icon-clock-outline'/>;
            break;
        default:
            icon = <i className='icon-format-list-bulleted'/>;
        }
        const joinPublicChannel = (
            <Menu.ItemAction
                id='showMoreChannels'
                onClick={this.showMoreChannelsModal}
                icon={<i className='icon-globe'/>}
                text={intl.formatMessage({id: 'sidebar_left.add_channel_dropdown.browseChannels', defaultMessage: 'Browse Channels'})}
            />
        );
        const createChannel = (
            <Menu.ItemAction
                id='showNewChannel'
                onClick={this.showNewChannelModal}
                icon={<i className='icon-plus'/>}
                text={intl.formatMessage({id: 'sidebar_left.add_channel_dropdown.createNewChannel', defaultMessage: 'Create New Channel'})}
            />
        );
        let createDirectMessage;
        if (category.type === CategoryTypes.CUSTOM || category.type === CategoryTypes.FAVORITES) {
            createDirectMessage = (
                <Menu.ItemAction
                    id={'browseDirectMessages'}
                    onClick={this.handleOpenDirectMessagesModal}
                    icon={<i className='icon-account-plus-outline'/>}
                    text={intl.formatMessage({id: 'sidebar.openDirectMessage', defaultMessage: 'Open a direct message'})}
                />
            );
        }
        return (
            <React.Fragment>
                <Menu.Group>
                    {muteUnmuteCategory}
                    {renameCategory}
                    {deleteCategory}
                </Menu.Group>
                <Menu.Group>
                    <Menu.ItemSubMenu
                        id={'sortChannels'}
                        subMenu={sortMenuItems}
                        text={intl.formatMessage({id: 'sidebar.sort', defaultMessage: 'Sort'})}
                        selectedValueText={selectedValueText}
                        icon={icon}
                        direction={'right' as any}
                        openUp={this.state.openUp}
                        styleSelectableItem={true}
                    />
                </Menu.Group>
                <Menu.Group>
                    {joinPublicChannel}
                    {createChannel}
                    {createDirectMessage}
                </Menu.Group>
                <Menu.Group>
                    <Menu.ItemAction
                        id={`create-${category.id}`}
                        onClick={this.createCategory}
                        icon={<i className='icon-folder-plus-outline'/>}
                        text={intl.formatMessage({id: 'sidebar_left.sidebar_category_menu.createCategory', defaultMessage: 'Create New Category'})}
                    />
                </Menu.Group>
            </React.Fragment>
        );
    }
    renderModals = () => {
        let moreDirectChannelsModal;
        if (this.state.showDirectChannelsModal) {
            moreDirectChannelsModal = (
                <MoreDirectChannels
                    onModalDismissed={this.hideMoreDirectChannelsModal}
                    isExistingChannel={false}
                />
            );
        }
        return (
            <React.Fragment>
                {moreDirectChannelsModal}
            </React.Fragment>
        );
    }

    refCallback = (ref: SidebarMenuType) => {
        if (ref) {
            this.setState({
                openUp: ref.state.openUp,
            });
        }
    }

    render() {
        const {intl, category} = this.props;

        return (
            <React.Fragment>
                <SidebarMenu
                    refCallback={this.refCallback}
                    id={`SidebarCategoryMenu-${category.id}`}
                    ariaLabel={intl.formatMessage({id: 'sidebar_left.sidebar_category_menu.dropdownAriaLabel', defaultMessage: 'Category Menu'})}
                    buttonAriaLabel={intl.formatMessage({id: 'sidebar_left.sidebar_category_menu.dropdownAriaLabel', defaultMessage: 'Category Menu'})}
                    isMenuOpen={this.props.isMenuOpen}
                    onToggleMenu={this.onToggleMenu}
                    tooltipText={intl.formatMessage({id: 'sidebar_left.sidebar_category_menu.editCategory', defaultMessage: 'Category options'})}
                >
                    {this.renderDropdownItems()}
                </SidebarMenu>
                {this.renderModals()}
            </React.Fragment>
        );
    }
}

export default injectIntl(SidebarCategoryMenu);
