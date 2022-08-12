// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {useTeammateNameDisplaySetting, useUser} from '../../hooks';

import ProfileTag from './profile_tag';

interface Props {
    userId: string;
}

const ProfileTagConnector = (props: Props) => {
    const user = useUser(props.userId);
    const teamnameNameDisplaySetting = useTeammateNameDisplaySetting();

    return (
        <ProfileTag
            user={user}
            teamnameNameDisplaySetting={teamnameNameDisplaySetting}
            {...props}
        />
    );
};

export default ProfileTagConnector;
