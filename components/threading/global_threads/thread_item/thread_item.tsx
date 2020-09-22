// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {FC, memo, ComponentProps} from 'react';
import {FormattedMessage} from 'react-intl';
import classNames from 'classnames';

import './thread_item.scss';

import Badge from 'components/widgets/badges/badge';
import Timestamp from 'components/timestamp';
import Avatars from 'components/widgets/users/avatars';

type Props = {
    name: string,
    teamName: string,
    previewText: string,
    users: ComponentProps<typeof Avatars>['users'],
    totalReplies: number,
    newReplies: number,
    newMentions: number,
    lastReplyAt: ComponentProps<typeof Timestamp>['value'],
    isSelected: boolean,
    select: () => void
};

const Comp: FC<Props> = ({
    name,
    teamName,
    lastReplyAt,
    previewText,
    totalReplies,
    newReplies,
    newMentions,
    isSelected,
    users,
    select,
}) => {
    const hasMentions = Boolean(newMentions);
    const showIndicator = hasMentions || Boolean(newReplies);
    return (
        <div
            className={classNames('ThreadItem', {
                'has-mentions': hasMentions,
                'is-selected': isSelected},
            )}
            tabIndex={0}
            onClick={select}
        >
            <h4>
                {showIndicator && (
                    <div className='indicator'>
                        {newMentions ? (
                            <div className='Dot Dot___mentions'>
                                {newMentions}
                            </div>
                        ) : (
                            <div className='Dot Dot___unreads'/>
                        )}
                    </div>
                )}
                {name || users[0].name}
                <Badge>
                    {teamName}
                </Badge>
                <Timestamp
                    value={lastReplyAt}
                    useTime={false}
                    units={['now', 'minute', 'hour', 'day']}
                />
            </h4>
            <p>
                {previewText}
            </p>
            <div className='activity'>
                <Avatars
                    users={users}
                    size='sm'
                />
                {showIndicator ? (
                    <FormattedMessage
                        id='threading.footer.numNewReplies'
                        defaultMessage='{newReplies, plural, =1 {# new reply} other {# new replies}}'
                        values={{newReplies}}
                    />
                ) : (
                    <FormattedMessage
                        id='threading.footer.numReplies'
                        defaultMessage='{totalReplies, plural, =0 {Reply} =1 {# reply} other {# replies}}'
                        values={{totalReplies}}
                    />
                )}
            </div>
        </div>
    );
};

export default memo(Comp);
