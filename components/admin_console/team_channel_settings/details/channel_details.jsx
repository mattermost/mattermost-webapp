// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import {bindActionCreators} from 'redux';

import {getChannel} from 'mattermost-redux/selectors/entities/channels';

import {getChannel as fetchChannel} from 'mattermost-redux/actions/channels';

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

import {setNavigationBlocked} from '../../../../actions/admin_actions';

import {TeamProfile} from './team_profile';
import LineSwitch from './line_switch.jsx';

const MANAGE_MODE = {
    NONE: -1,
    SYNC_GROUPS: 0,
    ALLOW_ALL: 1,
    DOMAIN_RESTRICTED: 2,
};

class ChannelDetails extends React.Component {
    static propTypes = {
        channelID: PropTypes.string.isRequired,
        channel: PropTypes.object.isRequired,
        actions: PropTypes.shape({
            setNavigationBlocked: PropTypes.func.isRequired,
            getChannel: PropTypes.func.isRequired,
        }).isRequired,
    };

    static defaultProps = {
        team: {display_name: '', id: ''},
    };

    constructor(props) {
        super(props);
        this.state = {
            teamMode: MANAGE_MODE.SYNC_GROUPS,
            saving: false,
            saveNeeded: false,
            serverError: null,
        };
    }

    componentDidMount() {
        const {channelID, actions} = this.props;
        actions.getChannel(channelID);
    }

    handleSubmit = () => {
        this.setState({saving: true});

        const serverError = null;
        const saveNeeded = false;

        // TODO: save changes

        this.setState({serverError, saving: false, saveNeeded});
        this.props.actions.setNavigationBlocked(saveNeeded);
    }

    toggleMode = (mode) => {
        const newMode = (mode === this.state.teamMode) ? MANAGE_MODE.NONE : mode;

        this.setState({saveNeeded: true, teamMode: newMode});
        this.props.actions.setNavigationBlocked(true);
    }

