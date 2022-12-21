// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';

import {getOpenModalCount} from 'selectors/views/modals';

export default function useShouldClose(): boolean {
    const [shouldClose, setShouldClose] = useState(false);
    const [initialOpenModalCount, setInitialOpenModalCount] = useState(0);
    const openModalCount = useSelector(getOpenModalCount);

    useEffect(() => {
        setInitialOpenModalCount(openModalCount);
    }, []);

    useEffect(() => {
        if (initialOpenModalCount !== openModalCount) {
            setShouldClose(true);
        }
    }, [initialOpenModalCount, openModalCount]);

    return shouldClose;
}
