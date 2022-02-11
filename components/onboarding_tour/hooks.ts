// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useSelector} from 'react-redux';

import {GlobalState} from 'types/store';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/common';
import {getInt} from 'mattermost-redux/selectors/entities/preferences';

export const useShowTutorialStep = (stepToShow: number, category: string): boolean => {
    const currentUserId = useSelector<GlobalState, string>(getCurrentUserId);
    const boundGetInt = (state: GlobalState) => getInt(state, category, currentUserId, 0);
    const step = useSelector<GlobalState, number>(boundGetInt);

    return step === stepToShow;
};
