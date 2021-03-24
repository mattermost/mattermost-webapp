// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage, injectIntl, IntlShape} from 'react-intl';

import {Team} from 'mattermost-redux/types/teams';

import * as GlobalActions from 'actions/global_actions';
import {trackEvent} from 'actions/telemetry_actions.jsx';

import {filterAndSortTeamsByDisplayName} from 'utils/team_utils.jsx';
import {ModalIdentifiers} from 'utils/constants';

import AboutBuildModal from 'components/about_build_modal';
import CommercialSupportModal from 'components/commercial_support_modal';

import Menu from 'components/widgets/menu/menu';

import MenuItemBlockableLink from './menu_item_blockable_link';

type Props = {
    intl: IntlShape;
    locale: string;
    siteName?: string;
    navigationBlocked?: boolean;
    teams: Team[];
    actions: {
        deferNavigation: (onNavigationConfirmed: any) => any;
    };
    isLicensed: boolean;
    isCloud: boolean;
};

class AdminNavbarDropdown extends React.PureComponent<Props> {
    private handleLogout = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (this.props.navigationBlocked) {
            e.preventDefault();
            this.props.actions.deferNavigation(GlobalActions.emitUserLoggedOutEvent);
        } else {
            GlobalActions.emitUserLoggedOutEvent();
        }
    };

    render(): JSX.Element {
        const {locale, teams, siteName, isLicensed, isCloud} = this.props;
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
                    />,
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
                            {(title) => {
                                return (
                                    <i
                                        className='fa fa-exchange'
                                        title={title as string}
                                    />
                                );
                            }}
                        </FormattedMessage>
                    }
                    text={formatMessage({id: 'admin.nav.switch', defaultMessage: 'Team Selection'})}
                />
            );
        }

        let commercialSupport = (
            <Menu.ItemExternalLink
                onClick={() => trackEvent('admin', 'click_administrators_support')}
                url='https://about.mattermost.com/commercial-support/'
                text={formatMessage({id: 'admin.nav.commercialSupport', defaultMessage: 'Commercial Support'})}
            />
        );

        if (isLicensed) {
            commercialSupport = (
                <Menu.ItemToggleModalRedux
                    modalId={ModalIdentifiers.COMMERCIAL_SUPPORT}
                    dialogType={CommercialSupportModal}
                    text={formatMessage({id: 'admin.nav.commercialSupport', defaultMessage: 'Commercial Support'})}
                />
            );
        }

        let adminGuideLink = 'https://about.mattermost.com/administrators-guide/';
        if (isCloud) {
            adminGuideLink = 'https://docs.mattermost.com/guides/cloud-admin-guide.html';
        }

        return (
            <Menu ariaLabel={formatMessage({id: 'admin.nav.menuAriaLabel', defaultMessage: 'Admin Console Menu'})}>
                <Menu.Group>
                    {teamToRender}
                    {switchTeams}
                </Menu.Group>
                <Menu.Group>
                    <Menu.ItemExternalLink
                        onClick={() => trackEvent('admin', 'click_administrators_guide')}
                        url={adminGuideLink}
                        text={formatMessage({id: 'admin.nav.administratorsGuide', defaultMessage: 'Administrator Guide'})}
                    />
                    <Menu.ItemExternalLink
                        onClick={() => trackEvent('admin', 'click_administrators_forum')}
                        url={'https://about.mattermost.com/troubleshooting-forum/'}
                        text={formatMessage({id: 'admin.nav.troubleshootingForum', defaultMessage: 'Troubleshooting Forum'})}
                    />
                    {commercialSupport}
                    <Menu.ItemToggleModalRedux
                        onClick={() => trackEvent('admin', 'click_administrators_about')}
                        modalId={ModalIdentifiers.ABOUT}
                        dialogType={AboutBuildModal}
                        text={formatMessage({id: 'navbar_dropdown.about', defaultMessage: 'About {appTitle}'}, {appTitle: siteName || 'Mattermost'})}
                    />
                </Menu.Group>
                <Menu.Group>
                    <Menu.ItemAction
                        onClick={this.handleLogout}
                        text={formatMessage({id: 'navbar_dropdown.logout', defaultMessage: 'Log Out'})}
                    />
                </Menu.Group>
            </Menu>
        );
    }
}

export default injectIntl(AdminNavbarDropdown);
