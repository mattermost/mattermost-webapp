// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import hoistStatics from 'hoist-non-react-statics';
import React from 'react';

/**
 * Allows two animation frames to complete to allow other components to update
 * and re-render before mounting and rendering an expensive `WrappedComponent`.
 * If provided, `PreRenderComponent` will be rendered instead of null when not
 * rendering the `Wrapped Component`.
 *
 * Based on this Twitter built component
 * https://gist.github.com/paularmstrong/cc2ead7e2a0dec37d8b2096fc8d85759#file-defercomponentrender-js
 */
export default function deferComponentRender(WrappedComponent, PreRenderComponent = null) {
    class DeferredRenderWrapper extends React.Component {
        constructor(props, context) {
            super(props, context);

            this.state = {
                shouldRender: false,
            };
        }

        componentDidMount() {
            window.requestAnimationFrame(() => {
                window.requestAnimationFrame(() => this.setState({shouldRender: true}));
            });
        }

        render() {
            return this.state.shouldRender ? <WrappedComponent {...this.props}/> : PreRenderComponent;
        }
    }

    return hoistStatics(DeferredRenderWrapper, WrappedComponent);
}
