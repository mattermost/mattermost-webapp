// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Tooltip} from 'react-bootstrap';
import {Draggable, Droppable} from 'react-beautiful-dnd';
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

type Props = {
    category: ChannelCategory;
    categoryIndex: number;
    channels: Channel[];
    setChannelRef: (channelId: string, ref: HTMLLIElement) => void;
    handleOpenMoreDirectChannelsModal: (e: Event) => void;
    getChannelRef: (channelId: string) => HTMLLIElement | undefined;
    isCollapsed: boolean;
    isDraggingChannel: boolean;
    isDraggingDM: boolean;
    isDraggingCategory: boolean;
    actions: {
        setCategoryCollapsed: (categoryId: string, collapsed: boolean) => void;
    };
};

export default class SidebarCategory extends React.PureComponent<Props> {
    categoryTitleRef: React.RefObject<HTMLButtonElement>;
    expandOnHoverTimeout?: NodeJS.Timeout;

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

    renderChannel = (channel: Channel, index: number) => {
        const {isCollapsed, setChannelRef, getChannelRef, category} = this.props;

        return (
            <SidebarChannel
                key={channel.id}
                channelIndex={index}
                channelId={channel.id}
                setChannelRef={setChannelRef}
                getChannelRef={getChannelRef}
                isCategoryCollapsed={isCollapsed}
                isDMCategory={category.type === CategoryTypes.DIRECT_MESSAGES}
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

    handleOpenDirectMessagesModal = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.stopPropagation();
        this.props.handleOpenMoreDirectChannelsModal(e.nativeEvent);
    }

    isDropDisabled = () => {
        const {isDraggingChannel, isDraggingDM, category} = this.props;

        if (category.type === CategoryTypes.DIRECT_MESSAGES) {
            return isDraggingChannel;
        } else if (category.type === CategoryTypes.PUBLIC || category.type === CategoryTypes.PRIVATE) {
            return isDraggingDM;
        }

        return false;
    }

    onMouseOver = () => {
        if (!this.isDropDisabled() && this.props.isCollapsed && (this.props.isDraggingChannel || this.props.isDraggingDM)) {
            console.log('start timeout');
            this.expandOnHoverTimeout = setTimeout(() => {
                console.log('do the thing');
                this.handleCollapse();
            }, 500);
        }
    }

    onMouseOut = () => {
        if (this.expandOnHoverTimeout) {
            console.log('clear the thing');
            clearTimeout(this.expandOnHoverTimeout);
            Reflect.deleteProperty(this, 'expandOnHoverTimeout');
        }
    }

    render() {
        const {category, categoryIndex, isCollapsed, channels} = this.props;
        if (!category) {
            return null;
        }

        if (category.type !== CategoryTypes.DIRECT_MESSAGES && (!channels || !channels.length)) {
            return null;
        }

        const renderedChannels = channels.map(this.renderChannel);

        let directMessagesModalButton: JSX.Element;
        let hideArrow = false;
        if (category.type === CategoryTypes.DIRECT_MESSAGES) {
            const helpLabel = localizeMessage('sidebar.createDirectMessage', 'Create new direct message');

            const tooltip = (
                <Tooltip
                    id='new-group-tooltip'
                    className='hidden-xs'
                >
                    {helpLabel}
                </Tooltip>
            );

            directMessagesModalButton = (
                <button
                    className='SidebarChannelGroupHeader_addButton'
                    onClick={this.handleOpenDirectMessagesModal}
                    aria-label={helpLabel}
                >
                    <OverlayTrigger
                        delayShow={500}
                        placement='top'
                        overlay={tooltip}
                    >
                        <i className='icon-plus'/>
                    </OverlayTrigger>
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
            <Draggable
                draggableId={category.id}
                index={categoryIndex}
            >
                {(provided, snapshot) => {
                    return (
                        <div 
                            className={classNames('SidebarChannelGroup a11y__section', {
                                dropDisabled: this.isDropDisabled(),
                            })}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                        >
                            <Droppable 
                                droppableId={category.id}
                                type='SIDEBAR_CHANNEL'
                                mode='virtual'
                                isDropDisabled={this.isDropDisabled()}
                            >
                                {(droppableProvided) => {
                                    return (
                                        <div
                                            {...droppableProvided.droppableProps}
                                            ref={droppableProvided.innerRef}
                                        >
                                            <div className='SidebarChannelGroupHeader'>
                                                <button
                                                    ref={this.categoryTitleRef}
                                                    className={classNames('SidebarChannelGroupHeader_groupButton', {favorites: category.type === CategoryTypes.FAVORITES})}
                                                    onClick={this.handleCollapse}
                                                    onMouseOver={this.onMouseOver}
                                                    onMouseOut={this.onMouseOut}
                                                    aria-label={displayName}
                                                >
                                                    <i
                                                        className={classNames('icon icon-chevron-down', {
                                                            'icon-rotate-minus-90': isCollapsed,
                                                            'hide-arrow': hideArrow,
                                                        })}
                                                    />
                                                    <div {...provided.dragHandleProps}>
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
                                                    {droppableProvided.placeholder}
                                                </ul>
                                            </div>
                                        </div>
                                    );
                                }}
                            </Droppable>
                        </div>
                    );
                }}
            </Draggable>
        );
    }
}
