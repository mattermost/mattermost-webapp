// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import SidebarChannel from '../sidebar_channel';

type Props = {
    category: any;
    setChannelRef: (channelId: string, ref: HTMLDivElement) => void;
    handleOpenMoreDirectChannelsModal: (e: Event) => void;
};

type State = {

};

export default class SidebarCategory extends React.PureComponent<Props, State> {
    renderChannel = (channelId: string) => {
        return (
            <SidebarChannel
                channelId={channelId}
                setChannelRef={this.props.setChannelRef}
            />
        );
    }

    render() {
        const {category} = this.props;
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
            <div className='a11y__section'>
                <div style={{display: 'flex'}}>
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
