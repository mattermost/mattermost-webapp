// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage, injectIntl} from 'react-intl';

import * as GlobalActions from 'actions/global_actions.jsx';

import {filterAndSortTeamsByDisplayName} from 'utils/team_utils.jsx';
import {ModalIdentifiers} from 'utils/constants';
import {intlShape} from 'utils/react_intl';

import AboutBuildModal from 'components/about_build_modal';

import Menu from 'components/widgets/menu/menu';

import MenuItemBlockableLink from './menu_item_blockable_link';

class AdminNavbarDropdown extends React.Component {
    static propTypes = {
        intl: intlShape.isRequired,
        locale: PropTypes.string.isRequired,
        siteName: PropTypes.string,
        navigationBlocked: PropTypes.bool,
        teams: PropTypes.arrayOf(PropTypes.object).isRequired,
        actions: PropTypes.shape({
            deferNavigation: PropTypes.func,
        }).isRequired,
    }

    handleLogout = (e) => {
        if (this.props.navigationBlocked) {
            e.preventDefault();
            this.props.actions.deferNavigation(GlobalActions.emitUserLoggedOutEvent);
        } else {
            GlobalActions.emitUserLoggedOutEvent();
        }
    };

    render() {
        const {locale, teams, siteName} = this.props;
        const {formatMessage} = this.props.intl;
        const teamToRender = []; // Array of team components
        let switchTeams;

        if (teams && teams.length > 0) {
            const teamsArray = filterAndSortTeamsByDisplayName(teams, locale);

            for (const team of teamsArray) {
                teamToRender.push(
                    <MenuItemBlockableLink
                        key={'team_' + team.name}
                        to={'/' + team.name}
                        text={formatMessage({id: 'navbar_dropdown.switchTo', defaultMessage: 'Switch to '}) + ' ' + team.display_name}
                    />
                );
            }
        } else {
            switchTeams = (
                <MenuItemBlockableLink
                    to={'/select_team'}
                    icon={
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
                    }
                    text={formatMessage({id: 'admin.nav.switch', defaultMessage: 'Team Selection'})}
                />
            );
        }

        return (
            <Menu ariaLabel={formatMessage({id: 'admin.nav.menuAriaLabel', defaultMessage: 'Admin Console Menu'})}>
                <Menu.Group>
                    {teamToRender}
                    {switchTeams}
                </Menu.Group>
                <Menu.Group>
                    <Menu.ItemExternalLink
                        url='https://about.mattermost.com/administrators-guide/'
                        text={formatMessage({id: 'admin.nav.administratorsGuide', defaultMessage: 'Administrator Guide'})}
                    />
                    <Menu.ItemExternalLink
                        url='https://about.mattermost.com/troubleshooting-forum/'
                        text={formatMessage({id: 'admin.nav.troubleshootingForum', defaultMessage: 'Troubleshooting Forum'})}
                    />
                    <Menu.ItemExternalLink
                        url='https://about.mattermost.com/commercial-support/'
                        text={formatMessage({id: 'admin.nav.commercialSupport', defaultMessage: 'Commercial Support'})}
                    />
                    <Menu.ItemToggleModalRedux
                        modalId={ModalIdentifiers.ABOUT}
                        dialogType={AboutBuildModal}
                        text={formatMessage({id: 'navbar_dropdown.about', defaultMessage: 'About {appTitle}'}, {appTitle: siteName || 'Mattermost'})}
                    />
                </Menu.Group>
                <Menu.Group>
                    <Menu.ItemAction
                        onClick={this.handleLogout}
                        text={formatMessage({id: 'navbar_dropdown.logout', defaultMessage: 'Logout'})}
                    />
                </Menu.Group>
            </Menu>
        );
    }
}

export default injectIntl(AdminNavbarDropdown);
