// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useCallback, useMemo} from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import InfiniteLoader from 'react-window-infinite-loader';
import {FixedSizeList} from 'react-window';

import {$ID} from 'mattermost-redux/types/utilities';
import {UserThread} from 'mattermost-redux/types/threads';

import {Constants} from 'utils/constants';

import Row from './virtualized_thread_list_row';

type Props = {
    ids: Array<$ID<UserThread>>;
    loadMoreItems: (startIndex: number, stopIndex: number) => Promise<any>;
    selectedThreadId?: $ID<UserThread>;
    total: number;
};

const style = {
    willChange: 'auto',
};

function VirtualizedThreadList({
    ids,
    selectedThreadId,
    loadMoreItems,
    total,
}: Props) {
    const infiniteLoaderRef = React.useRef<any>();
    const startIndexRef = React.useRef<number>(0);
    const stopIndexRef = React.useRef<number>(0);

    const itemKey = useCallback((index) => ids[index], [ids]);

    const scrollToItem = useCallback((index: number) => {
        if (ids.length > 0 && selectedThreadId) {
            if (startIndexRef.current >= index || index > stopIndexRef.current) {
                // eslint-disable-next-line no-underscore-dangle
                infiniteLoaderRef.current?._listRef.scrollToItem(index);
            }
        }
    }, [infiniteLoaderRef, ids, selectedThreadId]);

    const data = useMemo(() => ({ids, selectedThreadId, scrollToItem}), [ids, selectedThreadId, scrollToItem]);

    const isItemLoaded = useCallback((index) => {
        return ids.length === total || index < ids.length;
    }, [ids, total]);

    return (
        <AutoSizer>
            {({height, width}) => (
                <InfiniteLoader
                    ref={infiniteLoaderRef}
                    itemCount={total}
                    loadMoreItems={loadMoreItems}
                    isItemLoaded={isItemLoaded}
                    minimumBatchSize={Constants.THREADS_PAGE_SIZE}
                >
                    {({onItemsRendered, ref}) => {
                        return (
                            <FixedSizeList
                                onItemsRendered={({
                                    overscanStartIndex,
                                    overscanStopIndex,
                                    visibleStartIndex,
                                    visibleStopIndex,
                                }) => {
                                    onItemsRendered({
                                        overscanStartIndex,
                                        overscanStopIndex,
                                        visibleStartIndex,
                                        visibleStopIndex,
                                    });
                                    startIndexRef.current = visibleStartIndex;
                                    stopIndexRef.current = visibleStopIndex;
                                }}
                                ref={ref}
                                height={height}
                                itemCount={ids.length}
                                itemData={data}
                                itemKey={itemKey}
                                itemSize={133}
                                style={style}
                                width={width}
                            >
                                {Row}
                            </FixedSizeList>);
                    }
                    }
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
