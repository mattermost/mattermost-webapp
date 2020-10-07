// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, ComponentProps} from 'react';
import {FormattedMessage} from 'react-intl';
import classNames from 'classnames';

import './thread_item.scss';

import Badge from 'components/widgets/badges/badge';
import Timestamp from 'components/timestamp';
import Avatars from 'components/widgets/users/avatars';

import ThreadMenu from '../thread_menu';

import {THREADING_TIME} from '../../common/options';

type Props = {
    participants: ComponentProps<typeof Avatars>['users'],
    totalParticipants?: number;
    name: string,
    teamName: string,
    previewText: string,

    lastReplyAt: ComponentProps<typeof Timestamp>['value'],
    newReplies: number,
    newMentions: number,
    totalReplies: number,

    isFollowing: boolean,
    isSaved: boolean,
    isSelected: boolean,

    actions: {
        select: () => void,
    },
} & Pick<ComponentProps<typeof ThreadMenu>, 'actions'>;

const ThreadItem = ({
    participants,
    totalParticipants,
    name,
    teamName,
    previewText,

    lastReplyAt,
    newReplies,
    newMentions,
    totalReplies,

    isSelected,
    isSaved,
    isFollowing,

    actions: {
        select,
        ...menuActions
    },

}: Props) => {
    return (
        <div
            className={classNames('ThreadItem', {
                'has-unreads': newReplies,
                'is-selected': isSelected,
            })}
            tabIndex={0}
            onClick={select}
        >
            <h4>
                {Boolean(newMentions || newReplies) && (
                    <div className='indicator'>
                        {newMentions ? (
                            <div className={classNames('dot-mentions', {over: newMentions > 99})}>
                                {Math.min(newMentions, 99)}
                                {newMentions > 99 && '+'}
                            </div>
                        ) : (
                            <div className='dot-unreads'/>
                        )}
                    </div>
                )}
                {name || participants[0].name}
                {Boolean(teamName) && (
                    <Badge>
                        {teamName}
                    </Badge>
                )}
                <Timestamp
                    className='alt-hidden'
                    value={lastReplyAt}
                    useTime={false}
                    units={THREADING_TIME}
                />
            </h4>
            <span className='menu-anchor alt-visible'>
                <ThreadMenu
                    isSaved={isSaved}
                    isFollowing={isFollowing}
                    hasUnreads={Boolean(newReplies)}
                    actions={menuActions}
                />
            </span>
            <p>
                {previewText}
            </p>
            {Boolean(totalReplies) && (
                <div className='activity'>
                    <Avatars
                        users={participants}
                        totalUsers={totalParticipants}
                        size='xs'
                    />
                    {newReplies ? (
                        <FormattedMessage
                            id='threading.numNewReplies'
                            defaultMessage='{newReplies, plural, =1 {# new reply} other {# new replies}}'
                            values={{newReplies}}
                        />
                    ) : (
                        <FormattedMessage
                            id='threading.numReplies'
                            defaultMessage='{totalReplies, plural, =0 {Reply} =1 {# reply} other {# replies}}'
                            values={{totalReplies}}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default memo(ThreadItem);
