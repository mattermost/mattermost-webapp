// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect, useRef, useState} from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import {FixedSizeGrid, GridChildComponentProps} from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';

import {UserProfile} from '@mattermost/types/users';
import ProfileCard from 'components/people/profile_card/profile_card';
import {imageURLForUser} from 'utils/utils';
import {browserHistory} from 'utils/browser_history';

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

    const openUser = useCallback((user: UserProfile) => {
        browserHistory.push(`/people/@${user.username}`);
    }, []);

    const Item = ({columnIndex, rowIndex, style}: GridChildComponentProps) => {
        const index = (rowIndex * 4) + columnIndex;
        if (isItemLoaded(index)) {
            const user = people[index] as UserProfile;
            if (!user) {
                return null;
            }

            return (
                <div
                    style={{
                        ...style,
                    }}
                    className='Grid__item'
                    key={user.id}
                >
                    <ProfileCard
                        user={user}
                        avatarSrc={imageURLForUser(user.id)}
                        role={'system_user'}
                        onSubmit={openUser}
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
                    itemCount={itemCount}
                    loadMoreItems={loadMoreItems}
                >
                    {({onItemsRendered, ref}) => (
                        <FixedSizeGrid
                            ref={ref}
                            itemData={people}
                            className='Grid'
                            columnCount={4}
                            height={height}
                            rowCount={62 / 4}
                            width={width}
                            columnWidth={width / 4}
                            rowHeight={230}
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
                    )}
                </InfiniteLoader>
            )}
        </AutoSizer>
    );
};

export default PeopleList;
