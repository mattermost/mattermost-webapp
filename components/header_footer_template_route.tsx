// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Route} from 'react-router-dom';

const HeaderFooterTemplate = React.lazy(() => import('components/header_footer_template'));
const HeaderFooterTemplateNew = React.lazy(() => import('components/header_footer_template_new'));
const LoggedIn = React.lazy(() => import('components/logged_in'));

export const HFTRoute = ({component: Component, ...rest}: {component: any}) => (
    <Route
        {...rest}
        render={(props) => (
            <React.Suspense fallback={null}>
                <HeaderFooterTemplate {...props}>
                    <Component {...props}/>
                </HeaderFooterTemplate>
            </React.Suspense>
        )}
    />
);

export const HFTRouteNew = ({component: Component, ...rest}: {component: any}) => (
    <Route
        {...rest}
        render={(props) => (
            <React.Suspense fallback={null}>
                <HeaderFooterTemplateNew {...props}>
                    <Component {...props}/>
                </HeaderFooterTemplateNew>
            </React.Suspense>
        )}
    />
);

export const LoggedInHFTRoute = ({component: Component, ...rest}: {component: any}) => (
    <Route
        {...rest}
        render={(props) => (
            <React.Suspense fallback={null}>
                <LoggedIn {...props}>
                    <React.Suspense fallback={null}>
                        <HeaderFooterTemplate {...props}>
                            <Component {...props}/>
                        </HeaderFooterTemplate>
                    </React.Suspense>
                </LoggedIn>
            </React.Suspense>
        )}
    />
);

export const LoggedInHFTRouteNew = ({component: Component, ...rest}: {component: any}) => (
    <Route
        {...rest}
        render={(props) => (
            <React.Suspense fallback={null}>
                <LoggedIn {...props}>
                    <React.Suspense fallback={null}>
                        <HeaderFooterTemplateNew {...props}>
                            <Component {...props}/>
                        </HeaderFooterTemplateNew>
                    </React.Suspense>
                </LoggedIn>
            </React.Suspense>
        )}
    />
);
