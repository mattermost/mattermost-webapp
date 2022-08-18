// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {memo, useCallback, useEffect, useMemo, useState} from 'react';
import {FormattedMessage} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';

import classNames from 'classnames';

import {getLeastActiveChannelsForTeam, getMyLeastActiveChannels} from 'mattermost-redux/actions/insights';

import {LeastActiveChannel, TimeFrame} from '@mattermost/types/insights';

import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getTeammateNameDisplaySetting} from 'mattermost-redux/selectors/entities/preferences';
import {getMyChannelMemberships} from 'mattermost-redux/selectors/entities/channels';

import Constants, {InsightsScopes} from 'utils/constants';
import Avatars from 'components/widgets/users/avatars';
import DataGrid, {Row, Column} from 'components/admin_console/data_grid/data_grid';

import './../../../activity_and_insights.scss';

type Props = {
    filterType: string;
    timeFrame: TimeFrame;
    closeModal: () => void;
}

const LeastActiveChannelsTable = (props: Props) => {
    const dispatch = useDispatch();

    const [loading, setLoading] = useState(true);
    const [leastActiveChannels, setLeastActiveChannels] = useState([] as LeastActiveChannel[]);

    const currentTeamId = useSelector(getCurrentTeamId);
    const myChannelMemberships = useSelector(getMyChannelMemberships);

    const getInactiveChannels = useCallback(async () => {
        setLoading(true);
        if (props.filterType === InsightsScopes.TEAM) {
            const data: any = await dispatch(getLeastActiveChannelsForTeam(currentTeamId, 0, 3, props.timeFrame));
            if (data.data?.items) {
                setLeastActiveChannels(data.data.items);
            }
        } else {
            const data: any = await dispatch(getMyLeastActiveChannels(currentTeamId, 0, 3, props.timeFrame));
            if (data.data?.items) {
                setLeastActiveChannels(data.data.items);
            }
        }
        setLoading(false);
    }, [props.timeFrame, currentTeamId, props.filterType]);

    useEffect(() => {
        getInactiveChannels();
    }, [getInactiveChannels]);

    const closeModal = useCallback(() => {
        props.closeModal();
    }, [props.closeModal]);

    const getColumns = useMemo((): Column[] => {
        const columns: Column[] = [
            {
                name: (
                    <FormattedMessage
                        id='insights.topReactions.rank'
                        defaultMessage='Rank'
                    />
                ),
                field: 'rank',
                className: 'rankCell',
                width: 0.07,
            },
            {
                name: (
                    <FormattedMessage
                        id='insights.leastActiveChannels.channel'
                        defaultMessage='Channel'
                    />
                ),
                field: 'channel',
                width: 0.63,
            },
            {
                name: (
                    <FormattedMessage
                        id='insights.leastActiveChannels.lastActivity'
                        defaultMessage='Last activity'
                    />
                ),
                field: 'lastActivity',
                width: 0.15,
            },
            {
                name: (
                    <FormattedMessage
                        id='insights.leastActiveChannels.members'
                        defaultMessage='Members'
                    />
                ),
                field: 'participants',
                width: 0.15,
            },
        ];
        return columns;
    }, []);

    const getRows = useMemo((): Row[] => {
        return leastActiveChannels.map((channel, i) => {
            const channelMembership = myChannelMemberships[channel.id];
            let isChannelMember = false;
            if (typeof channelMembership !== 'undefined') {
                isChannelMember = true;
            }

            let iconToDisplay = <i className='icon icon-globe'/>;

            if (channel.type === Constants.PRIVATE_CHANNEL) {
                iconToDisplay = <i className='icon icon-lock-outline'/>;
            }

            return (
                {
                    cells: {
                        rank: (
                            <span className='cell-text'>
                                {i + 1}
                            </span>
                        ),
                        channel: (
                            <div className='channel-display-name'>
                                <span className='icon'>
                                    {iconToDisplay}
                                </span>
                                <span className='cell-text'>
                                    {channel.display_name}
                                </span>
                            </div>
                        ),
                        lastActivity: (
                            <span className='replies'>{channel.last_activity_at}</span>
                        ),
                        participants: (
                            <>
                                {channel.participants && channel.participants.length > 0 ? (
                                    <Avatars
                                        userIds={channel.participants}
                                        size='xs'
                                        disableProfileOverlay={true}
                                    />
                                ) : null}
                            </>

                        ),
                        
                    },
                    onClick: () => {
                        console.log('ggg')
                    },
                }
            );
        });
    }, [leastActiveChannels, myChannelMemberships]);

    return (
        <DataGrid
            columns={getColumns}
            rows={getRows}
            loading={loading}
            page={0}
            nextPage={() => {}}
            previousPage={() => {}}
            startCount={1}
            endCount={10}
            total={0}
            className={classNames('InsightsTable', 'TopThreadsTable')}
        />
    );
};

export default memo(LeastActiveChannelsTable);
