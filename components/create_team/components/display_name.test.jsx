// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {shallow} from 'enzyme';
import {FormattedMessage} from 'react-intl';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';
import DisplayName from 'components/create_team/components/display_name.jsx';
import Constants from 'utils/constants.jsx';

jest.mock('images/logo.png', () => 'logo.png');

describe('/components/create_team/components/display_name', () => {
    const defaultProps = {
        updateParent: jest.fn(),
        state: {
            team: {name: 'test-team', display_name: 'test-team'},
            wizard: 'display_name',
        },
        actions: {
            trackEvent: jest.fn(),
        },
    };

    test('should match snapshot', () => {
        const wrapper = shallow(<DisplayName {...defaultProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should run updateParent function', () => {
        const wrapper = mountWithIntl(<DisplayName {...defaultProps}/>);

        wrapper.find('button').simulate('click', {
            preventDefault: () => jest.fn(),
        });

        expect(wrapper.prop('updateParent')).toHaveBeenCalled();
    });

    test('should display isRequired error', () => {
        const wrapper = mountWithIntl(<DisplayName {...defaultProps}/>);
        wrapper.find('.form-control').instance().value = '';
        wrapper.find('button').simulate('click', {
            preventDefault: () => jest.fn(),
        });

        expect(wrapper.state('nameError')).toEqual(
            <FormattedMessage
                id='create_team.display_name.required'
                defaultMessage='This field is required'
            />
        );
    });

    test('should display charLength error', () => {
        const wrapper = mountWithIntl(<DisplayName {...defaultProps}/>);
        const input = wrapper.find('.form-control').instance();
        input.value = 'should_trigger_an_error_because_it_exceeds_MAX_TEAMNAME_LENGTH';

        wrapper.find('button').simulate('click', {
            preventDefault: () => jest.fn(),
        });

        expect(wrapper.state('nameError')).toEqual(
            <FormattedMessage
                id='create_team.display_name.charLength'
                defaultMessage='Name must be {min} or more characters up to a maximum of {max}. You can add a longer team description later.'
                values={{
                    min: Constants.MIN_TEAMNAME_LENGTH,
                    max: Constants.MAX_TEAMNAME_LENGTH,
                }}
            />
        );
    });
});
