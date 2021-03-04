// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';
import {Constants} from 'utils/constants';
import {ChannelWithTeamData as Channel} from 'mattermost-redux/types/channels';
import {Dictionary} from 'mattermost-redux/types/utilities';

import {browserHistory} from 'utils/browser_history';

import * as Utils from 'utils/utils.jsx';

import DataGrid, {Column, Row} from 'components/admin_console/data_grid/data_grid';
import TeamIcon from 'components/widgets/team_icon/team_icon';

import './channel_list.scss';
import {FilterOptions} from 'components/admin_console/filter/filter';
import GlobeIcon from 'components/widgets/icons/globe_icon';
import LockIcon from 'components/widgets/icons/lock_icon';
import ArchiveIcon from 'components/widgets/icons/archive_icon';
import {isArchivedChannel} from 'utils/channel_utils';

const ROW_HEIGHT = 80;

type Props = {
    channels: Channel[];
    totalCount: number;

    policyId: string | undefined;

    onRemoveCallback: (channel: Channel) => void;
    onAddCallback: (channels: Channel[]) => void;
    channelsToRemove: Dictionary<Channel>;
    channelsToAdd: Dictionary<Channel>;

    actions: {
        // searchTeams: (term: string, opts: TeamSearchOpts) => Promise<{data: TeamsWithCount}>;
        getDataRetentionCustomPolicyChannels: (id: string, page: number, perPage: number) => Promise<{ data: Channel[] }>;
    };
}

type State = {
    loading: boolean;
    page: number;
}
const PAGE_SIZE = 10;
export default class TeamList extends React.PureComponent<Props, State> {
    private pageLoaded = 0;
    public constructor(props: Props) {
        super(props);

        this.state = {
            loading: false,
            page: 0,
        };
    }

    componentDidMount = async () => {
        if (this.props.policyId) {
            await this.props.actions.getDataRetentionCustomPolicyChannels(this.props.policyId, 0, PAGE_SIZE * 2);
        }
    }

    private loadPage = (page: number) => {
        this.setState({loading: true});
        this.fetchTeams(page);
        this.setState({page, loading: false});
    }

    private fetchTeams = async (page: number) => {
        if (this.props.policyId) {
            await this.props.actions.getDataRetentionCustomPolicyChannels(this.props.policyId, page + 1, PAGE_SIZE);
        }
    }

    private nextPage = () => {
        this.loadPage(this.state.page + 1);
    }

    private previousPage = () => {
        this.loadPage(this.state.page - 1);
    }

    private getVisibleTotalCount = (): number => {
        const {channelsToAdd, channelsToRemove, totalCount} = this.props;
        const channelsToAddCount = Object.keys(channelsToAdd).length;
        const channelsToRemoveCount = Object.keys(channelsToRemove).length;
        return totalCount + (channelsToAddCount - channelsToRemoveCount);
    }

    public getPaginationProps = (): {startCount: number; endCount: number; total: number} => {
        // const {channelsToAdd, channelsToRemove, term} = this.props;
        const {page} = this.state;

        let total: number;
        let endCount = 0;
        const startCount = (page * PAGE_SIZE) + 1;

        //if (term === '') {
            total = this.getVisibleTotalCount();
        // } else {
        //     total = this.props.teams.length + Object.keys(channelsToAdd).length;
        //     this.props.teams.forEach((u) => {
        //         if (channelsToRemove[u.id]) {
        //             total -= 1;
        //         }
        //     });
        // }

        endCount = (page + 1) * PAGE_SIZE;
        endCount = endCount > total ? total : endCount;

        return {startCount, endCount, total};
    }

    private removeTeam = (channel: Channel) => {
        const {channelsToRemove} = this.props;
        if (channelsToRemove[channel.id] === channel) {
            return;
        }

        let {page} = this.state;
        const {endCount} = this.getPaginationProps();

        this.props.onRemoveCallback(channel);
        if (endCount > this.getVisibleTotalCount() && (endCount % PAGE_SIZE) === 1 && page > 0) {
            page--;
        }

        this.setState({page});
    }

