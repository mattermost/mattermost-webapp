// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
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
    channels: Channel[];
    setChannelRef: (channelId: string, ref: HTMLLIElement) => void;
    handleOpenMoreDirectChannelsModal: (e: Event) => void;
    getChannelRef: (channelId: string) => HTMLLIElement | undefined;
    isCollapsed: boolean;
    isNewCategory: boolean;
    actions: {
        setCategoryCollapsed: (categoryId: string, collapsed: boolean) => void;
    };
};

type State = {
    isNewCategory: boolean;
}

export default class SidebarCategory extends React.PureComponent<Props, State> {
    categoryTitleRef: React.RefObject<HTMLButtonElement>;
    newDropBoxRef: React.RefObject<HTMLDivElement>;

    constructor(props: Props) {
        super(props);

        this.categoryTitleRef = React.createRef();
        this.newDropBoxRef = React.createRef();

        this.state = {
            isNewCategory: props.isNewCategory,
        };
    }

    componentDidUpdate(prevProps: Props) {
        if (prevProps.channels.length !== this.props.channels.length && this.state.isNewCategory) {
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({isNewCategory: false});
        }

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

    removeAnimation = () => {
        if (this.newDropBoxRef.current) {
            this.newDropBoxRef.current.classList.remove('animating');
        }
    }

    handleOpenDirectMessagesModal = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.stopPropagation();
        this.props.handleOpenMoreDirectChannelsModal(e.nativeEvent);
    }

    render() {
        const {category, isCollapsed, channels} = this.props;
        const {isNewCategory} = this.state;

        if (!category) {
            return null;
        }

        if (!isNewCategory && category.type !== CategoryTypes.DIRECT_MESSAGES && (!channels || !channels.length)) {
            return null;
        }

        const renderedChannels = channels.map(this.renderChannel);

        let newLabel;
        let newDropBox;
        let directMessagesModalButton;
        let hideArrow = false;
        if (isNewCategory) {
            newLabel = (
                <div className='SidebarCategory_newLabel'>
                    <FormattedMessage
                        id='sidebar_left.sidebar_category.newLabel'
                        defaultMessage='new'
                    />
                </div>
            );

            newDropBox = (
                <div
                    ref={this.newDropBoxRef}
                    className={classNames('SidebarCategory_newDropBox', {
                        collapsed: isCollapsed,
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
            );
        } else if (category.type === CategoryTypes.DIRECT_MESSAGES) {
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
            <div className='SidebarChannelGroup a11y__section'>
                <div className='SidebarChannelGroupHeader'>
                    <button
                        ref={this.categoryTitleRef}
                        className={classNames('SidebarChannelGroupHeader_groupButton', {favorites: category.type === CategoryTypes.FAVORITES})}
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
                        {newLabel}
                        {directMessagesModalButton}
                    </button>
                </div>
                <div className='SidebarChannelGroup_content'>
                    <ul
                        role='list'
                        className='NavGroupContent'
                    >
                        {newDropBox}
                        {renderedChannels}
                    </ul>
                </div>
            </div>
        );
    }
}
