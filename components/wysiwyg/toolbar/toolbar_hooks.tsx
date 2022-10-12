// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

export function useGetLatest<T>(val: T) {
    const ref = React.useRef<T>(val);
    ref.current = val;
    return React.useCallback(() => ref.current, []);
}
