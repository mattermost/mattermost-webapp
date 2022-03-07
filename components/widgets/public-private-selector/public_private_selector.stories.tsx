// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';

import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';

import StoryBox from 'storybook/story_box';

import PublicPrivateSelector, {ButtonType} from './public-private-selector';

const selectionChange = action('onChange');

storiesOf('Widgets/PublicPrivateSelector', module).
    add(
        'Default',
        () => {
            const WrapperComponent = () => {
                const [selected, setSelected] = useState(ButtonType.PUBLIC);

                return (
                    <StoryBox containerStyle={{width: 600, padding: 32}}>
                        <PublicPrivateSelector
                            selected={selected}
                            onChange={(selected) => {
                                selectionChange(selected);
                                setSelected(selected);
                            }}
                        />
                    </StoryBox>
                );
            };

            return (
                <WrapperComponent/>
            );
        },
    ).
    add(
        'With custom messages',
        () => {
            const WrapperComponent = () => {
                const [selected, setSelected] = useState(ButtonType.PUBLIC);

                return (
                    <StoryBox containerStyle={{width: 600, padding: 32}}>
                        <PublicPrivateSelector
                            selected={selected}
                            publicButtonProps={{
                                title: 'Public Channel',
                                description: 'Anyone can join',
                            }}
                            privateButtonProps={{
                                title: 'Private Channel',
                                description: 'Only invited members can join',
                            }}
                            onChange={(selected) => {
                                selectionChange(selected);
                                setSelected(selected);
                            }}
                        />
                    </StoryBox>
                );
            };

            return (
                <WrapperComponent/>
            );
        },
    ).
    add(
        'With tooltips',
        () => {
            const WrapperComponent = () => {
                const [selected, setSelected] = useState(ButtonType.PUBLIC);

                return (
                    <StoryBox containerStyle={{width: 600, padding: 32}}>
                        <PublicPrivateSelector
                            selected={selected}
                            publicButtonProps={{
                                tooltip: 'Create a public one where anyone can join',
                            }}
                            privateButtonProps={{
                                tooltip: 'Create a private one where only invited members can join',
                            }}
                            onChange={(selected) => {
                                selectionChange(selected);
                                setSelected(selected);
                            }}
                        />
                    </StoryBox>
                );
            };

            return (
                <WrapperComponent/>
            );
        },
    ).
    add(
        'With private disabled',
        () => {
            const WrapperComponent = () => {
                const [selected, setSelected] = useState(ButtonType.PUBLIC);

                return (
                    <StoryBox containerStyle={{width: 600, padding: 32}}>
                        <PublicPrivateSelector
                            selected={selected}
                            privateButtonProps={{
                                tooltip: 'Private has been disabled by the system admin',
                                disabled: true,
                            }}
                            onChange={(selected) => {
                                selectionChange(selected);
                                setSelected(selected);
                            }}
                        />
                    </StoryBox>
                );
            };

            return (
                <WrapperComponent/>
            );
        },
    ).
    add(
        'With private locked',
        () => {
            const WrapperComponent = () => {
                const [selected, setSelected] = useState(ButtonType.PUBLIC);

                return (
                    <StoryBox containerStyle={{width: 600, padding: 32}}>
                        <PublicPrivateSelector
                            selected={selected}
                            privateButtonProps={{
                                tooltip: 'Private is only available in Mattermost Enterprise',
                                locked: true,
                            }}
                            onChange={(selected) => {
                                selectionChange(selected);
                                setSelected(selected);
                            }}
                        />
                    </StoryBox>
                );
            };

            return (
                <WrapperComponent/>
            );
        },
    );
