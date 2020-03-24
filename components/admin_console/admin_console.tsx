// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import 'bootstrap';

import React from 'react';
import {Route, Switch, Redirect} from 'react-router-dom';

import {ActionFunc} from 'mattermost-redux/types/actions';
import {Role} from 'mattermost-redux/types/roles';

import AnnouncementBar from 'components/announcement_bar';
import SystemNotice from 'components/system_notice';
import ModalController from 'components/modal_controller';

import SchemaAdminSettings from 'components/admin_console/schema_admin_settings';
import DiscardChangesModal from 'components/discard_changes_modal';

import AdminSidebar from './admin_sidebar';
import Highlight from './highlight';

type Props = {
    config: Record<string, any>;
    adminDefinition: Record<string, any>;
    environmentConfig?: Record<string, any>;
    license: Record<string, any>;
    unauthorizedRoute: string;
    buildEnterpriseReady: boolean;
    roles: {
        [x: string]: string | object;
    };
    match: { url: string };
    showNavigationPrompt: boolean;
    isCurrentUserSystemAdmin: boolean;
    actions: {
        getConfig: () => ActionFunc;
        getEnvironmentConfig: () => ActionFunc;
        setNavigationBlocked: () => void;
        confirmNavigation: () => void;
        cancelNavigation: () => void;
        loadRolesIfNeeded: (roles: Iterable<string>) => ActionFunc;
        selectChannel: (channelId: string) => void;
        selectTeam: (teamId: string) => void;
        editRole: (role: Role) => void;
        updateConfig?: (config: Record<string, any>) => ActionFunc;
    };
}

type State = {
    filter: string;
}

// not every page in the system console will need the license and config, but the vast majority will
type ExtraProps = {
    license?: Record<string, any>;
    config?: Record<string, any>;
    environmentConfig?: Record<string, any>;
    setNavigationBlocked?: () => void;
    roles?: {
        [x: string]: string | object;
    };
    editRole?: (role: Role) => void;
    updateConfig?: (config: Record<string, any>) => ActionFunc;
}

type Item = {
    isHidden?: (config?: Record<string, any>, state?: Record<string, any>, license?: Record<string, any>, buildEnterpriseReady?: boolean) => void;
    schema: Record<string, any>;
    url: string;
}

export default class AdminConsole extends React.Component<Props, State> {
    public constructor(props: Props) {
        super(props);
        this.state = {
            filter: '',
        };
    }

    public componentDidMount(): void {
        this.props.actions.getConfig();
        this.props.actions.getEnvironmentConfig();
        this.props.actions.loadRolesIfNeeded(['channel_user', 'team_user', 'system_user', 'channel_admin', 'team_admin', 'system_admin']);
        this.props.actions.selectChannel('');
        this.props.actions.selectTeam('');
    }

    private onFilterChange = (filter: string) => {
        this.setState({filter});
    }

    private mainRolesLoaded(roles: Record<string, any>) {
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

    private renderRoutes = (extraProps: ExtraProps) => {
        const schemas = Object.values(this.props.adminDefinition).reduce((acc, section: Item[]) => {
            const items = Object.values(section).filter((item: Item) => {
                if (item.isHidden && item.isHidden(this.props.config, {}, this.props.license, this.props.buildEnterpriseReady)) {
                    return false;
                }
                if (!item.schema) {
                    return false;
                }
                return true;
            });
            return acc.concat(items);
        }, []);
        const schemaRoutes = schemas.map((item: Item) => {
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
        });
        const defaultUrl = schemas[0].url;

        return (
            <Switch>
                {schemaRoutes}
                {<Redirect to={`${this.props.match.url}/${defaultUrl}`}/>}
            </Switch>
        );
    }

    public render(): JSX.Element | null {
        const {
            license,
            config,
            environmentConfig,
            showNavigationPrompt,
            roles,
        } = this.props;
        const {setNavigationBlocked, cancelNavigation, confirmNavigation, editRole, updateConfig} = this.props.actions;

        if (!this.props.isCurrentUserSystemAdmin) {
            return (
                <Redirect to={this.props.unauthorizedRoute}/>
            );
        }

        if (!this.mainRolesLoaded(this.props.roles)) {
            return null;
        }

        if (Object.keys(config).length === 0) {
            return <div/>;
        }

        if (config && Object.keys(config).length === 0 && config.constructor === Object) {
            return (
                <div className='admin-console__wrapper'>
                    <AnnouncementBar/>
                    <div className='admin-console'/>
                </div>
            );
        }

        const discardChangesModal: JSX.Element = (
            <DiscardChangesModal
                show={showNavigationPrompt}
                onConfirm={confirmNavigation}
                onCancel={cancelNavigation}
            />
        );

        const extraProps: ExtraProps = {
            license,
            config,
            environmentConfig,
            setNavigationBlocked,
            roles,
            editRole,
            updateConfig,
        };
        return (
            <div
                className='admin-console__wrapper'
                id='adminConsoleWrapper'
            >
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
