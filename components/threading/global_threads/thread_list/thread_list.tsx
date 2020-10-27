// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useCallback, PropsWithChildren} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';

import SimpleTooltip from 'components/widgets/simple_tooltip';

import Button from '../../common/button';

import './thread_list.scss';

type Filter = '' | 'unread';

type Props = {
    currentFilter: Filter,
    someUnread: boolean
    actions: {
        setFilter: (filter: Filter) => void,
        markAllRead: () => void,
    },
};

const ThreadList = ({
    currentFilter = '',
    someUnread,
    actions: {
        setFilter,
        markAllRead,
    },
    children,
}: PropsWithChildren<Props>) => {
    const {formatMessage} = useIntl();
    return (
        <div className={'ThreadList'}>
            <div className='header'>
                <Button
                    className={'Button___large Margined'}
                    isActive={currentFilter === ''}
                    onClick={useCallback(() => setFilter(''), [setFilter])}
                >
                    <FormattedMessage
                        id='threading.filters.allThreads'
                        defaultMessage='All your threads'
                    />
                </Button>
                <Button
                    className={'Button___large Margined'}
                    isActive={currentFilter === 'unread'}
                    hasDot={someUnread}
                    onClick={useCallback(() => setFilter('unread'), [setFilter])}
                >
                    <FormattedMessage
                        id='threading.filters.unreads'
                        defaultMessage='Unreads'
                    />
                </Button>

                <div className='right-anchor'>
                    <SimpleTooltip
                        id='threadListMarkRead'
                        content={formatMessage({
                            id: 'threading.threadList.markRead',
                            defaultMessage: 'Mark all as read',
                        })}
                    >
                        <Button
                            className={'Button___large Button___icon'}
                            onClick={useCallback(markAllRead, [markAllRead])}
                        >
                            <span className='Icon'>
                                <i className='icon-playlist-check'/>
                            </span>
                        </Button>
                    </SimpleTooltip>
                </div>
            </div>
            <div className='threads'>
                {children}
            </div>
        </div>
    );
};

export default memo(ThreadList);
