// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useIntl} from 'react-intl';
import {useSelector} from 'react-redux'
import {isAdmin} from 'mattermost-redux/utils/user_utils';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';
import {getOldestPostsChunkInChannel} from 'mattermost-redux/selectors/entities/posts';


import useOpenPricingModal from 'components/common/hooks/useOpenPricingModal';
import useGetLimits from 'components/common/hooks/useGetLimits';

import './index.scss';
import {GlobalState} from '@mattermost/types/store';

interface Props{}

export default function CenterMessageLock(props: Props) {
    const intl = useIntl();

    const openPricingModal = useOpenPricingModal();
    const isAdminUser = isAdmin(useSelector(getCurrentUser).roles);
    const [cloudLimits] = useGetLimits();
    const currentTeam = useSelector(getCurrentTeam);
    const currentChannel = useSelector(getCurrentChannel);
    const lastViewableMessage = useSelector(() => 1234567890);
    const oldest = useSelector((state: GlobalState) => getOldestPostsChunkInChannel(state, currentChannel?.id));

    const titleValues = {
        date: lastViewableMessage,
        team: currentTeam?.display_name,
    }

    const limit = intl.formatNumber(cloudLimits?.messages?.history || 0);

    let title = intl.formatMessage(
        {
            id: "workspace_limits.message_history.locked.title.end_user",
            defaultMessage: "Notify your admin to unlock messages prior to {date} in {team}",
        },
        titleValues,
    );
    let description: React.ReactNode = intl.formatMessage(
        {
            id: "workspace_limits.message_history.locked.description.end_user",
            defaultMessage: "Some older messages may not be shown because your workspace has over {limit} messages. Learn more",
        },
        {
            limit,
        },
    );

  if (isAdminUser) {
    title = intl.formatMessage({
        id: "workspace_limits.message_history.locked.title.admin",
        defaultMessage: "Unlock messages prior to {date} in {team}",
    }, titleValues);

    description = intl.formatMessage(
        {
            id: "workspace_limits.message_history.locked.description.admin",
            defaultMessage: "To view and search all of the messages in your workspace’s history, rather than just the most recent {limit} messages, upgrade to one of our paid plans. <a>Review our plan options and pricing.</a>",
        },
        {
            limit,
            a: (chunks: React.ReactNode | React.ReactNodeArray) => (
                <a href="#"
                    onClick={(e: React.MouseEvent) => {
                        e.preventDefault();
                        openPricingModal();
                    }}
                >
                    {chunks}
                </a>
            ),
        }
    );
  }

    return <div className="CenterMessageLock">
        <div className="CenterMessageLock__left">
            <i className="icon icon-eye-outline"/>
        </div>
        <div className="CenterMessageLock__right">
            {title}
            {description}
        </div>
    </div>
}
