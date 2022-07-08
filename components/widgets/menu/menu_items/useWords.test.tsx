// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {screen} from '@testing-library/react';
import {Provider} from 'react-redux';

import {renderWithIntl} from 'tests/react_testing_utils';
import mockStore from 'tests/test_store';

import {LimitTypes, LimitSummary} from 'components/common/hooks/useGetHighestThresholdCloudLimit';

import {FileSizes} from 'utils/file_utils';

import useWords from './useWords';

interface Props {
    highestLimit: LimitSummary | false;
    isAdminUser: boolean;
}

const emptyText = 'EMPTY TEXT';

function TestEl(props: Props) {
    const words = useWords(props.highestLimit, props.isAdminUser);
    if (!words) {
        return <span>{emptyText}</span>;
    }
    return (
        <ul>
            <li>{words.title}</li>
            <li>{words.description}</li>
            <li>{words.status}</li>
        </ul>
    );
}

interface Test {
    label: string;
    expects: {
        empty?: boolean;
        title?: string | RegExp;
        description?: string | RegExp;
        status?: string | RegExp;
    };
    props: Props;
}

const asAdmin = (highestLimit: LimitSummary | false): Props => ({isAdminUser: true, highestLimit});
const asUser = (highestLimit: LimitSummary | false): Props => ({isAdminUser: false, highestLimit});
const mkLimit = (id: LimitSummary['id'], usage: LimitSummary['usage'], limit: LimitSummary['limit']): LimitSummary => ({id, usage, limit});

const tenGb = 10 * FileSizes.Gigabyte;

describe('useWords', () => {
    const tests: Test[] = [
        {
            label: 'returns nothing if there is not a highest limit',
            props: {
                highestLimit: false,
                isAdminUser: false,
            },
            expects: {
                empty: true,
            },
        },
        {
            label: 'shows message history warn',
            props: asAdmin(mkLimit(LimitTypes.messageHistory, 5000, 10000)),
            expects: {
                title: 'Total messages',
                description: /closer.*10,000.*message limit/,
                status: '5K',
            },
        },
        {
            label: 'shows message history critical',
            props: asAdmin(mkLimit(LimitTypes.messageHistory, 8000, 10000)),
            expects: {
                title: 'Total messages',
                description: /close to hitting.*10,000.*message/,
                status: '8K',
            },
        },
        {
            label: 'shows message history exceeded',
            props: asAdmin(mkLimit(LimitTypes.messageHistory, 11000, 10000)),
            expects: {
                title: 'Total messages',
                description: /over.*message history.*only.*last.*10K.*messages/,
                status: '11K',
            },
        },
        {
            label: 'shows file storage warn',
            props: asAdmin(mkLimit(LimitTypes.fileStorage, 5 * FileSizes.Gigabyte, tenGb)),
            expects: {
                title: 'File storage limit',
                description: /closer.*10GB.*limit/,
                status: '5GB',
            },
        },
        {
            label: 'shows file storage critical',
            props: asAdmin(mkLimit(LimitTypes.fileStorage, 8 * FileSizes.Gigabyte, tenGb)),
            expects: {
                title: 'File storage limit',
                description: /closer.*10GB.*limit/,
                status: '8GB',
            },
        },
        {
            label: 'shows file storage exceeded',
            props: asAdmin(mkLimit(LimitTypes.fileStorage, 11 * FileSizes.Gigabyte, tenGb)),
            expects: {
                title: 'File storage limit',
                description: /over.*10GB.*limit/,
                status: '11GB',
            },
        },
        {
            label: 'shows integrations warn',
            props: asAdmin(mkLimit(LimitTypes.enabledIntegrations, 3, 5)),
            expects: {
                title: 'Integrations limit',
                description: /closer.*5.*enabled/,
                status: '3',
            },
        },
        {
            label: 'shows integrations critical',
            props: asAdmin(mkLimit(LimitTypes.enabledIntegrations, 4, 5)),
            expects: {
                title: 'Integrations limit',
                description: /closer.*5.*enabled/,
                status: '4',
            },
        },
        {
            label: 'shows integrations exceeded',
            props: asAdmin(mkLimit(LimitTypes.enabledIntegrations, 6, 5)),
            expects: {
                title: 'Integrations limit',
                description: /reached.*5.*enabled.*can’t enable additional/,
                status: '6',
            },
        },
        {
            label: 'shows boards warn',
            props: asAdmin(mkLimit(LimitTypes.boardsCards, 300, 500)),
            expects: {
                title: 'Board card limit',
                description: /closer.*500.*board card limit/,
                status: '300',
            },
        },
        {
            label: 'shows boards critical',
            props: asAdmin(mkLimit(LimitTypes.boardsCards, 400, 500)),
            expects: {
                title: 'Board card limit',
                description: /closer.*500.*board card limit/,
                status: '400',
            },
        },
        {
            label: 'shows boards critical',
            props: asAdmin(mkLimit(LimitTypes.boardsCards, 501, 500)),
            expects: {
                title: 'Board card limit',
                description: /over the.*500.*board card limit/,
                status: '501',
            },
        },
        {
            label: 'admin prompted to upgrade',
            props: asAdmin(mkLimit(LimitTypes.boardsCards, 301, 500)),
            expects: {
                description: 'View upgrade options.',
            },
        },
        {
            label: 'end user prompted to view plans',
            props: asUser(mkLimit(LimitTypes.boardsCards, 301, 500)),
            expects: {
                description: 'View plans',
            },
        },
    ];

    const store = mockStore({});
    tests.forEach((t: Test) => {
        test(t.label, () => {
            renderWithIntl(
                <Provider store={store}>
                    <TestEl {...t.props}/>
                </Provider>,
            );
            if (t.expects.empty) {
                screen.getByText(emptyText);
            }

            if (t.expects.title) {
                screen.getByText(t.expects.title);
            }

            if (t.expects.description) {
                screen.getByText(t.expects.description);
            }

            if (t.expects.status) {
                screen.getByText(t.expects.status);
            }
        });
    });
});
