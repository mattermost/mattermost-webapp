// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
// @flow

import * as React from 'react';

import LoadingSpinner from './loading_spinner.jsx';

type Props = {|
    loading: boolean,
    text: ?string,
    children: ?React.Node
|}

export default class LoadingWrapper extends React.Component<Props> {
    static defaultProps = {
        loading: true,
        text: null,
        children: null,
    }

    render() {
        const {text, loading, children} = this.props;
        if (!loading) {
            return children || null;
        }

        return (
            <LoadingSpinner text={text}/>
        );
    }
}
