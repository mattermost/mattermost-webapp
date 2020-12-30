// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Link} from 'react-router-dom';

import {Tooltip} from 'react-bootstrap';

import * as GlobalActions from 'actions/global_actions';
import {isMobile} from 'utils/user_agent';
import {Locations} from 'utils/constants';
import {isMobile as isMobileView} from 'utils/utils.jsx';
import OverlayTrigger from 'components/overlay_trigger';

import Timestamp, {RelativeRanges} from 'components/timestamp';

const POST_TOOLTIP_RANGES = [
    RelativeRanges.TODAY_TITLE_CASE,
    RelativeRanges.YESTERDAY_TITLE_CASE,
];

type Props = {

    /*
         * If true, time will be rendered as a permalink to the post
         */
    isPermalink: boolean;

    /*
     * The time to display
     */
    eventTime: number;

    location: string;

    /*
     * The post id of posting being rendered
     */
    postId: string;
    teamUrl: string;
}

export default class PostTime extends React.PureComponent<Props> {
    static defaultProps: Partial<Props> = {
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
                        id={eventTime.toString()}
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
