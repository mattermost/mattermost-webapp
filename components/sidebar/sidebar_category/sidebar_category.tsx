// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import SidebarChannel from '../sidebar_channel';

type Props = {
    category: any;
    setChannelRef: (channelId: string, ref: HTMLDivElement) => void;
    actions: {
        setCollapsedState: (categoryId: string, isCollapsed: boolean) => void;
    }
};

type State = {
    isCollapsed: boolean;
};

export default class SidebarCategory extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            isCollapsed: props.category.collapsed,
        };
    }

    renderChannel = (channelId: string) => {
        return (
            <SidebarChannel
                channelId={channelId}
                setChannelRef={this.props.setChannelRef}
            />
        );
    }

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

        const channels = (
            <div style={{display: isCollapsed ? 'none' : 'inherit'}}>
                {category.channel_ids.map(this.renderChannel)}
            </div>
        );

        return (
            <div>
                <div style={{display: 'flex'}}>
                    <a onClick={this.handleCollapse}>
                        {isCollapsed ? '+' : '-'}
                    </a>
                    {category.display_name}
                </div>
                {channels}
            </div>
        );
    }
}
