// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {getFilterOptions} from './get_users';

describe('get_users', () => {
    describe('getFilterOptions', () => {
        it('should return empty options in case of empty filter', () => {
            const filters = getFilterOptions('');
            expect(filters).toEqual({});
        });

        it('should return empty options in case of undefined', () => {
            const filters = getFilterOptions(undefined);
            expect(filters).toEqual({});
        });

        it('should return role options in case of system_admin', () => {
            const filters = getFilterOptions('system_admin');
            expect(filters).toEqual({role: 'system_admin'});
        });

        it('should return empty options in case of inactive', () => {
            const filters = getFilterOptions('inactive');
            expect(filters).toEqual({inactive: true});
        });
    });
});
