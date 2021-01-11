// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, ComponentProps, useCallback, ReactNode} from 'react';
import {useIntl} from 'react-intl';
import {useSelector, useDispatch} from 'react-redux';

import {UserThread} from 'mattermost-redux/types/threads';
import {setThreadFollow} from 'mattermost-redux/actions/threads';

import {makeGetChannel} from 'mattermost-redux/selectors/entities/channels';

import {t} from 'utils/i18n';

import {GlobalState} from 'types/store';
import ThreadMenu from '../thread_menu';
import Button from '../../common/button';
import FollowButton from '../../common/follow_button';
import SimpleTooltip from 'components/widgets/simple_tooltip';
import Header from 'components/widgets/header';
import {useThreadRouting} from '../../hooks';

import './thread_pane.scss';

const getChannel = makeGetChannel();

type Props = {
    thread: UserThread;
    isFollowing: boolean;
    children: ReactNode;
} & Omit<ComponentProps<typeof ThreadMenu>, 'children' | 'threadId'>;

const ThreadPane = ({
    thread,
    isFollowing,
    hasUnreads,
    children,
}: Props) => {
    const {formatMessage} = useIntl();
    const dispatch = useDispatch();
    const {
        currentTeamId,
        currentUserId,
        goToInChannel,
        select,
    } = useThreadRouting();

    const {
        id: threadId,
        post: {
            channel_id: channelId,
            edit_at: editAt,
            create_at: createAt,
        },
    } = thread;

    const channel = useSelector((state: GlobalState) => getChannel(state, {id: channelId}));

    return (
        <div className='ThreadPane'>
            <Header
                className='ThreadPane___header'
                heading={(
                    <>
                        <Button
                            className='Button___icon Button___large back'
                            onClick={useCallback(() => select(), [])}
                        >
                            <i className='icon icon-arrow-back-ios'/>
                        </Button>
                        <h3>
                            <span className='separated'>
                                {formatMessage({
                                    id: 'threading.header.heading',
                                    defaultMessage: 'Thread',
                                })}
                            </span>
                            <Button
                                className='separated'
                                clamp={true}
                                onClick={useCallback(() => {
                                    goToInChannel(threadId);
                                }, [goToInChannel, threadId])}
                            >
                                {channel.display_name}
                            </Button>
                        </h3>
                    </>
                )}
                right={(
                    <>
                        <FollowButton
                            isFollowing={isFollowing}
                            disabled={isFollowing == null}
                            onClick={useCallback(() => {
                                dispatch(setThreadFollow(currentUserId, currentTeamId, threadId, !isFollowing));
                            }, [currentUserId, currentTeamId, threadId, isFollowing, setThreadFollow])}
                        />
                        <ThreadMenu
                            threadId={threadId}
                            postTimestamp={editAt || createAt}
                            isFollowing={isFollowing}
                            hasUnreads={hasUnreads}
                        >
                            <SimpleTooltip
                                id='threadActionMenu'
                                content={formatMessage({
                                    id: t('threading.threadHeader.menu'),
                                    defaultMessage: 'More Actions',
                                })}
                            >
                                <Button className='Button___icon Button___large'>
                                    <i className='Icon icon-dots-vertical'/>
                                </Button>
                            </SimpleTooltip>
                        </ThreadMenu>
                    </>
                )}
            />
            {children}
        </div>
    );
};

export default memo(ThreadPane);
