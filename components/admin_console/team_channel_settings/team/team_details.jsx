// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import {bindActionCreators} from 'redux';

import {getTeam} from 'mattermost-redux/selectors/entities/teams';

import {getTeam as fetchTeam} from 'mattermost-redux/actions/teams';

import {getAllGroups, getGroupsAssociatedToTeam} from 'mattermost-redux/selectors/entities/groups';

import {getGroupsAssociatedToTeam as fetchAssociatedGroups} from 'mattermost-redux/actions/groups';

import {connect} from 'react-redux';

import {t} from 'utils/i18n';
import AdminPanel from 'components/widgets/admin_console/admin_panel.jsx';
import BlockableLink from 'components/admin_console/blockable_link';
import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';

import SaveButton from 'components/save_button';
import {localizeMessage} from 'utils/utils';
import FormError from 'components/form_error';

import ToggleModalButton from 'components/toggle_modal_button.jsx';

import AddGroupsToTeamModal from 'components/add_groups_to_team_modal';

import {setNavigationBlocked} from 'actions/admin_actions';

import LineSwitch from '../line_switch.jsx';
import GroupList from '../group/groups.jsx';

import {TeamProfile} from './team_profile';

const NeedGroupsError = () => (
    <FormError
        error={(
            <FormattedMessage
                id='admin.team_settings.team_detail.need_groups'
                defaultMessage='You must add at least one group to manage this team by sync group members.'
            />)}
    />
);

const UsersWillBeRemovedError = ({amount, team}) => (
    <FormError
        iconClassName='fa-exclamation-triangle'
        textClassName='has-warning'
        error={(
            <span>
                <FormattedMessage
                    id='admin.team_settings.team_detail.users_will_be_removed'
                    defaultMessage='{amount} Users will be removed from this team. They are not in groups linked to this team.'
                    values={{amount}}
                />
                <ToggleModalButton
                    className='btn btn-link'
                    dialogType={AddGroupsToTeamModal}
                    dialogProps={{team}}
                >
                    <FormattedMessage
                        id='admin.team_settings.team_details.view_removed_users'
                        defaultMessage='View These Users'
                    />
                </ToggleModalButton>
            </span>
        )}
    />

);

class TeamDetails extends React.Component {
    static propTypes = {
        teamID: PropTypes.string.isRequired,
        team: PropTypes.object.isRequired,
        groups: PropTypes.arrayOf(PropTypes.object),
        allGroups: PropTypes.object.isRequired,
        actions: PropTypes.shape({
            setNavigationBlocked: PropTypes.func.isRequired,
            getTeam: PropTypes.func.isRequired,
            getGroups: PropTypes.func.isRequired,
        }).isRequired,
    };

    static defaultProps = {
        team: {display_name: '', id: ''},
    };

    constructor(props) {
        super(props);
        const team = props.team;
        this.state = {
            groups: props.groups,
            syncChecked: Boolean(team.group_constrained),
            allAllowedChecked: team.allow_open_invite,
            allowedDomainsChecked: team.allowed_domains !== '',
            allowedDomains: team.allowed_domains,
            saving: false,
            saveNeeded: false,
            serverError: null,
        };
    }

    componentDidMount() {
        const {teamID, actions} = this.props;
        actions.getTeam(teamID).
            then(() => actions.getGroups(teamID)).
            then(() => this.setState({groups: this.props.groups}));
    }

    handleSubmit = () => {
        this.setState({saving: true});

        let serverError = null;
        let saveNeeded = false;

        // TODO: save changes
        if (this.state.groups.length === 0) {
            serverError = <NeedGroupsError/>;
            saveNeeded = true;
        }

        this.setState({serverError, saving: false, saveNeeded});
        this.props.actions.setNavigationBlocked(saveNeeded);
    }

    setToggles = (syncChecked, allAllowedChecked, allowedDomainsChecked, allowedDomains) => {
        this.setState({
            saveNeeded: true,
            syncChecked,
            allAllowedChecked: !syncChecked && allAllowedChecked,
            allowedDomainsChecked: !syncChecked && allowedDomainsChecked,
            allowedDomains,
        });
        this.props.actions.setNavigationBlocked(true);
    }

    handleGroupRemoved = (gid) => {
        const groups = this.state.groups.filter((g) => g.id !== gid);
        const serverError = (
            <UsersWillBeRemovedError
                team={this.props.team}
                amount={40}
            />
        );
        this.setState({groups, saveNeeded: true, serverError});
        this.props.actions.setNavigationBlocked(true);
    }

