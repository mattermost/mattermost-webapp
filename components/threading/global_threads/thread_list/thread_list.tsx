// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, ReactFragment} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';

import {t} from 'utils/i18n';
import SimpleTooltip from 'components/simple_tooltip';

import Button from '../../common/button';

import './thread_list.scss';

type Props = {
    posts: ReactFragment;
    actions: {

    },
};

const ThreadList = ({
    posts,
}: Props) => {
    const {formatMessage} = useIntl();
    return (
        <div className={'ThreadList'}>
            <div className='header'>
                <Button
                    className={'Button___large Margined'}
                    isActive={true}
                    onClick={() => open()}
                >
                    <FormattedMessage
                        id='threading.filters.allThreads'
                        defaultMessage='All your threads'
                    />
                </Button>
                <Button
                    className={'Button___large Margined'}
                    hasDot={true}
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
                            id: t('threading.threadList.markRead'),
                            defaultMessage: 'Mark all as read',
                        })}
                    >
                        <Button
                            className={'Button___large Button___icon'}
                        >
                            <span className='Icon'>
                                <i className='icon-playlist-check'/>
                            </span>
                        </Button>
                    </SimpleTooltip>
                </div>
            </div>
            <div className='threads'>
                {posts}
            </div>
        </div>
    );
};

export default memo(ThreadList);
