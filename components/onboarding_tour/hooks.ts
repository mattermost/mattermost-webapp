// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useSelector} from 'react-redux';

import {GlobalState} from 'types/store';
import {getInt} from 'mattermost-redux/selectors/entities/preferences';

export const useShowTutorialStep = (category: string, name: string, stepToShow: number): boolean => {
    const boundGetInt = (state: GlobalState) => getInt(state, category, name, 0);
    const step = useSelector<GlobalState, number>(boundGetInt);
    return step === stepToShow;
};
