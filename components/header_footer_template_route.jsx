// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Route} from 'react-router-dom';

import {AsyncComponent} from 'components/async_load';

const HeaderFooterTemplate = React.lazy(() => import("components/header_footer_template"))
const loadLoggedIn = React.lazy(() => import("components/logged_in"));

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
