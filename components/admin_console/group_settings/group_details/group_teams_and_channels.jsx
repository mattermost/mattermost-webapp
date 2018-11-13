// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import GroupTeamsAndChannelsRow from 'components/admin_console/group_settings/group_details/group_teams_and_channels_row.jsx';

export default class GroupTeamsAndChannels extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            collapsed: {},
        };
    }

    render = () => {
        const entries = [
            {
                type: 'public-team',
                hasChildren: true,
                name: 'Contributors',
                collapsed: false,
                key: '1',
            },
            {
                type: 'private-channel',
                name: 'Authentication',
                key: '2',
            },
            {
                type: 'public-team',
                hasChildren: false,
                name: 'Customer Support',
                key: '3',
            },
            {
                type: 'private-team',
                hasChildren: true,
                name: 'Deepmind Product Team',
                collapsed: false,
                key: '4',
            },
            {
                type: 'private-channel',
                name: 'Advertisements',
                key: '5',
            },
            {
                type: 'public-channel',
                name: 'Decisions',
                key: '6',
            },
        ];
        return (
            <div className='group-teams-and-channels'>
                <div className='group-teams-and-channels--header'>
                    <FormattedMessage
                        id='admin.group_settings.group_profile.group_teams_and_channels.name'
                        defaultMessage='Name'
                    />
                </div>
                <div className='group-teams-and-channels--body'>
                    {entries.map((entry) => (
                        <GroupTeamsAndChannelsRow {...entry}/>
                    ))}
                </div>
            </div>
        );
    };
}
