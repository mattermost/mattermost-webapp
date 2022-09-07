// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {useSelector} from 'react-redux';

import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';

export const useUserSettingsRouting = () => {
    const user = useSelector(getCurrentUser);

    return {
        user,
    };
};
