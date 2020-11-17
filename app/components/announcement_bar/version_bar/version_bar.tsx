// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {FormattedMessage} from 'react-intl';

import {equalServerVersions} from 'utils/server_version';
import {AnnouncementBarTypes} from 'utils/constants';

import AnnouncementBar from '../default_announcement_bar';

interface Props {
    serverVersion: string,
}

interface State {
    serverVersionOnAppLoad: string,
}

export default class VersionBar extends React.PureComponent <Props, State> {
    constructor(props:Props) {
        super(props);

        this.state = {
            serverVersionOnAppLoad: props.serverVersion,
        };
    }

    static getDerivedStateFromProps(props:Props, state:State) {
        if (!state.serverVersionOnAppLoad && props.serverVersion) {
            return {
                serverVersionOnAppLoad: props.serverVersion,
            };
        }

        return null;
    }

    reloadPage = () => {
        window.location.reload();
    }

    render() {
        const {serverVersionOnAppLoad} = this.state;
        const {serverVersion} = this.props;

        if (!serverVersionOnAppLoad) {
            return null;
        }

        if (!equalServerVersions(serverVersionOnAppLoad, serverVersion)) {
            return (
                <AnnouncementBar
                    type={AnnouncementBarTypes.ANNOUNCEMENT}
                    message={
                        <React.Fragment>
                            <FormattedMessage
                                id='version_bar.new'
                                defaultMessage='A new version of Mattermost is available.'
                            />
                            {' '}
                            <a onClick={this.reloadPage}>
                                <FormattedMessage
                                    id='version_bar.refresh'
                                    defaultMessage='Refresh the app now'
                                />
                            </a>
                            {'.'}
                        </React.Fragment>
                    }
                />
            );
        }

        return null;
    }
}
