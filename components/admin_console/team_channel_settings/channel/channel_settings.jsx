// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import {t} from 'utils/i18n';
import ChannelsList from 'components/admin_console/team_channel_settings/channel/list';
import AdminPanel from 'components/widgets/admin_console/admin_panel';

export class ChannelsSettings extends React.Component {
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
                        id='admin.channel_settings.groupsPageTitle'
                        defaultMessage='{siteName} Channels'
                        values={{siteName: this.props.siteName}}
                    />
                </div>

                <div className='admin-console__wrapper'>
                    <div className='admin-console__content'>
                        <AdminPanel
                            id='channels'
                            titleId={t('admin.channel_settings.title')}
                            titleDefault='Channels'
                            subtitleId={t('admin.channel_settings.description')}
                            subtitleDefault={'Showing {startCount, number} - {endCount, number} of {total, number} channels. Manage channel settings.'}
                            subtitleValues={{...this.state}}
                        >
                            <ChannelsList onPageChangedCallback={this.onPageChangedCallback}/>
                        </AdminPanel>
                    </div>
                </div>
            </div>
        );
    };
}
