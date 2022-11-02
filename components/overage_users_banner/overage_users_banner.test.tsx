// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {fireEvent, screen} from '@testing-library/react';

import {DeepPartial} from '@mattermost/types/utilities';
import {GlobalState} from 'types/store';
import {General} from 'mattermost-redux/constants';
import {OverActiveUserLimits, Preferences, StatTypes} from 'utils/constants';
import {renderWithIntlAndStore} from 'tests/react_testing_utils';
import {savePreferences} from 'mattermost-redux/actions/preferences';
import {TestHelper} from 'utils/test_helper';

import OverageUsersBanner from './index';

type ComponentProps = React.ComponentProps<typeof OverageUsersBanner>;

type RenderComponentArgs = {
    props?: Partial<ComponentProps>;
    store?: any;
}

jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: jest.fn().mockReturnValue(() => {}),
}));

jest.mock('mattermost-redux/actions/preferences', () => ({
    savePreferences: jest.fn(),
}));

const seatsPurchased = 40;

const seatsMinimumFor5PercentageState = (Math.ceil(seatsPurchased * OverActiveUserLimits.MIN)) + seatsPurchased;

const seatsMinimumFor10PercentageState = (Math.ceil(seatsPurchased * OverActiveUserLimits.MAX)) + seatsPurchased;

const text5PercentageState = `Your workspace user count has exceeded your paid license seat count by ${seatsMinimumFor5PercentageState - seatsPurchased} seats`;
const text10PercentageState = `Your workspace user count has exceeded your paid license seat count by ${seatsMinimumFor10PercentageState - seatsPurchased} seats`;

