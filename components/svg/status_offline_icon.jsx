// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

export default class StatusOfflineIcon extends React.PureComponent {
    render() {
        return (
            <span {...this.props}>
                <FormattedMessage
                    id='mobile.set_status.offline.icon'
                    defaultMessage='Offline Icon'
                >
                    {(ariaLabel) => (
                        <svg
                            width='100%'
                            height='100%'
                            className='offline--icon'
                            viewBox='0 0 20 20'
                            style={style}
                            role='icon'
                            aria-label={ariaLabel}
                        >
                            <path d='M10,0c5.519,0 10,4.481 10,10c0,5.519 -4.481,10 -10,10c-5.519,0 -10,-4.481 -10,-10c0,-5.519 4.481,-10 10,-10Zm0,2c4.415,0 8,3.585 8,8c0,4.415 -3.585,8 -8,8c-4.415,0 -8,-3.585 -8,-8c0,-4.415 3.585,-8 8,-8Z'/>
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
