// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import * as MenuItem from './menu_items';

export default class ChannelHeaderDropdown extends React.PureComponent {
    static propTypes = {
        user: PropTypes.object.isRequired,
        channel: PropTypes.object.isRequired,
        isDefault: PropTypes.bool.isRequired,
        isReadonly: PropTypes.bool.isRequired,
        isMuted: PropTypes.bool.isRequired,
        isArchived: PropTypes.bool.isRequired,
    }

    render() {
        const {
            user,
            channel,
            isDefault,
            isMuted,
            isReadonly,
            isArchived,
        } = this.props;

        return (
            <ul
                id='channelHeaderDropdownMenu'
                className='dropdown-menu'
                role='menu'
                aria-labelledby='channel_header_dropdown'
            >
                <MenuItem.Group>
                    <MenuItem.ViewChannelInfo channel={channel}/>
                    <MenuItem.NotificationPreferences
                        user={user}
                        channel={channel}
                        isArchived={isArchived}
                    />
                    <MenuItem.ToggleMuteChannel
                        user={user}
                        channel={channel}
                        isMuted={isMuted}
                        isArchived={isArchived}
                    />
                </MenuItem.Group>

                <MenuItem.Group>
                    <MenuItem.AddMembers
                        channel={channel}
                        isDefault={isDefault}
                        isArchived={isArchived}
                    />
                    <MenuItem.ViewAndManageMembers
                        channel={channel}
                        isDefault={isDefault}
                    />
                </MenuItem.Group>

                <MenuItem.Group>
                    <MenuItem.SetChannelHeader
                        channel={channel}
                        isArchived={isArchived}
                        isReadonly={isReadonly}
                    />
                    <MenuItem.SetChannelPurpose
                        channel={channel}
                        isArchived={isArchived}
                        isReadonly={isReadonly}
                    />
                    <MenuItem.RenameChannel
                        channel={channel}
                        isArchived={isArchived}
                    />
                    <MenuItem.ConvertChannel
                        channel={channel}
                        isDefault={isDefault}
                        isArchived={isArchived}
                    />
                    <MenuItem.DeleteChannel
                        channel={channel}
                        isDefault={isDefault}
                        isArchived={isArchived}
                    />
                </MenuItem.Group>

                <MenuItem.Group showDivider={false}>
                    <MenuItem.LeaveChannel
                        channel={channel}
                        isDefault={isDefault}
                    />
                    <MenuItem.CloseChannel isArchived={isArchived}/>
                </MenuItem.Group>
            </ul>
        );
    }
}
