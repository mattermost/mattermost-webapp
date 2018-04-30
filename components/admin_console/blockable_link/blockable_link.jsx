// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {NavLink} from 'react-router-dom';

import {browserHistory} from 'utils/browser_history';

export default class BlockableLink extends React.Component {
    static propTypes = {

        /*
         * Bool whether navigation is blocked
         */
        blocked: PropTypes.bool.isRequired,

        /*
         * String Link destination
         */
        to: PropTypes.string.isRequired,

        actions: PropTypes.shape({

            /*
             * Function for deferring navigation while blocked
             */
            deferNavigation: PropTypes.func.isRequired,
        }).isRequired,
    };

    handleClick = (e) => {
        if (this.props.blocked) {
            e.preventDefault();

            this.props.actions.deferNavigation(() => {
                browserHistory.push(this.props.to);
            });
        }
    };

    render() {
        const props = {...this.props};
        Reflect.deleteProperty(props, 'blocked');
        Reflect.deleteProperty(props, 'actions');

        return (
            <NavLink
                {...props}
                onClick={this.handleClick}
            />
        );
    }
}
