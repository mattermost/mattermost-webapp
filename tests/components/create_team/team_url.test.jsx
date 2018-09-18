// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {shallow} from 'enzyme';

import {FormattedHTMLMessage, FormattedMessage} from 'react-intl';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';
import TeamUrl from 'components/create_team/components/team_url/team_url.jsx';
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
            checkIfTeamExists: jest.fn(),
            createTeam: jest.fn(),
            trackEvent: jest.fn(),
        },
    };

    const chatLengthError = (
        <FormattedMessage
            id='create_team.team_url.charLength'
            defaultMessage='Name must be {min} or more characters up to a maximum of {max}'
            values={{
                min: Constants.MIN_TEAMNAME_LENGTH,
                max: Constants.MAX_TEAMNAME_LENGTH,
            }}
        />
    );

    test('should match snapshot', () => {
        const wrapper = shallow(<TeamUrl {...defaultProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should return to display_name.jsx page', () => {
        const wrapper = mountWithIntl(<TeamUrl {...defaultProps}/>);

        wrapper.find('a').simulate('click', {
            preventDefault: () => jest.fn(),
        });

        expect(wrapper.prop('state').wizard).toBe('display_name');
        expect(wrapper.prop('updateParent')).toHaveBeenCalled();
    });

    test('should successfully submit', () => {
        defaultProps.actions.checkIfTeamExists = jest.fn().mockImplementation(
            () => {
                defaultProps.actions.createTeam();
            }
        );
        const wrapper = mountWithIntl(<TeamUrl {...defaultProps}/>);

        wrapper.find('button').simulate('click', {
            preventDefault: () => jest.fn(),
        });

        expect(wrapper.prop('actions').createTeam).toHaveBeenCalled();
    });

    test('should display isRequired error', () => {
        const wrapper = mountWithIntl(<TeamUrl {...defaultProps}/>);
        wrapper.find('.form-control').instance().value = '';
        wrapper.find('button').simulate('click', {preventDefault: () => jest.fn()});

        expect(wrapper.state('nameError')).toEqual(
            <FormattedMessage
                id='create_team.team_url.required'
                defaultMessage='This field is required'
            />
        );
    });

    test('should display charLength error', () => {
        const wrapper = mountWithIntl(<TeamUrl {...defaultProps}/>);
        wrapper.find('.form-control').instance().value = 'a';
        wrapper.find('button').simulate('click', {preventDefault: () => jest.fn()});
        expect(wrapper.state('nameError')).toEqual(chatLengthError);

        wrapper.find('.form-control').instance().value = 'should_trigger_an_error_because_it_exceeds_MAX_TEAMNAME_LENGTH';
        wrapper.find('button').simulate('click', {preventDefault: () => jest.fn()});
        expect(wrapper.state('nameError')).toEqual(chatLengthError);
    });

    test('should display teamUrl regex error', () => {
        const wrapper = mountWithIntl(<TeamUrl {...defaultProps}/>);
        wrapper.find('.form-control').instance().value = '!!wrongName1';
        wrapper.find('button').simulate('click', {preventDefault: () => jest.fn()});
        expect(wrapper.state('nameError')).toEqual(
            <FormattedMessage
                id='create_team.team_url.regex'
                defaultMessage="Use only lower case letters, numbers and dashes. Must start with a letter and can't end in a dash."
            />
        );
    });

    test('should display teamUrl taken error', () => {
        const wrapper = mountWithIntl(<TeamUrl {...defaultProps}/>);
        wrapper.find('.form-control').instance().value = 'channel';
        wrapper.find('button').simulate('click', {preventDefault: () => jest.fn()});
        expect(wrapper.state('nameError')).toEqual(
            <FormattedHTMLMessage
                id='create_team.team_url.taken'
                defaultMessage='This URL <a href="https://docs.mattermost.com/help/getting-started/creating-teams.html#team-url" target="_blank">starts with a reserved word</a> or is unavailable. Please try another.'
            />
        );
    });
});
