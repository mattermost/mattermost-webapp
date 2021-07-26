// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useCallback, useEffect, useRef, useMemo} from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import {DynamicSizeList} from 'dynamic-virtualized-list';

import {$ID} from 'mattermost-redux/types/utilities';
import {UserThread} from 'mattermost-redux/types/threads';

import ThreadItem from '../thread_item';

type Props = {
    ids: Array<$ID<UserThread>>;
    selectedThreadId?: $ID<UserThread>;
};

const ITEMS_ON_SCREEN = 8;
const OVERSCAN_COUNT_BACKWARD = 4;
const OVERSCAN_COUNT_FORWARD = 4;

const virtListStyles = {
    maxHeight: '100%',
    position: 'absolute',
    top: '0',
    willChange: 'auto',
};

function VirtualizedThreadList({
    ids,
    selectedThreadId,
}: Props) {
    const innerRef = useRef();
    const listRef = useRef<typeof DynamicSizeList>();

    useEffect(() => {
        // if ids length have changed hack to update the view
        if (listRef.current) {
            listRef.current.scrollTo(0, 1, true);
        }
    }, [ids.length]);

    const renderRow = ({itemId}: {itemId: $ID<UserThread>}) => {
        return (
            <ThreadItem
                key={itemId}
                threadId={itemId}
                isSelected={selectedThreadId === itemId}
            />
        );
    };

    const canLoadMorePosts = useCallback(() => {}, []);

    const onItemsRendered = useCallback(() => {}, []);

    // dynamic-virtualized-list renders items in reverse order
    // so we need to reverse the ids before feeding the list
    // so that we get the correct order afterwards.
    const revIds = useMemo(() => [...ids].reverse(), [ids]);

    // the last index is the top item
    const initScrollToIndex = useCallback(() => ({
        index: ids.length - 1,
        position: 'start',
    }), [ids]);

    // the last indexes are the items at top.
    const initRangeToRender = useMemo(() => {
        const lastIndex = ids.length - 1;

        return [
            lastIndex - ITEMS_ON_SCREEN,
            lastIndex,
        ];
    }, [ids]);

    return (
        <AutoSizer>
            {({height, width}) => (
                <DynamicSizeList
                    ref={listRef}
                    canLoadMorePosts={canLoadMorePosts}
                    height={height}
                    initRangeToRender={initRangeToRender}
                    initScrollToIndex={initScrollToIndex}
                    innerRef={innerRef}
                    itemData={revIds}
                    onItemsRendered={onItemsRendered}
                    overscanCountBackward={OVERSCAN_COUNT_BACKWARD}
                    overscanCountForward={OVERSCAN_COUNT_FORWARD}
                    style={virtListStyles}
                    width={width}
                >
                    {renderRow}
                </DynamicSizeList>
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
