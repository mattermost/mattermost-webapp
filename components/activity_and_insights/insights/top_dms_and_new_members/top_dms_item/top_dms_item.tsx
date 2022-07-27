// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {memo, useEffect, useState, useCallback, useMemo} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {getMyTopDMs} from 'mattermost-redux/actions/insights';

import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getTeammateNameDisplaySetting} from 'mattermost-redux/selectors/entities/preferences';

import {TopDM} from '@mattermost/types/insights';
import {GlobalState} from '@mattermost/types/store';

import Constants, {InsightsScopes} from 'utils/constants';

import OverlayTrigger from 'components/overlay_trigger';
import Avatar from 'components/widgets/users/avatar';

import CircleLoader from '../../skeleton_loader/circle_loader/circle_loader';

import './../../../activity_and_insights.scss';
import Tooltip from 'components/tooltip';
import { FormattedMessage } from 'react-intl';
import { UserProfile } from '@mattermost/types/users';
import { displayUsername } from 'mattermost-redux/utils/user_utils';
import { imageURLForUser } from 'utils/utils';

type Props = {
    dm: TopDM;
    barSize: number;
}

const TopDMsItem = ({dm, barSize}: Props) => {
    const teammateNameDisplaySetting = useSelector(getTeammateNameDisplaySetting);

    const tooltip = useCallback((messageCount: number) => {
        return (
            <Tooltip
                id='total-messages'
            >
                <FormattedMessage
                    id='insights.topChannels.messageCount'
                    defaultMessage='{messageCount} total messages'
                    values={{
                        messageCount,
                    }}
                />
            </Tooltip>
        );
    }, []);

    return (
        <div className='top-dms-item'>
            <Avatar
                url={imageURLForUser(dm.second_participant.id, dm.second_participant.last_picture_update)}
                size={'xl'}
            />
            <span className='dm-name'>{displayUsername(dm.second_participant as UserProfile, teammateNameDisplaySetting)}</span>
            <span className='dm-role'>{dm.second_participant.position}</span>
            <div className='channel-message-count'>
                <OverlayTrigger
                    trigger={['hover']}
                    delayShow={Constants.OVERLAY_TIME_DELAY}
                    placement='top'
                    overlay={tooltip(dm.post_count)}
                >
                    <span className='message-count'>{dm.post_count}</span>
                </OverlayTrigger>
                <span
                    className='horizontal-bar'
                    style={{
                        flex: `${barSize} 0`,
                    }}
                />
            </div>
        </div>
    );
};

export default memo(TopDMsItem);
