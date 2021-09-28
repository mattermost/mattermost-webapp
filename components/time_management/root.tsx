// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import styled from 'styled-components';
import {useIntl} from 'react-intl';
import {Switch, Route, useRouteMatch} from 'react-router-dom';

import Day from './day';
import Unscheduled from './unscheduled';

const Header = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-bottom: 24px;
`;

const HeaderTitle = styled.div`
    font-family: Metropolis;
    font-size: 28px;
    font-weight: 700;
    line-height: 36px;
    margin-bottom: 4px;
    color: #3D3C40;
`;

const HeaderSubTitle = styled.div`
    font-family: Open Sans;
    font-style: normal;
    font-weight: normal;
    font-size: 12px;
    line-height: 16px;
    color: #3D3C40;
`;

const Container = styled.div`
    height: 100%;
    background-color: #E5E5E5;
    overflow: scroll;
`;

const Content = styled.div`
    margin: 32px;
`;

const Body = styled.div`
`;

const Home = styled.div`
    display: flex;
`;

const Root = () => {
    const match = useRouteMatch();
    const {formatDate} = useIntl();

    return (
        <Container>
            <Content>
                <Header>
                    <HeaderTitle>
                        {'Good Morning, Curiosity'}
                    </HeaderTitle>
                    <HeaderSubTitle>
                        {`-60°C Clear Skies in Greenheugh Pediment, Mars • ${formatDate(new Date(), {month: 'long', weekday: 'long', day: 'numeric', year: 'numeric'})}`}
                    </HeaderSubTitle>
                </Header>
                <Body>
                    <Switch>
                        <Route path={`${match.url}/`}>
                            <Home>
                                <Day/>
                                <Unscheduled/>
                            </Home>
                        </Route>
                    </Switch>
                </Body>
            </Content>
        </Container>
    );
};

export default Root;
