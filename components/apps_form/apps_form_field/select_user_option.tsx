// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {components, OptionProps} from 'react-select';

import {AppSelectOption} from '@mattermost/types/apps';
import Avatar from 'components/widgets/users/avatar/avatar';

import * as Utils from 'utils/utils';
import BotBadge from 'components/widgets/badges/bot_badge';
import GuestBadge from 'components/widgets/badges/guest_badge';
import {isGuest} from 'mattermost-redux/utils/user_utils';
import {imageURLForUser} from 'utils/utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getDescription = (data: any): string => {
    if ((data.first_name || data.last_name) && data.nickname) {
        return ` - ${Utils.getFullName(data)} (${data.nickname})`;
    } else if (data.nickname) {
        return ` - (${data.nickname})`;
    } else if (data.first_name || data.last_name) {
        return ` - ${Utils.getFullName(data)}`;
    }
    return '';
};

const {Option} = components;

export const SelectUserOption = (props: OptionProps<AppSelectOption>) => {
    const username = props.data.username;
    const description = getDescription(props.data);

    return (
        <Option {...props}>
            <div className='select_option_item'>
                <Avatar
                    size='xxs'
                    username={username}
                    url={imageURLForUser(props.data.id)}
                />
                <div className='select_option__item'>
                    <span className='select_option__main'>
                        {'@' + username}
                    </span>
                    <span>
                        {' '}
                        {description}
                    </span>
                </div>
                <BotBadge show={Boolean(props.data.is_bot)}/>
                <GuestBadge show={isGuest(props.data.roles)}/>
            </div>
        </Option>
    );
};
