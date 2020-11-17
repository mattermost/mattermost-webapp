// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import {Draggable, Droppable} from 'react-beautiful-dnd';
import classNames from 'classnames';

import {CategoryTypes} from 'mattermost-redux/constants/channel_categories';
import {Channel} from 'mattermost-redux/types/channels';
import {ChannelCategory, CategorySorting} from 'mattermost-redux/types/channel_categories';
import {localizeMessage} from 'mattermost-redux/utils/i18n_utils';

import {trackEvent} from 'actions/telemetry_actions';

import OverlayTrigger from 'components/overlay_trigger';

import {DraggingState} from 'types/store';

import Constants, {A11yCustomEventTypes, DraggingStateTypes, DraggingStates} from 'utils/constants';
import {t} from 'utils/i18n';
import {isKeyPressed} from 'utils/utils';

import SidebarChannel from '../sidebar_channel';
import {SidebarCategoryHeader} from '../sidebar_category_header';

import SidebarCategoryMenu from './sidebar_category_menu';

type Props = {
    category: ChannelCategory;
    categoryIndex: number;
    channels: Channel[];
    setChannelRef: (channelId: string, ref: HTMLLIElement) => void;
    handleOpenMoreDirectChannelsModal: (e: Event) => void;
    getChannelRef: (channelId: string) => HTMLLIElement | undefined;
    isCollapsed: boolean;
    isNewCategory: boolean;
    draggingState: DraggingState;
    actions: {
        setCategoryCollapsed: (categoryId: string, collapsed: boolean) => void;
        setCategorySorting: (categoryId: string, sorting: CategorySorting) => void;
    };
};

type State = {
    isMenuOpen: boolean;
}

export default class SidebarCategory extends React.PureComponent<Props, State> {
    categoryTitleRef: React.RefObject<HTMLButtonElement>;
    newDropBoxRef: React.RefObject<HTMLDivElement>;

    constructor(props: Props) {
        super(props);

        this.categoryTitleRef = React.createRef();
        this.newDropBoxRef = React.createRef();

        this.state = {
            isMenuOpen: false,
        };
    }

    componentDidUpdate(prevProps: Props) {
        if (this.props.isCollapsed !== prevProps.isCollapsed && this.newDropBoxRef.current) {
            this.newDropBoxRef.current.classList.add('animating');
        }
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
        const {isCollapsed, setChannelRef, getChannelRef, category, draggingState} = this.props;

        return (
            <SidebarChannel
                key={channel.id}
                channelIndex={index}
                channelId={channel.id}
                setChannelRef={setChannelRef}
                getChannelRef={getChannelRef}
                isCategoryCollapsed={isCollapsed}
                isCategoryDragged={draggingState.type === DraggingStateTypes.CATEGORY && draggingState.id === category.id}
                isDropDisabled={this.isDropDisabled()}
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

    handleSortDirectMessages = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        const {category} = this.props;
        e.stopPropagation();

        const newSorting = category.sorting === CategorySorting.Recency ? CategorySorting.Alphabetical : CategorySorting.Recency;
        this.props.actions.setCategorySorting(category.id, newSorting);
        trackEvent('ui', `ui_sidebar_sort_dm_${newSorting}`);
    }
    removeAnimation = () => {
        if (this.newDropBoxRef.current) {
            this.newDropBoxRef.current.classList.remove('animating');
        }
    }

    handleOpenDirectMessagesModal = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.stopPropagation();
        this.props.handleOpenMoreDirectChannelsModal(e.nativeEvent);
        trackEvent('ui', 'ui_sidebar_create_direct_message');
    }

    handleMenuToggle = (open: boolean) => {
        this.setState({isMenuOpen: open});
    }

    isDropDisabled = () => {
        const {draggingState, category} = this.props;

        if (category.type === CategoryTypes.DIRECT_MESSAGES) {
            return draggingState.type === DraggingStateTypes.CHANNEL;
        } else if (category.type === CategoryTypes.CHANNELS) {
            return draggingState.type === DraggingStateTypes.DM;
        }

        return false;
    }

    renderNewDropBox = (isDraggingOver: boolean) => {
        const {isCollapsed, draggingState, category, isNewCategory, channels} = this.props;

        if (!isNewCategory || channels?.length) {
            return null;
        }

        return (
            <React.Fragment>
                <Draggable
                    draggableId={`NEW_CHANNEL_SPACER__${category.id}`}
                    isDragDisabled={true}
                    index={0}
                >
                    {(provided) => {
                        // NEW_CHANNEL_SPACER here is used as a spacer to ensure react-beautiful-dnd will not try and place the first channel
                        // on the header. This acts as a space filler for the header so that the first channel dragged in will float below it.
                        return (
                            <li
                                ref={provided.innerRef}
                                draggable='false'
                                className={'SidebarChannel noFloat newChannelSpacer'}
                                {...provided.draggableProps}
                                role='listitem'
                                tabIndex={-1}
                            />
                        );
                    }}
                </Draggable>
                <div
                    ref={this.newDropBoxRef}
                    className={classNames('SidebarCategory_newDropBox', {
                        collapsed: isCollapsed || (draggingState.type === DraggingStateTypes.CATEGORY && draggingState.id === category.id),
                        isDraggingOver,
                    })}
                    onTransitionEnd={this.removeAnimation}
                >
                    <i className='icon-hand-right'/>
                    <span className='SidebarCategory_newDropBox-label'>
                        <FormattedMessage
                            id='sidebar_left.sidebar_category.newDropBoxLabel'
                            defaultMessage='Drag channels here...'
                        />
                    </span>
                </div>
            </React.Fragment>
        );
    }

