// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';

import {isTelemetryEnabled, shouldTrackPerformance} from 'actions/telemetry_actions';

const mockStore = configureStore([thunk]);

describe('Actions.Telemetry', () => {
    test('isTelemetryEnabled', async () => {
        const state = {
            entities: {
                general: {
                    config: {
                        DiagnosticsEnabled: 'false',
                    },
                },
            },
        };

        const store = mockStore(state);

        expect(isTelemetryEnabled(store)).toBeFalsy();

        state.entities.general.config.DiagnosticsEnabled = 'true';

        expect(isTelemetryEnabled(store)).toBeTruthy();
    });

    test('shouldTrackPerformance', async () => {
        const state = {
            entities: {
                general: {
                    config: {
                        DiagnosticsEnabled: 'false',
                        EnableDeveloper: 'false',
                    },
                },
            },
        };

        const store = mockStore(state);

        expect(shouldTrackPerformance(store)).toBeFalsy();

        state.entities.general.config.DiagnosticsEnabled = 'true';

        expect(shouldTrackPerformance(store)).toBeTruthy();

        state.entities.general.config.DiagnosticsEnabled = 'false';
        state.entities.general.config.EnableDeveloper = 'true';

        expect(shouldTrackPerformance(store)).toBeTruthy();
    });
});
