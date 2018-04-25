// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {Route, Switch, Redirect} from 'react-router-dom';
import classNames from 'classnames';

import PermalinkView from 'components/permalink_view/index.js';
import Navbar from 'components/navbar';

import ChannelIdentifierRouter from 'components/channel_layout/channel_identifier_router.jsx';

export default class CenterChannel extends React.PureComponent {
    static propTypes = {
        match: PropTypes.object.isRequired,
        location: PropTypes.object.isRequired,
        lastChannelPath: PropTypes.string.isRequired,
        lhsOpen: PropTypes.bool.isRequired,
        rhsOpen: PropTypes.bool.isRequired,
        rhsMenuOpen: PropTypes.bool.isRequired,
        webRtcOpen: PropTypes.bool.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            returnTo: '',
        };
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.location.pathname !== nextProps.location.pathname && nextProps.location.pathname.includes('/pl/')) {
            this.setState({returnTo: this.props.location.pathname});
        }
    }

    render() {
        const {lastChannelPath} = this.props;
        const url = this.props.match.url;
        return (
            <div
                key='inner-wrap'
                className={classNames('inner-wrap', 'channel__wrap', {
                    'webrtc--show': this.props.webRtcOpen,
                    'move--right': this.props.lhsOpen,
                    'move--left': this.props.rhsOpen || this.props.webRtcOpen,
                    'move--left-small': this.props.rhsMenuOpen,
                })}
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
                            render={(props) => (
                                <PermalinkView
                                    {...props}
                                    returnTo={this.state.returnTo}
                                />
                            )}
                        />
                        <Route
                            path={'/:team/:path(channels|messages)/:identifier'}
                            render={({props, match, history}) => (
                                <ChannelIdentifierRouter
                                    match={match}
                                    history={history}
                                    {...props}
                                />
                            )}
                        />
                        <Redirect to={lastChannelPath}/>
                    </Switch>
                </div>
            </div>
        );
    }
}
