// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useCallback, useMemo} from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import InfiniteLoader from 'react-window-infinite-loader';
import {FixedSizeList} from 'react-window';

import {$ID} from 'mattermost-redux/types/utilities';
import {UserThread} from 'mattermost-redux/types/threads';

import Row from './virtualized_thread_list_row';

type Props = {
    ids: Array<$ID<UserThread>>;
    loadMoreItems: (startIndex: number, stopIndex: number) => Promise<any>;
    selectedThreadId?: $ID<UserThread>;
    total: number;
};

function VirtualizedThreadList({
    ids,
    selectedThreadId,
    loadMoreItems,
    total,
}: Props) {
    const itemKey = useCallback((index) => ids[index], [ids]);

    const data = useMemo(() => ({ids, selectedThreadId}), [ids, selectedThreadId]);

    const isItemLoaded = useCallback((index) => {
        return ids.length === total || index < ids.length;
    }, [ids]);

    const handleLoadMoreItems = useCallback((startIndex, stopIndex) => {
        return loadMoreItems(startIndex, stopIndex);
    }, [loadMoreItems]);

    return (
        <AutoSizer>
            {({height, width}) => (
                <InfiniteLoader
                    itemCount={total}
                    loadMoreItems={handleLoadMoreItems}
                    isItemLoaded={isItemLoaded}
                >
                    {({onItemsRendered, ref}) => (
                        <FixedSizeList
                            onItemsRendered={onItemsRendered}
                            ref={ref}
                            height={height}
                            itemCount={ids.length}
                            itemData={data}
                            itemKey={itemKey}
                            itemSize={133}
                            style={{willChange: 'auto'}}
                            width={width}
                        >
                            {Row}
                        </FixedSizeList>
                    )}
                </InfiniteLoader>
            )}
        </AutoSizer>
    );
}

function areEqual(prevProps: Props, nextProps: Props) {
    return (
        prevProps.selectedThreadId === nextProps.selectedThreadId &&
        prevProps.ids.join() === nextProps.ids.join()
    );
}

export default memo(VirtualizedThreadList, areEqual);
