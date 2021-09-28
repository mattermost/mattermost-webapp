// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
    flex: 1;
    margin: 0px 10px;
    padding: 24px;
    background-color: #FFFFFF;
    border-radius: 8px;
    align-self: flex-start;
`;

const Title = styled.div`
    font-family: Metropolis;
    font-size: 18px;
    line-height: 24px
    margin-bottom: 20px;
    font-weight: 600;
`;

const Body = styled.div`
`;

const Unscheduled = () => {
    return (
        <Container>
            <Title>
                {'Unscheduled'}
            </Title>
            <Body>
                {'stuff'}
            </Body>
        </Container>
    );
};

export default Unscheduled;
