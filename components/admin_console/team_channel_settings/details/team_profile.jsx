// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import {t} from 'utils/i18n';

import AdminPanel from 'components/widgets/admin_console/admin_panel.jsx';
import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';

import * as Utils from 'utils/utils';

import TeamImage from '../team_image.jsx';

export function TeamProfile({team}) {
    const teamIconUrl = Utils.imageURLForTeam(team);

    return (
        <AdminPanel
            id='team_profile'
            titleId={t('admin.team_settings.team_detail.profileTitle')}
            titleDefault='Team Profile'
            subtitleId={t('admin.team_settings.team_detail.profileDescription')}
            subtitleDefault='Summary of the team, including team name and description.'
        >

            <div className='group-teams-and-channels'>

                <div className='group-teams-and-channels--body'>
                    <div className='row'>
                        <div className='col-sm-3'>
                            <TeamImage
                                displayName={team.display_name}
                                teamIconUrl={teamIconUrl}
                            />
                        </div>
                        <div className='col-sm-9'>
                            <div className='row'>
                                <FormattedMarkdownMessage
                                    id='admin.team_settings.team_detail.teamName'
                                    defaultMessage='**Team Name**: {name}'
                                    values={{name: team.display_name}}
                                />

                            </div>
                            <div className='row'>
                                <FormattedMarkdownMessage
                                    id='admin.team_settings.team_detail.teamDescription'
                                    defaultMessage='**Team Description**: {description}'
                                    values={{description: team.description}}
                                />

                            </div>

                        </div>
                    </div>
                </div>
            </div>

        </AdminPanel>
    );
}

TeamProfile.propTypes = {
    team: PropTypes.object.isRequired,
};
