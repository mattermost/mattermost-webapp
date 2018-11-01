// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import * as Utils from 'utils/utils.jsx';

export default class TextButtonWithSpinner extends React.PureComponent {
    static propTypes = {
        regularText: PropTypes.node.isRequired,
        spinningText: PropTypes.node,
        onClick: PropTypes.func,
        timeout: PropTypes.number,
    }
    static defaultProps = {
        spinningText: 'Loading',
        timeout: 120,
    }

    constructor(props) {
        super(props);

        this.state = {
            spinning: false,
        };
    }

    handleClick = (e) => {
        e.preventDefault();

        this.setState({
            spinning: true,
        });

        this.props.onClick();

        setTimeout(() => {
            this.setState({
                spinning: false,
            });
        }, this.props.timeout);
    }

    render() {
        if (this.state.spinning) {
            return (
                <React.Fragment>
                    <span className='fa-wrapper'>
                        <span
                            className='fa fa-spinner icon--rotate'
                            title={Utils.localizeMessage('generic_icons.loading', 'Loading Icon')}
                        />
                    </span>
                    {this.props.spinningText}
                </React.Fragment>
            );
        }
        return (
            <span className='resend-verification-wrapper'>
                <a
                    onClick={this.handleClick}
                >
                    {this.props.regularText}
                </a>
            </span>
        );
    }
}

