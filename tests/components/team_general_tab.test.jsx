import React from 'react';

import {mountWithIntl} from 'tests/helpers/intl-test-helper.jsx';

import GeneralTab from 'components/team_general_tab.jsx';

describe('components/TeamSettings', () => {
    beforeEach(() => {
        global.window.mm_config = {};
    });

    const defaultProps = {
        team: {},
        activeSection: 'team_icon',
        updateSection: () => () => true,
        closeModal: () => () => true,
        collapseModal: () => () => true
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
                    type: 'text/plain'
                }]
            }
        });

        expect(wrapper.state('clientError')).not.toBe('');
    });

    test('should handle too large files', () => {
        global.window.mm_config.MaxFileSize = 50;

        const wrapper = mountWithIntl(<GeneralTab {...defaultProps}/>);

        wrapper.instance().updateTeamIcon({
            target: {
                files: [{
                    type: 'image/jpeg',
                    size: 12345
                }]
            }
        });

        expect(wrapper.state('clientError')).not.toBe('');
    });
});