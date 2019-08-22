// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {getUserOptionsFromFilter, searchUserOptionsFromFilter} from './filter_users';

describe('filter_users', () => {
    describe('getUserOptionsFromFilter', () => {
        it('should return empty options in case of empty filter', () => {
            const filters = getUserOptionsFromFilter('');
            expect(filters).toEqual({});
        });

        it('should return empty options in case of undefined', () => {
            const filters = getUserOptionsFromFilter(undefined);
            expect(filters).toEqual({});
        });

        it('should return role options in case of system_admin', () => {
            const filters = getUserOptionsFromFilter('system_admin');
            expect(filters).toEqual({role: 'system_admin'});
        });

        it('should return inactive option in case of inactive', () => {
            const filters = getUserOptionsFromFilter('inactive');
            expect(filters).toEqual({inactive: true});
        });
    });
    describe('searchUserOptionsFromFilter', () => {
        it('should return empty options in case of empty filter', () => {
            const filters = searchUserOptionsFromFilter('');
            expect(filters).toEqual({});
        });

        it('should return empty options in case of undefined', () => {
            const filters = searchUserOptionsFromFilter(undefined);
            expect(filters).toEqual({});
        });

        it('should return role options in case of system_admin', () => {
            const filters = searchUserOptionsFromFilter('system_admin');
            expect(filters).toEqual({role: 'system_admin'});
        });

        it('should return allow_inactive option in case of inactive', () => {
            const filters = searchUserOptionsFromFilter('inactive');
            expect(filters).toEqual({allow_inactive: true});
        });
    });
});