    render = () => {
        const {channel} = this.props;

        return (
            <div className='wrapper--fixed'>
                <div className='admin-console__header with-back'>
                    <div>
                        <BlockableLink
                            to='/admin_console/user_management/teams'
                            className='fa fa-angle-left back'
                        />
                        <FormattedMessage
                            id='admin.team_settings.team_detail.zgroup_configuration'
                            defaultMessage='Channel Configuration'
                        />
                    </div>
                </div>

                {/*<div className='admin-console__wrapper'>*/}
                {/*    <div className='admin-console__content'>*/}

                {/*        <TeamProfile*/}
                {/*            team={team}*/}
                {/*        />*/}

                {/*        <AdminPanel*/}
                {/*            id='team_manage'*/}
                {/*            titleId={t('admin.team_settings.team_detail.manageTitle')}*/}
                {/*            titleDefault='Team Management'*/}
                {/*            subtitleId={t('admin.team_settings.team_detail.manageDescription')}*/}
                {/*            subtitleDefault='Choose between inviting members manually or syncing members automatically from groups.'*/}
                {/*        >*/}
                {/*            <div className='group-teams-and-channels'>*/}

                {/*                <div className='group-teams-and-channels--body'>*/}
                {/*                    <LineSwitch*/}
                {/*                        toggled={isModeSync}*/}
                {/*                        onToggle={() => this.toggleMode(MANAGE_MODE.SYNC_GROUPS)}*/}
                {/*                        title={(*/}
                {/*                            <FormattedMessage*/}
                {/*                                id='admin.team_settings.team_details.syncGroupMembers'*/}
                {/*                                defaultMessage='Sync Group Members'*/}
                {/*                            />*/}
                {/*                        )}*/}
                {/*                        subTitle={(*/}
                {/*                            <FormattedMarkdownMessage*/}
                {/*                                id='admin.team_settings.team_details.syncGroupMembersDescr'*/}
                {/*                                defaultMessage='When enabled, adding and removing users from groups will add or remove them from this team. The only way of inviting members to this team is by adding the groups they belong to. [Learn More](www.mattermost.com/pl/default-ldap-group-constrained-team-channel.html)'*/}
                {/*                            />*/}
                {/*                        )}*/}
                {/*                    />*/}
                {/*                    {!isModeSync && (*/}
                {/*                        <LineSwitch*/}
                {/*                            toggled={teamMode === MANAGE_MODE.ALLOW_ALL}*/}
                {/*                            onToggle={() => this.toggleMode(MANAGE_MODE.ALLOW_ALL)}*/}
                {/*                            title={(*/}
                {/*                                <FormattedMessage*/}
                {/*                                    id='admin.team_settings.team_details.anyoneCanJoin'*/}
                {/*                                    defaultMessage='Anyone can join this team'*/}
                {/*                                />*/}
                {/*                            )}*/}
                {/*                            subTitle={(*/}
                {/*                                <FormattedMessage*/}
                {/*                                    id='admin.team_settings.team_details.anyoneCanJoinDescr'*/}
                {/*                                    defaultMessage='This team can be discovered allowing anyone with an account to join this team.'*/}
                {/*                                />*/}
                {/*                            )}*/}
                {/*                        />)}*/}
                {/*                    {!isModeSync && (*/}
                {/*                        <LineSwitch*/}
                {/*                            toggled={teamMode === MANAGE_MODE.DOMAIN_RESTRICTED}*/}
                {/*                            onToggle={() => this.toggleMode(MANAGE_MODE.DOMAIN_RESTRICTED)}*/}
                {/*                            title={(*/}
                {/*                                <FormattedMessage*/}
                {/*                                    id='admin.team_settings.team_details.specificDomains'*/}
                {/*                                    defaultMessage='Only specific email domains can join this team'*/}
                {/*                                />*/}
                {/*                            )}*/}
                {/*                            subTitle={(*/}
                {/*                                <FormattedMessage*/}
                {/*                                    id='admin.team_settings.team_details.specificDomainsDescr'*/}
                {/*                                    defaultMessage='Users can only join the team if their email matches one of the specified domains'*/}
                {/*                                />*/}
                {/*                            )}*/}
                {/*                        >*/}
                {/*                            <div className='help-text'>*/}
                {/*                                <FormattedMessage*/}
                {/*                                    id='admin.team_settings.team_details.csvDomains'*/}
                {/*                                    defaultMessage='Comma Separated Email Domain List'*/}
                {/*                                />*/}
                {/*                            </div>*/}
                {/*                            <input*/}
                {/*                                type='text'*/}
                {/*                                placeholder='mattermost.org'*/}
                {/*                                className='form-control'*/}
                {/*                            />*/}
                {/*                        </LineSwitch>)}*/}
                {/*                </div>*/}
                {/*            </div>*/}
                {/*        </AdminPanel>*/}

                {/*        <AdminPanel*/}
                {/*            id='team_groups'*/}
                {/*            titleId={isModeSync ? t('admin.team_settings.team_detail.syncedGroupsTitle') : t('admin.team_settings.team_detail.groupsTitle')}*/}
                {/*            titleDefault={isModeSync ? 'Synced Groups' : 'Groups'}*/}
                {/*            subtitleId={isModeSync ? t('admin.team_settings.team_detail.syncedGroupsDescription') : t('admin.team_settings.team_detail.groupsDescription')}*/}
                {/*            subtitleDefault={isModeSync ? 'Add and remove team members based on their group membership..' : 'Group members will be added to the team.'}*/}
                {/*            button={*/}
                {/*                <ToggleModalButton*/}
                {/*                    className='btn btn-primary'*/}
                {/*                    dialogType={AddGroupsToTeamModal}*/}
                {/*                    dialogProps={{team}}*/}
                {/*                >*/}
                {/*                    <FormattedMessage*/}
                {/*                        id='admin.team_settings.team_details.add_group'*/}
                {/*                        defaultMessage='Add Group'*/}
                {/*                    />*/}
                {/*                </ToggleModalButton>}*/}
                {/*        >*/}
                {/*            <div className='group-teams-and-channels'>*/}
                {/*                <div className='group-teams-and-channels-empty'>*/}
                {/*                    <FormattedMessage*/}
                {/*                        id={isModeSync ? t('admin.team_settings.team_details.no-synced-groups') : t('admin.team_settings.team_details.no-groups')}*/}
                {/*                        defaultMessage={isModeSync ? 'At least one group must be specified' : 'No groups specified yet'}*/}
                {/*                    />*/}
                {/*                </div>*/}
                {/*            </div>*/}
                {/*        </AdminPanel>*/}

                {/*    </div>*/}
                {/*</div>*/}

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
                        <FormError error={this.state.serverError}/>
                    </div>
                </div>
            </div>
        );
    };
}

function mapStateToProps(state, props) {
    const channelID = props.match.params.channel_id;
    const channel = getChannel(state, channelID);

    return {
        channel,
        channelID,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getTeam: fetchChannel,
            setNavigationBlocked,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ChannelDetails);
