// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import LoadingWrapper from 'components/widgets/loading/loading_wrapper.jsx';

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
        return (
            <span className='resend-verification-wrapper'>
                <LoadingWrapper
                    loading={this.state.spinning}
                    text={this.props.spinningText}
                >
                    <a
                        onClick={this.handleClick}
                    >
                        {this.props.regularText}
                    </a>
                </LoadingWrapper>
            </span>
        );
    }
}

