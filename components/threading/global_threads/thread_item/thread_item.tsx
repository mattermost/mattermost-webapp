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

type Props = {
    participants: ComponentProps<typeof Avatars>['users'],
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
    const hasUnreads = Boolean(newMentions || newReplies);

    return (
        <div
            className={classNames('ThreadItem', {
                'has-indicator': hasUnreads,
                'is-selected': isSelected,
            })}
            tabIndex={0}
            onClick={select}
        >
            <h4>
                {hasUnreads && (
                    <div className='indicator'>
                        {newMentions ? (
                            <div className='dot-mentions'>
                                {newMentions}
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
                    units={[
                        'now',
                        'minute',
                        'hour',
                        'today-yesterday',
                        'week',
                        'month',
                    ]}
                />
                <span className='menu-anchor alt-visible'>
                    <ThreadMenu
                        isSaved={isSaved}
                        isFollowing={isFollowing}
                        hasUnreads={hasUnreads}
                        actions={menuActions}
                    />
                </span>

            </h4>
            <p>
                {previewText}
            </p>
            {Boolean(totalReplies) && (
                <div className='activity'>
                    <Avatars
                        users={participants}
                        size='sm'
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
