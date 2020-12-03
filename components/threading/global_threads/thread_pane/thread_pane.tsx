// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, ComponentProps, useCallback, ReactNode} from 'react';
import {useIntl} from 'react-intl';
import {useSelector} from 'react-redux';
import {useHistory, useRouteMatch} from 'react-router-dom';

import {Post} from 'mattermost-redux/types/posts';
import {getChannel} from 'mattermost-redux/selectors/entities/channels';

import {t} from 'utils/i18n';

import './thread_pane.scss';

import {GlobalState} from 'types/store';
import ThreadMenu from '../thread_menu';
import Button from '../../common/button';
import FollowButton from '../../common/follow_button';
import SimpleTooltip from 'components/widgets/simple_tooltip';
import Header from 'components/widgets/header';

type Props = {
    post: Post;
    isFollowing: boolean;
    isSaved: boolean;
    children: ReactNode;
    actions: {
        follow: () => void;
        unFollow: () => void;
        openInChannel: () => void;
    };
} & Omit<ComponentProps<typeof ThreadMenu>, 'children'>;

const ThreadPane = ({
    post,
    isFollowing,
    isSaved,
    hasUnreads,
    children,
    actions,
}: Props) => {
    const {formatMessage} = useIntl();
    const channel = useSelector((state: GlobalState) => getChannel(state, post.channel_id));
    const {params: {team, threadIdentifier}} = useRouteMatch<{team: string; threadIdentifier: string}>();
    const history = useHistory();

    return (
        <div className='ThreadPane'>
            <Header
                className='ThreadPane___header'
                heading={(
                    <h3>
                        <span className='separated'>
                            {formatMessage({
                                id: 'threading.header.heading',
                                defaultMessage: 'Thread',
                            })}
                        </span>
                        <Button
                            className='separated'
                            onClick={useCallback(() => {
                                history.push(`/${team}/pl/${threadIdentifier}`);
                            }, [history])}
                        >
                            {channel.display_name}
                        </Button>
                    </h3>
                )}
                right={(
                    <>
                        <FollowButton
                            isFollowing={isFollowing}
                            follow={useCallback(actions.follow, [actions.follow])}
                            unFollow={useCallback(actions.unFollow, [actions.unFollow])}
                        />
                        <ThreadMenu
                            isFollowing={isFollowing}
                            isSaved={isSaved}
                            hasUnreads={hasUnreads}
                            actions={actions}
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
