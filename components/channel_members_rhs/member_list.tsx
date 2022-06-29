// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useRef, useState} from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import {VariableSizeList, ListChildComponentProps} from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';

import {UserProfile} from '@mattermost/types/users';
import {Channel} from '@mattermost/types/channels';

import Member from './member';
import {ChannelMember, ListItem} from './channel_members_rhs';

export interface Props {
    channel: Channel;
    members: ListItem[];
    editing: boolean;
    hasNextPage: boolean;
    isNextPageLoading: boolean;
    searchTerms: string;

    actions: {
        openDirectMessage: (user: UserProfile) => void;
        loadMore: () => void;
    };
}

const MemberList = ({
    hasNextPage,
    isNextPageLoading,
    channel,
    members,
    searchTerms,
    editing,
    actions,
}: Props) => {
    const infiniteLoaderRef = useRef<InfiniteLoader | null>(null);
    const variableSizeListRef = useRef<VariableSizeList | null>(null);
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        if (hasMounted) {
            if (infiniteLoaderRef.current) {
                infiniteLoaderRef.current.resetloadMoreItemsCache();
            }
            if (variableSizeListRef.current) {
                variableSizeListRef.current.resetAfterIndex(0);
            }
        }
        setHasMounted(true);
    }, [searchTerms, members.length, hasMounted]);

    const itemCount = hasNextPage ? members.length + 1 : members.length;

    // Only load 1 page of items at a time.
    // Pass an empty callback to InfiniteLoader in case it asks us to load more than once.
    const loadMoreItems = isNextPageLoading ? () => {} : actions.loadMore;

    // Every row is loaded except for our loading indicator row.
    const isItemLoaded = (index: number) => {
        return !hasNextPage || index < members.length;
    };

    const getItemSize = (index: number) => {
        if (!(index in members)) {
            return 0;
        }

        switch (members[index].type) {
        case 'first-separator':
            return 28;
        case 'separator':
            return 16 + 28;
        }

        return 48;
    };

    // Render an item or a loading indicator.
    const Item = ({index, style}: ListChildComponentProps) => {
        if (isItemLoaded(index)) {
            if (members[index].type === 'member') {
                const member = members[index].data as ChannelMember;
                return (
                    <div
                        style={style}
                        key={member.user.id}
                    >
                        <Member
                            channel={channel}
                            index={index}
                            totalUsers={members.length}
                            member={member}
                            editing={editing}
                            actions={{openDirectMessage: actions.openDirectMessage}}
                        />
                    </div>
                );
            } else if (members[index].type === 'separator' || members[index].type === 'first-separator') {
                return (
                    <div
                        key={index}
                        style={style}
                    >
                        {members[index].data}
                    </div>
                );
            }
        }

        return null;
    };

    if (members.length === 0) {
        return null;
    }

    return (
        <AutoSizer>
            {({height, width}) => (
                <InfiniteLoader
                    ref={infiniteLoaderRef}
                    isItemLoaded={isItemLoaded}
                    itemCount={itemCount}
                    loadMoreItems={loadMoreItems}
                >
                    {({onItemsRendered, ref}) => (

                        <VariableSizeList
                            itemCount={itemCount}
                            onItemsRendered={onItemsRendered}
                            ref={(list) => {
                                ref(list);
                                variableSizeListRef.current = list;
                            }}

                            itemSize={getItemSize}
                            height={height}
                            width={width}
                        >
                            {Item}
                        </VariableSizeList>
                    )}
                </InfiniteLoader>
            )}
        </AutoSizer>
    );
};

export default MemberList;
