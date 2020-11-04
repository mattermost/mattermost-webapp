// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Link} from 'react-router-dom';

import {Tooltip} from 'react-bootstrap';

import * as GlobalActions from 'actions/global_actions.jsx';
import {isMobile} from 'utils/user_agent';
import {Locations} from 'utils/constants';
import {isMobile as isMobileView} from 'utils/utils.jsx';
import OverlayTrigger from 'components/overlay_trigger';

import Timestamp, {RelativeRanges} from 'components/timestamp';

const POST_TOOLTIP_RANGES = [
    RelativeRanges.TODAY_TITLE_CASE,
    RelativeRanges.YESTERDAY_TITLE_CASE,
];

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

        location: PropTypes.oneOf([Locations.CENTER, Locations.RHS_ROOT, Locations.RHS_COMMENT, Locations.SEARCH]).isRequired,

        /*
         * The post id of posting being rendered
         */
        postId: PropTypes.string,
        teamUrl: PropTypes.string,
    };

    static defaultProps = {
        eventTime: 0,
        location: Locations.CENTER,
    };

    handleClick = () => {
        if (isMobileView()) {
            GlobalActions.emitCloseRightHandSide();
        }
    };

    render() {
        const {
            eventTime,
            isPermalink,
            location,
            postId,
            teamUrl,
        } = this.props;

        const postTime = (
            <Timestamp
                value={eventTime}
                className='post__time'
                useDate={false}
            />
        );

        const content = isMobile() || !isPermalink ? (
            <div
                role='presentation'
                className='post_permalink_mobile_view'
            >
                {postTime}
            </div>
        ) : (
            <Link
                id={`${location}_time_${postId}`}
                to={`${teamUrl}/pl/${postId}`}
                className='post__permalink'
                onClick={this.handleClick}
            >
                {postTime}
            </Link>
        );

        return (
            <OverlayTrigger
                delayShow={500}
                placement='top'
                overlay={
                    <Tooltip
                        id={eventTime}
                        className='hidden-xs'
                    >
                        <Timestamp
                            value={eventTime}
                            ranges={POST_TOOLTIP_RANGES}
                        />
                    </Tooltip>
                }
            >
                {content}
            </OverlayTrigger>
        );
    }
}
