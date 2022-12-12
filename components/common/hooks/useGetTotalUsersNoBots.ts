// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useEffect, useState} from 'react';

import {Client4} from 'mattermost-redux/client';

const useGetTotalUsersNoBots = (includeInactive = false): number => {
    const [userCount, setUserCount] = useState<number>(0);

    const getTotalUsers = async () => {
        const data = await Client4.getFilteredUsersStats({include_bots: false, include_deleted: includeInactive});
        setUserCount(data?.total_users_count);
    };

    useEffect(() => {
        getTotalUsers();
    }, []);

    return userCount;
};

export default useGetTotalUsersNoBots;
