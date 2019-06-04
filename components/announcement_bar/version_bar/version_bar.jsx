// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import {FormattedMessage} from 'react-intl';

import {equalServerVersions} from 'utils/server_version.jsx';
import {AnnouncementBarTypes} from 'utils/constants.jsx';

import AnnouncementBar from '../announcement_bar.jsx';

export default class VersionBar extends React.PureComponent {
    static propTypes = {
        serverVersion: PropTypes.string,
    };

    constructor(props) {
        super(props);

        this.serverVersionAtConstruction = props.serverVersion;
    }

    reloadPage = () => {
        window.location.reload();
    }

    render() {
        if (!equalServerVersions(this.serverVersionAtConstruction, this.props.serverVersion)) {
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
