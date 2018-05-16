// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Route} from 'react-router-dom';

import HeaderFooterTemplate from 'bundle-loader?lazy!components/header_footer_template';
import loadLoggedIn from 'bundle-loader?lazy!components/logged_in';
import {AsyncComponent} from 'components/async_load';

export const HFTRoute = ({component: Component, ...rest}) => (
    <Route
        {...rest}
        render={(props) => (
            <AsyncComponent
                doLoad={HeaderFooterTemplate}
                {...props}
            >
                <Component {...props}/>
            </AsyncComponent>
        )}
    />
);

export const LoggedInHFTRoute = ({component: Component, ...rest}) => (
    <Route
        {...rest}
        render={(props) => (
            <AsyncComponent
                doLoad={loadLoggedIn}
                {...props}
            >
                <AsyncComponent
                    doLoad={HeaderFooterTemplate}
                    {...props}
                >
                    <Component {...props}/>
                </AsyncComponent>
            </AsyncComponent>
        )}
    />
);
