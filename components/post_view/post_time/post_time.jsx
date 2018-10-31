// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Link} from 'react-router-dom';

import * as GlobalActions from 'actions/global_actions.jsx';
import {isMobile} from 'utils/user_agent.jsx';
import {isMobile as isMobileView} from 'utils/utils.jsx';
import LocalDateTime from 'components/local_date_time';

export default class PostTime extends React.PureComponent {
    static propTypes = {

        /*
         * If true, time will be rendered as a permalink to the post
         */
        isPermalink: PropTypes.bool.isRequired,

        /*
         * The time to display
         */
        eventTime: PropTypes.number.isRequired,

        /*
         * The post id of posting being rendered
         */
        postId: PropTypes.string,
        teamUrl: PropTypes.string,
    };

    static defaultProps = {
        eventTime: 0,
    };

    handleClick = () => {
        if (isMobileView()) {
            GlobalActions.emitCloseRightHandSide();
        }
    };

    render() {
        const localDateTime = (
            <LocalDateTime
                eventTime={this.props.eventTime}
            />
        );
        if (isMobile() || !this.props.isPermalink) {
            return localDateTime;
        }

        return (
            <Link
                to={`${this.props.teamUrl}/pl/${this.props.postId}`}
                className='post__permalink'
                onClick={this.handleClick}
            >
                {localDateTime}
            </Link>
        );
    }
}
