// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {FormattedMessage, useIntl} from 'react-intl';

import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import Menu from 'components/widgets/menu/menu';
import {CustomStatusDuration} from 'mattermost-redux/types/users';
import {durationValues} from 'utils/constants';

type ExpiryMenuItem = {
    text: string;
    value: string;
}

type Props = {
    expiry: string;
    handleExpiryChange: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, expiryValue: CustomStatusDuration) => void;
}

const {
    DONT_CLEAR,
    THIRTY_MINUTES,
    ONE_HOUR,
    FOUR_HOURS,
    TODAY,
    THIS_WEEK,
    DATE_AND_TIME,
} = CustomStatusDuration;

const ExpiryMenu: React.FC<Props> = (props: Props) => {
    const {expiry, handleExpiryChange} = props;
    const {formatMessage} = useIntl();
    const expiryMenuItems: { [key: string]: ExpiryMenuItem } = {
        [DONT_CLEAR]: {
            text: formatMessage(durationValues[DONT_CLEAR]),
            value: formatMessage(durationValues[DONT_CLEAR]),
        },
        [THIRTY_MINUTES]: {
            text: formatMessage(durationValues[THIRTY_MINUTES]),
            value: formatMessage(durationValues[THIRTY_MINUTES]),
        },
        [ONE_HOUR]: {
            text: formatMessage(durationValues[ONE_HOUR]),
            value: formatMessage(durationValues[ONE_HOUR]),
        },
        [FOUR_HOURS]: {
            text: formatMessage(durationValues[FOUR_HOURS]),
            value: formatMessage(durationValues[FOUR_HOURS]),
        },
        [TODAY]: {
            text: formatMessage(durationValues[TODAY]),
            value: formatMessage(durationValues[TODAY]),
        },
        [THIS_WEEK]: {
            text: formatMessage(durationValues[THIS_WEEK]),
            value: formatMessage(durationValues[THIS_WEEK]),
        },
        [DATE_AND_TIME]: {
            text: formatMessage({id: 'expiry_dropdown.choose_date_and_time', defaultMessage: 'Choose date and time'}),
            value: formatMessage(durationValues[DATE_AND_TIME]),
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
                        ariaLabel={formatMessage({id: 'expiry_dropdown.clear_after', defaultMessage: 'Clear after'})}
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
