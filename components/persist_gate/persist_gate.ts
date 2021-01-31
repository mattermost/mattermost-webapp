// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

type Props = {
    initialized: boolean;
    loading?: React.ReactNode;
    children: React.ReactNode;
}

// This component mirrors redux-persist v5's PersistGate component, but it
// is built to support redux-persist v4 which we use
export default class PersistGate extends React.PureComponent<Props> {
    render() {
        if (!this.props.initialized) {
            return this.props.loading;
        }

        return this.props.children;
    }
}