    getColumns = (): Column[] => {
        const name = (
            <FormattedMessage
                id='admin.team_settings.team_list.nameHeader'
                defaultMessage='Name'
            />
        );

        return [
            {
                name,
                field: 'name',
                fixed: true,
            },
            {
                name: 'Team',
                field: 'team',
                fixed: true,
            },
            {
                name: '',
                field: 'remove',
                textAlign: 'right',
                fixed: true,
            },
        ];
    }

    getRows = () => {
        const {page} = this.state;
        const {channels, channelsToRemove, channelsToAdd, totalCount} = this.props; // term was here
        const {startCount, endCount} = this.getPaginationProps();

        let channelsToDisplay = channels;
        const includeTeamsList = Object.values(channelsToAdd);

        // Remove users to remove and add users to add
        channelsToDisplay = channelsToDisplay.filter((user) => !channelsToRemove[user.id]);
        channelsToDisplay = [...includeTeamsList, ...channelsToDisplay];
        channelsToDisplay = channelsToDisplay.slice(startCount - 1, endCount);

        // Dont load more elements if searching
        if (channelsToDisplay.length < PAGE_SIZE && channels.length < totalCount) { //term === '' &&  was included
            const numberOfTeamsRemoved = Object.keys(channelsToRemove).length;
            const pagesOfTeamsRemoved = Math.floor(numberOfTeamsRemoved / PAGE_SIZE);
            const pageToLoad = page + pagesOfTeamsRemoved + 1;

            // Directly call action to load more users from parent component to load more users into the state
            if (pageToLoad > this.pageLoaded) {
                this.fetchTeams(pageToLoad);
                this.pageLoaded = pageToLoad;
            }
        }

        return channelsToDisplay.map((channel) => {
            let iconToDisplay = <GlobeIcon className='channel-icon'/>;

            if (channel.type === Constants.PRIVATE_CHANNEL) {
                iconToDisplay = <LockIcon className='channel-icon'/>;
            }
            if (isArchivedChannel(channel)) {
                iconToDisplay = (
                    <ArchiveIcon
                        className='channel-icon'
                        data-testid={`${channel.name}-archive-icon`}
                    />
                );
            }
            return {
                cells: {
                    id: channel.id,
                    name: (
                        <div className='ChannelList__nameColumn'>
                            {iconToDisplay}
                            <div className='ChannelList__nameText'>
                                <b data-testid='team-display-name'>
                                    {channel.display_name}
                                </b>
                            </div>
                        </div>
                    ),
                    team: (
                        <>
                            eligendi
                        </>
                    ),
                    remove: (
                        <a
                            data-testid={`${channel.display_name}edit`}
                            className='group-actions TeamList_editText'
                            onClick={(e) => {
                                this.removeTeam(channel);
                            }}
                        >
                            <FormattedMessage
                                id='admin.data_retention.custom_policy.teams.remove'
                                defaultMessage='Remove'
                            />
                        </a>
                    ),
                },
            };
        });
    }

    render() {
        const rows: Row[] = this.getRows();
        const columns: Column[] = this.getColumns();
        const {startCount, endCount, total} = this.getPaginationProps();

        return (
            <div className='PolicyChannelsList'>
                <DataGrid
                    columns={columns}
                    rows={rows}
                    loading={this.state.loading}
                    page={this.state.page}
                    nextPage={this.nextPage}
                    previousPage={this.previousPage}
                    startCount={startCount}
                    endCount={endCount}
                    total={total}
                    className={'customTable'}
                    // onSearch={this.onSearch}
                    // term={term}
                    // placeholderEmpty={placeholderEmpty}
                    // rowsContainerStyles={rowsContainerStyles}
                    // filterProps={filterProps}
                />
            </div>
        );
    }
}

