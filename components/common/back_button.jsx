// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

export default class BackButton extends React.PureComponent {
    static propTypes = {

        /**
         * URL to return to
         */
        url: PropTypes.string,

        /**
         * An optional click handler that will trigger when the user clicks on the back button
         */
        onClick: PropTypes.func,
    };

    static defaultProps = {
        url: '/',
    };

    render() {
        return (
            <div
                id='back_button'
                className='signup-header'
            >
                <Link
                    onClick={this.props.onClick}
                    to={this.props.url}
                >
                    <FormattedMessage
                        id='generic_icons.back'
                        defaultMessage='Back Icon'
                    >
                        {(title) => (
                            <span
                                id='back_button_icon'
                                className='fa fa-1x fa-angle-left'
                                title={title}
                            />
                        )}
                    </FormattedMessage>
                    <FormattedMessage
                        id='web.header.back'
                        defaultMessage='Back'
                    />
                </Link>
            </div>
        );
    }
}
