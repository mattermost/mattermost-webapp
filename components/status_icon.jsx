// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import StatusAwayAvatarIcon from 'components/widgets/icons/status_away_avatar_icon';
import StatusAwayIcon from 'components/widgets/icons/status_away_icon';
import StatusDndAvatarIcon from 'components/widgets/icons/status_dnd_avatar_icon';
import StatusDndIcon from 'components/widgets/icons/status_dnd_icon';
import StatusOfflineAvatarIcon from 'components/widgets/icons/status_offline_avatar_icon';
import StatusOfflineIcon from 'components/widgets/icons/status_offline_icon';
import StatusOnlineAvatarIcon from 'components/widgets/icons/status_online_avatar_icon';
import StatusOnlineIcon from 'components/widgets/icons/status_online_icon';

export default class StatusIcon extends React.PureComponent {
    static propTypes = {
        button: PropTypes.bool,
        status: PropTypes.string,
        className: PropTypes.string,
        type: PropTypes.string,
    };

    static defaultProps = {
        className: '',
        button: false,
    };

    render() {
        const {button, status, type} = this.props;

        if (!status) {
            return null;
        }

        let className = 'status ' + this.props.className;

        if (button) {
            className = this.props.className;
        }

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
