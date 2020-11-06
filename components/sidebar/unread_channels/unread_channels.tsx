// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useIntl} from 'react-intl';

import {Channel} from 'mattermost-redux/types/channels';

import {SidebarCategoryHeaderStatic} from '../sidebar_category_header';
import SidebarChannel from '../sidebar_channel';

type Props = {
    getChannelRef: (channelId: string) => HTMLLIElement | undefined;
    setChannelRef: (channelId: string, ref: HTMLLIElement) => void;
    unreadChannels: Channel[];
};

export default function UnreadChannels(props: Props) {
    const intl = useIntl();

    return (
        <div className='SidebarChannelGroup a11y__section'>
            <SidebarCategoryHeaderStatic displayName={intl.formatMessage({id: 'sidebar.types.all_unreads', defaultMessage: 'ALL UNREADS'})}/>
            {props.unreadChannels.map((channel, index) => {
                return (
                    <SidebarChannel
                        key={channel.id}
                        channelIndex={index}
                        channelId={channel.id}
                        setChannelRef={props.setChannelRef}
                        getChannelRef={props.getChannelRef}
                        isCategoryCollapsed={false}
                        isCategoryDragged={false}
                        isDraggable={false}
                        isDropDisabled={true}
                        isDMCategory={false}
                    />
                );
            })}
        </div>
    );
}
