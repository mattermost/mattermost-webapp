// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Theme} from 'mattermost-redux/types/themes';

import {GlobalState} from 'types/store';

type Props = {

    /*
     * Override the component to be plugged
     */
    pluggableName: string;

    /*
     * Components for overriding provided by plugins
     */
    components: GlobalState['plugins']['components'];

    /*
     * Logged in user's theme
     */
    theme: Theme;

    /*
     * Id of the specific component to be plugged.
     */
    pluggableId?: string;

    /*
     * Name of the sub component to use. Defaults to 'component' if unspecified.
     */
    subComponentName?: 'mainComponent' | 'headerCentreComponent' | 'headerRightComponent';

    /*
     * Accept any other prop to pass onto the plugin component
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [name: string]: any;
}

type BaseChildProps = {
    theme: Theme;
}

export default function Pluggable(props: Props): JSX.Element | null {
    const {
        components,
        pluggableId,
        pluggableName,
        subComponentName = '',
        theme,
        ...otherProps
    } = props;

    if (!pluggableName || !Object.hasOwnProperty.call(components, pluggableName)) {
        return null;
    }

    // Override the default component with any registered plugin's component
    // Select a specific component by pluginId if available
    let content;

    if (pluggableName === 'Product') {
        content = components.Product.map((pc) => {
            if (!subComponentName || !pc[subComponentName]) {
                return null;
            }

            const Component = pc[subComponentName]! as React.ComponentType<BaseChildProps>;

            return (
                <Component
                    {...otherProps}
                    theme={theme}
                    key={pluggableName + pc.id}
                />
            );
        });
    } else {
        let pluginComponents = components[pluggableName]!;

        if (pluggableId) {
            pluginComponents = pluginComponents.filter(
                (element) => element.id === pluggableId);
        }

        content = pluginComponents.map((p) => {
            if (!p.component) {
                return null;
            }

            const Component = p.component as React.ComponentType<BaseChildProps>;

            return (
                <Component
                    {...otherProps}
                    theme={theme}
                    key={pluggableName + p.id}
                />
            );
        });
    }

    return (
        <React.Fragment>
            {content}
        </React.Fragment>
    );
}
