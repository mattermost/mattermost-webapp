// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {ArrowForwardIosIcon} from '@mattermost/compass-icons/components';

import {PopoverMenuItem, Props as PopoverMenuItemProps} from 'components/menu_item_types/popover_menu_item';

type Props = Omit<PopoverMenuItemProps, 'trailingElement'>

export function PopoverSubMenuItem(props: Props) {
    return (
        <PopoverMenuItem
            {...props}
            trailingElement={<ArrowForwardIosIcon size={18}/>}
        />
    );
}
