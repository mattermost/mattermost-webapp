// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import {t} from 'utils/i18n';
import TeamList from 'components/admin_console/team_channel_settings/team/list';
import AdminPanel from 'components/widgets/admin_console/admin_panel.jsx';

export class TeamsSettings extends React.Component {
    static propTypes = {
        siteName: PropTypes.string.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            startCount: 0,
            endCount: 1,
            total: 0,
        };
    }

    onPageChangedCallback = ({startCount, endCount, total}) => {
        this.setState({startCount, endCount, total});
    }

    render = () => {
        return (
            <div className='wrapper--fixed'>
                <div className='admin-console__header'>
                    <FormattedMessage
                        id='admin.team_settings.groupsPageTitle'
                        defaultMessage='{siteName} Teams'
                        values={{siteName: this.props.siteName}}
                    />
                </div>

                <div className='admin-console__wrapper'>
                    <div className='admin-console__content'>
                        <AdminPanel
                            id='teams'
                            titleId={t('admin.team_settings.title')}
                            titleDefault='Teams'
                            subtitleId={t('admin.team_settings.description')}
                            subtitleDefault={'Showing {startCount, number} - {endCount, number} of {total, number} teams. Manage team settings.'}
                            subtitleValues={{...this.state}}
                        >
                            <TeamList onPageChangedCallback={this.onPageChangedCallback}/>
                        </AdminPanel>
                    </div>
                </div>
            </div>
        );
    };
}
