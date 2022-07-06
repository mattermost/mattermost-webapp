// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useIntl, FormatDateOptions} from 'react-intl';
import {useSelector} from 'react-redux';

import {EyeOffOutlineIcon} from '@mattermost/compass-icons/components';

// import {GlobalState} from '@mattermost/types/store';

import {isAdmin} from 'mattermost-redux/utils/user_utils';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';

// import {getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';
// import {getOldestPostsChunkInChannel} from 'mattermost-redux/selectors/entities/posts';

import useOpenPricingModal from 'components/common/hooks/useOpenPricingModal';
import useGetLimits from 'components/common/hooks/useGetLimits';

import './index.scss';

const ONE_YEAR_MS = 1000 * 1 * 60 * 60 * 24 * 365;

export default function CenterMessageLock() {
    const intl = useIntl();

    const openPricingModal = useOpenPricingModal();
    const isAdminUser = isAdmin(useSelector(getCurrentUser).roles);
    const [cloudLimits, limitsLoaded] = useGetLimits();
    const currentTeam = useSelector(getCurrentTeam);

    // const currentChannel = useSelector(getCurrentChannel);
    const lastViewableMessage = useSelector(() => 1234567890);

    // const oldest = useSelector((state: GlobalState) => getOldestPostsChunkInChannel(state, currentChannel?.id));
    if (!'lastViewableMessage < 0 || !limitsLoaded') {
        return null;
    }

    const dateFormat: FormatDateOptions = {month: 'long', day: 'numeric'};
    if (Date.now() - lastViewableMessage >= ONE_YEAR_MS) {
        dateFormat.year = 'numeric';
    }
    const titleValues = {
        date: intl.formatDate(lastViewableMessage, dateFormat),
        team: currentTeam?.display_name,
    };

    const limit = intl.formatNumber(cloudLimits?.messages?.history || 0);

    let title = intl.formatMessage(
        {
            id: 'workspace_limits.message_history.locked.title.end_user',
            defaultMessage: 'Notify your admin to unlock messages prior to {date} in {team}',
        },
        titleValues,
    );
    let description: React.ReactNode = intl.formatMessage(
        {
            id: 'workspace_limits.message_history.locked.description.end_user',
            defaultMessage: 'Some older messages may not be shown because your workspace has over {limit} messages. Select Notify Admin to send an automatic request to your System Admins to upgrade.',
        },
        {
            limit,
        },
    );

    let cta = (<button className='btn btn-primary'>
        {
            intl.formatMessage({
                id: 'workspace_limits.message_history.locked.cta.end_user',
                defaultMessage: 'Notify Admin',
            })
        }
    </button>);

    if (isAdminUser) {
        title = intl.formatMessage({
            id: 'workspace_limits.message_history.locked.title.admin',
            defaultMessage: 'Unlock messages prior to {date} in {team}',
        }, titleValues);

        description = intl.formatMessage(
            {
                id: 'workspace_limits.message_history.locked.description.admin',
                defaultMessage: 'To view and search all of the messages in your workspace’s history, rather than just the most recent {limit} messages, upgrade to one of our paid plans. <a>Review our plan options and pricing.</a>',
            },
            {
                limit,
                a: (chunks: React.ReactNode | React.ReactNodeArray) => (
                    <a
                        href='#'
                        onClick={(e: React.MouseEvent) => {
                            e.preventDefault();
                            openPricingModal();
                        }}
                    >
                        {chunks}
                    </a>
                ),
            },
        );

        cta = (
            <button
                className='btn is-admin'
                onClick={openPricingModal}
            >
                {
                    intl.formatMessage({
                        id: 'workspace_limits.message_history.locked.cta.admin',
                        defaultMessage: 'Upgrade now',
                    })
                }
            </button>
        );
    }

    return (<div className='CenterMessageLock'>
        <div className='CenterMessageLock__left'>
            <EyeOffOutlineIcon color={'rgba(var(--center-channel-text-rgb), 0.72)'}/>
        </div>
        <div className='CenterMessageLock__right'>
            <div className='CenterMessageLock__title'>
                {title}
            </div>
            <div className='CenterMessageLock__description'>
                {description}
            </div>
            <div className='CenterMessageLock__cta'>
                {cta}
            </div>
        </div>
    </div>);
}
