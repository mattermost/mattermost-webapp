// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {memo, useCallback, useEffect, useMemo, useState} from 'react';
import {FormattedDate, FormattedMessage} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';
import {Link} from 'react-router-dom';

import classNames from 'classnames';

import {getNewTeamMembers} from 'mattermost-redux/actions/insights';

import {NewMember, TimeFrame} from '@mattermost/types/insights';
import {UserProfile} from '@mattermost/types/users';

import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {getTeammateNameDisplaySetting} from 'mattermost-redux/selectors/entities/preferences';

import {displayUsername} from 'mattermost-redux/utils/user_utils';

import {InsightsScopes} from 'utils/constants';
import {imageURLForUser} from 'utils/utils';

import Avatar from 'components/widgets/users/avatar';
import DataGrid, {Row, Column} from 'components/admin_console/data_grid/data_grid';
import ModalPagination from 'components/activity_and_insights/insights/modal_pagination/modal_pagination';

import './../../../activity_and_insights.scss';

type Props = {
    filterType: string;
    timeFrame: TimeFrame;
    offset: number;
    setOffset: (offset: number) => void;
    closeModal: () => void;
}

const NewMembersTable = (props: Props) => {
    const dispatch = useDispatch();

    const [loading, setLoading] = useState(false);
    const [newMembers, setNewMembers] = useState([] as NewMember[]);
    const [hasNext, setHasNext] = useState(false);

    const teammateNameDisplaySetting = useSelector(getTeammateNameDisplaySetting);
    const currentTeam = useSelector(getCurrentTeam);

    const getNewTeamMembersList = useCallback(async () => {
        if (props.filterType === InsightsScopes.TEAM) {
            setLoading(true);
            const data: any = await dispatch(getNewTeamMembers(currentTeam.id, props.offset, 10, props.timeFrame));
            if (data.data?.items) {
                setNewMembers(data.data.items);
            }
            if ('has_next' in data.data) {
                setHasNext(data.data?.has_next);
            }
            setLoading(false);
        }
    }, [props.timeFrame, props.filterType, props.offset]);

    useEffect(() => {
        getNewTeamMembersList();
    }, [getNewTeamMembersList]);

    const closeModal = useCallback(() => {
        props.closeModal();
    }, [props.closeModal]);

    const getColumns = useMemo((): Column[] => {
        const columns: Column[] = [
            {
                name: (
                    <FormattedMessage
                        id='insights.newMembers.member'
                        defaultMessage='Team member'
                    />
                ),
                field: 'teamMember',
                width: 0.4,
            },
            {
                name: (
                    <FormattedMessage
                        id='insights.newMembers.position'
                        defaultMessage='Position'
                    />
                ),
                field: 'position',
                width: 0.4,
            },
            {
                name: (
                    <FormattedMessage
                        id='insights.newMembers.joined'
                        defaultMessage='Date joined'
                    />
                ),
                field: 'joined',
                width: 0.2,
            },
        ];
        return columns;
    }, []);

    const getRows = useMemo((): Row[] => {
        return newMembers.map((member) => {
            return (
                {
                    cells: {
                        teamMember: (
                            <Link
                                className='user-info'
                                to={`/${currentTeam.name}/messages/@${member.username}`}
                                onClick={closeModal}
                            >
                                <Avatar
                                    url={imageURLForUser(member.id)}
                                    size={'sm'}
                                />
                                <span className='display-name'>{displayUsername(member as UserProfile, teammateNameDisplaySetting)}</span>
                            </Link>

                        ),
                        position: (
                            <>
                                {member.position}
                            </>
                        ),
                        joined: (
                            <span className='cell-text'>
                                <FormattedDate
                                    value={new Date(member.create_at)}
                                    day='2-digit'
                                    month='short'
                                    year='numeric'
                                />
                            </span>
                        ),
                    },
                }
            );
        });
    }, [newMembers]);

    return (
        <>
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
                className={classNames('InsightsTable', 'TopDMsTable')}
            />
            <ModalPagination
                hasNext={hasNext}
                offset={props.offset}
                setOffset={props.setOffset}
            />
        </>

    );
};

export default memo(NewMembersTable);
