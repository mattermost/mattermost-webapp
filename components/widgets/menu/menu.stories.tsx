// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {storiesOf} from '@storybook/react';
import {withKnobs, text, boolean} from '@storybook/addon-knobs';
import {action} from '@storybook/addon-actions';

import InfoIcon from '../icons/info_icon';
import MenuIcon from '../icons/menu_icon';

import Menu from './menu';
import MenuWrapper from './menu_wrapper';

storiesOf('Widgets/Menus', module).
    addDecorator(withKnobs).
    add(
        'simple menu',
        () => {
            const txt = text('Text', 'Text');
            const extraText = text('Extra Text', 'Extra text');
            const icon = boolean('Show Icon', false);
            const showEntry1 = boolean('Show entry 1', true);
            const showEntry2 = boolean('Show entry 2', true);
            const showEntry3 = boolean('Show entry 3', true);
            const ariaLabel = text('Aria Label', 'Aria Label');
            const onClick1 = action('clicked entry 1');
            const onClick2 = action('clicked entry 2');
            const onClick3 = action('clicked entry 3');
            return (
                <div style={{position: 'relative'}}>
                    <Menu ariaLabel={ariaLabel}>
                        <Menu.ItemAction
                            onClick={onClick1}
                            ariaLabel={ariaLabel}
                            text={txt}
                            icon={icon ? <InfoIcon/> : null}
                            show={showEntry1}
                            extraText={extraText}
                        />
                        <Menu.ItemAction
                            onClick={onClick2}
                            ariaLabel={ariaLabel}
                            text={txt}
                            icon={icon ? <InfoIcon/> : null}
                            show={showEntry2}
                            extraText={extraText}
                        />
                        <Menu.ItemAction
                            onClick={onClick3}
                            ariaLabel={ariaLabel}
                            text={txt}
                            icon={icon ? <InfoIcon/> : null}
                            show={showEntry3}
                            extraText={extraText}
                        />
                    </Menu>
                </div>
            );
        },
    ).
    add(
        'menu with header',
        () => {
            const headerText = text('Menu Header', 'Menu Header');
            const txt = text('Menu Item Text', 'Menu Item Text');
            const extraText = text('Optional help text', 'Optional help text');
            const icon = boolean('Show Icon', false);
            const showEntry1 = boolean('Show entry 1', true);
            const showEntry2 = boolean('Show entry 2', true);
            const showEntry3 = boolean('Show entry 3', true);
            const ariaLabel = text('Aria Label', 'Aria Label');
            const onClick1 = action('clicked entry 1');
            const onClick2 = action('clicked entry 2');
            const onClick3 = action('clicked entry 3');
            return (
                <div style={{position: 'relative'}}>
                    <Menu ariaLabel={ariaLabel}>
                        <Menu.Header>
                            {headerText}
                        </Menu.Header>
                        <Menu.Group>
                            <Menu.ItemAction
                                onClick={onClick1}
                                ariaLabel={ariaLabel}
                                text={txt}
                                icon={icon ? <InfoIcon/> : null}
                                show={showEntry1}
                                extraText={extraText}
                            />
                            <Menu.ItemAction
                                onClick={onClick2}
                                ariaLabel={ariaLabel}
                                text={txt}
                                icon={icon ? <InfoIcon/> : null}
                                show={showEntry2}
                                extraText={extraText}
                            />
                            <Menu.ItemAction
                                onClick={onClick3}
                                ariaLabel={ariaLabel}
                                text={txt}
                                icon={icon ? <InfoIcon/> : null}
                                show={showEntry3}
                                extraText={extraText}
                            />
                        </Menu.Group>
                    </Menu>
                </div>
            );
        },
    ).
    add(
        'menu with groups',
        () => {
            const txt = text('Text', 'Text');
            const extraText = text('Extra Text', 'Extra text');
            const icon = boolean('Show Icon', false);
            const showEntry1 = boolean('Show entry 1', true);
            const showEntry2 = boolean('Show entry 2', true);
            const showEntry3 = boolean('Show entry 3', true);
            const ariaLabel = text('Aria Label', 'Aria Label');
            const onClick1 = action('clicked entry 1');
            const onClick2 = action('clicked entry 2');
            const onClick3 = action('clicked entry 3');
            return (
                <div style={{position: 'relative'}}>
                    <Menu ariaLabel={ariaLabel}>
                        <Menu.Group>
                            <Menu.ItemAction
                                onClick={onClick1}
                                ariaLabel={ariaLabel}
                                text={txt}
                                icon={icon ? <InfoIcon/> : null}
                                show={showEntry1}
                                extraText={extraText}
                            />
                            <Menu.ItemAction
                                onClick={onClick2}
                                ariaLabel={ariaLabel}
                                text={txt}
                                icon={icon ? <InfoIcon/> : null}
                                show={showEntry2}
                                extraText={extraText}
                            />
                        </Menu.Group>
                        <Menu.Group>
                            <Menu.ItemAction
                                onClick={onClick3}
                                ariaLabel={ariaLabel}
                                text={txt}
                                icon={icon ? <InfoIcon/> : null}
                                show={showEntry3}
                                extraText={extraText}
                            />
                        </Menu.Group>
                    </Menu>
                </div>
            );
        },
    ).
    add(
        'Content with a menu',
        () => {
            const title = text('Title', 'Open Menu');
            const txt = text('Text', 'Text');
            const extraText = text('Extra Text', 'Extra text');
            const icon = boolean('Show Icon', false);
            const showEntry1 = boolean('Show entry 1', true);
            const showEntry2 = boolean('Show entry 2', true);
            const showEntry3 = boolean('Show entry 3', true);
            const ariaLabel = text('Aria Label', 'Aria Label');
            const onClick1 = action('clicked entry 1');
            const onClick2 = action('clicked entry 2');
            const onClick3 = action('clicked entry 3');
            return (
                <div style={{position: 'relative'}}>
                    <MenuWrapper>
                        <strong>
                            <span>{title}</span>
                            <MenuIcon/>
                        </strong>
                        <Menu ariaLabel={ariaLabel}>
                            <Menu.ItemAction
                                onClick={onClick1}
                                ariaLabel={ariaLabel}
                                text={txt}
                                icon={icon ? <InfoIcon/> : null}
                                show={showEntry1}
                                extraText={extraText}
                            />
                            <Menu.ItemAction
                                onClick={onClick2}
                                ariaLabel={ariaLabel}
                                text={txt}
                                icon={icon ? <InfoIcon/> : null}
                                show={showEntry2}
                                extraText={extraText}
                            />
                            <Menu.ItemAction
                                onClick={onClick3}
                                ariaLabel={ariaLabel}
                                text={txt}
                                icon={icon ? <InfoIcon/> : null}
                                show={showEntry3}
                                extraText={extraText}
                            />
                        </Menu>
                    </MenuWrapper>
                </div>
            );
        },
    );
