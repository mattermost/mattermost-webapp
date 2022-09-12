// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import BoardsButton from './boards_button';

const component = (otherProps: any) => (
    <BoardsButton
        boardComponent={
            <button>{'create a board'}</button>
        }
        show={true}
        {...otherProps}
    />
);

describe('components/post_view/ChannelIntroMessages', () => {
    describe('test Boards Button', () => {
        test('should match snapshot', () => {
            expect(shallow(component({}))).toMatchSnapshot();
        });

        test('should match snapshot, no boards', () => {
            expect(shallow(component({
                boardComponent: null,
            }))).toMatchSnapshot();
        });

        test('should match snapshot, has board, no show', () => {
            expect(shallow(component({
                show: false,
            }))).toMatchSnapshot();
        });
    });
});
