// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable react/prop-types */

import React, {FC, memo, ComponentProps} from 'react';
import {FormattedMessage} from 'react-intl';

import './thread_footer.scss';

import Avatars from '../avatars';

import Timestamp from 'components/timestamp';
import SimpleTooltip from 'components/simple_tooltip';
import ReplyIcon from 'components/widgets/icons/reply_icon';

type Props = {
    repliers: ComponentProps<typeof Avatars>['users'];
    totalReplies: number;
    newReplies: number;
    lastReplyAt: ComponentProps<typeof Timestamp>['value'];
    isFollowing: boolean;
    startFollowing: () => void;
    stopFollowing: () => void;
    requestOpenThread: () => void;
};

const ThreadFooter: FC<Props> = ({
    repliers,
    totalReplies = 0,
    newReplies = 0,
    lastReplyAt,
    isFollowing = null,
    startFollowing: start,
    stopFollowing: stop,
    requestOpenThread: open,
}) => {
    const followingButton = isFollowing === true ? (
        <button
            className='Button Button___transparent'
            onClick={() => stop()}
        >
            <span className='Button_label'>
                <FormattedMessage
                    id='threading.footer.following'
                    defaultMessage='Following '
                />
            </span>

        </button>
    ) : (
        <button
            className='Button Button___transparent'
            onClick={() => start()}
        >
            <span className='Button_label'>
                <FormattedMessage
                    id='threading.footer.notFollowing'
                    defaultMessage='Follow'
                />
            </span>
        </button>
    );

    if (!totalReplies) {
        return (
            <div className='ThreadFooter'>
                {followingButton}
            </div>
        );
    }

    return (
        <div className='ThreadFooter'>
            {Boolean(newReplies) && <>
                <SimpleTooltip
                    id='threadFooterIndicator'
                    content={
                        <FormattedMessage
                            id='threading.footer.numNewMessages'
                            defaultMessage='{unreads, plural, =0 {no unread messages} =1 {one unread message} other {# unread messages}}'
                            values={{unreads: newReplies}}
                        />
                    }
                >
                    <div className='indicator'>
                        <div className='dot-unread'/>
                    </div>
                </SimpleTooltip>
            </>}
            <Avatars
                breakAt={repliers.length <= 4 ? 4 : 3}
                users={repliers}
                size='sm'
            />

            <button
                className='Button Button___transparent'
                onClick={() => open()}
            >
                <ReplyIcon className='Icon Icon___small Button_leftIcon'/>
                <FormattedMessage
                    id='threading.footer.numReplies'
                    defaultMessage='{totalReplies, plural, =0 {reply} =1 {# reply} other {# replies}}'
                    values={{totalReplies}}
                />
            </button>

            <div className='VerticalSeparator'/>

            {followingButton}

            <div className='VerticalSeparator hover-visible'/>

            <Timestamp
                value={lastReplyAt}
                useTime={false}
                units={['now', 'minute', 'hour', 'day']}
            >
                {({formatted}) => (
                    <span className='Timestamp hover-visible'>
                        <FormattedMessage
                            id='threading.footer.lastReplyAt'
                            defaultMessage='Last reply {formatted}'
                            values={{formatted}}
                        />
                    </span>
                )}
            </Timestamp>
        </div>
    );
};

export default memo(ThreadFooter);
