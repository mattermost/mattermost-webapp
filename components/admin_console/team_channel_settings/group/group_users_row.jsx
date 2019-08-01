// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import {Client4} from 'mattermost-redux/client';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';

import {t} from 'utils/i18n';
import * as Utils from 'utils/utils';

export default class AdminGroupUsersRow extends React.PureComponent {
    static propTypes = {
        displayName: PropTypes.string.isRequired,
        user: PropTypes.object.isRequired,
        lastPictureUpdate: PropTypes.number.isRequired,
    };

    renderRolesColumn = (member) => {
        return member.roles.split(' ').map((role) => Utils.localizeMessage('admin.permissions.roles.' + role + '.name', role)).join(', ');
    }
    renderGroupsColumn = (member) => {
        if (member.groups.length === 1) {
            return member.groups[0].display_name;
        }
        return (
            <OverlayTrigger
                placement='top'
                overlay={
                    <Tooltip id='groupsTooltip'>
                        {member.groups.map((g) => g.display_name).join(', ')}
                    </Tooltip>
                }
            >
                <a href='#'>
                    <FormattedMessage
                        id={t('team_channel_settings.group.group_user_row.numberOfGroups')}
                        defaultMessage={'{amount, number} {amount, plural, one {Group} other {Groups}}'}
                        values={{amount: member.groups.length}}
                    />
                </a>
            </OverlayTrigger>
        );
    }

    render = () => {
        const {user, lastPictureUpdate, displayName} = this.props;
        return (
            <div
                className={'group '}
            >
                <div
                    className='group-row'
                    style={{padding: '30px 0px'}}
                >
                    <div className='group-name'>
                        <div className='row'>
                            <div className='col-sm-2'>
                                <img
                                    className='group-user-profile-picture'
                                    alt={''}
                                    src={Client4.getProfilePictureUrl(user.id, lastPictureUpdate)}
                                />
                            </div>
                            <div className='col-sm-10'>
                                <div className='row'>
                                    <b>{'@' + user.username}&nbsp;</b>
                                    {'-'}&nbsp;
                                    {displayName}
                                </div>
                                <div className='row'>
                                    {user.email}
                                </div>

                            </div>
                        </div>

                    </div>
                    <span
                        className='group-user-removal-column group-description'
                    >{this.renderRolesColumn(user)}</span>
                    <span
                        className='group-user-removal-column group-description group-description-link'
                    >{this.renderGroupsColumn(user)}</span>
                </div>
            </div>
        );
    };
}
