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
import FaAddIcon from 'components/widgets/icons/fa_add_icon';

type Props = {
    repliers: ComponentProps<typeof Avatars>['users'];
    totalReplies: number;
    newReplies: number;
    lastReplyAt: ComponentProps<typeof Timestamp>['value'];
    isFollowing: boolean;
};

const ThreadFooter: FC<Props> = ({
    repliers,
    totalReplies = 0,
    newReplies = 0,
    lastReplyAt,
    isFollowing = null,
}) => {
    return (
        <div className='ThreadFooter'>
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

            <Avatars
                size='sm'
                users={repliers}
            />

            <button className='Button Button___transparent'>
                <ReplyIcon className='Icon Icon___small Button_leftIcon'/>
                <FormattedMessage
                    id='threading.footer.numReplies'
                    defaultMessage='{count, plural, =0 {reply} other {# replies}}'
                    values={{count: newReplies || totalReplies}}
                />
            </button>

            <div className='ButtonSeparator'/>

            <div className='hover-visible'>
                {isFollowing === true ? (
                    <button className='Button Button___transparent'>
                        <span className='Icon Icon___small Button_leftIcon'>
                            <FaAddIcon/>
                        </span>
                        <span className='Button_label'>
                            <FormattedMessage
                                id='threading.footer.following'
                                defaultMessage='Unfollow'
                            />
                        </span>

                    </button>
                ) : (
                    <button className='Button Button___transparent'>
                        <span className='Icon Icon___small Button_leftIcon'>
                            <FaAddIcon/>
                        </span>
                        <span className='Button_label'>
                            <FormattedMessage
                                id='threading.footer.notFollowing'
                                defaultMessage='Follow'
                            />
                        </span>
                    </button>
                )
                }

            </div>

            <div className='hover-hidden'>
                <Timestamp
                    value={lastReplyAt}
                    useTime={false}
                    units={['minute', 'day']}
                >
                    {({formatted}, {relative}) => (
                        <span className='Timestamp'>
                            {relative ? (
                                <FormattedMessage
                                    id='threading.footer.lastReplyRelative'
                                    defaultMessage='Last reply was {formatted}'
                                    values={{formatted}}
                                />
                            ) : (
                                <FormattedMessage
                                    id='threading.footer.lastReplyAbsolute'
                                    defaultMessage='Last reply on {formatted}'
                                    values={{formatted}}
                                />
                            )}
                        </span>
                    )}
                </Timestamp>
            </div>
        </div>
    );
};

export default memo(ThreadFooter);
