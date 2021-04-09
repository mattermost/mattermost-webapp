// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import Title from './title';

import './home_view.scss';

const Home = () => {
    return (
        <div
            id='app-content'
            className='app__content HomeView'
        >
            <Title/>
        </div>
    );
}

export default Home;
