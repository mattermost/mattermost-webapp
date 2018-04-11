// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

export default class LastUsers extends React.PureComponent {
    static propTypes = {
        firstUserEl: PropTypes.string.isRequired,
        lastUsersEl: PropTypes.string.isRequired,
        allUsersEl: PropTypes.string.isRequired,
        what: PropTypes.string.isRequired,
        actor: PropTypes.string,
    };

    constructor(props) {
        super(props);

        this.state = {
            expand: false,
        };
    }

    handleClick = (e) => {
        e.preventDefault();

        this.setState({expand: true});
    }

    render() {
        const {expand} = this.state;
        const {
            firstUserEl,
            lastUsersEl,
            allUsersEl,
            what,
            actor,
        } = this.props;

        if (expand) {
            return (
                <span>
                    {allUsersEl}
                    {' '}{what}{' '}{actor}{'.'}
                </span>
            );
        }

        return (
            <span>
                {firstUserEl}
                <a onClick={this.handleClick}>{lastUsersEl}</a>
                {' '}{what}{' '}{actor}{'.'}
            </span>
        );
    }
}
