// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable react/jsx-no-literals */

import {fireEvent, screen, act} from '@testing-library/react';
import React from 'react';
import * as reactRedux from 'react-redux';
import {createStore} from 'redux';

import {renderWithIntl} from 'tests/react_testing_utils';

import {GatherIntent} from './gather_intent';
import {GatherIntentModalProps} from './gather_intent_modal';

const DummyModal = ({onClose, onSave}: GatherIntentModalProps) => {
    return (
        <>
            <button
                id='closeIcon'
                className='icon icon-close'
                aria-label='Close'
                title='Close'
                onClick={onClose}
            />
            <p>Body</p>
            <button
                onClick={() => {
                    onSave({ach: true, other: false, wire: true});
                }}
                type='button'
            >
                Test
            </button>
        </>
    );
};

describe('components/gather_intent/gather_intent.tsx', () => {
    const gatherIntentText = 'gatherIntentText';
    const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');

    beforeEach(() => {
        useDispatchMock.mockClear();
    });

    const renderComponent = () => {
        return renderWithIntl(
            <reactRedux.Provider store={createStore(() => {})}>
                <GatherIntent
                    modalComponent={DummyModal}
                    gatherIntentText={gatherIntentText}
                    typeGatherIntent='firstSelfHostLicensePurchase'
                />
            </reactRedux.Provider>,
        );
    };

    it('should display modal if the user click on the modal opener', () => {
        renderComponent();

        fireEvent.click(screen.getByText(gatherIntentText));

        expect(screen.getByText('Body')).toBeInTheDocument();
    });

    it('should display the modal opener after close the modal', () => {
        renderComponent();

        fireEvent.click(screen.getByText(gatherIntentText));
        fireEvent.click(screen.getByLabelText('Close'));

        expect(screen.queryByText('Body')).not.toBeInTheDocument();
    });

    it('should render the submitted modal after save the configuration', async () => {
        useDispatchMock.mockReturnValue(jest.fn().mockImplementation(() => new Promise((resolve) => {
            resolve({});
        })));
        renderComponent();

        fireEvent.click(screen.getByText(gatherIntentText));

        await act(async () => {
            fireEvent.click(screen.getByText('Test'));
        });

        expect(screen.queryByText('Thanks for sharing feedback!')).toBeInTheDocument();
    });

    it('should render the submitted modal after save the configuration and reopening the modal', async () => {
        useDispatchMock.mockReturnValue(jest.fn().mockImplementation(() => new Promise((resolve) => {
            resolve({});
        })));
        renderComponent();

        fireEvent.click(screen.getByText(gatherIntentText));

        await act(async () => {
            fireEvent.click(screen.getByText('Test'));
        });

        fireEvent.click(screen.getByText('Done'));
        fireEvent.click(screen.getByText(gatherIntentText));

        expect(screen.queryByText('Thanks for sharing feedback!')).toBeInTheDocument();
    });
});
