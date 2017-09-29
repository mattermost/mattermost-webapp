// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

// EXPERIMENTAL - SUBJECT TO CHANGE

import React from 'react';
import PropTypes from 'prop-types';

export default class Pluggable extends React.PureComponent {
    static propTypes = {

        /*
         * Should be a single overridable React component. One of this or overrideName is required
         */
        children: PropTypes.element,

        /*
         * Override the component to be plugged. One of this or children is required
         */
        overrideName: PropTypes.string,

        /*
         * Components for overriding provided by plugins
         */
        components: PropTypes.object.isRequired,

        /*
         * Logged in user's theme
         */
        theme: PropTypes.object.isRequired
    }

    render() {
        const overrideName = this.props.overrideName;

        let child;
        if (this.props.children) {
            child = React.Children.only(this.props.children).type;
        } else if (!overrideName) {
            return null;
        }

        const components = this.props.components;
        const childrenProps = child ? this.props.children.props : {};
        const componentName = overrideName || child.getComponentName();

        // Include any props passed to this component or to the child component
        let props = {...this.props};
        Reflect.deleteProperty(props, 'children');
        Reflect.deleteProperty(props, 'components');
        Reflect.deleteProperty(props, 'overrideName');
        props = {...props, ...childrenProps};

        // Override the default component with any registered plugin's component
        if (components.hasOwnProperty(componentName)) {
            const PluginComponent = components[componentName].component;
            return (
                <PluginComponent
                    {...props}
                    theme={this.props.theme}
                />
            );
        }

        if (child == null) {
            return null;
        }

        return React.cloneElement(this.props.children, {...props});
    }
}
