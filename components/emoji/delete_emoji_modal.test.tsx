// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {mountWithIntl} from 'tests/helpers/intl-test-helper';
import DeleteEmoji from 'components/emoji/delete_emoji_modal';

describe('components/emoji/components/DeleteEmoji', () => {
    const instance = new DeleteEmoji({onDelete: jest.fn()});
    test('title should match the of delete emoji title', () => {
        const wrapper = mountWithIntl(instance.triggerTitle);
        expect(wrapper.html()).toBe('<span>Delete</span>');
    });
    test('modal title should match the of delete emoji modal title', () => {
        const wrapper = mountWithIntl(instance.modalTitle);
        expect(wrapper.html()).toBe('<span>Delete Custom Emoji</span>');
    });
    test('modal message should match the of delete emoji modal message', () => {
        const wrapper = mountWithIntl(instance.modalMessage);
        expect(wrapper.html()).toMatch(/This action permanently deletes the custom emoji. Are you sure you want to delete it?/);
    });
    test('modal confirmation button should match the of delete emoji modal confirmation button', () => {
        const wrapper = mountWithIntl(instance.modalConfirmButton);
        expect(wrapper.html()).toBe('<span>Delete</span>');
    });
});
