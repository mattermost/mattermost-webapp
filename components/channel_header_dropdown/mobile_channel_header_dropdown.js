// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import StatusIcon from 'components/status_icon';

import {Constants} from 'utils/constants';
import {getDisplayNameByUserId} from 'utils/utils';

import {ChannelHeaderDropdownItems} from 'components/channel_header_dropdown';

import Menu from 'components/widgets/menu/menu';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';

import MobileChannelHeaderDropdownAnimation from './mobile_channel_header_dropdown_animation.jsx';

export default class MobileChannelHeaderDropdown extends React.PureComponent {
    static propTypes = {
        user: PropTypes.object.isRequired,
        channel: PropTypes.object.isRequired,
        teammateId: PropTypes.string,
        teammateStatus: PropTypes.string,
    }

    getChannelTitle = () => {
        const {user, channel, teammateId} = this.props;

        if (channel.type === Constants.DM_CHANNEL) {
            const displayname = getDisplayNameByUserId(teammateId);
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
            teammateStatus,
        } = this.props;

        return (
            <MenuWrapper animationComponent={MobileChannelHeaderDropdownAnimation}>
                <a>
                    <span className='heading'>
                        <StatusIcon status={teammateStatus}/>
                        {this.getChannelTitle()}
                    </span>
                    <FormattedMessage
                        id='generic_icons.dropdown'
                        defaultMessage='Dropdown Icon'
                    >
                        {(title) => (
                            <span
                                className='fa fa-angle-down header-dropdown__icon'
                                title={title}
                            />
                        )}
                    </FormattedMessage>
                </a>

                <Menu>
                    <ChannelHeaderDropdownItems isMobile={true}/>
                    <div className='close visible-xs-block'>
                        {'×'}
                    </div>
                </Menu>
            </MenuWrapper>
        );
    }
}
