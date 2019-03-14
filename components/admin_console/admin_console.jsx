// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import 'bootstrap';

import PropTypes from 'prop-types';
import React from 'react';
import {Route, Switch, Redirect} from 'react-router-dom';

import AnnouncementBar from 'components/announcement_bar';
import SystemNotice from 'components/system_notice';
import {reloadIfServerVersionChanged} from 'actions/global_actions.jsx';
import ModalController from 'components/modal_controller';

import SchemaAdminSettings from 'components/admin_console/schema_admin_settings';
import DiscardChangesModal from 'components/discard_changes_modal.jsx';

import AdminSidebar from './admin_sidebar';
import AdminDefinition from './admin_definition';
import Highlight from './highlight';

export default class AdminConsole extends React.Component {
    static propTypes = {
        config: PropTypes.object.isRequired,
        environmentConfig: PropTypes.object,
        license: PropTypes.object.isRequired,
        roles: PropTypes.object.isRequired,
        match: PropTypes.shape({
            url: PropTypes.string.isRequired,
        }).isRequired,
        showNavigationPrompt: PropTypes.bool.isRequired,
        isCurrentUserSystemAdmin: PropTypes.bool.isRequired,

        actions: PropTypes.shape({
            getConfig: PropTypes.func.isRequired,
            getEnvironmentConfig: PropTypes.func.isRequired,
            setNavigationBlocked: PropTypes.func.isRequired,
            confirmNavigation: PropTypes.func.isRequired,
            cancelNavigation: PropTypes.func.isRequired,
            loadRolesIfNeeded: PropTypes.func.isRequired,
            editRole: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);
        this.state = {
            filter: '',
        };
    }

    componentDidMount() {
        this.props.actions.getConfig();
        this.props.actions.getEnvironmentConfig();
        this.props.actions.loadRolesIfNeeded(['channel_user', 'team_user', 'system_user', 'channel_admin', 'team_admin', 'system_admin']);
        reloadIfServerVersionChanged();
    }

    onFilterChange = (filter) => {
        this.setState({filter});
    }

    mainRolesLoaded(roles) {
        return (
            roles &&
            roles.channel_admin &&
            roles.channel_user &&
            roles.team_admin &&
            roles.team_user &&
            roles.system_admin &&
            roles.system_user
        );
    }

    renderRoutes = (extraProps) => {
        const firstUrl = Object.values(AdminDefinition.reporting)[0].url;
        return (
            <Switch>
                {Object.values({...AdminDefinition.reporting, ...AdminDefinition.other}).map((item) => {
                    if (!item.schema) {
                        return null;
                    }
                    return (
                        <Route
                            key={item.url}
                            path={`${this.props.match.url}/${item.url}`}
                            render={(props) => (
                                <SchemaAdminSettings
                                    {...extraProps}
                                    {...props}
                                    schema={item.schema}
                                />
                            )}
                        />
                    );
                })}
                {Object.values(AdminDefinition.settings).map(this.renderSectionRoutes.bind(this, extraProps))}
                <Redirect to={`${this.props.match.url}/${firstUrl}`}/>
            </Switch>
        );
    }

    renderSectionRoutes = (extraProps, section) => {
        const firstUrl = Object.values(section).filter((i) => i.schema)[0].url;
        return (
            <Route
                key={section.url}
                path={`${this.props.match.url}/${section.url}`}
                render={(props) => (
                    <Switch>
                        {Object.values(section).map((item) => {
                            if (!item.schema) {
                                return null;
                            }
                            return (
                                <Route
                                    key={item.url}
                                    path={`${props.match.url}/${item.url}`}
                                    render={(subprops) => (
                                        <SchemaAdminSettings
                                            {...extraProps}
                                            {...subprops}
                                            schema={item.schema}
                                        />
                                    )}
                                />
                            );
                        })}
                        <Redirect to={`${props.match.url}/${firstUrl}`}/>
                    </Switch>
                )}
            />
        );
    }

    render() {
        const {
            license,
            config,
            environmentConfig,
            showNavigationPrompt,
            roles,
        } = this.props;
        const {setNavigationBlocked, cancelNavigation, confirmNavigation, editRole} = this.props.actions;

        if (!this.props.isCurrentUserSystemAdmin) {
            return (
                <Redirect to='/'/>
            );
        }

        if (!this.mainRolesLoaded(this.props.roles)) {
            return null;
        }

        if (Object.keys(config).length === 0) {
            return <div/>;
        }
        if (config && Object.keys(config).length === 0 && config.constructor === 'Object') {
            return (
                <div className='admin-console__wrapper'>
                    <AnnouncementBar/>
                    <div className='admin-console'/>
                </div>
            );
        }

        const discardChangesModal = (
            <DiscardChangesModal
                show={showNavigationPrompt}
                onConfirm={confirmNavigation}
                onCancel={cancelNavigation}
            />
        );

        // not every page in the system console will need the license and config, but the vast majority will
        const extraProps = {
            license,
            config,
            environmentConfig,
            setNavigationBlocked,
            roles,
            editRole,
        };

        return (
            <div className='admin-console__wrapper'>
                <AnnouncementBar/>
                <SystemNotice/>
                <AdminSidebar onFilterChange={this.onFilterChange}/>
                <div className='admin-console'>
                    <Highlight filter={this.state.filter}>
                        {this.renderRoutes(extraProps)}
                    </Highlight>
                </div>
                {discardChangesModal}
                <ModalController/>
            </div>
        );
    }
}
