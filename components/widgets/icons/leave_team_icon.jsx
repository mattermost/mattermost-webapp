// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

export default class LeaveTeamIcon extends React.PureComponent {
    render() {
        return (
            <span {...this.props}>
                <FormattedMessage
                    id='navbar_dropdown.leave.icon'
                    defaultMessage='Leave Team Icon'
                >
                    {(ariaLabel) => (
                        <svg
                            width='100%'
                            height='100%'
                            viewBox='0 0 164 164'
                            style={style}
                            role='img'
                            aria-label={ariaLabel}
                        >
                            <path d='M26.023,164L26.023,7.035L26.022,0.32L137.658,0.32L137.658,164L124.228,164L124.228, 13.749L39.452,13.749L39.452,164L26.023, 164ZM118.876,164L118.876,18.619L58.137,32.918L58.137,149.701L118.876,164Z'/>
                        </svg>
                    )}
                </FormattedMessage>
            </span>
        );
    }
}

const style = {
    fillRule: 'evenodd',
    clipRule: 'evenodd',
    strokeLinejoin: 'round',
    strokeMiterlimit: 1.41421,
};
