// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import SidebarChannel from '../sidebar_channel';
import Constants, {A11yCustomEventTypes} from 'utils/constants';
import {isKeyPressed} from 'utils/utils';

type Props = {
    category: any;
    setChannelRef: (channelId: string, ref: HTMLDivElement) => void;
    handleOpenMoreDirectChannelsModal: (e: Event) => void;
    getChannelRef: (channelId: string) => HTMLDivElement | undefined;
    actions: {
        setCollapsedState: (categoryId: string, isCollapsed: boolean) => void;
    };
};

type State = {
    isCollapsed: boolean;
};

export default class SidebarCategory extends React.PureComponent<Props, State> {
    categoryTitleRef: React.RefObject<HTMLDivElement>;

    constructor(props: Props) {
        super(props);

        this.categoryTitleRef = React.createRef();
        this.state = {
            isCollapsed: props.category.collapsed,
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

    renderChannel = (channelId: string) => {
        const {isCollapsed} = this.state;

        return (
            <SidebarChannel
                channelId={channelId}
                setChannelRef={this.props.setChannelRef}
                getChannelRef={this.props.getChannelRef}
                isCategoryCollapsed={isCollapsed}
            />
        );
    }

    handleCollapse = () => {
        const {category} = this.props;
        const {isCollapsed} = this.state;
        this.props.actions.setCollapsedState(category.id, !isCollapsed);
        this.setState({isCollapsed: !isCollapsed}); // TODO: Won't be necessary after it's in redux
    }

    render() {
        const {category} = this.props;
        const {isCollapsed} = this.state;

        const channels = category.channel_ids.map(this.renderChannel);

        // TODO: temporary button, need better way of opening modal
        let directMessagesModalButton;
        if (category.id === 'direct') {
            directMessagesModalButton = (
                <div style={{fontWeight: 'bold'}}>
                    <a
                        href='#'
                        onClick={(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => this.props.handleOpenMoreDirectChannelsModal(e.nativeEvent)}
                    >
                        {'+'}
                    </a>
                </div>
            );
        }

        return (
            <div>
                <div
                    ref={this.categoryTitleRef}
                    className='a11y__section'
                    style={{display: 'flex'}}
                    onClick={this.handleCollapse}
                >
                    {isCollapsed ? '+' : '-'}
                    <div>
                        {category.display_name}
                    </div>
                    {directMessagesModalButton}
                </div>
                {channels}
            </div>
        );
    }
}
