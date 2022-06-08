// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useDispatch, useSelector} from 'react-redux';

import {PreferenceType} from '@mattermost/types/preferences';

import {savePreferences} from 'mattermost-redux/actions/preferences';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/common';
import {getMyPreferences} from 'mattermost-redux/selectors/entities/preferences';
import {getPreferenceKey} from 'mattermost-redux/utils/preference_utils';

export default function usePreference(category: string, name: string): [string | undefined, (value: string) => void] {
    const dispatch = useDispatch();

    const userId = useSelector(getCurrentUserId);
    const preferences = useSelector(getMyPreferences);

    const key = getPreferenceKey(category, name);
    const preference = preferences[key];

    const setPreference = (value: string) => {
        const preference: PreferenceType = {
            category,
            name,
            user_id: userId,
            value,
        };
        dispatch(savePreferences(userId, [preference]));
    };

    return [preference?.value, setPreference];
}
