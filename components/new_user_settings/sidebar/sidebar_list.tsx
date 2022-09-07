// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {FC, useState} from 'react';

import SidebarListItem from './sidebar_list_item';

import './sidebar_list.scss';
import {sideBarListData} from '../user_settings_modal/user_settings_modal';

interface Props {
    activeTab: string;
    setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}

const SidebarList: FC<Props> = ({activeTab, setActiveTab}: Props) => {
    return (
        <div className='user-settings-modal__sidebar'>
            {sideBarListData.map((item) => (
                <SidebarListItem
                    key={item.title}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    {...item}
                />
            ))}
        </div>
    );
};

export default SidebarList;
