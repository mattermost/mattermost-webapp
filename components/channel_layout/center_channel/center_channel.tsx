// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Route, Switch, Redirect} from 'react-router-dom';
import classNames from 'classnames';

import {Action, ActionFunc} from 'mattermost-redux/types/actions';

import LoadingScreen from 'components/loading_screen';
import PermalinkView from 'components/permalink_view';
import ChannelHeaderMobile from 'components/channel_header_mobile';
import ChannelIdentifierRouter from 'components/channel_layout/channel_identifier_router';
import PlaybookRunner from 'components/channel_layout/playbook_runner';
import {makeAsyncComponent} from 'components/async_load';
const LazyGlobalThreads = makeAsyncComponent(
    React.lazy(() => import('components/threading/global_threads')),
    (
        <div className='app__content'>
            <LoadingScreen/>
        </div>
    ),
);

type Props = {
    match: {
        url: string;
    };
    location: {
        pathname: string;
    };
    lastChannelPath: string;
    lhsOpen: boolean;
    rhsOpen: boolean;
    rhsMenuOpen: boolean;
    isCollapsedThreadsEnabled: boolean;
    currentUserId: string;
    showNextSteps: boolean;
    showNextStepsTips: boolean;
    isOnboardingHidden: boolean;
    showNextStepsEphemeral: boolean;
    actions: {
        setShowNextStepsView: (show: boolean) => Action;
        getProfiles: (page?: number, perPage?: number, options?: Record<string, string | boolean>) => ActionFunc;
    };
};

type State = {
    returnTo: string;
    lastReturnTo: string;
};

export default class CenterChannel extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            returnTo: '',
            lastReturnTo: '',
        };
    }

    static getDerivedStateFromProps(nextProps: Props, prevState: State) {
        if (prevState.lastReturnTo !== nextProps.location.pathname && nextProps.location.pathname.includes('/pl/')) {
            return {
                lastReturnTo: nextProps.location.pathname,
                returnTo: prevState.lastReturnTo,
            };
        }
        return {lastReturnTo: nextProps.location.pathname};
    }

    async componentDidMount() {
        const {actions, showNextSteps, showNextStepsTips, isOnboardingHidden} = this.props;
        await actions.getProfiles();
        if ((showNextSteps || showNextStepsTips) && !isOnboardingHidden) {
            actions.setShowNextStepsView(true);
        }
    }

    componentDidUpdate(prevProps: Props) {
        const {location, showNextStepsEphemeral, actions} = this.props;
        if (location.pathname !== prevProps.location.pathname && showNextStepsEphemeral) {
            actions.setShowNextStepsView(false);
        }
    }

    render() {
        const {lastChannelPath, isCollapsedThreadsEnabled} = this.props;
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
                    <div id='navbar_wrapper'>
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
                            path='/:team/:path(channels|messages)/:identifier/:postid?'
                            component={ChannelIdentifierRouter}
                        />
                        <Route
                            path='/:team/_playbooks/:playbookId/run'
                        >
                            <PlaybookRunner/>
                        </Route>
                        {isCollapsedThreadsEnabled ? (
                            <Route
                                path='/:team/threads/:threadIdentifier?'
                                component={LazyGlobalThreads}
                            />
                        ) : null}
                        <Redirect to={lastChannelPath}/>
                    </Switch>
                </div>
            </div>
        );
    }
}
