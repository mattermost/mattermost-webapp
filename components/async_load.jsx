// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {PropTypes} from 'prop-types';

export class AsyncComponent extends React.Component {
    static propTypes = {

        /**
         * Function that loads the component asyncronously
         */
        doLoad: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            loadedModule: null,
        };
    }

    componentWillMount() {
        this.load(this.props);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.doLoad !== this.props.doLoad) {
            this.load(nextProps);
        }
    }

    load(props) {
        props.doLoad((loadedModule) => {
            this.setState({loadedModule: loadedModule.default ? loadedModule.default : loadedModule});
        });
    }

    render() {
        return this.state.loadedModule ? <this.state.loadedModule {...this.props}/> : null;
    }
}

export function makeAsyncComponent(loadComponent) {
    return (props) => (<AsyncComponent
        doLoad={loadComponent}
        {...props}
                       />);
}
