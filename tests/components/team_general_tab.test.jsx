import React from 'react';

import {mountWithIntl} from 'tests/helpers/intl-test-helper.jsx';

import GeneralTab from 'components/team_general_tab/team_general_tab.jsx';

describe('components/TeamSettings', () => {
    const defaultProps = {
        team: {},
        maxFileSize: 50,
        activeSection: 'team_icon',
        updateSection: () => {},    //eslint-disable-line no-empty-function
        closeModal: () => {},       //eslint-disable-line no-empty-function
        collapseModal: () => {},    //eslint-disable-line no-empty-function
        actions: {
            updateTeam: () => {},   //eslint-disable-line no-empty-function
            setTeamIcon: () => {},  //eslint-disable-line no-empty-function
        },
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
});