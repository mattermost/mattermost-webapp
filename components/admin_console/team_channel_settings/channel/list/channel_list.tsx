// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {ChannelWithTeamData} from 'mattermost-redux/types/channels';
import {ActionFunc, ActionResult} from 'mattermost-redux/types/actions';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import {Constants} from 'utils/constants';

import {Channel} from 'mattermost-redux/types/channels';
import DataGrid, {Row, Column} from 'components/admin_console/data_grid/data_grid';
import {PAGE_SIZE} from 'components/admin_console/team_channel_settings/abstract_list.jsx';


import GlobeIcon from 'components/widgets/icons/globe_icon';
import LockIcon from 'components/widgets/icons/lock_icon';

import './channel_list.scss'; 
interface ChannelListProps {
    actions: {
        searchAllChannels: (term: string, notAssociatedToGroup?: string, excludeDefaultChannels?: boolean, page?: number, perPage?: number) => ActionFunc | ActionResult;
        getData: (page: number, perPage: number, notAssociatedToGroup? : string, excludeDefaultChannels?: boolean) => ActionFunc | ActionResult | Promise<ChannelWithTeamData[]> | any;
    };
    data?: Channel[];
    total?: number;
    removeGroup?: () => void;
    onPageChangedCallback?: () => void;
    emptyListTextId?: string;
    emptyListTextDefaultMessage?: string;
}

interface ChannelListState {
    term: string;
    channels: ChannelWithTeamData[];
    loading: boolean;
    page: number;
    total: number;
}

export default class ChannelList extends React.PureComponent<ChannelListProps, ChannelListState> {
    constructor(props: ChannelListProps) {
        super(props);
        this.state = {
            loading: false,
            term: '',
            channels: [],
            page: 0,
            total: 0,
        };
    }
    
    componentDidMount() {
        this.loadPage();
    }

    getPaginationProps = () => {
        const {page, total} = this.state;
        const startCount = (page * PAGE_SIZE) + 1;
        let endCount = (page + 1) * PAGE_SIZE;
        endCount = endCount > total ? total : endCount;
        return {startCount, endCount, total};
    }

    loadPage = async (page = 0, term = '') => {
        this.setState({loading: true});
        let response, channels, total;

        if (term.length > 0) {
            response = await this.props.actions.searchAllChannels(term, '', false, page, PAGE_SIZE);
            channels = response.data.channels;
            total = response.data.total_count;
        } else {
            response = await this.props.actions.getData(page, PAGE_SIZE);
            channels = response.data.channels;
            total = response.data.total_count;
        }

        this.setState({page, loading: false, channels, total, term});
    }

    nextPage = () => {
        this.loadPage(this.state.page + 1);
    }

    previousPage = () => {
        this.loadPage(this.state.page - 1);
    }

    search = async (term = '') => {
        this.loadPage(0, term);
    }


    private getColumns = (): Column[] => {
        const name: JSX.Element = (
            <FormattedMessage
                id='admin.channel_settings.channel_list.nameHeader'
                defaultMessage='Name'
            />
        );
        const team: JSX.Element = (
            <FormattedMessage
                id='admin.channel_settings.channel_list.teamHeader'
                defaultMessage='Team'
            />
        );
        const management: JSX.Element = (
            <FormattedMessage
                id='admin.channel_settings.channel_list.managementHeader'
                defaultMessage='Management'
            />
        );

        return [
            {
                name,
                field: 'name',
                width: 3,
                fixed: true,
            },
            {
                name: team,
                field: 'team',
                width: 1.5,
                fixed: true,
            },
            {
                name: management,
                field: 'management',
                fixed: true,
            },
            {
                name: '',
                field: 'edit',
                textAlign: 'right',
                fixed: true,
            },
        ];
    }

    private getRows = (): Row[] => {
        let channelsToDisplay = [...this.state.channels];
        channelsToDisplay = channelsToDisplay.slice(0, PAGE_SIZE);

        return channelsToDisplay.map((channel) => {
            return {
                id: channel.id,
                name: (
                    <span
                        className='group-name overflow--ellipsis row-content'
                        data-testid='channel-display-name'
                    >
                        {channel.type === Constants.PRIVATE_CHANNEL ? (
                            <LockIcon className='channel-icon channel-icon__lock'/>
                        ) : (
                            <GlobeIcon className='channel-icon channel-icon__globe'/>
                        )}
                        {channel.display_name}
                    </span>
                ),
                team: (
                    <span className='group-description row-content'>
                        {channel.team_display_name}
                    </span>
                ),
                management: (
                    <span className='group-description adjusted row-content'>
                        <FormattedMessage
                            id={`admin.channel_settings.channel_row.managementMethod.${channel.group_constrained ? 'group' : 'manual'}`}
                            defaultMessage={channel.group_constrained ? 'Group Sync' : 'Manual Invites'}
                        />
                    </span>
                ),
                edit: (
                    <span
                        className='group-actions TeamList_editRow'
                        data-testid={`${channel.display_name}edit`}
                    >
                        <Link to={`/admin_console/user_management/channels/${channel.id}`} >
                            <FormattedMessage
                                id='admin.channel_settings.channel_row.configure'
                                defaultMessage='Edit'
                            />
                        </Link>
                    </span>
                ),
            };
        });
    }
    public render = (): JSX.Element => {
        const {term} = this.state;
        const rows: Row[] = this.getRows();
        const columns: Column[] = this.getColumns();
        const {startCount, endCount, total} = this.getPaginationProps();

        const placeholderEmpty: JSX.Element = (
            <FormattedMessage
                id='admin.channel_settings.channel_list.no_channels_fo'
                defaultMessage='No channels found'
            />
        );

        return (
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
                search={this.search}
                term={term}
                placeholderEmpty={placeholderEmpty}
            />
        );
    }
}
