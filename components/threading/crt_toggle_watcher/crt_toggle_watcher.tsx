// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useEffect, useRef} from 'react';
import {useSelector, useDispatch} from 'react-redux';

import {isEmpty} from 'lodash';

import {isCollapsedThreadsEnabled, getMyPreferences} from 'mattermost-redux/selectors/entities/preferences';

import {resetReloadPostsInChannel} from 'mattermost-redux/actions/posts';
import {getMyTeamUnreads} from 'mattermost-redux/actions/teams';

const CrtToggleWatcher = () => {
    const dispatch = useDispatch();
    const isCRTEnabled = useSelector(isCollapsedThreadsEnabled);
    const preferencesLoaded = !isEmpty(useSelector(getMyPreferences));
    const loaded = useRef(false);
    useEffect(() => {
        if (loaded.current) {
            dispatch(resetReloadPostsInChannel());
            if (isCRTEnabled) {
                dispatch(getMyTeamUnreads(isCRTEnabled));
            }
        } else if (preferencesLoaded) {
            loaded.current = true;
        }
    }, [preferencesLoaded, isCRTEnabled]);
    return null;
};

export default CrtToggleWatcher;