    render() {
        const {
            category,
            categoryIndex,
            channels,
            isCollapsed,
            isNewCategory,
        } = this.props;

        if (!category) {
            return null;
        }

        if (category.type === CategoryTypes.FAVORITES && !channels?.length) {
            return null;
        }

        const renderedChannels = channels.map(this.renderChannel);

        let categoryMenu: JSX.Element;
        let newLabel: JSX.Element;
        let directMessagesModalButton: JSX.Element;
        let isCollapsible = true;
        if (isNewCategory) {
            newLabel = (
                <div className='SidebarCategory_newLabel'>
                    <FormattedMessage
                        id='sidebar_left.sidebar_category.newLabel'
                        defaultMessage='new'
                    />
                </div>
            );

            categoryMenu = (
                <SidebarCategoryMenu
                    category={category}
                    isMenuOpen={this.state.isMenuOpen}
                    onToggleMenu={this.handleMenuToggle}
                />
            );
        } else if (category.type === CategoryTypes.DIRECT_MESSAGES) {
            const addHelpLabel = localizeMessage('sidebar.createDirectMessage', 'Create new direct message');

            const addTooltip = (
                <Tooltip
                    id='new-group-tooltip'
                    className='hidden-xs'
                >
                    {addHelpLabel}
                </Tooltip>
            );

            let sortingIcon: JSX.Element;
            let sortHelpLabel;
            if (category.sorting === CategorySorting.Alphabetical) {
                sortingIcon = (<i className='icon-sort-alphabetical-ascending'/>);
                sortHelpLabel = localizeMessage('sidebar.sortedByAlphabetical', 'Sorted alphabetically');
            } else {
                sortingIcon = (<i className='icon-clock-outline'/>);
                sortHelpLabel = localizeMessage('sidebar.sortedByRecency', 'Sorted by most recent');
            }

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
                    <OverlayTrigger
                        delayShow={500}
                        placement='top'
                        overlay={sortTooltip}
                    >
                        <button
                            className='SidebarChannelGroupHeader_sortButton'
                            onClick={this.handleSortDirectMessages}
                            aria-label={sortHelpLabel}
                        >
                            {sortingIcon}
                        </button>
                    </OverlayTrigger>
                    <OverlayTrigger
                        delayShow={500}
                        placement='top'
                        overlay={addTooltip}
                    >
                        <button
                            className='SidebarChannelGroupHeader_addButton'
                            onClick={this.handleOpenDirectMessagesModal}
                            aria-label={addHelpLabel}
                        >
                            <i className='icon-plus'/>
                        </button>
                    </OverlayTrigger>
                </React.Fragment>
            );

            if (!channels || !channels.length) {
                isCollapsible = false;
            }
        } else {
            categoryMenu = (
                <SidebarCategoryMenu
                    category={category}
                    isMenuOpen={this.state.isMenuOpen}
                    onToggleMenu={this.handleMenuToggle}
                />
            );
        }

        let displayName = category.display_name;
        if (category.type !== CategoryTypes.CUSTOM) {
            displayName = localizeMessage(`sidebar.types.${category.type}`, category.display_name);
        }

        return (
            <Draggable
                draggableId={category.id}
                index={categoryIndex}
                disableInteractiveElementBlocking={true}
            >
                {(provided, snapshot) => {
                    return (
                        <div
                            className={classNames('SidebarChannelGroup a11y__section', {
                                dmCategory: category.type === CategoryTypes.DIRECT_MESSAGES,
                                dropDisabled: this.isDropDisabled(),
                                menuIsOpen: this.state.isMenuOpen,
                                capture: this.props.draggingState.state === DraggingStates.CAPTURE,
                            })}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                        >
                            <Droppable
                                droppableId={category.id}
                                type='SIDEBAR_CHANNEL'
                                isDropDisabled={this.isDropDisabled()}
                            >
                                {(droppableProvided, droppableSnapshot) => {
                                    return (
                                        <div
                                            {...droppableProvided.droppableProps}
                                            ref={droppableProvided.innerRef}
                                            className={classNames({
                                                draggingOver: droppableSnapshot.isDraggingOver,
                                            })}
                                        >
                                            <SidebarCategoryHeader
                                                ref={this.categoryTitleRef}
                                                displayName={displayName}
                                                dragHandleProps={provided.dragHandleProps}
                                                isCollapsed={isCollapsed}
                                                isCollapsible={isCollapsible}
                                                isDragging={snapshot.isDragging}
                                                isDraggingOver={droppableSnapshot.isDraggingOver}
                                                onClick={this.handleCollapse}
                                            >
                                                {newLabel}
                                                {directMessagesModalButton}
                                                {categoryMenu}
                                            </SidebarCategoryHeader>
                                            <div className='SidebarChannelGroup_content'>
                                                <ul
                                                    role='list'
                                                    className='NavGroupContent'
                                                >
                                                    {this.renderNewDropBox(droppableSnapshot.isDraggingOver)}
                                                    {renderedChannels}
                                                    {(category.type === CategoryTypes.DIRECT_MESSAGES || isNewCategory) ? null : droppableProvided.placeholder}
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

// Adding references to translations for i18n-extract
t('sidebar.types.channels');
t('sidebar.types.direct_messages');
t('sidebar.types.favorites');
