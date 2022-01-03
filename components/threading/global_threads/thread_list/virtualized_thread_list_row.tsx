// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo} from 'react';
import {areEqual} from 'react-window';

import {UserThread} from 'mattermost-redux/types/threads';

import ThreadItem from '../thread_item';

type Props = {
    data: {
        ids: Array<UserThread['id']>;
        selectedThreadId?: UserThread['id'];
    };
    index: number;
    style: any;
};

function Row({index, style, data}: Props) {
    const itemId = data.ids[index];
    const isSelected = data.selectedThreadId === itemId;

    return (
        <ThreadItem
            isSelected={isSelected}
            key={itemId}
            style={style}
            threadId={itemId}
        />
    );
}

export default memo(Row, areEqual);
