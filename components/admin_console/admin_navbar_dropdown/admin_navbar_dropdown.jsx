// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import * as GlobalActions from 'actions/global_actions.jsx';
import TeamStore from 'stores/team_store.jsx';

import {filterAndSortTeamsByDisplayName} from 'utils/team_utils.jsx';
import * as Utils from 'utils/utils.jsx';
import {Constants} from 'utils/constants.jsx';
import AboutBuildModal from 'components/about_build_modal';
import BlockableLink from 'components/admin_console/blockable_link';
import MenuIcon from 'components/svg/menu_icon';

export default class AdminNavbarDropdown extends React.Component {
    static propTypes = {

        /*
         * Bool whether the navigation is blocked by unsaved changes
         */
        navigationBlocked: PropTypes.bool,

        actions: PropTypes.shape({

            /*
             * Action to attempt a navigation and set a callback
             * to execute after the navigation is confirmed
             */
            deferNavigation: PropTypes.func,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            teams: TeamStore.getAll(),
            teamMembers: TeamStore.getMyTeamMembers(),
            showAboutModal: false,
        };
    }

    componentDidMount() {
        $(ReactDOM.findDOMNode(this.refs.dropdown)).on('hide.bs.dropdown', () => {
            this.blockToggle = true;
            setTimeout(() => {
                this.blockToggle = false;
            }, 100);
        });

        TeamStore.addChangeListener(this.onTeamChange);
    }

    componentWillUnmount() {
        $(ReactDOM.findDOMNode(this.refs.dropdown)).off('hide.bs.dropdown');
        TeamStore.removeChangeListener(this.onTeamChange);
    }

    handleAboutModal = (e) => {
        e.preventDefault();

        this.setState({showAboutModal: true});
    };

    handleLogout = (e) => {
        if (this.props.navigationBlocked) {
            e.preventDefault();
            this.props.actions.deferNavigation(GlobalActions.emitUserLoggedOutEvent);
        } else {
            GlobalActions.emitUserLoggedOutEvent();
        }
    };

    aboutModalDismissed = () => {
        this.setState({showAboutModal: false});
    };

    onTeamChange = () => {
        this.setState({
            teams: TeamStore.getAll(),
            teamMembers: TeamStore.getMyTeamMembers(),
        });
    };

    render() {
        var teamsArray = []; // Array of team objects
        var teams = []; // Array of team components
        let switchTeams;

        if (this.state.teamMembers && this.state.teamMembers.length > 0) {
            for (const index in this.state.teamMembers) {
                if (this.state.teamMembers.hasOwnProperty(index)) {
                    const teamMember = this.state.teamMembers[index];
                    const team = this.state.teams[teamMember.team_id];
                    teamsArray.push(team);
                }
            }

            teamsArray = filterAndSortTeamsByDisplayName(teamsArray);

            for (const team of teamsArray) {
                teams.push(
                    <li key={'team_' + team.name}>
                        <BlockableLink
                            id={'swithTo' + Utils.createSafeId(team.name)}
                            to={'/' + team.name + `/channels/${Constants.DEFAULT_CHANNEL}`}
                        >
                            <FormattedMessage
                                id='navbar_dropdown.switchTo'
                                defaultMessage='Switch to '
                            />
                            {team.display_name}
                        </BlockableLink>
                    </li>
                );
            }

            teams.push(
                <li
                    key='teamDiv'
                    className='divider'
                />
            );
        } else {
            switchTeams = (
                <li>
                    <BlockableLink
                        to={'/select_team'}
                    >
                        <i
                            className='fa fa-exchange'
                            title={Utils.localizeMessage('select_team.icon', 'Select Team Icon')}
                        />
                        <FormattedMessage
                            id='admin.nav.switch'
                            defaultMessage='Team Selection'
                        />
                    </BlockableLink>
                </li>
            );
        }

        return (
            <ul className='nav navbar-nav navbar-right admin-navbar-dropdown'>
                <li
                    ref='dropdown'
                    className='dropdown'
                >
                    <a
                        href='#'
                        id='adminNavbarDropdownButton'
                        className='dropdown-toggle admin-navbar-dropdown__toggle'
                        data-toggle='dropdown'
                        role='button'
                        aria-expanded='false'
                    >
                        <MenuIcon className='dropdown__icon admin-navbar-dropdown__icon'/>
                    </a>
                    <ul
                        className='dropdown-menu'
                        role='menu'
                    >
                        {teams}
                        {switchTeams}
                        <li
                            key='teamDiv'
                            className='divider'
                        />
                        <li>
                            <Link
                                to='https://about.mattermost.com/administrators-guide/'
                                rel='noopener noreferrer'
                                target='_blank'
                            >
                                <FormattedMessage
                                    id='admin.nav.administratorsGuide'
                                    defaultMessage='Administrator Guide'
                                />
                            </Link>
                        </li>
                        <li>
                            <Link
                                to='https://about.mattermost.com/troubleshooting-forum/'
                                rel='noopener noreferrer'
                                target='_blank'
                            >
                                <FormattedMessage
                                    id='admin.nav.troubleshootingForum'
                                    defaultMessage='Troubleshooting Forum'
                                />
                            </Link>
                        </li>
                        <li>
                            <Link
                                to='https://about.mattermost.com/commercial-support/'
                                rel='noopener noreferrer'
                                target='_blank'
                            >
                                <FormattedMessage
                                    id='admin.nav.commercialSupport'
                                    defaultMessage='Commercial Support'
                                />
                            </Link>
                        </li>
                        <li>
                            <a
                                href='#'
                                onClick={this.handleAboutModal}
                            >
                                <FormattedMessage
                                    id='navbar_dropdown.about'
                                    defaultMessage='About Mattermost'
                                />
                            </a>
                        </li>
                        <li className='divider'/>
                        <li>
                            <a
                                href='#'
                                id='logout'
                                onClick={this.handleLogout}
                            >
                                <FormattedMessage
                                    id='admin.nav.logout'
                                    defaultMessage='Logout'
                                />
                            </a>
                        </li>
                        <AboutBuildModal
                            show={this.state.showAboutModal}
                            onModalDismissed={this.aboutModalDismissed}
                        />
                    </ul>
                </li>
            </ul>
        );
    }
}
