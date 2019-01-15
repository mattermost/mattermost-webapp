// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {Route, Switch, Redirect} from 'react-router-dom';
import classNames from 'classnames';

import PermalinkView from 'components/permalink_view';
import ChannelHeaderMobile from 'components/channel_header_mobile';
import ChannelIdentifierRouter from 'components/channel_layout/channel_identifier_router';

export default class CenterChannel extends React.PureComponent {
    static propTypes = {
        match: PropTypes.object.isRequired,
        location: PropTypes.object.isRequired,
        lastChannelPath: PropTypes.string.isRequired,
        lhsOpen: PropTypes.bool.isRequired,
        rhsOpen: PropTypes.bool.isRequired,
        rhsMenuOpen: PropTypes.bool.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            returnTo: '',
        };
    }

    UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line camelcase
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
                    'move--right': this.props.lhsOpen,
                    'move--left': this.props.rhsOpen,
                    'move--left-small': this.props.rhsMenuOpen,
                })}
            >
                <div className='row header'>
                    <div id='navbar'>
                        <ChannelHeaderMobile/>
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
                            component={ChannelIdentifierRouter}
                        />
                        <Redirect to={lastChannelPath}/>
                    </Switch>
                </div>
            </div>
        );
    }
}
