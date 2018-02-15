// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Link} from 'react-router-dom';

import TeamStore from 'stores/team_store.jsx';
import {isMobile} from 'utils/user_agent.jsx';

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
         * Set to display using 24 hour format
         */
        useMilitaryTime: PropTypes.bool,

        /*
         * The post id of posting being rendered
         */
        postId: PropTypes.string
    };

    static defaultProps = {
        eventTime: 0,
        useMilitaryTime: false
    };

    constructor(props) {
        super(props);
        this.state = {
            currentTeamDisplayName: TeamStore.getCurrent().name
        };
    }

    renderTimeTag() {
        const date = new Date(this.props.eventTime);

        return (
            <time
                className='post__time'
                dateTime={date.toISOString()}
                title={date}
            >
                {date.toLocaleString('en', {hour: '2-digit', minute: '2-digit', hour12: !this.props.useMilitaryTime})}
            </time>
        );
    }

    render() {
        if (isMobile() || !this.props.isPermalink) {
            return this.renderTimeTag();
        }

        return (
            <Link
                to={`/${this.state.currentTeamDisplayName}/pl/${this.props.postId}`}
                className='post__permalink'
            >
                {this.renderTimeTag()}
            </Link>
        );
    }
}
