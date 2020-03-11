// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import classNames from 'classnames';

import {CategoryTypes} from 'mattermost-redux/constants/channel_categories';
import {Channel} from 'mattermost-redux/types/channels';
import {ChannelCategory} from 'mattermost-redux/types/channel_categories';
import {localizeMessage} from 'mattermost-redux/utils/i18n_utils';

import Constants, {A11yCustomEventTypes} from 'utils/constants';
import {isKeyPressed} from 'utils/utils';

import SidebarChannel from '../sidebar_channel';

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

export default class SidebarCategory extends React.PureComponent<Props> {
    categoryTitleRef: React.RefObject<HTMLButtonElement>;

    constructor(props: Props) {
        super(props);

        this.categoryTitleRef = React.createRef();
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
        const {isCollapsed} = this.props;

        return (
            <SidebarChannel
                channelId={channel.id}
                setChannelRef={this.props.setChannelRef}
                getChannelRef={this.props.getChannelRef}
                isCategoryCollapsed={isCollapsed}
            />
        );
    }

    handleCollapse = () => {
        const {category, isCollapsed} = this.props;
        this.props.actions.setCategoryCollapsed(category.id, !isCollapsed);
    }

    handleOpenDirectMessagesModal = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.stopPropagation();
        this.props.handleOpenMoreDirectChannelsModal(e.nativeEvent);
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

        let directMessagesModalButton;
        let hideArrow = false;
        if (category.type === CategoryTypes.DIRECT_MESSAGES) {
            directMessagesModalButton = (
                <button
                    className='SidebarChannelGroupHeader_addButton'
                    onClick={this.handleOpenDirectMessagesModal}
                >
                    <i className='icon-plus'/>
                </button>
            );

            if (!channels || !channels.length) {
                hideArrow = true;
            }
        }

        let displayName = category.display_name;
        if (category.type !== CategoryTypes.CUSTOM) {
            displayName = localizeMessage(`sidebar.types.${category.type}`, category.display_name);
        }

        return (
            <div className='SidebarChannelGroup'>
                <div className='SidebarChannelGroupHeader'>
                    <button
                        ref={this.categoryTitleRef}
                        className='SidebarChannelGroupHeader_groupButton a11y__section'
                        onClick={this.handleCollapse}
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
                        {directMessagesModalButton}
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
