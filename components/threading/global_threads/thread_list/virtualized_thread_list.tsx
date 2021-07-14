// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useCallback, useMemo} from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import {FixedSizeList} from 'react-window';

import {$ID} from 'mattermost-redux/types/utilities';
import {UserThread} from 'mattermost-redux/types/threads';

import Row from './virtualized_thread_list_row';

type Props = {
    ids: Array<$ID<UserThread>>;
    selectedThreadId?: $ID<UserThread>;
};

function VirtualizedThreadList({
    ids,
    selectedThreadId,
}: Props) {
    const itemKey = useCallback((index) => ids[index], [ids]);

    const data = useMemo(() => ({ids, selectedThreadId}), [ids, selectedThreadId]);

    return (
        <AutoSizer>
            {({height, width}) => (
                <FixedSizeList
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
