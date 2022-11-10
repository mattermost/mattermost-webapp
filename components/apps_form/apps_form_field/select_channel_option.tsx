// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {components, OptionProps} from 'react-select';

import {AppSelectOption} from '@mattermost/types/apps';

const {Option} = components;
export const SelectChannelOption = (props: OptionProps<AppSelectOption>) => {
    const item = props.data;

    const channelName = item.display_name;
    const purpose = item.purpose;

    const icon = (
        <span className='select_option__icon select_option__icon--large'>
            <i className='icon icon--standard icon--no-spacing icon-globe'/>
        </span>
    );

    const description = '(~' + item.name + ')';

    return (<Option {...props}>
        <div className='select_option_item'>
            {icon}
            <div className='select_option__item'>
                <span className='select_option__main'>
                    {channelName}
                </span>
                <span className='ml-2'>
                    {' '}
                    {description}
                </span>
                <span className='ml-2'>
                    {' '}
                    {purpose}
                </span>
            </div></div>
    </Option>);
};
