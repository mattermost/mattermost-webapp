// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

export default class Pluggable extends React.PureComponent {
    static propTypes = {

        /*
         * Should be a single overridable React component. One of this or pluggableName is required
         */
        children: PropTypes.element,

        /*
         * Override the component to be plugged. One of this or children is required
         */
        pluggableName: PropTypes.string,

        /*
         * Components for overriding provided by plugins
         */
        components: PropTypes.object.isRequired,

        /*
         * Logged in user's theme
         */
        theme: PropTypes.object.isRequired,

        /*
         * Id of the specific component to be plugged.
         */
        pluggableId: PropTypes.string,
    }

    render() {
        const pluggableName = this.props.pluggableName;

        let child;
        if (this.props.children) {
            child = React.Children.only(this.props.children).type;
        } else if (!pluggableName) {
            return null;
        }

        const components = this.props.components;
        const childrenProps = child ? this.props.children.props : {};
        const componentName = pluggableName || child.getComponentName();

        // Include any props passed to this component or to the child component
        let props = {...this.props};
        Reflect.deleteProperty(props, 'children');
        Reflect.deleteProperty(props, 'components');
        Reflect.deleteProperty(props, 'pluggableName');
        props = {...props, ...childrenProps};

        // Override the default component with any registered plugin's component
        // Select a specific component by pluginId if available
        if (components.hasOwnProperty(componentName)) {
            let pluginComponents = components[componentName];

            if (this.props.pluggableId) {
                pluginComponents = pluginComponents.filter(
                    (element) => element.id === this.props.pluggableId);
            }

            const content = pluginComponents.map((p) => {
                const PluginComponent = p.component;
                return (
                    <PluginComponent
                        {...props}
                        theme={this.props.theme}
                        key={componentName + p.id}
                    />
                );
            });

            return (
                <React.Fragment>
                    {content}
                </React.Fragment>
            );
        }

        if (child == null) {
            return null;
        }

        return React.cloneElement(this.props.children, {...props});
    }
}
