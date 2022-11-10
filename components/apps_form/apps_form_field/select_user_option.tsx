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

const {Option} = components;
export const SelectUserOption = (props: OptionProps<AppSelectOption>) => {
    const username = props.data.username;
    let description = '';

    if ((props.data.first_name || props.data.last_name) && props.data.nickname) {
        description = ` - ${Utils.getFullName(props.data)} (${props.data.nickname})`;
    } else if (props.data.nickname) {
        description = ` - (${props.data.nickname})`;
    } else if (props.data.first_name || props.data.last_name) {
        description = ` - ${Utils.getFullName(props.data)}`;
    }

    return (
        <Option {...props}>
            <div className='select_option_item'>
                <Avatar
                    size='xxs'
                    username={username}
                    url={props.data.icon_data}
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
