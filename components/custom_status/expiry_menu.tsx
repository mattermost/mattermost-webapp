// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {FormattedMessage} from 'react-intl';

import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import Menu from 'components/widgets/menu/menu';
import {localizeMessage} from 'utils/utils';

type ExpiryMenuItem = {
    text: string;
    value: string;
    localizationId: string;
}

type Props = {
    expiry: string;
    handleExpiryChange: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, expiryValue: string) => void;
}

const ExpiryMenu: React.FC<Props> = (props: Props) => {
    const {expiry, handleExpiryChange} = props;
    const expiryMenuItems: { [key: string]: ExpiryMenuItem } = {
        'dont-clear': {
            text: "Don't clear",
            value: "Don't clear",
            localizationId: 'dont_clear',
        },
        'thirty-minutes': {
            text: '30 minutes',
            value: '30 minutes',
            localizationId: 'thirty_minutes',
        },
        'one-hour': {
            text: '1 hour',
            value: '1 hour',
            localizationId: 'one_hour',
        },
        'four-hours': {
            text: '4 hours',
            value: '4 hours',
            localizationId: 'four_hours',
        },
        today: {
            text: 'Today',
            value: 'Today',
            localizationId: 'today',
        },
        'this-week': {
            text: 'This week',
            value: 'This week',
            localizationId: 'this_week',
        },
        'date-and-time': {
            text: 'Choose date and time',
            value: 'Date and Time',
            localizationId: 'choose_date_and_time',
        },
    };

    return (
        <div className='statusExpiry'>
            <div className='statusExpiry__content'>
                <MenuWrapper
                    className={'statusExpiry__menu'}
                >
                    <span className='expiry-wrapper expiry-selector'>
                        <FormattedMessage
                            id='expiry_dropdown.clear_after'
                            defaultMessage='Clear after: '
                        />
                        <span className='expiry-value'>
                            {expiryMenuItems[expiry].value}
                        </span>
                        <span>
                            <i
                                className='fa fa-angle-down'
                                aria-hidden='true'
                            />
                        </span>
                    </span>
                    <Menu
                        ariaLabel={localizeMessage('expiry_dropdown.menuAriaLabel', 'Clear after')}
                        id='statusExpiryMenu'
                    >
                        <Menu.Group>
                            {Object.keys(expiryMenuItems).map((item, index) => (
                                <Menu.ItemAction
                                    key={index}
                                    onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => handleExpiryChange(event, item)}
                                    ariaLabel={localizeMessage(`expiry_dropdown.${expiryMenuItems[item].localizationId}`, expiryMenuItems[item].text).toLowerCase()}
                                    text={localizeMessage(`expiry_dropdown.${expiryMenuItems[item].localizationId}`, expiryMenuItems[item].text)}
                                    id={`expiry-menu-${item}`}
                                />
                            ))}
                        </Menu.Group>
                    </Menu>
                </MenuWrapper>
            </div>
        </div>
    );
};

export default ExpiryMenu;
