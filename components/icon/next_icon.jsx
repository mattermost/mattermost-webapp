// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import {FormattedMessage} from 'react-intl';

export default class NextIcon extends React.PureComponent {
    static propTypes = {
        additionalClassName: PropTypes.string,
    };

    static defaultProps = {
        additionalClassName: null,
    };

    render() {
        const className = 'fa fa-1x fa-angle-right' + (this.props.additionalClassName ? ' ' + this.props.additionalClassName : '');
        return (
            <FormattedMessage
                id='generic_icons.next'
                defaultMessage='Next Icon'
            >
                {(title) => (
                    <i
                        className={className}
                        title={title}
                    />
                )}
            </FormattedMessage>
        );
    }
}
