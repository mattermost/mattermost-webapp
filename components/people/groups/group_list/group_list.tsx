// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useRef, useState} from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import {ListChildComponentProps, VariableSizeList} from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';

import {FormattedMessage} from 'react-intl';

import classNames from 'classnames';

import {Group} from '@mattermost/types/groups';

export interface Props {
    groups: Group[];
    hasNextPage: boolean;
    isNextPageLoading: boolean;
    searchTerms: string;
    onClick: (group: Group) => void;
    loadMore: () => Promise<void>;
    selectedGroupID: string;
}

const GroupList = ({
    hasNextPage,
    isNextPageLoading,
    groups,
    searchTerms,
    loadMore,
    onClick,
    selectedGroupID,
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
    }, [searchTerms, groups.length, hasMounted]);

    const itemCount = hasNextPage ? groups.length + 1 : groups.length;

    const loadMoreItems = isNextPageLoading ? () => {} : loadMore;

    const isItemLoaded = (index: number) => {
        return !hasNextPage || index < groups.length;
    };

    const Item = ({index, style}: ListChildComponentProps) => {
        if (isItemLoaded(index)) {
            const group = groups[index] as Group;
            if (!group) {
                return null;
            }

            return (
                <div
                    style={style}
                    className={classNames('group__item', selectedGroupID === group.id && 'active')}
                    key={group.id}
                    id={group.id}
                    onClick={() => onClick(group)}
                >
                    <span className='group-display-name'>
                        {group.display_name}
                    </span>
                    <span className='group-name'>
                        {'@'}{group.name}
                    </span>
                    <div className='group-member-count'>
                        <FormattedMessage
                            id='user_groups_modal.memberCount'
                            defaultMessage='{member_count} {member_count, plural, one {member} other {members}}'
                            values={{
                                member_count: group.member_count,
                            }}
                        />
                    </div>
                </div>
            );
        }

        return null;
    };

    if (groups.length === 0) {
        return null;
    }

    return (
        <AutoSizer>
            {({height}) => (
                <InfiniteLoader
                    ref={infiniteLoaderRef}
                    isItemLoaded={isItemLoaded}
                    itemCount={itemCount}
                    loadMoreItems={loadMoreItems}
                >
                    {({onItemsRendered, ref}) => {
                        return (
                            <VariableSizeList
                                ref={(list) => {
                                    ref(list);
                                    variableSizeListRef.current = list;
                                }}
                                itemCount={itemCount}
                                width={400}
                                height={height}
                                onItemsRendered={onItemsRendered}
                                itemSize={() => 50}
                                className={'group__list'}
                            >
                                {Item}
                            </VariableSizeList>
                        );
                    }}
                </InfiniteLoader>
            )}
        </AutoSizer>
    );
};

export default GroupList;
