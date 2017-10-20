// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import Constants from 'utils/constants.jsx';

export default function StatusIcon(props) {
    const status = props.status;
    const type = props.type;

    if (!status) {
        return null;
    }

    let statusIcon = '';
    if (type === 'avatar') {
        if (status === 'online') {
            statusIcon = Constants.ONLINE_AVATAR_SVG;
        } else if (status === 'away') {
            statusIcon = Constants.AWAY_AVATAR_SVG;
        } else if (status === 'dnd') {
            statusIcon = Constants.DND_AVATAR_SVG;
        } else {
            statusIcon = Constants.OFFLINE_AVATAR_SVG;
        }
    } else if (status === 'online') {
        statusIcon = Constants.ONLINE_ICON_SVG;
    } else if (status === 'away') {
        statusIcon = Constants.AWAY_ICON_SVG;
    } else if (status === 'dnd') {
        statusIcon = Constants.DND_ICON_SVG;
    } else {
        statusIcon = Constants.OFFLINE_ICON_SVG;
    }

    return (
        <span
            className={'status ' + props.className}
            dangerouslySetInnerHTML={{__html: statusIcon}}
        />
    );
}

StatusIcon.defaultProps = {
    className: ''
};

StatusIcon.propTypes = {
    status: PropTypes.string,
    className: PropTypes.string,
    type: PropTypes.string
};
