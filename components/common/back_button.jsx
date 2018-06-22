// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import {localizeMessage} from 'utils/utils.jsx';

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
            <div className='signup-header'>
                <Link
                    onClick={this.props.onClick}
                    to={this.props.url}
                >
                    <span
                        className='fa fa-chevron-left'
                        title={localizeMessage('generic_icons.back', 'Back Icon')}
                    />
                    <FormattedMessage
                        id='web.header.back'
                        defaultMessage='Back'
                    />
                </Link>
            </div>
        );
    }
}
