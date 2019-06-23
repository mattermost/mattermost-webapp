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

import {setNavigationBlocked} from 'actions/admin_actions';
import ToggleModalButton from 'components/toggle_modal_button';
import AddGroupsToChannelModal from 'components/add_groups_to_channel_modal';
import GroupList from '../group/groups';

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
        if (!this.props.channel.id) {
            actions.getChannel(channelID);
        }
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
        const isModeSync = false;
        const channel = this.props.channel;
        return (
            <div className='wrapper--fixed'>
                <div className='admin-console__header with-back'>
                    <div>
                        <BlockableLink
                            to='/admin_console/user_management/channels'
                            className='fa fa-angle-left back'
                        />
                        <FormattedMessage
                            id='admin.team_settings.channel_detail.channel_configuration'
                            defaultMessage='Channel Configuration'
                        />
                    </div>
                </div>
                <div className='admin-console__wrapper'>
                    <div className='admin-console__content'>

                        <AdminPanel
                            id='channel_profile'
                            titleId={t('admin.channel_settings.channel_detail.profileTitle')}
                            titleDefault='Channel Profile'
                            subtitleId={t('admin.channel_settings.channel_detail.profileDescription')}
                            subtitleDefault='Summary of the channel, including the channel name.'
                        >

                            <div className='group-teams-and-channels'>

                                <div className='group-teams-and-channels--body'>
                                    <FormattedMarkdownMessage
                                        id='admin.channel_settings.channel_detail.channelName'
                                        defaultMessage='**Name**'
                                    />
                                    <br/>
                                    {channel.name}
                                </div>
                            </div>

                        </AdminPanel>
                        <AdminPanel
                            id='team_groups'
                            titleId={isModeSync ? t('admin.team_settings.team_detail.syncedGroupsTitle') : t('admin.team_settings.team_detail.groupsTitle')}
                            titleDefault={isModeSync ? 'Synced Groups' : 'Groups'}
                            subtitleId={isModeSync ? t('admin.team_settings.team_detail.syncedGroupsDescription') : t('admin.team_settings.team_detail.groupsDescription')}
                            subtitleDefault={isModeSync ? 'Add and remove team members based on their group membership..' : 'Group members will be added to the team.'}
                            button={
                                <ToggleModalButton
                                    className='btn btn-primary'
                                    dialogType={AddGroupsToChannelModal}
                                    dialogProps={{channel}}
                                >
                                    <FormattedMessage
                                        id='admin.team_settings.team_details.add_group'
                                        defaultMessage='Add Group'
                                    />
                                </ToggleModalButton>}
                        >
                            {channel.id && <GroupList
                                channel={channel}
                                isModeSync={isModeSync}
                            />}

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
                        to='/admin_console/user_management/channels'
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
    const channel = getChannel(state, channelID) || {};

    return {
        channel,
        channelID,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getChannel: fetchChannel,
            setNavigationBlocked,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ChannelDetails);
