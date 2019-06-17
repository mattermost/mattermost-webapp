// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {t} from 'utils/i18n';
import TeamList from 'components/admin_console/team_settings/team_list';
import AdminPanel from 'components/widgets/admin_console/admin_panel.jsx';

export default class TeamsSettings extends React.PureComponent {
    render = () => {
        return (
            <div className='wrapper--fixed'>
                <div className='admin-console__header'>
                    <FormattedMessage
                        id='admin.team_settings.groupsPageTitle'
                        defaultMessage='Teams'
                    />
                </div>

                <div className='admin-console__wrapper'>
                    <div className='admin-console__content'>
                        <AdminPanel
                            id='teams'
                            titleId={t('admin.team_settings.title')}
                            titleDefault='Teams'
                            subtitleId={t('admin.team_settings.description')}
                            subtitleDefault={'bla bla'}

                        >
                            <TeamList/>
                        </AdminPanel>
                    </div>
                </div>
            </div>
        );
    };
}
