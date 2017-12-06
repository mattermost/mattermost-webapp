// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import {Constants} from 'utils/constants.jsx';

import StatusIcon from '../../status_icon.jsx';

export default class SidebarChannelButtonOrLinkIcon extends React.PureComponent {
    static propTypes = {
        channelType: PropTypes.string.isRequired,
        channelId: PropTypes.string.isRequired,
        membersCount: PropTypes.number,
        channelStatus: PropTypes.string,
        teammateId: PropTypes.string,
        teammateDeletedAt: PropTypes.number
    }

    render() {
        var icon = null;
        const globeIcon = Constants.GLOBE_ICON_SVG;
        const lockIcon = Constants.LOCK_ICON_SVG;
        if (this.props.channelType === Constants.OPEN_CHANNEL) {
            icon = (
                <span
                    className='icon icon__globe'
                    dangerouslySetInnerHTML={{__html: globeIcon}}
                />
            );
        } else if (this.props.channelType === Constants.PRIVATE_CHANNEL) {
            icon = (
                <span
                    className='icon icon__lock'
                    dangerouslySetInnerHTML={{__html: lockIcon}}
                />
            );
        } else if (this.props.channelType === Constants.GM_CHANNEL) {
            icon = <div className='status status--group'>{this.props.membersCount}</div>;
        } else if (this.props.channelType === Constants.DM_CHANNEL) {
            if (this.props.teammateId && this.props.teammateDeletedAt) {
                icon = (
                    <span
                        className='icon icon__archive'
                        dangerouslySetInnerHTML={{__html: Constants.ARCHIVE_ICON_SVG}}
                    />
                );
            } else {
                icon = (
                    <StatusIcon
                        type='avatar'
                        status={this.props.channelStatus}
                    />);
            }
        }
        return icon;
    }
}
