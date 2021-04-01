// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useCallback, PropsWithChildren} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import {useDispatch} from 'react-redux';

import {markAllThreadsInTeamRead} from 'mattermost-redux/actions/threads';

import SimpleTooltip from 'components/widgets/simple_tooltip';
import Header from 'components/widgets/header';

import Button from '../../common/button';

import './thread_list.scss';
import {useThreadRouting} from '../../hooks';

export enum ThreadFilter {
    none = '',
    unread = 'unread'
}

export const FILTER_STORAGE_KEY = 'globalThreads_filter';

type Props = {
    currentFilter: ThreadFilter;
    someUnread: boolean;
    setFilter: (filter: ThreadFilter) => void;
};

const ThreadList = ({
    currentFilter = ThreadFilter.none,
    someUnread,
    children,
    setFilter,
}: PropsWithChildren<Props>) => {
    const {formatMessage} = useIntl();
    const dispatch = useDispatch();
    const {currentTeamId, currentUserId, clear} = useThreadRouting();

    return (
        <div className={'ThreadList'}>
            <Header
                heading={(
                    <>
                        <Button
                            className={'Button___large Margined'}
                            isActive={currentFilter === ''}
                            onClick={useCallback(() => setFilter(ThreadFilter.none), [])}
                        >
                            <FormattedMessage
                                id='threading.filters.allThreads'
                                defaultMessage='All your threads'
                            />
                        </Button>
                        <Button
                            className={'Button___large Margined'}
                            isActive={currentFilter === ThreadFilter.unread}
                            hasDot={someUnread}
                            onClick={useCallback(() => {
                                setFilter(ThreadFilter.unread);
                            }, [setFilter])}
                        >
                            <FormattedMessage
                                id='threading.filters.unreads'
                                defaultMessage='Unreads'
                            />
                        </Button>
                    </>
                )}
                right={(
                    <div className='right-anchor'>
                        <SimpleTooltip
                            id='threadListMarkRead'
                            disabled={!someUnread}
                            content={formatMessage({
                                id: 'threading.threadList.markRead',
                                defaultMessage: 'Mark all as read',
                            })}
                        >
                            <Button
                                className={'Button___large Button___icon'}
                                disabled={!someUnread}
                                onClick={useCallback(() => {
                                    dispatch(markAllThreadsInTeamRead(currentUserId, currentTeamId));
                                    if (currentFilter === ThreadFilter.unread) {
                                        clear();
                                    }
                                }, [currentTeamId, currentUserId])}
                            >
                                <span className='Icon'>
                                    <i className='icon-playlist-check'/>
                                </span>
                            </Button>
                        </SimpleTooltip>
                    </div>
                )}
            />
            <div className='threads'>
                {children}
            </div>
        </div>
    );
};

export default memo(ThreadList);
