// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useRef, useState} from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import {VariableSizeList, ListChildComponentProps, FixedSizeList} from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';

import {UserProfile} from '@mattermost/types/users';
import {Channel} from '@mattermost/types/channels';

// import Member from './member';

export interface Props {
    people: UserProfile[];
    hasNextPage: boolean;
    isNextPageLoading: boolean;
    searchTerms: string;
}

const PeopleList = ({
    hasNextPage,
    isNextPageLoading,
    people,
    searchTerms,
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
    }, [searchTerms, people.length, hasMounted]);

    const itemCount = hasNextPage ? people.length + 1 : people.length;
    const loadMore = () => {
        console.log('load more');
    }
    const loadMoreItems = isNextPageLoading ? () => {} : loadMore;

    const isItemLoaded = (index: number) => {
        return !hasNextPage || index < people.length;
    };

    const getItemSize = (index: number) => {
        if (!(index in people)) {
            return 0;
        }

        return 48;
    };

    const Item = ({index, style}: ListChildComponentProps) => {
        if (isItemLoaded(index)) {
            const user = people[index] as UserProfile;
            return (
                <div
                    style={style}
                    key={user.id}
                >
                    <>{'Hi hello hi'}</>
                </div>
            );
            
        }

        return null;
    };

    if (people.length === 0) {
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
                        <FixedSizeList
                            ref={ref}
                            onItemsRendered={onItemsRendered}
                            height={height}
                            width={width}
                            layout='vertical'
                            overscanCount={1}
                            itemCount={itemCount}
                            itemData={people}
                            itemSize={100}
                        >
                            {Item}
                        </FixedSizeList>
                    )}
                </InfiniteLoader>
            )}
        </AutoSizer>
    );
};

export default PeopleList;
