// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';

import {storiesOf} from '@storybook/react';
import {withKnobs, text, boolean} from '@storybook/addon-knobs';
import {action} from '@storybook/addon-actions';

import AdminPanel from './admin_panel';
import AdminPanelTogglable from './admin_panel_togglable';
import AdminPanelWithButton from './admin_panel_with_button';
import AdminPanelWithLink from './admin_panel_with_link';
import AdminHeader from './admin_header';
import FormattedAdminHeader from './formatted_admin_header';

storiesOf('Widgets/Admin Console', module).
    addDecorator(withKnobs).
    add(
        'admin panel',
        () => {
            const content = text('Content', 'Content');
            const onHeaderClick = action('clicked header');
            const onButtonClick = action('clicked button');
            const title = text('Title', 'title');
            const subtitle = text('Subtitle', 'subtitle');
            const hasButton = boolean('HasButton', false);
            return (
                <AdminPanel
                    onHeaderClick={onHeaderClick}
                    titleId='not-valid-id'
                    titleDefault={title}
                    subtitleId='not-valid-id'
                    subtitleDefault={subtitle}
                    button={hasButton ? <button onClick={onButtonClick}>{'Button'}</button> : null}
                >
                    {content}
                </AdminPanel>
            );
        },
    ).
    add(
        'admin panel with button',
        () => {
            const content = text('Content', 'Content');
            const onHeaderClick = action('clicked header');
            const onButtonClick = action('clicked button');
            const title = text('Title', 'title');
            const subtitle = text('Subtitle', 'subtitle');
            const buttonText = text('Button text', 'Button');
            const disabled = boolean('Button disabled', false);
            return (
                <AdminPanelWithButton
                    onHeaderClick={onHeaderClick}
                    titleId='not-valid-id'
                    titleDefault={title}
                    subtitleId='not-valid-id'
                    subtitleDefault={subtitle}
                    buttonTextId='not-valid-id'
                    buttonTextDefault={buttonText}
                    onButtonClick={onButtonClick}
                    disabled={disabled}
                >
                    {content}
                </AdminPanelWithButton>
            );
        },
    ).
    add(
        'admin panel with link',
        () => {
            const content = text('Content', 'Content');
            const onHeaderClick = action('clicked header');
            const title = text('Title', 'title');
            const subtitle = text('Subtitle', 'subtitle');
            const linkText = text('Link text', 'Home');
            const url = text('Link url', '/');
            const disabled = boolean('Button disabled', false);
            return (
                <AdminPanelWithLink
                    onHeaderClick={onHeaderClick}
                    titleId='not-valid-id'
                    titleDefault={title}
                    subtitleId='not-valid-id'
                    subtitleDefault={subtitle}
                    linkTextId='not-valid-id'
                    linkTextDefault={linkText}
                    url={url}
                    disabled={disabled}
                >
                    {content}
                </AdminPanelWithLink>
            );
        },
    ).
    add(
        'togglable admin panel',
        () => {
            const content = text('Content', 'Content');
            const title = text('Title', 'title');
            const subtitle = text('Subtitle', 'subtitle');
            const Wrapper = () => {
                const [open, setOpen] = useState(true);
                return (
                    <AdminPanelTogglable
                        titleId='not-valid-id'
                        titleDefault={title}
                        subtitleId='not-valid-id'
                        subtitleDefault={subtitle}
                        open={open}
                        onToggle={() => setOpen(!open)}
                    >
                        {content}
                    </AdminPanelTogglable>
                );
            };
            return <Wrapper/>;
        },
    ).
    add(
        'admin header',
        () => {
            const title = text('Title', 'title');
            return (
                <AdminHeader>{title}</AdminHeader>
            );
        },
    ).
    add(
        'formatted admin header',
        () => {
            const markdown = text('Markdown', '**Markdown** text');
            return (
                <FormattedAdminHeader
                    id='not-valid-id'
                    defaultMessage={markdown}
                />
            );
        },
    );
