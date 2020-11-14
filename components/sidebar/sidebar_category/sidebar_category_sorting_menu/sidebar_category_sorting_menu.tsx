// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {injectIntl, IntlShape} from 'react-intl';

import {ChannelCategory, CategorySorting} from 'mattermost-redux/types/channel_categories';

import {trackEvent} from 'actions/telemetry_actions';

import SidebarMenu from 'components/sidebar/sidebar_menu';
import SidebarMenuType from 'components/sidebar/sidebar_menu/sidebar_menu';
import Menu from 'components/widgets/menu/menu';
import {Props as SubmenuItemProps} from 'components/widgets/menu/menu_items/submenu_item';

type Props = {
    category: ChannelCategory;
    handleOpenMoreDirectChannelsModal: (e: Event) => void;
    categories?: ChannelCategory[];
    intl: IntlShape;
    isCollapsed: boolean;
    isMenuOpen: boolean;
    onToggleMenu: (isMenuOpen: boolean) => void;
    actions: {
        setCategorySorting: (categoryId: string, sorting: CategorySorting) => void;
        limitVisibleDMsGMs: (count: number) => void;
    };
};

type State = {
    openUp: boolean;
    width: number;
    selectedDmNumber: number;
    selectedCategorySort: string;
};

export class SidebarCategorySortingMenu extends React.PureComponent<Props, State> {
    isLeaving: boolean;

    constructor(props: Props) {
        super(props);

        this.state = {
            openUp: false,
            width: 0,
            selectedDmNumber: 20,
            selectedCategorySort: CategorySorting.Alphabetical,
        };

        this.isLeaving = false;
    }

    handleSortDirectMessages = (sorting: CategorySorting) => {
        const {category} = this.props;

        this.props.actions.setCategorySorting(category.id, sorting);
        trackEvent('ui', `ui_sidebar_sort_dm_${sorting}`);
        this.setState({selectedCategorySort: sorting});
    }

    handlelimitVisibleDMsGMs = (number: number) => {
        this.props.actions.limitVisibleDMsGMs(number);
        this.setState({selectedDmNumber: number});
    }

    handleOpenDirectMessagesModal = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.stopPropagation();
        this.props.handleOpenMoreDirectChannelsModal(e.nativeEvent);
        trackEvent('ui', 'ui_sidebar_create_direct_message');
    }

    renderDropdownItems = () => {
        const {intl} = this.props;
        const {selectedDmNumber, selectedCategorySort} = this.state;

        const sortMenuItems: SubmenuItemProps[] = [{
            id: 'sortAlphabetical',
            direction: 'right' as any,
            text: intl.formatMessage({id: 'user.settings.sidebar.sortAlpha', defaultMessage: 'Alphabetically'}),
            action: () => this.handleSortDirectMessages(CategorySorting.Alphabetical),
        },
        {
            id: 'sortByMostRecent',
            direction: 'right' as any,
            text: intl.formatMessage({id: 'sidebar.sortedByRecencyLabel', defaultMessage: 'Recent Activity'}),
            action: () => this.handleSortDirectMessages(CategorySorting.Recency),
        }];

        const dmLimitOptions = [10, 15, 20, 40];

        const selectedDmCount = dmLimitOptions.map((number) => {
            return {
                id: `SidebarCategorySortingMenu-dmCount-${number}`,
                direction: 'right' as any,
                text: number,
                action: () => this.handlelimitVisibleDMsGMs(number),
            } as SubmenuItemProps;
        });

        const categoryMenuItems: SubmenuItemProps[] = [];
        categoryMenuItems.push(
            {
                id: 'showAllDms',
                direction: 'right' as any,
                text: intl.formatMessage({id: 'sidebar.allDirectMessages', defaultMessage: 'All direct messages'}),
                action: () => this.props.actions.limitVisibleDMsGMs(Infinity),
            },
            {
                id: 'SidebarChannelMenu-moveToDivider',
                text: (<li className='MenuGroup menu-divider'/>),
            },
            ...selectedDmCount,
        );

        const browseDirectMessages = (
            <Menu.Group>
                <Menu.ItemAction
                    id={'browseDirectMessages'}
                    onClick={this.handleOpenDirectMessagesModal}
                    icon={<i className='icon-account-plus-outline'/>}
                    text={intl.formatMessage({id: 'sidebar.openDirectMessage', defaultMessage: 'Open a direct message'})}
                />
            </Menu.Group>
        );

        return (
            <React.Fragment>
                <Menu.Group>
                    <Menu.ItemSubMenu
                        id={'sortDirectMessages'}
                        subMenu={sortMenuItems}
                        text={intl.formatMessage({id: 'sidebar.sort', defaultMessage: 'Sort'})}
                        selectedValueText={selectedCategorySort === CategorySorting.Alphabetical ? 'Alphabetically' : 'Recent Activity'}
                        icon={selectedCategorySort === CategorySorting.Alphabetical ? <i className='icon-sort-alphabetical-ascending'/> : <i className='icon-clock-outline'/>}
                        direction={'right' as any}
                        openUp={this.state.openUp}
                        xOffset={this.state.width}
                        categorySortingMenu={true}
                    />
                    <Menu.ItemSubMenu
                        id={'showMessageCount'}
                        subMenu={categoryMenuItems}
                        text={intl.formatMessage({id: 'sidebar.show', defaultMessage: 'Show'})}
                        selectedValueText={selectedDmNumber}
                        icon={<i className='icon-account-multiple-outline'/>}
                        direction={'right' as any}
                        openUp={this.state.openUp}
                        xOffset={this.state.width}
                        categorySortingMenu={true}
                    />
                </Menu.Group>
                {browseDirectMessages}
            </React.Fragment>
        );
    }

    refCallback = (ref: SidebarMenuType) => {
        if (ref) {
            this.setState({
                openUp: ref.state.openUp,
                width: ref.state.width,
            });
        }
    }

    onToggleMenu = (open: boolean) => {
        this.props.onToggleMenu(open);

        if (open) {
            trackEvent('ui', 'ui_sidebar_channel_menu_opened');
        }
    }

    render() {
        const {
            intl,
            isCollapsed,
            isMenuOpen,
        } = this.props;

        return (
            <SidebarMenu
                refCallback={this.refCallback}
                id={'SidebarCategorySortingMenu'}
                ariaLabel={intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.dropdownAriaLabel', defaultMessage: 'Channel Menu'})}
                buttonAriaLabel={intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.dropdownAriaLabel', defaultMessage: 'Channel Menu'})}
                isMenuOpen={isMenuOpen}
                onToggleMenu={this.onToggleMenu}
                tooltipText={intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.editChannel', defaultMessage: 'Channel options'})}
                tabIndex={isCollapsed ? -1 : 0}
                additionalClass='sortingMenuAdditionalClass'
            >
                {this.renderDropdownItems()}
            </SidebarMenu>
        );
    }
}

export default injectIntl(SidebarCategorySortingMenu);