    handleGroupChange = (groupIDs) => {
        const groups = [...this.state.groups, ...groupIDs.map((gid) => this.props.allGroups[gid])];
        this.setState({groups, saveNeeded: true});
        this.props.actions.setNavigationBlocked(true);
    }

    render = () => {
        const {team} = this.props;
        const {groups, allAllowedChecked, allowedDomainsChecked, allowedDomains, syncChecked} = this.state;

        const SyncGroupsToggle = () => (
            <LineSwitch
                toggled={syncChecked}
                onToggle={() => this.setToggles(!syncChecked, allAllowedChecked, allowedDomainsChecked, allowedDomains)}
                title={(
                    <FormattedMessage
                        id='admin.team_settings.team_details.syncGroupMembers'
                        defaultMessage='Sync Group Members'
                    />
                )}
                subTitle={(
                    <FormattedMarkdownMessage
                        id='admin.team_settings.team_details.syncGroupMembersDescr'
                        defaultMessage='When enabled, adding and removing users from groups will add or remove them from this team. The only way of inviting members to this team is by adding the groups they belong to. [Learn More](www.mattermost.com/pl/default-ldap-group-constrained-team-channel.html)'
                    />
                )}
            />);

        const AllowAllToggle = () =>
            !syncChecked && (
                <LineSwitch
                    toggled={allAllowedChecked}
                    onToggle={() => this.setToggles(syncChecked, !allAllowedChecked, allowedDomainsChecked, allowedDomains)}
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
                />);

        const AllowedDomainsToggle = () =>
            !syncChecked && (
                <LineSwitch
                    toggled={allowedDomainsChecked}
                    onToggle={() => this.setToggles(syncChecked, allAllowedChecked, !allowedDomainsChecked, allowedDomains)}
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
                        value={allowedDomains}
                        placeholder='mattermost.org'
                        className='form-control'
                        onChange={(e) => this.setToggles(syncChecked, allAllowedChecked, allowedDomainsChecked, e.currentTarget.value)}
                    />
                </LineSwitch>);

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
                                    <SyncGroupsToggle/>
                                    <AllowAllToggle/>
                                    <AllowedDomainsToggle/>
                                </div>
                            </div>
                        </AdminPanel>

                        <AdminPanel
                            id='team_groups'
                            titleId={syncChecked ? t('admin.team_settings.team_detail.syncedGroupsTitle') : t('admin.team_settings.team_detail.groupsTitle')}
                            titleDefault={syncChecked ? 'Synced Groups' : 'Groups'}
                            subtitleId={syncChecked ? t('admin.team_settings.team_detail.syncedGroupsDescription') : t('admin.team_settings.team_detail.groupsDescription')}
                            subtitleDefault={syncChecked ? 'Add and remove team members based on their group membership..' : 'Group members will be added to the team.'}
                            button={
                                <ToggleModalButton
                                    className='btn btn-primary'
                                    dialogType={AddGroupsToTeamModal}
                                    dialogProps={{team, onAddCallback: this.handleGroupChange, skipCommit: true, excludeGroups: groups}}
                                >
                                    <FormattedMessage
                                        id='admin.team_settings.team_details.add_group'
                                        defaultMessage='Add Group'
                                    />
                                </ToggleModalButton>}
                        >
                            <GroupList
                                team={team}
                                isModeSync={syncChecked}
                                groups={groups}
                                onGroupRemoved={this.handleGroupRemoved}
                            />
                        </AdminPanel>

                    </div>
                </div>

                <div className='admin-console-save'>
                    <SaveButton
                        saving={this.state.saving}
                        disabled={!this.state.saveNeeded}
                        onClick={this.handleSubmit}
                        savingMessage={localizeMessage('admin.team_settings.team_detail.saving', 'Saving Config...')}
                    />
                    <BlockableLink
                        className='cancel-button'
                        to='/admin_console/user_management/teams'
                    >
                        <FormattedMessage
                            id='admin.team_settings.team_detail.cancel'
                            defaultMessage='Cancel'
                        />
                    </BlockableLink>

                    <div className='error-message'>
                        {this.state.serverError}
                    </div>
                </div>
            </div>
        );
    };
}

function mapStateToProps(state, props) {
    const teamID = props.match.params.team_id;
    const team = getTeam(state, teamID);
    const groups = getGroupsAssociatedToTeam(state, teamID);
    const allGroups = getAllGroups(state, teamID);
    return {
        team,
        groups,
        allGroups,
        teamID,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getTeam: fetchTeam,
            getGroups: fetchAssociatedGroups,
            setNavigationBlocked,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(TeamDetails);
