// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import SidebarChannel from '../sidebar_channel';

type Props = {
    category: any;
};

type State = {

};

export default class SidebarCategory extends React.PureComponent<Props, State> {
    renderChannel = (channelId: string) => {
        return (
            <SidebarChannel channelId={channelId}/>
        );
    }

    render() {
        const {category} = this.props;
        const channels = category.channel_ids.map(this.renderChannel);

        return (
            <div>
                {category.display_name}
                {channels}
            </div>
        );
    }
}
