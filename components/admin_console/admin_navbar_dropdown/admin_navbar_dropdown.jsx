// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import {FormattedMessage} from 'react-intl';

import * as GlobalActions from 'actions/global_actions.jsx';

import {filterAndSortTeamsByDisplayName} from 'utils/team_utils.jsx';
import * as Utils from 'utils/utils.jsx';
import {Constants} from 'utils/constants.jsx';
import AboutBuildModal from 'components/about_build_modal';
import BlockableLink from 'components/admin_console/blockable_link';
import MenuIcon from 'components/svg/menu_icon';

export default class AdminNavbarDropdown extends React.Component {
    static propTypes = {
        locale: PropTypes.string.isRequired,

        /*
         * Bool whether the navigation is blocked by unsaved changes
         */
        navigationBlocked: PropTypes.bool,
        teams: PropTypes.arrayOf(PropTypes.object).isRequired,

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
    }

    componentWillUnmount() {
        $(ReactDOM.findDOMNode(this.refs.dropdown)).off('hide.bs.dropdown');
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

    render() {
        const {locale, teams} = this.props;
        const teamToRender = []; // Array of team components
        let switchTeams;

        if (teams && teams.length > 0) {
            const teamsArray = filterAndSortTeamsByDisplayName(teams, locale);

            for (const team of teamsArray) {
                teamToRender.push(
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

            teamToRender.push(
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
                        <FormattedMessage
                            id='select_team.icon'
                            defaultMessage='Select Team Icon'
                        >
                            {(title) => (
                                <i
                                    className='fa fa-exchange'
                                    title={title}
                                />
                            )}
                        </FormattedMessage>
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
                        {teamToRender}
                        {switchTeams}
                        <li
                            key='teamDiv'
                            className='divider'
                        />
                        <li>
                            <a
                                href='https://about.mattermost.com/administrators-guide/'
                                rel='noopener noreferrer'
                                target='_blank'
                            >
                                <FormattedMessage
                                    id='admin.nav.administratorsGuide'
                                    defaultMessage='Administrator Guide'
                                />
                            </a>
                        </li>
                        <li>
                            <a
                                href='https://about.mattermost.com/troubleshooting-forum/'
                                rel='noopener noreferrer'
                                target='_blank'
                            >
                                <FormattedMessage
                                    id='admin.nav.troubleshootingForum'
                                    defaultMessage='Troubleshooting Forum'
                                />
                            </a>
                        </li>
                        <li>
                            <a
                                href='https://about.mattermost.com/commercial-support/'
                                rel='noopener noreferrer'
                                target='_blank'
                            >
                                <FormattedMessage
                                    id='admin.nav.commercialSupport'
                                    defaultMessage='Commercial Support'
                                />
                            </a>
                        </li>
                        <li>
                            <button
                                className='style--none'
                                onClick={this.handleAboutModal}
                            >
                                <FormattedMessage
                                    id='navbar_dropdown.about'
                                    defaultMessage='About Mattermost'
                                />
                            </button>
                        </li>
                        <li className='divider'/>
                        <li>
                            <button
                                className='style--none'
                                id='logout'
                                onClick={this.handleLogout}
                            >
                                <FormattedMessage
                                    id='admin.nav.logout'
                                    defaultMessage='Logout'
                                />
                            </button>
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
