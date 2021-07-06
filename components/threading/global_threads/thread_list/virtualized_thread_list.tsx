// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useRef, useCallback, useMemo} from 'react';
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
};

function VirtualizedThreadList({
    ids,
    selectedThreadId,
}: Props) {
    const innerRef = useRef();

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

    // dynamic-virtualized-list renders items in reverse order
    // so we need to reverse the ids before feeding the list
    // so that we get the correct order afterwards.
    //
    // TODO: have dynamic-virtualized-list to maybe accept a direction prop
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
                    canLoadMorePosts={canLoadMorePosts}
                    height={height}
                    initRangeToRender={initRangeToRender}
                    initScrollToIndex={initScrollToIndex}
                    innerRef={innerRef}
                    itemData={revIds}
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

export default memo(VirtualizedThreadList);
