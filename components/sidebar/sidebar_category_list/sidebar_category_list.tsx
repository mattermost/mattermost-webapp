// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import SidebarCategory from '../sidebar_category';
import SidebarChannel from '../sidebar_channel/sidebar_channel';

type Props = {
    currentChannel: Channel | undefined;
    categories: any[];
    unreadChannelIds: string[];
};

type State = {

};

export default class SidebarCategoryList extends React.PureComponent<Props, State> {
    channelRefs: Map<string, React.RefObject<HTMLDivElement>>;

    constructor(props: Props) {
        super(props);

        this.channelRefs = this.createChannelRefs();
    }

    createChannelRefs = () => {
        return new Map(this.getDisplayedChannels().map((channelId) => [channelId, React.createRef<HTMLDivElement>()]));
    }

    getFirstUnreadChannelFromChannelIdArray = (array: string[]) => {
        return array.find((channelId) => {
            if (channelId !== this.props.currentChannel.id && this.props.unreadChannelIds.includes(channelId)) {
                return channelId;
            }
            return null;
        });
    }

    getFirstUnreadChannel = () => {
        return this.getFirstUnreadChannelFromChannelIdArray(this.getDisplayedChannels());
    }

    getLastUnreadChannel = () => {
        return this.getFirstUnreadChannelFromChannelIdArray(this.getDisplayedChannels().reverse());
    }

    getDisplayedChannels = () : string[] => {
        return this.props.categories.reduce((allChannelIds, section) => {
            allChannelIds.push(...section.channel_ids);
            return allChannelIds;
        }, []);
    };

    renderCategory = (category: any) => {
        return (
            <SidebarCategory
                category={category}
                channelRefs={this.channelRefs}
            />
        );
    }

    render() {
        const {categories} = this.props;
        const renderedCategories = categories.map(this.renderCategory);

        return (
            <div>
                {'Sidebar Category List'}
                {renderedCategories}
            </div>
        );
    }
}
