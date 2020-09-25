// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable react/prop-types */

import React, {FC, memo, ComponentProps} from 'react';
import {FormattedMessage} from 'react-intl';

import './thread_footer.scss';

import Avatars from 'components/widgets/users/avatars';

import Button from 'components/threading/common/button';
import FollowButton from 'components/threading/common/follow_button';

import Timestamp from 'components/timestamp';
import SimpleTooltip from 'components/simple_tooltip';
import ReplyIcon from 'components/widgets/icons/reply_icon';

type Props = {
    users: ComponentProps<typeof Avatars>['users'];
    totalReplies: number;
    newReplies: number;
    lastReplyAt: ComponentProps<typeof Timestamp>['value'];
    minimalist?: boolean,
    isFollowing: boolean;
    follow: () => void,
    unfollow: () => void,
    requestOpenThread: () => void;
};

const ThreadFooter: FC<Props> = ({
    users,
    totalReplies = 0,
    newReplies = 0,
    lastReplyAt,
    isFollowing,
    follow,
    unfollow,
    requestOpenThread: open,
}) => {
    return (
        <div className='ThreadFooter'>
            {Boolean(newReplies) && <>
                <SimpleTooltip
                    id='threadFooterIndicator'
                    content={
                        <FormattedMessage
                            id='threading.footer.numNewMessages'
                            defaultMessage='{newReplies, plural, =0 {no unread messages} =1 {one unread message} other {# unread messages}}'
                            values={{newReplies}}
                        />
                    }
                >
                    <div className='indicator'>
                        <div className='dot-unread'/>
                    </div>
                </SimpleTooltip>
            </>}

            <Avatars
                users={users}
                size='sm'
            />

            <Button
                onClick={() => open()}
                iconLeft={<ReplyIcon/>}
            >
                <FormattedMessage
                    id='threading.footer.numReplies'
                    defaultMessage='{totalReplies, plural, =0 {Reply} =1 {# reply} other {# replies}}'
                    values={{totalReplies}}
                />
            </Button>

            <FollowButton
                isFollowing={isFollowing}
                start={follow}
                stop={unfollow}
            />

            {lastReplyAt && (
                <Timestamp
                    value={lastReplyAt}
                    useTime={false}
                    units={['now', 'minute', 'hour', 'day']}
                >
                    {({formatted}) => (
                        <span className='Timestamp Separated alt-visible'>
                            <FormattedMessage
                                id='threading.footer.lastReplyAt'
                                defaultMessage='Last reply {formatted}'
                                values={{formatted}}
                            />
                        </span>
                    )}
                </Timestamp>
            )}
        </div>
    );
};

export default memo(ThreadFooter);
