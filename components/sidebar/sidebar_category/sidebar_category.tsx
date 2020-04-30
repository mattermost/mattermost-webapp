// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Tooltip} from 'react-bootstrap';
import classNames from 'classnames';

import {CategoryTypes} from 'mattermost-redux/constants/channel_categories';
import {Channel} from 'mattermost-redux/types/channels';
import {ChannelCategory} from 'mattermost-redux/types/channel_categories';
import {localizeMessage} from 'mattermost-redux/utils/i18n_utils';

import {trackEvent} from 'actions/diagnostics_actions';
import OverlayTrigger from 'components/overlay_trigger';
import Constants, {A11yCustomEventTypes} from 'utils/constants';
import {isKeyPressed} from 'utils/utils';

import SidebarChannel from '../sidebar_channel';

import SidebarCategoryMenu from './sidebar_category_menu';

type Props = {
    category: ChannelCategory;
    channels: Channel[];
    setChannelRef: (channelId: string, ref: HTMLLIElement) => void;
    handleOpenMoreDirectChannelsModal: (e: Event) => void;
    getChannelRef: (channelId: string) => HTMLLIElement | undefined;
    isCollapsed: boolean;
    actions: {
        setCategoryCollapsed: (categoryId: string, collapsed: boolean) => void;
    };
};

type State = {
    isMenuOpen: boolean;
}

export default class SidebarCategory extends React.PureComponent<Props, State> {
    categoryTitleRef: React.RefObject<HTMLButtonElement>;

    constructor(props: Props) {
        super(props);

        this.categoryTitleRef = React.createRef();

        this.state = {
            isMenuOpen: false,
        };
    }

    componentDidMount() {
        // Refs can be null when this component is shallowly rendered for testing
        if (this.categoryTitleRef.current) {
            this.categoryTitleRef.current.addEventListener(A11yCustomEventTypes.ACTIVATE, this.handleA11yActivateEvent);
            this.categoryTitleRef.current.addEventListener(A11yCustomEventTypes.DEACTIVATE, this.handleA11yDeactivateEvent);
        }
    }

    componentWillUnmount() {
        if (this.categoryTitleRef.current) {
            this.categoryTitleRef.current.removeEventListener(A11yCustomEventTypes.ACTIVATE, this.handleA11yActivateEvent);
            this.categoryTitleRef.current.removeEventListener(A11yCustomEventTypes.DEACTIVATE, this.handleA11yDeactivateEvent);
        }
    }

    handleA11yActivateEvent = () => {
        if (this.categoryTitleRef.current) {
            this.categoryTitleRef.current.addEventListener('keydown', this.handleA11yKeyDown);
        }
    }

    handleA11yDeactivateEvent = () => {
        if (this.categoryTitleRef.current) {
            this.categoryTitleRef.current.removeEventListener('keydown', this.handleA11yKeyDown);
        }
    }

    handleA11yKeyDown = (e: KeyboardEvent) => {
        if (isKeyPressed(e, Constants.KeyCodes.ENTER)) {
            this.handleCollapse();
        }
    }

    renderChannel = (channel: Channel) => {
        const {isCollapsed, setChannelRef, getChannelRef} = this.props;

        return (
            <SidebarChannel
                key={channel.id}
                channelId={channel.id}
                setChannelRef={setChannelRef}
                getChannelRef={getChannelRef}
                isCategoryCollapsed={isCollapsed}
            />
        );
    }

    handleCollapse = () => {
        const {category, isCollapsed} = this.props;

        if (isCollapsed) {
            trackEvent('ui', 'ui_sidebar_expand_category');
        } else {
            trackEvent('ui', 'ui_sidebar_collapse_category');
        }

        this.props.actions.setCategoryCollapsed(category.id, !isCollapsed);
    }

    handleSortDirectMessages = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.stopPropagation();

        // TODO
    }

    handleOpenDirectMessagesModal = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.stopPropagation();
        this.props.handleOpenMoreDirectChannelsModal(e.nativeEvent);
    }

    handleMenuToggle = (open: boolean) => {
        this.setState({isMenuOpen: open});
    }

    render() {
        const {category, isCollapsed, channels} = this.props;
        if (!category) {
            return null;
        }

        if (category.type !== CategoryTypes.DIRECT_MESSAGES && (!channels || !channels.length)) {
            return null;
        }

        const renderedChannels = channels.map(this.renderChannel);

        let categoryMenu;
        let hideArrow = false;
        if (category.type === CategoryTypes.DIRECT_MESSAGES) {
            const addHelpLabel = localizeMessage('sidebar.createDirectMessage', 'Create new direct message');

            const addTooltip = (
                <Tooltip
                    id='new-group-tooltip'
                    className='hidden-xs'
                >
                    {addHelpLabel}
                </Tooltip>
            );

            const sortHelpLabel = localizeMessage('sidebar.sortByRecency', 'Sort by recency');

            const sortTooltip = (
                <Tooltip
                    id='new-group-tooltip'
                    className='hidden-xs'
                >
                    {sortHelpLabel}
                </Tooltip>
            );

            categoryMenu = (
                <React.Fragment>
                    <button
                        className='SidebarChannelGroupHeader_sortButton'
                        onClick={this.handleSortDirectMessages}
                        aria-label={sortHelpLabel}
                    >
                        <OverlayTrigger
                            delayShow={500}
                            placement='top'
                            overlay={sortTooltip}
                        >
                            <i className='icon-clock-outline'/>
                        </OverlayTrigger>
                    </button>
                    <button
                        className='SidebarChannelGroupHeader_addButton'
                        onClick={this.handleOpenDirectMessagesModal}
                        aria-label={addHelpLabel}
                    >
                        <OverlayTrigger
                            delayShow={500}
                            placement='top'
                            overlay={addTooltip}
                        >
                            <i className='icon-plus'/>
                        </OverlayTrigger>
                    </button>
                </React.Fragment>
            );

            if (!channels || !channels.length) {
                hideArrow = true;
            }
        } else {
            categoryMenu = (
                <SidebarCategoryMenu
                    category={category}
                    onToggle={this.handleMenuToggle}
                />
            );
        }

        let displayName = category.display_name;
        if (category.type !== CategoryTypes.CUSTOM) {
            displayName = localizeMessage(`sidebar.types.${category.type}`, category.display_name);
        }

        return (
            <div
                className={classNames('SidebarChannelGroup a11y__section', {
                    menuIsOpen: this.state.isMenuOpen,
                })}
            >
                <div className='SidebarChannelGroupHeader'>
                    <button
                        ref={this.categoryTitleRef}
                        className={'SidebarChannelGroupHeader_groupButton'}
                        onClick={this.handleCollapse}
                        aria-label={displayName}
                    >
                        <i
                            className={classNames('icon icon-chevron-down', {
                                'icon-rotate-minus-90': isCollapsed,
                                'hide-arrow': hideArrow,
                            })}
                        />
                        <div>
                            {displayName}
                        </div>
                        {categoryMenu}
                    </button>
                </div>
                <div className='SidebarChannelGroup_content'>
                    <ul
                        role='list'
                        className='NavGroupContent'
                    >
                        {renderedChannels}
                    </ul>
                </div>
            </div>
        );
    }
}
