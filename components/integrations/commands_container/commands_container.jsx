// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Route, Switch, Redirect} from 'react-router-dom';

import InstalledCommands from 'components/integrations/installed_commands';
import AddCommand from 'components/integrations/add_command';
import EditCommand from 'components/integrations/edit_command';
import ConfirmIntegration from 'components/integrations/confirm_integration';

const CommandRoute = ({component: Component, extraProps, ...rest}) => ( //eslint-disable-line react/prop-types
    <Route
        {...rest}
        render={(props) => (
            <Component
                {...extraProps}
                {...props}
            />
        )}
    />
);

export default class CommandsContainer extends React.PureComponent {
    static propTypes = {

        /**
        * The team data needed to pass into child components
        */
        team: PropTypes.object,

        /**
        * The user data needed to pass into child components
        */
        user: PropTypes.object,

        /**
        * The users collection
        */
        users: PropTypes.object,

        /**
        * Installed slash commands to display
        */
        commands: PropTypes.array,

        /**
        * Object from react-router
        */
        match: PropTypes.shape({
            url: PropTypes.string.isRequired,
        }).isRequired,

        actions: PropTypes.shape({

            /**
            * The function to call to fetch team commands
            */
            loadCommandsAndProfilesForTeam: PropTypes.func.isRequired,
        }).isRequired,

        /**
        * Whether or not commands are enabled.
        */
        enableCommands: PropTypes.bool,
    }

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
        };
    }

    componentDidMount() {
        if (this.props.enableCommands) {
            this.props.actions.loadCommandsAndProfilesForTeam(this.props.team.id).then(
                () => this.setState({loading: false}),
            );
        }
    }

    render() {
        const extraProps = {
            loading: this.state.loading,
            commands: this.props.commands || [],
            users: this.props.users,
            team: this.props.team,
            user: this.props.user,
        };
        return (
            <div>
                <Switch>
                    <Route
                        exact={true}
                        path={`${this.props.match.url}/`}
                        render={() => (<Redirect to={`${this.props.match.url}/installed`}/>)}
                    />
                    <CommandRoute
                        extraProps={extraProps}
                        path={`${this.props.match.url}/installed`}
                        component={InstalledCommands}
                    />
                    <CommandRoute
                        extraProps={extraProps}
                        path={`${this.props.match.url}/add`}
                        component={AddCommand}
                    />
                    <CommandRoute
                        extraProps={extraProps}
                        path={`${this.props.match.url}/edit`}
                        component={EditCommand}
                    />
                    <CommandRoute
                        extraProps={extraProps}
                        path={`${this.props.match.url}/confirm`}
                        component={ConfirmIntegration}
                    />
                </Switch>
            </div>
        );
    }
}
