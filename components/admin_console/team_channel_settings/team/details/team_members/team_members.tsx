// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {t} from 'utils/i18n';
import AdminPanel from 'components/widgets/admin_console/admin_panel';
import DataGrid, { Column } from 'components/widgets/admin_console/data_grid/data_grid';

import {Client4} from 'mattermost-redux/client';
import ProfilePicture from 'components/profile_picture';

import './members.scss'
import CSS from 'csstype';

// import {Tab, Tabs} from 'react-bootstrap';

type Props = {
    teamId: string;

    users: any[];

    addUsersToRemove: (user: any) => void;

    stats: {
        active_member_count: number,
        team_id: string,
        total_member_count: number,
    }

    actions: {
        getTeamStats: (teamId: string) => Promise<{
            data: boolean;
        }>;
        loadProfilesAndTeamMembers: (page: number, perPage: number, teamId?: string, options?: {}) => Promise<{
            data: boolean;
        }>;
    },
}


type State = {
    loading: boolean;
    page: number;
    usersToRemove: any,
    totalMemberCount: number,
}

const USERS_PER_PAGE = 10;

export default class TeamMembers extends React.PureComponent<Props, State> {
    public constructor(props: Props) {
        super(props);

        this.state = {
            loading: true,
            page: 0,
            usersToRemove: {},
            totalMemberCount: 0,
        };
    }

    private loadPage = async (page: number) => {
        this.setState({loading: true});

        const {loadProfilesAndTeamMembers} = this.props.actions;
        const {teamId} = this.props;

        await loadProfilesAndTeamMembers(page, USERS_PER_PAGE, teamId);

        this.setState({loading: false, page});
    }

    private nextPage = () => {
        this.setState({loading: true});
        this.loadPage(this.state.page + 1);
    }

    private previousPage = () => {
        this.setState({page: this.state.page - 1});
    }

    componentDidMount() {
        this.props.actions.getTeamStats(this.props.teamId).then(() => {
            this.setState({totalMemberCount: this.props.stats.total_member_count})
        });

        this.loadPage(0);
    }

    getPaginationProps() {
        let total = this.state.totalMemberCount;

        const startCount = 1 + this.state.page * USERS_PER_PAGE;
        let endCount = (this.state.page + 1) * USERS_PER_PAGE;
        if (endCount > total) {
            endCount = total;
        }

        return { startCount, endCount, total };
    }

    getRows() {
        const {startCount, endCount} = this.getPaginationProps()
        const {usersToRemove} = this.state;
        let usersToDisplay = this.props.users;
        usersToDisplay = usersToDisplay.filter((user) => !usersToRemove[user.id])
        usersToDisplay = usersToDisplay.slice(startCount - 1, endCount);

        if (usersToDisplay.length < 10 && this.props.users.length < (this.props.stats?.total_member_count || 0)) {
            const numberOfUsersRemoved = Object.keys(usersToRemove).length
            const pageToLoad = this.state.page + Math.floor(numberOfUsersRemoved/10) + 1;
            this.props.actions.loadProfilesAndTeamMembers(pageToLoad, USERS_PER_PAGE, this.props.teamId);
        }

        return usersToDisplay.map((user) => {
            return {
                ...user,
                name: this.renderNameRow(user),
                role: 'Member',
                remove: this.renderRemove(user),
            };
        });
    }

    addUsersToRemove(user: any) {
        let {usersToRemove} = this.state;
        usersToRemove[user.id] = user;

        this.props.addUsersToRemove(user);
        this.setState({usersToRemove, totalMemberCount: this.state.totalMemberCount - 1});
        this.forceUpdate();
    }

    renderRemove(user: any) {
        const styles: CSS.Properties = {
            paddingRight: '20px',
        };

        return (

            <div style={styles}>
                <a
                    onClick={() => {this.addUsersToRemove(user)}}
                    href="#"
                >
                    <span>Remove</span>
                </a>
            </div>
        );
    }

    renderNameRow(user: any) {
        return (
            <div className='team-members-row'>
                <ProfilePicture
                    src={Client4.getProfilePictureUrl(user.id, user.last_picture_update)}
                    status={status}
                    size='md'
                />

                <div className='team-members-name'>
                    {user.username} - {user.first_name} {user.last_name}
                    <br></br>
                    <span className='team-members-email'>
                        {user.email}
                    </span>
                </div>

            </div>
        );
    }

    render() {
        const columns: Column[] = [
            {name: 'Name', field: 'name', width: 3},
            {name: 'Role', field: 'role'},
            {name: 'Position', field: 'position', width: 1},
            {name: '', field: 'remove', textAlign: 'right', fixed: true},
        ];

        const membersInTeam = (
            <DataGrid
                columns={columns}
                rows={this.getRows()}
                loading={this.state.loading}
                page={this.state.page}
                nextPage={this.nextPage}
                previousPage={this.previousPage}
                {...this.getPaginationProps()}
            />
        );

        return (
            <AdminPanel
                id='team_members'
                titleId={t('admin.team_settings.team_detail.membersTitle')}
                titleDefault='Members'
                subtitleId={t('admin.team_settings.team_detail.membersDescription')}
                subtitleDefault='The users in this list are members of this team'
            >
                {/* <Tabs defaultActiveKey="home" id="noanim-tab-example">
                    <Tab eventKey="home" title="Home"> */}
                        {membersInTeam}
                    {/* </Tab>
                </Tabs> */}
            </AdminPanel>
        );
    }
}
