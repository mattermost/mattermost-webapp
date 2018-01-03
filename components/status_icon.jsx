// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import StatusAwayAvatarIcon from 'components/svg/status_away_avatar_icon';
import StatusAwayIcon from 'components/svg/status_away_icon';
import StatusDndAvatarIcon from 'components/svg/status_dnd_avatar_icon';
import StatusDndIcon from 'components/svg/status_dnd_icon';
import StatusOfflineAvatarIcon from 'components/svg/status_offline_avatar_icon';
import StatusOfflineIcon from 'components/svg/status_offline_icon';
import StatusOnlineAvatarIcon from 'components/svg/status_online_avatar_icon';
import StatusOnlineIcon from 'components/svg/status_online_icon';

export default class StatusIcon extends React.PureComponent {
    static propTypes = {
        status: PropTypes.string,
        className: PropTypes.string,
        type: PropTypes.string
    };

    static defaultProps = {
        className: ''
    };

    render() {
        const {status, type} = this.props;

        if (!status) {
            return null;
        }

        const className = 'status ' + this.props.className;

        let IconComponent = 'span';
        if (type === 'avatar') {
            if (status === 'online') {
                IconComponent = StatusOnlineAvatarIcon;
            } else if (status === 'away') {
                IconComponent = StatusAwayAvatarIcon;
            } else if (status === 'dnd') {
                IconComponent = StatusDndAvatarIcon;
            } else {
                IconComponent = StatusOfflineAvatarIcon;
            }
        } else if (status === 'online') {
            IconComponent = StatusOnlineIcon;
        } else if (status === 'away') {
            IconComponent = StatusAwayIcon;
        } else if (status === 'dnd') {
            IconComponent = StatusDndIcon;
        } else {
            IconComponent = StatusOfflineIcon;
        }

        return <IconComponent className={className}/>;
    }
}
