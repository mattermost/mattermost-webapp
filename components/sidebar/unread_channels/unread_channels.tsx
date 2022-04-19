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

    if (props.unreadChannels.length === 0) {
        return null;
    }

    return (
        <div className='SidebarChannelGroup dropDisabled a11y__section'>
            <SidebarCategoryHeaderStatic displayName={intl.formatMessage({id: 'sidebar.types.unreads', defaultMessage: 'UNREADS'})}/>
            <div className='SidebarChannelGroup_content'>
                <ul
                    role='list'
                    className='NavGroupContent'
                >
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
                                isAutoSortedCategory={true}
                            />
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}
