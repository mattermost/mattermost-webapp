// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable react/prop-types */

import React, {FC, memo, ComponentProps} from 'react';
import {FormattedMessage} from 'react-intl';

import './thread_footer.scss';

import Avatars from '../avatars';

import Timestamp from 'components/timestamp';
import SimpleTooltip from 'components/simple_tooltip';
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
                <FormattedMessage
                    id='threading.footer.numReplies'
                    defaultMessage='{count, number} replies'
                    values={{count: newReplies || totalReplies}}
                />
            </button>

            <div className='btn-separator'/>

            <div className='while-active'>
                {isFollowing === true ? (
                    <button className='Button Button___transparent'>
                        <i className='Icon Icon___small Button_leftIcon fa-plus'/>
                        <FormattedMessage
                            id='threading.footer.following'
                            defaultMessage='Unfollow'
                        />
                    </button>
                ) : (
                    <button className='Button Button___transparent'>
                        <i className='Icon Icon___small Button_leftIcon fa-plus'/>
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

            <div className='while-inactive'>
                <Timestamp
                    value={lastReplyAt}
                    useTime={false}
                    units={['minute', 'day']}
                >
                    {({formatted}, {relative}) => {
                        return relative ? (
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
                        );
                    }}
                </Timestamp>
            </div>
        </div>
    );
};

export default memo(ThreadFooter);
