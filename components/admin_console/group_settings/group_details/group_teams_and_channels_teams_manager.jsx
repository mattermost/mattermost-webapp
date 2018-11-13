// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

export default class GroupTeamsAndChannelsTeamsManager extends React.PureComponent {
    render = () => {
        return (
            <div className='teams-manager'>
                <div className='actions-bar'>
                    <FormattedMessage
                        id='admin.group_settings.group_profile.group_teams_and_channels.specific_teams_action_bar_title'
                        defaultMessage='Specify teams group members will be invited into'
                    />
                    <button
                        className='btn btn-primary'
                    >
                        <FormattedMessage
                            id='admin.group_settings.group_profile.group_teams_and_channels.specific_teams_action_button'
                            defaultMessage='Add Teams'
                        />
                    </button>
                </div>
                <div className='teams-list'>
                    <div className='teams-list--header'>
                        <div className='name'>
                            <FormattedMessage
                                id='admin.group_settings.group_profile.group_teams_and_channels.specific_teams_name'
                                defaultMessage='Team Name'
                            />
                        </div>
                        <div className='role'>
                            <FormattedMessage
                                id='admin.group_settings.group_profile.group_teams_and_channels.role'
                                defaultMessage='Role'
                            />
                        </div>
                        <div className='auto-remove'>
                            <FormattedMessage
                                id='admin.group_settings.group_profile.group_teams_and_channels.auto_remove'
                                defaultMessage='Auto Remove'
                            />
                        </div>
                        <div className='actions' />
                    </div>
                    <div className='teams-list--body'>
                    </div>
                </div>
            </div>
        );
    }
}
