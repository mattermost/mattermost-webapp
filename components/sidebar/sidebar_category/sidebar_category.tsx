// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import SidebarChannel from '../sidebar_channel';
import Constants, {A11yCustomEventTypes} from 'utils/constants';
import {isKeyPressed} from 'utils/utils';

type Props = {
    category: any;
    setChannelRef: (channelId: string, ref: HTMLDivElement) => void;
    getChannelRef: (channelId: string) => HTMLDivElement | undefined;
    actions: {
        setCollapsedState: (categoryId: string, isCollapsed: boolean) => void;
    };
};

type State = {
    isCollapsed: boolean;
};

export default class SidebarCategory extends React.PureComponent<Props, State> {
    categoryRef: React.RefObject<HTMLDivElement>;

    constructor(props: Props) {
        super(props);

        this.categoryRef = React.createRef();
        this.state = {
            isCollapsed: props.category.collapsed,
        };
    }

    componentDidMount() {
        // Refs can be null when this component is shallowly rendered for testing
        if (this.categoryRef.current) {
            this.categoryRef.current.addEventListener(A11yCustomEventTypes.ACTIVATE, this.handleA11yActivateEvent);
            this.categoryRef.current.addEventListener(A11yCustomEventTypes.DEACTIVATE, this.handleA11yDeactivateEvent);
        }
    }

    componentWillUnmount() {
        if (this.categoryRef.current) {
            this.categoryRef.current.removeEventListener(A11yCustomEventTypes.ACTIVATE, this.handleA11yActivateEvent);
            this.categoryRef.current.removeEventListener(A11yCustomEventTypes.DEACTIVATE, this.handleA11yDeactivateEvent);
        }
    }

    handleA11yActivateEvent = () => {
        if (this.categoryRef.current) {
            this.categoryRef.current.addEventListener('keydown', this.handleA11yKeyDown);
        }
    }

    handleA11yDeactivateEvent = () => {
        if (this.categoryRef.current) {
            this.categoryRef.current.removeEventListener('keydown', this.handleA11yKeyDown);
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

    // TODO: uncomment when the state is in redux
    // static getDerivedStateFromProps(nextProps: Props, prevState: State) {
    //     if (nextProps.category.collapsed !== prevState.isCollapsed) {
    //         return {isCollapsed: nextProps.category.collapsed};
    //     }
    // }

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

        return (
            <div
                ref={this.categoryRef}
                className='a11y__section'
            >
                <div
                    style={{display: 'flex'}}
                    onClick={this.handleCollapse}
                >
                    {isCollapsed ? '+' : '-'}
                    {category.display_name}
                </div>
                {channels}
            </div>
        );
    }
}
