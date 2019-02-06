// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

export default class ReplyIcon extends React.PureComponent {
    render() {
        return (
            <span {...this.props}>
                <FormattedMessage
                    id='generic_icons.reply'
                    defaultMessage='Reply Icon'
                >
                    {(ariaLabel) => (
                        <svg
                            id='Layer_1'
                            x='0px'
                            y='0px'
                            width='17px'
                            height='17px'
                            viewBox='-158 242 18 18'
                            style={style}
                            role='icon'
                            aria-label={ariaLabel}
                        >
                            <path d='M-142.2,252.6c-2-3-4.8-4.7-8.3-4.8v-3.3c0-0.2-0.1-0.3-0.2-0.3s-0.3,0-0.4,0.1l-6.9,6.2c-0.1,0.1-0.1,0.2-0.1,0.3 c0,0.1,0,0.2,0.1,0.3l6.9,6.4c0.1,0.1,0.3,0.1,0.4,0.1c0.1-0.1,0.2-0.2,0.2-0.4v-3.8c4.2,0,7.4,0.4,9.6,4.4c0.1,0.1,0.2,0.2,0.3,0.2 c0,0,0.1,0,0.1,0c0.2-0.1,0.3-0.3,0.2-0.4C-140.2,257.3-140.6,255-142.2,252.6z M-150.8,252.5c-0.2,0-0.4,0.2-0.4,0.4v3.3l-6-5.5 l6-5.3v2.8c0,0.2,0.2,0.4,0.4,0.4c3.3,0,6,1.5,8,4.5c0.5,0.8,0.9,1.6,1.2,2.3C-144,252.8-147.1,252.5-150.8,252.5z'/>
                        </svg>
                    )}
                </FormattedMessage>
            </span>
        );
    }
}

const style = {
    enableBackground: 'new -158 242 18 18',
};
