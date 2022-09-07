// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {FC} from 'react';
import {FormattedMessage} from 'react-intl';

import classNames from 'classnames';
import IconProps from '@mattermost/compass-icons/components/props';

import './sidebar_list_item.scss';

interface Props {
    icon: JSX.Element;
    title: string;
    activeTab: string;
    setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}

const SidebarListItem: FC<Props> = ({
    icon,
    title,
    activeTab,
    setActiveTab,
}: Props) => {
    const handleSetActiveTab = (title: string) => {
        setActiveTab(title);
    };

    return (
        <button
            onClick={() => handleSetActiveTab(title)}
            className={classNames(
                'user-settings-modal__sidebar-item', {
                    'user-settings-modal__sidebar-item--active': activeTab === title,
                })}
        >
            <span>
                {icon}
            </span>
            <span className='user-settings-modal__sidebar-item__title'>
                <FormattedMessage
                    id={`user.settings.sidebar.${title}`}
                    defaultMessage={title}
                />
            </span>
        </button>
    );
};

export default SidebarListItem;
