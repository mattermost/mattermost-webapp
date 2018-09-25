// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import StatusIcon from 'components/status_icon';
import MobileChannelHeaderPlug from 'plugins/mobile_channel_header_plug';
import {Constants} from 'utils/constants';
import * as Utils from 'utils/utils';

import * as MenuItem from './menu_items';

export default class MobileChannelHeaderDropdown extends React.PureComponent {
    static propTypes = {
        user: PropTypes.object.isRequired,
        channel: PropTypes.object.isRequired,
        membership: PropTypes.object.isRequired,
        teammateId: PropTypes.string.isRequired,
        teammateStatus: PropTypes.string.isRequired,
        isDefault: PropTypes.bool.isRequired,
        isFavorite: PropTypes.bool.isRequired,
        isReadonly: PropTypes.bool.isRequired,
        isArchived: PropTypes.bool.isRequired,
    }

    getChannelTitle = () => {
        const {user, channel, teammateId} = this.props;

        if (channel.type === Constants.DM_CHANNEL) {
            const displayname = Utils.getDisplayNameByUserId(teammateId);
            if (user.id === teammateId) {
                return (
                    <FormattedMessage
                        id='channel_header.directchannel.you'
                        defaultMessage='{displayname} (you)'
                        values={{displayname}}
                    />
                );
            }
            return displayname;
        }
        return channel.display_name;
    }

    render() {
        const {
            user,
            channel,
            membership,
            teammateStatus,
            isDefault,
            isFavorite,
            isReadonly,
            isArchived,
        } = this.props;

        if (!channel) {
            return null;
        }

        return (
            <div clsssName='navbar-brand'>
                <div className='dropdown'>
                    {/* this.generateWebrtcIcon() */}
                    <a
                        href='#'
                        className='dropdown-toggle theme'
                        type='button'
                        data-toggle='dropdown'
                        aria-expanded='true'
                    >
                        <span className='heading'>
                            <StatusIcon status={teammateStatus}>
                                {this.getChannelTitle()}
                            </StatusIcon>
                        </span>
                        <span
                            className='fa fa-angle-down header-dropdown__icon'
                            title={Utils.localizeMessaeg('generic_icons.dropdown', 'Dropdown Icon')}
                        />
                    </a>

                    <ul
                        className='dropdown-menu'
                        role='menu'
                    >
                        {/* This part could be more clean with HOC */}
                        <MenuItem.ViewChannelInfo
                            channel={channel}
                        />
                        <MenuItem.ViewPinnedPosts
                            channel={channel}
                        />
                        <MenuItem.NotificationPreferences
                            user={user}
                            channel={channel}
                            membership={membership}
                        />
                        <MenuItem.AddMembers
                            channel={channel}
                            isDefault={isDefault}
                        />
                        <MenuItem.ViewMembers
                            channel={channel}
                            isDefault={isDefault}
                        />
                        <MenuItem.ManageMembers
                            channel={channel}
                            isDefault={isDefault}
                        />
                        <MenuItem.SetChannelHeader
                            channel={channel}
                            isReadonly={isReadonly}
                        />
                        <MenuItem.SetChannelPurpose
                            channel={channel}
                            isReadonly={isReadonly}
                        />
                        <MenuItem.RenameChannel
                            channel={channel}
                            isDefault={isDefault}
                            isArchived={isArchived}
                        />
                        <MenuItem.ConvertChannel
                            channel={channel}
                        />
                        <MenuItem.DeleteChannel
                            channel={channel}
                        />
                        <MenuItem.LeaveChannel
                            channel={channel}
                            isDefault={isDefault}
                        />
                        <MenuItem.ToggleFavoriteChannel
                            channel={channel}
                            isFavorite={isFavorite}
                        />

                        <MobileChannelHeaderPlug
                            channel={channel}
                            isDropdown={true}
                        />
                        <div className='close visible-xs-block'>
                            {'X'}
                        </div>
                    </ul>
                </div>
            </div>
        );
    }
}
