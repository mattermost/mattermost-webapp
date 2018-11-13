// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import {Groups} from 'mattermost-redux/constants';

import {t} from 'utils/i18n';
import GroupProfile from 'components/admin_console/group_settings/group_details/group_profile';
import GroupTeamsAndChannels from 'components/admin_console/group_settings/group_details/group_teams_and_channels';
import GroupUsers from 'components/admin_console/group_settings/group_details/group_users';
import AdminPanel from 'components/admin_console/admin_panel.jsx';
import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';

export default class GroupDetails extends React.PureComponent {
    static propTypes = {
        groupID: PropTypes.string.isRequired,
        group: PropTypes.object,
        groupTeams: PropTypes.arrayOf(PropTypes.object),
        groupChannels: PropTypes.arrayOf(PropTypes.object),
        members: PropTypes.arrayOf(PropTypes.object),
        actions: PropTypes.shape({
            getGroup: PropTypes.func.isRequired,
            getMembers: PropTypes.func.isRequired,
            getGroupSyncables: PropTypes.func.isRequired,
            link: PropTypes.func.isRequired,
            unlink: PropTypes.func.isRequired,
        }).isRequired,
    };

    static defaultProps = {
        members: [],
        groupTeams: [],
        groupChannels: [],
    };

    constructor(props) {
        super(props);
        this.state = {loading: true};
    }

    componentDidMount() {
        const {groupID, actions} = this.props;
        actions.getGroup(groupID).then(() => {
            this.setState({loading: false});
        });
        actions.getGroupSyncables(groupID, Groups.SYNCABLE_TYPE_TEAM);
        actions.getGroupSyncables(groupID, Groups.SYNCABLE_TYPE_CHANNEL);
        actions.getMembers(groupID, 0, 100);
    }

    render = () => {
        return (
            <div className='wrapper--fixed'>
                <h3 className='admin-console-header'>
                    <FormattedMessage
                        id='admin.group_settings.group_detail.group_configuration'
                        defaultMessage='Group Configuration'
                    />
                </h3>

                <div className='banner info'>
                    <div className='banner__content'>
                        <FormattedMarkdownMessage
                            id='admin.group_settings.group_detail.introBanner'
                            defaultMessage={'TODO: Lorem Ipsum'}
                        />
                    </div>
                </div>

                <AdminPanel
                    id='group_profile'
                    titleId={t('admin.group_settings.group_detail.groupProfileTitle')}
                    titleDefaultMessage='Group Profile'
                    subtitleId={t('admin.group_settings.group_detail.groupProfileDescription')}
                    subtitleDefaultMessage='Set the name and description for this group.'
                >
                    <GroupProfile
                        name='fake-name'
                    />
                </AdminPanel>

                <AdminPanel
                    id='group_teams_and_channels'
                    titleId={t('admin.group_settings.group_detail.groupTeamsAndChannelsTitle')}
                    titleDefaultMessage='Team and Channel Membership'
                    subtitleId={t('admin.group_settings.group_detail.groupTeamsAndChannelsDescription')}
                    subtitleDefaultMessage='Specify team and channel membership, sync policies and roles for your group.'
                >
                    <GroupTeamsAndChannels/>
                </AdminPanel>

                <AdminPanel
                    id='group_users'
                    titleId={t('admin.group_settings.group_detail.groupUsersTitle')}
                    titleDefaultMessage='Users'
                    subtitleId={t('admin.group_settings.group_detail.groupUsersDescription')}
                    subtitleDefaultMessage='Below is a listing of all users associated with this group.'
                >
                    <GroupUsers/>
                </AdminPanel>
            </div>
        );
    };
}
