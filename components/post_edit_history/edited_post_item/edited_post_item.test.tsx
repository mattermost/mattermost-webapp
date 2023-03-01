// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ComponentProps} from 'react';
import {shallow} from 'enzyme';

import {TestHelper} from 'utils/test_helper';
import {ModalIdentifiers} from 'utils/constants';

import RestorePostModal from '../restore_post_modal';

import EditedPostItem from './edited_post_item';

describe('components/post_edit_history/edited_post_item', () => {
    const baseProps: ComponentProps<typeof EditedPostItem> = {
        post: TestHelper.getPostMock({
            id: 'post_id',
            message: 'post message',
        }),
        isCurrent: false,
        postCurrentVersion: TestHelper.getPostMock({
            id: 'post_current_version_id',
            message: 'post current version message',
        }),
        actions: {
            editPost: jest.fn(),
            closeRightHandSide: jest.fn(),
            openModal: jest.fn(),
        },
    };

    test('should match snapshot', () => {
        const wrapper = shallow(<EditedPostItem {...baseProps}/>);
        expect(wrapper).toMatchSnapshot();
    });
    test('should match snapshot when isCurrent is true', () => {
        const props = {
            ...baseProps,
            isCurrent: true,
        };
        const wrapper = shallow(<EditedPostItem {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });
    test('clicking on the restore button should call openRestorePostModal', () => {
        const wrapper = shallow(<EditedPostItem {...baseProps}/>);

        // find the button with restore icon and click it
        wrapper.find('ForwardRef').filterWhere((button) => button.prop('icon') === 'restore').simulate('click');
        expect(baseProps.actions.openModal).toHaveBeenCalledWith(
            expect.objectContaining({
                modalId: ModalIdentifiers.RESTORE_POST_MODAL,
                dialogType: RestorePostModal,
            }),
        );
    });

    test('when isCurrent is true, should not render the restore button', () => {
        const props = {
            ...baseProps,
            isCurrent: true,
        };
        const wrapper = shallow(<EditedPostItem {...props}/>);
        expect(wrapper.find('ForwardRef').filterWhere((button) => button.prop('icon') === 'refresh')).toHaveLength(0);
    });

    test('when isCurrent is true, should render the current version text', () => {
        const props = {
            ...baseProps,
            isCurrent: true,
        };
        const wrapper = shallow(<EditedPostItem {...props}/>);
        expect(wrapper.find('.edit-post-history__current__indicator')).toHaveLength(1);
    });
});
