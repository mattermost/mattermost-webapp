// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {FormattedMessage} from 'react-intl';

import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import Menu from 'components/widgets/menu/menu';
import {localizeMessage} from 'utils/utils';
import {Duration} from 'mattermost-redux/types/users';

type ExpiryMenuItem = {
    text: string;
    value: string;
}

type Props = {
    expiry: string;
    handleExpiryChange: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, expiryValue: Duration) => void;
}

const {
    DONT_CLEAR,
    THIRTY_MINUTES,
    ONE_HOUR,
    FOUR_HOURS,
    TODAY,
    THIS_WEEK,
    DATE_AND_TIME,
} = Duration;

const ExpiryMenu: React.FC<Props> = (props: Props) => {
    const {expiry, handleExpiryChange} = props;
    const expiryMenuItems: { [key: string]: ExpiryMenuItem } = {
        [DONT_CLEAR]: {
            text: localizeMessage('expiry_dropdown.dont_clear', "Don't clear"),
            value: localizeMessage('expiry_dropdown.dont_clear', "Don't clear"),
        },
        [THIRTY_MINUTES]: {
            text: localizeMessage('expiry_dropdown.thirty_minutes', '30 minutes'),
            value: localizeMessage('expiry_dropdown.thirty_minutes', '30 minutes'),
        },
        [ONE_HOUR]: {
            text: localizeMessage('expiry_dropdown.one_hour', '1 hour'),
            value: localizeMessage('expiry_dropdown.one_hour', '1 hour'),
        },
        [FOUR_HOURS]: {
            text: localizeMessage('expiry_dropdown.four_hours', '4 hours'),
            value: localizeMessage('expiry_dropdown.four_hours', '4 hours'),
        },
        [TODAY]: {
            text: localizeMessage('expiry_dropdown.today', 'Today'),
            value: localizeMessage('expiry_dropdown.today', 'Today'),
        },
        [THIS_WEEK]: {
            text: localizeMessage('expiry_dropdown.this_week', 'This week'),
            value: localizeMessage('expiry_dropdown.this_week', 'This week'),
        },
        [DATE_AND_TIME]: {
            text: localizeMessage('expiry_dropdown.choose_date_and_time', 'Choose date and time'),
            value: localizeMessage('expiry_dropdown.date_and_time', 'Date and Time'),
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
                            defaultMessage='Clear after'
                        />{': '}
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
                        ariaLabel={localizeMessage('expiry_dropdown.clear_after', 'Clear after')}
                        id='statusExpiryMenu'
                    >
                        <Menu.Group>
                            {Object.keys(expiryMenuItems).map((item) => (
                                <Menu.ItemAction
                                    key={item}
                                    onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => handleExpiryChange(event, item)}
                                    ariaLabel={expiryMenuItems[item].text.toLowerCase()}
                                    text={expiryMenuItems[item].text}
                                    id={`expiry_menu_${item}`}
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
