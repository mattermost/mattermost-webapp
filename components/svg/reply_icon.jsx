// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

export default class ReplyIcon extends React.PureComponent {
    static propTypes = {
        size: PropTypes.string,
    };

    static defaultProps = {
        size: 'medium',
    }

    render() {
        let svgSize = 18;
        if (this.props.size === 'large') {
            svgSize = 20;
        } else if (this.props.size === 'small') {
            svgSize = 16;
        }

        return (
            <span {...this.props}>
                <FormattedMessage
                    id='generic_icons.reply'
                    defaultMessage='Reply Icon'
                >
                    {(ariaLabel) => (
                        <svg
                            width={svgSize}
                            height={svgSize}
                            style={style}
                            role='icon'
                            aria-label={ariaLabel}
                            viewBox='0 0 20 20'
                        >
                            <path
                                fillRule='evenodd'
                                d='M9.157,0 C8.929,0 8.699,0.116 8.516,0.376 L0.237,9.172 C-0.079,9.623 -0.079,10.32 0.237,10.771 L8.552,19.624 C8.733,19.883 8.965,20 9.191,20 C9.639,20 10.072,19.545 10.082,18.845 L10.124,15.668 C10.132,15.032 10.523,14.509 10.998,14.509 C11.01,14.509 11.021,14.51 11.033,14.51 C15.885,14.774 16.845,15.904 18.56,17.837 C18.73,18.028 18.921,18.112 19.106,18.112 C19.638,18.112 20.129,17.421 19.97,16.598 C18.296,7.963 13.107,6.765 10.773,6.196 C10.353,6.094 10.053,5.612 10.053,5.045 L10.048,1.173 C10.047,0.464 9.609,0 9.157,0 M8.051,3.789 L8.053,5.048 C8.054,6.546 8.978,7.817 10.3,8.139 L10.355,8.153 C12.182,8.598 15.329,9.363 17.133,13.908 C15.803,13.148 14.034,12.67 11.141,12.513 L11.053,12.509 L10.998,12.509 C9.409,12.509 8.147,13.885 8.124,15.642 L8.116,16.239 L2.23,9.972 L8.051,3.789'
                            />
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
