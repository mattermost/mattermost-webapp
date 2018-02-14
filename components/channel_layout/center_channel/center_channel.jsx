// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {Route, Switch, Redirect} from 'react-router-dom';

import PermalinkView from 'components/permalink_view';
import Navbar from 'components/navbar';
import ChannelIdentifierRouter from 'components/channel_layout/channel_identifier_router';

export default class CenterChannel extends React.PureComponent {
    static propTypes = {
        params: PropTypes.object,
        lastChannelPath: PropTypes.string.isRequired
    };

    render() {
        const {lastChannelPath} = this.props;
        const url = this.props.params.match.url;
        return (
            <div
                id='inner-wrap-webrtc'
                key='inner-wrap'
                className='inner-wrap channel__wrap'
            >
                <div className='row header'>
                    <div id='navbar'>
                        <Navbar/>
                    </div>
                </div>
                <div className='row main'>
                    <Switch>
                        <Route
                            path={`${url}/pl/:postid`}
                            component={PermalinkView}
                        />
                        <Route
                            path={'/:team/:path(channels|messages)/:identifier'}
                            component={ChannelIdentifierRouter}
                        />
                        <Redirect to={lastChannelPath}/>
                    </Switch>
                </div>
            </div>
        );
    }
}
