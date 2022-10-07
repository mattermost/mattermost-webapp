// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useRef, useState} from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import {FixedSizeGrid, GridChildComponentProps} from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';

import ProfileCard from 'components/people/profile_card/profile_card';

import {UserProfile} from '@mattermost/types/users';

export interface Props {
    people: UserProfile[];
    hasNextPage: boolean;
    isNextPageLoading: boolean;
    searchTerms: string;
    loadMore: () => Promise<void>;
}

const PeopleList = ({
    hasNextPage,
    isNextPageLoading,
    people,
    searchTerms,
    loadMore,
}: Props) => {
    const infiniteLoaderRef = useRef<InfiniteLoader | null>(null);
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        if (hasMounted) {
            if (infiniteLoaderRef.current) {
                infiniteLoaderRef.current.resetloadMoreItemsCache();
            }
        }
        setHasMounted(true);
    }, [searchTerms, people.length, hasMounted]);

    const itemCount = hasNextPage ? people.length + 1 : people.length;

    const loadMoreItems = isNextPageLoading ? () => {} : loadMore;

    const isItemLoaded = (index: number) => {
        return !hasNextPage || index < people.length;
    };

    const Item = ({columnIndex, rowIndex, style, data}: GridChildComponentProps) => {
        const columnCount = Math.floor(data.width / 320);
        const index = (rowIndex * columnCount) + columnIndex;
        if (isItemLoaded(index)) {
            const user = people[index] as UserProfile;
            if (!user) {
                return null;
            }

            return (
                <div
                    style={style}
                    className='Grid__item'
                    key={user.id}
                    id={user.id}
                >
                    <ProfileCard
                        user={user}
                        linked={true}
                        filter={searchTerms}
                    />
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
                    itemCount={1000}
                    loadMoreItems={loadMoreItems}
                >
                    {({onItemsRendered, ref}) => {
                        const columnWidth = 320;
                        const rowHeight = 320;
                        const columnCount = Math.floor(width / columnWidth);

                        return (
                            <FixedSizeGrid
                                ref={ref}
                                itemData={{width}}
                                className='Grid'
                                width={width}
                                height={height - 120}
                                rowCount={Math.ceil(itemCount / columnCount)}
                                columnCount={columnCount}
                                columnWidth={columnWidth}
                                rowHeight={rowHeight}
                                onItemsRendered={(gridData) => {
                                    const {visibleRowStartIndex, visibleRowStopIndex, visibleColumnStopIndex, overscanRowStartIndex, overscanRowStopIndex, overscanColumnStopIndex} = gridData;

                                    const overscanStartIndex = overscanRowStartIndex * (overscanColumnStopIndex + 1);
                                    const overscanStopIndex = overscanRowStopIndex * (overscanColumnStopIndex + 1);
                                    const visibleStartIndex = visibleRowStartIndex * (visibleColumnStopIndex + 1);
                                    const visibleStopIndex = visibleRowStopIndex * (visibleColumnStopIndex + 1);

                                    onItemsRendered({overscanStartIndex, overscanStopIndex, visibleStartIndex, visibleStopIndex});
                                }}
                            >
                                {Item}
                            </FixedSizeGrid>
                        );
                    }}
                </InfiniteLoader>
            )}
        </AutoSizer>
    );
};

export default PeopleList;
