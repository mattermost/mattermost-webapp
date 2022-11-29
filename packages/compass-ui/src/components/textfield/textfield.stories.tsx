// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';

import Textfield from './textfield';

export default {
    title: 'Textfield',
    component: Textfield,
};

/*
 * Example Textfield story with React Hooks.
 */
export const Primary = () => {
    const [value, setValue] = useState('');
    const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => setValue(event.target.value);
    return (
        <Textfield
            value={value}
            onChange={handleOnChange}
            label={'example label'}
        />
    );
};