describe('components/overage_users_banner', () => {
    const initialState: DeepPartial<GlobalState> = {
        entities: {
            users: {
                currentUserId: 'current_user',
                profiles: {
                    current_user: {
                        roles: General.SYSTEM_ADMIN_ROLE,
                        id: 'currentUser',
                    },
                },
            },
            admin: {
                analytics: {
                    [StatTypes.TOTAL_USERS]: 1,
                },
            },
            general: {
                license: {
                    IsLicensed: 'true',
                    IssuedAt: '1517714643650',
                    StartsAt: '1517714643650',
                    ExpiresAt: '1620335443650',
                    SkuShortName: 'Enterprise',
                    Name: 'LicenseName',
                    Company: 'Mattermost Inc.',
                    Users: String(seatsPurchased),
                },
            },
            preferences: {
                myPreferences: {},
            },
        },
    };

    const renderComponent = ({props, store}: RenderComponentArgs = {props: {}, store: initialState}) => {
        const defaultProps: React.ComponentProps<typeof OverageUsersBanner> = {
            location: 'admin-console',
        };

        return renderWithIntlAndStore(
            <OverageUsersBanner
                {...defaultProps}
                {...props}
            />, store);
    };

    it('should not render the banner because we are not on overage state', () => {
        renderComponent();

        expect(screen.queryByText('Notify your Customer Success Manager on your next true-up check')).not.toBeInTheDocument();
    });

    it('should not render the banner because we are not admins', () => {
        const store: GlobalState = JSON.parse(JSON.stringify(initialState));

        store.entities.users = {
            ...store.entities.users,
            profiles: {
                ...store.entities.users.profiles,
                current_user: {
                    ...store.entities.users.profiles.current_user,
                    roles: General.SYSTEM_USER_ROLE,
                },
            },
        };

        renderComponent({
            store,
        });

        expect(screen.queryByText('Notify your Customer Success Manager on your next true-up check')).not.toBeInTheDocument();
    });

    it('should not render the banner because it\'s cloud licenese', () => {
        const store: GlobalState = JSON.parse(JSON.stringify(initialState));

        store.entities.general.license = {
            ...store.entities.general.license,
            Cloud: 'true',
        };

        renderComponent({
            store,
        });

        expect(screen.queryByText('Notify your Customer Success Manager on your next true-up check')).not.toBeInTheDocument();
    });

    // EACH para las props de location
    it.each([['app'], ['admin-console']])('should not render the 5% banner in %s location because we have dissmised it', (location) => {
        const store: GlobalState = JSON.parse(JSON.stringify(initialState));

        store.entities.preferences.myPreferences = TestHelper.getPreferencesMock(
            [
                {
                    category: Preferences.OVERAGE_USERS_BANNER,
                    value: 'Overage users banner watched',
                    name: `warn_overage_seats_${seatsPurchased}`,
                },
            ],
        );

        store.entities.admin = {
            ...store.entities.admin,
            analytics: {
                [StatTypes.TOTAL_USERS]: seatsMinimumFor5PercentageState,
            },
        };

        renderComponent({
            store,
            props: {
                location: location as ComponentProps['location'],
            },
        });

        expect(screen.queryByText(text5PercentageState)).not.toBeInTheDocument();
    });

    it.each([['app'], ['admin-console']])('should render the banner because we are over 5% in %s location and we don\'t have any preferences', (location) => {
        const store: GlobalState = JSON.parse(JSON.stringify(initialState));

        store.entities.admin = {
            ...store.entities.admin,
            analytics: {
                [StatTypes.TOTAL_USERS]: seatsMinimumFor5PercentageState,
            },
        };

        renderComponent({
            store,
            props: {
                location: location as ComponentProps['location'],
            },
        });

        expect(screen.getByText(text5PercentageState)).toBeInTheDocument();
        //expect(screen.getByText('Notify your Customer Success Manager on your next true-up check')).toBeInTheDocument();
    });

    it.each([['app'], ['admin-console']])('should render the banner because we are over 5% in %s location and we have preferences from one old banner', (location) => {
        const store: GlobalState = JSON.parse(JSON.stringify(initialState));

        store.entities.preferences.myPreferences = TestHelper.getPreferencesMock(
            [
                {
                    category: Preferences.OVERAGE_USERS_BANNER,
                    value: 'Overage users banner watched',
                    name: `warn_overage_seats_${10}`,
                },
            ],
        );

        store.entities.admin = {
            ...store.entities.admin,
            analytics: {
                [StatTypes.TOTAL_USERS]: seatsMinimumFor5PercentageState,
            },
        };

        renderComponent({
            store,
            props: {
                location: location as ComponentProps['location'],
            },
        });

        expect(screen.getByText(text5PercentageState)).toBeInTheDocument();
        //expect(screen.getByText('Notify your Customer Success Manager on your next true-up check')).toBeInTheDocument();
    });

    it.each([['app'], ['admin-console']])('should save the preferences for 5% banner in %s location if admin click on close', (location) => {
        const store: GlobalState = JSON.parse(JSON.stringify(initialState));

        store.entities.admin = {
            ...store.entities.admin,
            analytics: {
                [StatTypes.TOTAL_USERS]: seatsMinimumFor5PercentageState,
            },
        };

        renderComponent({
            store,
            props: {
                location: location as ComponentProps['location'],
            },
        });

        fireEvent.click(screen.getByRole('button'));

        expect(savePreferences).toBeCalledTimes(1);
        expect(savePreferences).toBeCalledWith(store.entities.users.profiles.current_user.id, [{
            category: Preferences.OVERAGE_USERS_BANNER,
            name: `warn_overage_seats_${seatsPurchased}`,
            user_id: store.entities.users.profiles.current_user.id,
            value: 'Overage users banner watched',
        }]);
    });

    // Over 10% and in the system console
    it('should render the banner because we are over 10%, admin location and we don\'t have preferences', () => {
        const store: GlobalState = JSON.parse(JSON.stringify(initialState));

        store.entities.admin = {
            ...store.entities.admin,
            analytics: {
                [StatTypes.TOTAL_USERS]: seatsMinimumFor10PercentageState,
            },
        };

        renderComponent({
            store,
        });

        expect(screen.getByText(text10PercentageState)).toBeInTheDocument();
        //expect(screen.getByText('Notify your Customer Success Manager on your next true-up check')).toBeInTheDocument();
    });

    it('should render the banner because we are over 10%, admin location and we have preferences', () => {
        const store: GlobalState = JSON.parse(JSON.stringify(initialState));

        store.entities.preferences.myPreferences = TestHelper.getPreferencesMock(
            [
                {
                    category: Preferences.OVERAGE_USERS_BANNER,
                    value: 'Overage users banner watched',
                    name: `error_overage_seats_${seatsPurchased}`,
                },
            ],
        );

        store.entities.admin = {
            ...store.entities.admin,
            analytics: {
                [StatTypes.TOTAL_USERS]: seatsMinimumFor10PercentageState,
            },
        };

        renderComponent({
            store,
        });

        expect(screen.getByText(text10PercentageState)).toBeInTheDocument();
        //expect(screen.getByText('Notify your Customer Success Manager on your next true-up check')).toBeInTheDocument();
    });

    // Over 10% and in the app side
    it('should render the banner because we are over 10%, app location and we don\'t have preferences', () => {
        const store: GlobalState = JSON.parse(JSON.stringify(initialState));

        store.entities.admin = {
            ...store.entities.admin,
            analytics: {
                [StatTypes.TOTAL_USERS]: seatsMinimumFor10PercentageState,
            },
        };

        renderComponent({
            store,
            props: {
                location: 'app',
            },
        });

        expect(screen.getByText(text10PercentageState)).toBeInTheDocument();
        //expect(screen.getByText('Notify your Customer Success Manager on your next true-up check')).toBeInTheDocument();
    });

    it('should render the banner because we are over 10%, app location and we have preference only for the warning state', () => {
        const store: GlobalState = JSON.parse(JSON.stringify(initialState));

        store.entities.preferences.myPreferences = TestHelper.getPreferencesMock(
            [
                {
                    category: Preferences.OVERAGE_USERS_BANNER,
                    value: 'Overage users banner watched',
                    name: `warn_overage_seats_${seatsPurchased}`,
                },
            ],
        );

        store.entities.admin = {
            ...store.entities.admin,
            analytics: {
                [StatTypes.TOTAL_USERS]: seatsMinimumFor10PercentageState,
            },
        };

        renderComponent({
            store,
            props: {
                location: 'app',
            },
        });

        expect(screen.getByText(text10PercentageState)).toBeInTheDocument();
        //expect(screen.getByText('Notify your Customer Success Manager on your next true-up check')).toBeInTheDocument();
    });

    it('should not render the banner because we are over 10%, app location and we have preferences', () => {
        const store: GlobalState = JSON.parse(JSON.stringify(initialState));

        store.entities.preferences.myPreferences = TestHelper.getPreferencesMock(
            [
                {
                    category: Preferences.OVERAGE_USERS_BANNER,
                    value: 'Overage users banner watched',
                    name: `error_overage_seats_${seatsPurchased}`,
                },
            ],
        );

        store.entities.admin = {
            ...store.entities.admin,
            analytics: {
                [StatTypes.TOTAL_USERS]: seatsMinimumFor10PercentageState,
            },
        };

        renderComponent({
            store,
            props: {
                location: 'app',
            },
        });

        expect(screen.queryByText(text10PercentageState)).not.toBeInTheDocument();
        //expect(screen.getByText('Notify your Customer Success Manager on your next true-up check')).toBeInTheDocument();
    });

    it('should save preferences for the banner because we are over 10%, app location and we don\'t have preferences', () => {
        const store: GlobalState = JSON.parse(JSON.stringify(initialState));

        store.entities.admin = {
            ...store.entities.admin,
            analytics: {
                [StatTypes.TOTAL_USERS]: seatsMinimumFor10PercentageState,
            },
        };

        renderComponent({
            store,
            props: {
                location: 'app',
            },
        });

        fireEvent.click(screen.getByRole('button'));

        expect(savePreferences).toBeCalledTimes(1);
        expect(savePreferences).toBeCalledWith(store.entities.users.profiles.current_user.id, [{
            category: Preferences.OVERAGE_USERS_BANNER,
            name: `error_overage_seats_${seatsPurchased}`,
            user_id: store.entities.users.profiles.current_user.id,
            value: 'Overage users banner watched',
        }]);
    });
});
