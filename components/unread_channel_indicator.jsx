// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import Constants from 'utils/constants.jsx';

export default function UnreadChannelIndicator(props) {
    const unreadIcon = Constants.UNREAD_ICON_SVG;
    let displayValue = 'none';
    if (props.show) {
        displayValue = 'block';
    }

    return (
        <div
            id={'unreadIndicator' + props.name}
            className={'nav-pills__unread-indicator ' + props.extraClass}
            style={{display: displayValue}}
            onClick={props.onClick}
        >
            {props.text}
            <span
                className='icon icon__unread'
                dangerouslySetInnerHTML={{__html: unreadIcon}}
            />
        </div>
    );
}

UnreadChannelIndicator.defaultProps = {
    show: false,
    extraClass: '',
    text: ''
};
UnreadChannelIndicator.propTypes = {
    onClick: PropTypes.func.isRequired,
    show: PropTypes.bool,
    extraClass: PropTypes.string,
    text: PropTypes.object,
    name: PropTypes.string
};
