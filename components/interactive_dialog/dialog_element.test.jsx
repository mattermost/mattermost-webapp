// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
//
import React from 'react';
import {shallow} from 'enzyme';

import TextSetting from 'components/widgets/settings/text_setting';

import DialogElement from './dialog_element.jsx';

describe('components/interactive_dialog/DialogElement', () => {
    const baseDialogProps = {
        displayName: 'Testing',
        name: 'testing',
        type: 'text',
        maxLength: 100,
    };
    const baseTextSettingProps = {
        id: baseDialogProps.name,
        maxLength: 100,
        resizable: false,
        value: '',
        label: (
            <React.Fragment>
                {baseDialogProps.displayName}
                <span className='error-text'>{' *'}</span>
            </React.Fragment>
        ),
    };
    it('subtype blank', () => {
        const wrapper = shallow(
            <DialogElement
                {...baseDialogProps}
                subtype=''
            />
        );
        expect(wrapper.matchesElement(
            <TextSetting
                {...baseTextSettingProps}
                type='input'
            />
        )).toEqual(true);
    });

    it('subtype email', () => {
        const wrapper = shallow(
            <DialogElement
                {...baseDialogProps}
                subtype='email'
            />
        );
        expect(wrapper.matchesElement(
            <TextSetting
                {...baseTextSettingProps}
                type='email'
            />
        )).toEqual(true);
    });

    it('subtype invalid', () => {
        const wrapper = shallow(
            <DialogElement
                {...baseDialogProps}
                subtype='invalid'
            />
        );
        expect(wrapper.matchesElement(
            <TextSetting
                {...baseTextSettingProps}
                type='input'
            />
        )).toEqual(true);
    });

    it('subtype password', () => {
        const wrapper = shallow(
            <DialogElement
                {...baseDialogProps}
                subtype='password'
            />
        );
        expect(wrapper.matchesElement(
            <TextSetting
                {...baseTextSettingProps}
                type='password'
            />
        )).toEqual(true);
    });
});
