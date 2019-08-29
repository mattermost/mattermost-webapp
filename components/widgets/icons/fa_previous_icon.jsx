// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {FormattedMessage} from 'react-intl';
import PropTypes from 'prop-types';

export default class PreviousIcon extends React.PureComponent {
    static propTypes = {
        additionalClassName: PropTypes.string,
    };

    static defaultProps = {
        additionalClassName: null,
    };

    render() {
        const className = 'fa fa-1x fa-angle-left' + (this.props.additionalClassName ? ' ' + this.props.additionalClassName : '');
        return (
            <FormattedMessage
                id='generic_icons.previous'
                defaultMessage='Previous Icon'
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
