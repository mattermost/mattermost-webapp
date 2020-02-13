// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import SidebarChannel from '../sidebar_channel';

type Props = {
    category: any;
    setChannelRef: (channelId: string, ref: HTMLDivElement) => void;
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

        return (
            <div className='a11y__section'>
                {category.display_name}
                {channels}
            </div>
        );
    }
}
