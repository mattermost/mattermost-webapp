// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

export default class LoadingScreen extends React.Component {
    static propTypes = {
        position: PropTypes.oneOf(['absolute', 'fixed', 'relative', 'static', 'inherit']),
        style: PropTypes.object,
        message: PropTypes.node,
    }

    static defaultProps = {
        position: 'relative',
        style: {},
    }

    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        let message = (
            <FormattedMessage
                id='loading_screen.loading'
                defaultMessage='Loading'
            />
        );

        if (this.props.message) {
            message = this.props.message;
        }

        return (
            <div
                className='loading-screen'
                style={{position: this.props.position, ...this.props.style}}
            >
                <div className='loading__content'>
                    <h3>
                        {message}
                    </h3>
                    <div className='round round-1'/>
                    <div className='round round-2'/>
                    <div className='round round-3'/>
                </div>
            </div>
        );
    }
}
