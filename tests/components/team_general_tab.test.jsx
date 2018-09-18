// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {shallow} from 'enzyme';

import {mountWithIntl} from 'tests/helpers/intl-test-helper.jsx';

import GeneralTab from 'components/team_general_tab/team_general_tab.jsx';

describe('components/TeamSettings', () => {
    const defaultProps = {
        team: {id: 'team_id'},
        maxFileSize: 50,
        activeSection: 'team_icon',
        updateSection: () => {}, //eslint-disable-line no-empty-function
        closeModal: () => {}, //eslint-disable-line no-empty-function
        collapseModal: () => {}, //eslint-disable-line no-empty-function
        actions: {
            updateTeam: () => {}, //eslint-disable-line no-empty-function
            removeTeamIcon: () => {}, //eslint-disable-line no-empty-function
            setTeamIcon: () => {}, //eslint-disable-line no-empty-function
        },
        canInviteTeamMembers: true,
    };

    test('should handle bad updateTeamIcon function call', () => {
        const wrapper = mountWithIntl(<GeneralTab {...defaultProps}/>);

        wrapper.instance().updateTeamIcon(null);

        expect(wrapper.state('clientError')).not.toBe('');
    });

    test('should handle invalid file selection', () => {
        const wrapper = mountWithIntl(<GeneralTab {...defaultProps}/>);

        wrapper.instance().updateTeamIcon({
            target: {
                files: [{
                    type: 'text/plain',
                }],
            },
        });

        expect(wrapper.state('clientError')).not.toBe('');
    });

    test('should handle too large files', () => {
        const wrapper = mountWithIntl(<GeneralTab {...defaultProps}/>);

        wrapper.instance().updateTeamIcon({
            target: {
                files: [{
                    type: 'image/jpeg',
                    size: defaultProps.maxFileSize + 1,
                }],
            },
        });

        expect(wrapper.state('clientError')).not.toBe('');
    });

    test('should call actions.setTeamIcon on handleTeamIconSubmit', () => {
        const actions = {
            updateTeam: jest.fn(),
            removeTeamIcon: jest.fn(),
            setTeamIcon: jest.fn(),
        };

        const props = {...defaultProps, actions};

        const wrapper = shallow(<GeneralTab {...props}/>);

        let teamIconFile = null;
        wrapper.setState({teamIconFile, submitActive: true});
        wrapper.instance().handleTeamIconSubmit({preventDefault: jest.fn()});
        expect(actions.setTeamIcon).not.toHaveBeenCalled();

        teamIconFile = {file: 'team_icon_file'};
        wrapper.setState({teamIconFile, submitActive: false});
        wrapper.instance().handleTeamIconSubmit({preventDefault: jest.fn()});
        expect(actions.setTeamIcon).not.toHaveBeenCalled();

        wrapper.setState({teamIconFile, submitActive: true});
        wrapper.instance().handleTeamIconSubmit({preventDefault: jest.fn()});

        expect(actions.setTeamIcon).toHaveBeenCalledTimes(1);
        expect(actions.setTeamIcon).toHaveBeenCalledWith(props.team.id, teamIconFile);
    });

    test('should call actions.removeTeamIcon on handleTeamIconRemove', () => {
        const actions = {
            updateTeam: jest.fn(),
            removeTeamIcon: jest.fn(),
            setTeamIcon: jest.fn(),
        };

        const props = {...defaultProps, actions};

        const wrapper = shallow(<GeneralTab {...props}/>);

        wrapper.instance().handleTeamIconRemove({preventDefault: jest.fn()});

        expect(actions.removeTeamIcon).toHaveBeenCalledTimes(1);
        expect(actions.removeTeamIcon).toHaveBeenCalledWith(props.team.id);
    });

    test('hide invite code if no permissions for team inviting', () => {
        const props = {...defaultProps, canInviteTeamMembers: false};

        const wrapper1 = shallow(<GeneralTab {...defaultProps}/>);
        const wrapper2 = shallow(<GeneralTab {...props}/>);

        expect(wrapper1).toMatchSnapshot();
        expect(wrapper2).toMatchSnapshot();
    });
});
