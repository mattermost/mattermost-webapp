// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Draggable, NotDraggingStyle, DraggingStyle, DraggableStateSnapshot} from 'react-beautiful-dnd';
import classNames from 'classnames';

import {Channel} from 'mattermost-redux/types/channels';

import {DraggingState} from 'types/store';
import Constants, {DraggingStates} from 'utils/constants';

import SidebarBaseChannel from './sidebar_base_channel';
import SidebarDirectChannel from './sidebar_direct_channel';
import SidebarGroupChannel from './sidebar_group_channel';

type Props = {

    /**
     * The channel object for this channel list item
     */
    channel: Channel;

    channelIndex: number;

    /**
     * If in a DM, the name of the user your DM is with
     */
    teammateUsername?: string;

    /**
     * The current team you are on
     */
    currentTeamName: string;

    /**
     * Number of unread mentions in this channel
     */
    unreadMentions: number;

    /**
     * Number of unread messages in this channel
     */
    unreadMsgs: number;

    /**
     * User preference of whether the channel can be marked unread
     */
    showUnreadForMsgs: boolean;

    /**
     * Gets the ref for a given channel id
     */
    getChannelRef: (channelId: string) => HTMLLIElement | undefined;

    /**
     * Sets the ref for the sidebar channel div element, so that it can be used by parent components
     */
    setChannelRef: (channelId: string, ref: HTMLLIElement) => void;

    /**
     * If category is collapsed
     */
    isCategoryCollapsed: boolean;

    /**
     * Is the channel the currently focused channel
     */
    isCurrentChannel: boolean;

    isDMCategory: boolean;

    draggingState: DraggingState;

    isCategoryDragged: boolean;

    isDropDisabled: boolean;
};

type State = {

};

export default class SidebarChannel extends React.PureComponent<Props, State> {
    isUnread = () => {
        return this.props.unreadMentions > 0 || (this.props.unreadMsgs > 0 && this.props.showUnreadForMsgs);
    }

    isCollapsed = (props: Props) => {
        return props.isCategoryDragged || (props.isCategoryCollapsed && !this.isUnread() && !props.isCurrentChannel);
    }

    componentDidUpdate(prevProps: Props) {
        if (this.isCollapsed(this.props) !== this.isCollapsed(prevProps) && (this.props.draggingState.state !== DraggingStates.CAPTURE && this.props.draggingState.state !== DraggingStates.BEFORE)) {
            const channelElement = this.getRef();
            if (channelElement) {
                channelElement.classList.add('animating');
            }
        }
    }

    removeAnimation = () => {
        const channelElement = this.getRef();
        if (channelElement) {
            channelElement.classList.remove('animating');
        }
    }

    getRef = () => {
        return this.props.getChannelRef(this.props.channel.id);
    }

    setRef = (refMethod: (element: HTMLLIElement) => any) => {
        return (ref: HTMLLIElement) => {
            this.props.setChannelRef(this.props.channel.id, ref);
            refMethod(ref);
        };
    }

    getStyle = (style: DraggingStyle | NotDraggingStyle | undefined, snapshot: DraggableStateSnapshot) => {
        // Turn off channel floating for the DM category, since you can't reorder DMs
        if (this.props.isDMCategory && !snapshot.isDragging) {
            return {
                ...style,
                transform: 'none',
            };
        }

        // Fade DMs into the DM category instead of dropping them into a slot
        if (snapshot.isDropAnimating && snapshot.draggingOver?.includes('direct_messages')) {
            return {
                ...style,
                opacity: 0,
                transition: `all ${snapshot.dropAnimation?.curve} ${snapshot.dropAnimation?.duration}s`,
            };
        }

        return style;
    }

    render() {
        const {channel, currentTeamName, channelIndex} = this.props;

        let ChannelComponent: React.ComponentType<{channel: Channel; currentTeamName: string}> = SidebarBaseChannel;
        if (channel.type === Constants.DM_CHANNEL) {
            ChannelComponent = SidebarDirectChannel;
        } else if (channel.type === Constants.GM_CHANNEL) {
            ChannelComponent = SidebarGroupChannel;
        }

        return (
            <Draggable
                draggableId={channel.id}
                index={channelIndex}
            >
                {(provided, snapshot) => {
                    return (
                        <li
                            role='listitem'
                            draggable='false'
                            ref={this.setRef(provided.innerRef)}
                            className={classNames('SidebarChannel', {
                                collapsed: this.isCollapsed(this.props),
                                unread: this.isUnread(),
                                active: this.props.isCurrentChannel,
                                dragging: snapshot.isDragging,
                            })}
                            onTransitionEnd={this.removeAnimation}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={this.getStyle(provided.draggableProps.style, snapshot)}
                        >
                            <ChannelComponent
                                channel={channel}
                                currentTeamName={currentTeamName}
                            />
                        </li>
                    );
                }}
            </Draggable>
        );
    }
}
