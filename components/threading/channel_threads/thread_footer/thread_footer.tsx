// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable react/prop-types */

import React, {memo, ComponentProps} from 'react';
import {FormattedMessage} from 'react-intl';

import './thread_footer.scss';

import Avatars from 'components/widgets/users/avatars';

import Button from 'components/threading/common/button';
import FollowButton from 'components/threading/common/follow_button';

import Timestamp from 'components/timestamp';
import SimpleTooltip from 'components/simple_tooltip';
import ReplyIcon from 'components/widgets/icons/reply_icon';

import {THREADING_TIME} from '../../common/options';

type Props = {
    participants: ComponentProps<typeof Avatars>['users'];
    totalReplies: number;
    newReplies: number;
    lastReplyAt: ComponentProps<typeof Timestamp>['value'];
    isFollowing: boolean;
    actions: {
        follow: () => void,
        unfollow: () => void,
        requestOpenThread: () => void;
    }
};

function ThreadFooter({
    participants,
    totalReplies = 0,
    newReplies = 0,
    lastReplyAt,
    isFollowing,
    actions: {
        follow,
        unfollow,
        requestOpenThread: open,
    },
}: Props) {
    return (
        <div className='ThreadFooter'>
            {Boolean(newReplies) && (
                <SimpleTooltip
                    id='threadFooterIndicator'
                    content={
                        <FormattedMessage
                            id='threading.numNewMessages'
                            defaultMessage='{newReplies, plural, =0 {no unread messages} =1 {one unread message} other {# unread messages}}'
                            values={{newReplies}}
                        />
                    }
                >
                    <div className='indicator'>
                        <div className='dot-unreads'/>
                    </div>
                </SimpleTooltip>
            )}

            <Avatars
                users={participants}
                size='sm'
            />

            <Button
                onClick={() => open()}
                prepend={<ReplyIcon className='Icon'/>}
            >
                <FormattedMessage
                    id='threading.numReplies'
                    defaultMessage='{totalReplies, plural, =0 {Reply} =1 {# reply} other {# replies}}'
                    values={{totalReplies}}
                />
            </Button>

            <FollowButton
                isFollowing={isFollowing}
                start={() => follow()}
                stop={() => unfollow()}
            />

            {lastReplyAt && (
                <Timestamp
                    value={lastReplyAt}
                    useTime={false}
                    units={THREADING_TIME}
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
}

export default memo(ThreadFooter);
