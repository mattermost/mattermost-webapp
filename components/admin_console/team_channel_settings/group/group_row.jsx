// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import Menu from 'components/widgets/menu/menu';
import {localizeMessage} from 'utils/utils.jsx';

export default class GroupRow extends React.Component {
    static propTypes = {
        group: PropTypes.object.isRequired,
        removeGroup: PropTypes.func.isRequired,
        setNewGroupRole: PropTypes.func.isRequired,
        type: PropTypes.string.isRequired,
    };

    removeGroup = () => {
        this.props.removeGroup(this.props.group.id);
    }

    setNewGroupRole = () => {
        this.props.setNewGroupRole(this.props.group.id);
    }

    displayCurrentRole = () => {
        const {group, type} = this.props;
        const channelAdmin = (
            <FormattedMessage
                id='admin.team_channel_settings.group_row.channelAdmin'
                defaultMessage='Channel Admin'
            />
        );
        const teamAdmin = (
            <FormattedMessage
                id='admin.team_channel_settings.group_row.teamAdmin'
                defaultMessage='Team Admin'
            />
        );
        const member = (
            <FormattedMessage
                id='admin.team_channel_settings.group_row.member'
                defaultMessage='Member'
            />
        );

        if (group.scheme_admin && type === 'channel') {
            return channelAdmin;
        } else if (group.scheme_admin && type === 'team') {
            return teamAdmin;
        }
        return member;
    }

    displayRoleToBe = () => {
        const {group, type} = this.props;
        if (!group.scheme_admin && type === 'channel') {
            return localizeMessage('admin.team_channel_settings.group_row.channelAdmin', 'Channel Admin');
        } else if (!group.scheme_admin && type === 'team') {
            return localizeMessage('admin.team_channel_settings.group_row.teamAdmin', 'Team Admin');
        }
        return localizeMessage('admin.team_channel_settings.group_row.member', 'Member');
    }

    render = () => {
        const {group} = this.props;
        return (
            <div
                className='group'
            >
                <div className='group-row'>
                    <span className='group-name row-content'>
                        {group.display_name || group.name}
                    </span>
                    <span className='group-description row-content'>
                        <FormattedMessage
                            id='admin.team_channel_settings.group_row.members'
                            defaultMessage='{memberCount, number} {memberCount, plural, one {member} other {members}}'
                            values={{memberCount: group.member_count}}
                        />
                    </span>
                    <div className='group-description row-content roles'>
                        <MenuWrapper>
                            <div>
                                <a>
                                    <span>{this.displayCurrentRole()}</span>
                                    <span className='caret'/>
                                </a>
                            </div>
                            <Menu
                                openLeft={true}
                                openUp={false}
                                ariaLabel={localizeMessage('admin.team_channel_settings.group_row.memberRole', 'Member Role')}
                            >
                                <Menu.ItemAction
                                    onClick={this.setNewGroupRole}
                                    text={this.displayRoleToBe()}
                                />
                            </Menu>
                        </MenuWrapper>
                    </div>
                    <span className='group-actions'>
                        <a
                            href='#'
                            onClick={this.removeGroup}
                        >
                            <FormattedMessage
                                id='admin.team_channel_settings.group_row.remove'
                                defaultMessage='Remove'
                            />
                        </a>
                    </span>
                </div>
            </div>
        );
    };
}
