// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import {Client4} from 'mattermost-redux/client';

import {t} from 'utils/i18n';
import AdminPanel from 'components/widgets/admin_console/admin_panel.jsx';
import BlockableLink from 'components/admin_console/blockable_link';
import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';

import LineSwitch from './line_switch.jsx';
import {TeamProfile} from './team_profile';

const MANAGE_MODE = {
    NONE: -1,
    SYNC_GROUPS: 0,
    ALLOW_ALL: 1,
    DOMAIN_RESTRICTED: 2,
};

export default class TeamDetails extends React.Component {
    static propTypes = {
        teamID: PropTypes.string.isRequired,
        team: PropTypes.object.isRequired,
        actions: PropTypes.shape({
            getTeam: PropTypes.func.isRequired,
        }).isRequired,
    };

    static defaultProps = {
        team: {display_name: '', id: ''},
    };

    constructor(props) {
        super(props);
        this.state = {
            teamMode: MANAGE_MODE.NONE,
        };
    }

    componentDidMount() {
        const {teamID, actions} = this.props;
        actions.getTeam(teamID);
    }

    render = () => {
        const {team} = this.props;
        const teamMode = this.state.teamMode;
        return (
            <div className='wrapper--fixed'>
                <div className='admin-console__header with-back'>
                    <div>
                        <BlockableLink
                            to='/admin_console/user_management/teams'
                            className='fa fa-angle-left back'
                        />
                        <FormattedMessage
                            id='admin.team_settings.team_detail.group_configuration'
                            defaultMessage='Team Configuration'
                        />
                    </div>
                </div>

                <div className='admin-console__wrapper'>
                    <div className='admin-console__content'>

                        <TeamProfile
                            team={team}
                        />

                        <AdminPanel
                            id='team_manage'
                            titleId={t('admin.team_settings.team_detail.manageTitle')}
                            titleDefault='Team Management'
                            subtitleId={t('admin.team_settings.team_detail.manageDescription')}
                            subtitleDefault='Choose between inviting members manually or syncing members automatically from groups.'
                        >
                            <div className='group-teams-and-channels'>

                                <div className='group-teams-and-channels--body'>
                                    <LineSwitch
                                        toggled={teamMode === MANAGE_MODE.SYNC_GROUPS}
                                        onToggle={() => this.setState({teamMode: MANAGE_MODE.SYNC_GROUPS})}
                                        title={(
                                            <FormattedMessage
                                                id='admin.team_settings.team_details.syncGroupMembers'
                                                defaultMessage='Sync Group Members'
                                            />
                                        )}
                                        subTitle={(
                                            <FormattedMarkdownMessage
                                                id='admin.team_settings.team_details.syncGroupMembersDescr'
                                                defaultMessage='When enabled, adding and removing users from groups will add or remove them from this team. The only way of inviting members to this team is by adding the groups they belong to. [Learn More](http://someurl.com)'
                                            />
                                        )}
                                    />
                                    <LineSwitch
                                        toggled={teamMode === MANAGE_MODE.ALLOW_ALL}
                                        onToggle={() => this.setState({teamMode: MANAGE_MODE.ALLOW_ALL})}
                                        title={(
                                            <FormattedMessage
                                                id='admin.team_settings.team_details.anyoneCanJoin'
                                                defaultMessage='Anyone can join this team'
                                            />
                                        )}
                                        subTitle={(
                                            <FormattedMessage
                                                id='admin.team_settings.team_details.anyoneCanJoinDescr'
                                                defaultMessage='This team can be discovered allowing anyone with an account to join this team.'
                                            />
                                        )}
                                    />
                                    <LineSwitch
                                        toggled={teamMode === MANAGE_MODE.DOMAIN_RESTRICTED}
                                        onToggle={() => this.setState({teamMode: MANAGE_MODE.DOMAIN_RESTRICTED})}
                                        title={(
                                            <FormattedMessage
                                                id='admin.team_settings.team_details.specificDomains'
                                                defaultMessage='Only specific email domains can join this team'
                                            />
                                        )}
                                        subTitle={(
                                            <FormattedMessage
                                                id='admin.team_settings.team_details.specificDomainsDescr'
                                                defaultMessage='Users can only join the team if their email matches one of the specified domains'
                                            />
                                        )}
                                    >
                                        <div className='help-text'>
                                            <FormattedMessage
                                                id='admin.team_settings.team_details.csvDomains'
                                                defaultMessage='Comma Separated Email Domain List'
                                            />
                                        </div>
                                        <input
                                            type='text'
                                            placeholder='mattermost.org'
                                            className='form-control'
                                        />
                                    </LineSwitch>
                                </div>
                            </div>
                        </AdminPanel>

                        <AdminPanel
                            id='team_groups'
                            titleId={t('admin.team_settings.team_detail.groupsTitle')}
                            titleDefault='Groups'
                            subtitleId={t('admin.team_settings.team_detail.groupsDescription')}
                            subtitleDefault='Group members will be added to the team.'
                            button={<button className='btn btn-primary'>
                                <FormattedMessage
                                    id='admin.team_settings.team_details.add_group'
                                    defaultMessage='Add Group'
                                />
                            </button>}
                        >
                            <div className='group-teams-and-channels'>
                                <div className='group-teams-and-channels-empty'>
                                    <FormattedMessage
                                        id='admin.team_settings.team_details.no-groups'
                                        defaultMessage='No groups specified yet'
                                    />
                                </div>
                            </div>
                        </AdminPanel>

                        <AdminPanel
                            id='team_synced_groups'
                            titleId={t('admin.team_settings.team_detail.syncedGroupsTitle')}
                            titleDefault='Synced Groups'
                            subtitleId={t('admin.team_settings.team_detail.syncedGroupsDescription')}
                            subtitleDefault='Add and remove team members based on their group membership..'

                            button={<button className='btn btn-primary'>
                                <FormattedMessage
                                    id='admin.team_settings.team_details.add_group'
                                    defaultMessage='Add Group'
                                />
                            </button>}
                        >
                            <div className='group-teams-and-channels'>
                                <div className='group-teams-and-channels-empty'>
                                    <FormattedMessage
                                        id='admin.team_settings.team_details.no-synced-groups'
                                        defaultMessage='At least one group must be specified'
                                    />
                                </div>
                            </div>

                        </AdminPanel>

                    </div>
                </div>

            </div>
        );
    };
}
