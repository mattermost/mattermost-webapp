// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router/es6';

export default class BackButton extends React.PureComponent {
    static defaultProps = {
        url: '/'
    };

    static propTypes = {

        /**
         * URL to return to
         */
        url: PropTypes.string
    }

    render() {
        return (
            <div className='signup-header'>
                <Link to={this.props.url}>
                    <span className='fa fa-chevron-left'/>
                    <FormattedMessage
                        id='web.header.back'
                        defaultMessage='Back'
                    />
                </Link>
            </div>
        );
    }
}
