// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import SearchResultsHeader from 'components/search_results_header';
import {AppBinding, AppContext, AppForm} from '@mattermost/types/apps';
import {getRhsAppBinding} from 'selectors/rhs';
import {useSelector} from 'react-redux';
import AppsForm from 'components/apps_form';
import {createCallContext} from 'utils/apps';
import Markdown from 'components/markdown';

const binding: AppBinding = {
    type: 'view',
    app_id: 'github',
    label: 'GitHub',
    description: 'The Description',
    bindings: [
        {
            type: 'menu',
            label: 'Menu Title',
            bindings: [
                {
                    type: 'menu_item',
                    label: 'Your Pull Requests',
                    description: '1',
                    icon: 'fa-code-fork'
                }
            ],
        },
        {
            type: 'button',
            label: 'Start a meeting 2',
        },
        {
            type: 'form',
            label: 'Some Form',
            form: {
                fields: [
                    {
                        name: 'submit',
                        type: 'static_select',
                        options: [
                            {
                                label: 'Start a Meeting',
                                value: 'start_meeting',
                            },
                        ],
                    },
                ],
                submit_buttons: 'submit',
                submit: {
                    path: 'start_meeting/submit',
                },
            },
        },
        {
            type: 'divider',
            label: 'Some Divider',
        },
        {
            type: 'markdown',
            label: 'Some Markdown',
            description: '### Markdown is great! :tada:',
        },
    ],
};

window.testRHSBinding = binding;

export default function RhsAppBinding() {
    const binding = useSelector(getRhsAppBinding);
    const context = createCallContext(
        'github',
    );

    let view = <h3>{'Loading'}</h3>;
    if (binding) {
        view = (
            <AppBindingView
                binding={binding}
                context={context}
            />
        );
    }

    return (
        <div
            id='rhsContainer'
            className='sidebar-right__body'
        >
            <SearchResultsHeader>
                {binding?.label || ''}
            </SearchResultsHeader>
            <div style={{
                padding: '20px',
            }}>
                {view}
            </div>
        </div>
    );
}

type ViewProps = {
    binding: AppBinding;
    context: AppContext;
};

export function AppBindingView(props: ViewProps) {
    const context = createCallContext(
        'github',
    );

    const subviews = props.binding.bindings?.map((b) => {
        const subviewProps = {
            binding: b,
            context,
        };

        switch (b.type) {
            case 'view':
                return <AppBindingView {...subviewProps} />;
            case 'menu':
                return <AppBindingMenu {...subviewProps} />;
            case 'form':
                return <AppBindingForm {...subviewProps} />;
            case 'divider':
                return (
                    <Markdown message='-----' />
                );
            case 'markdown':
                return (
                    <Markdown message={b.description} />
                );
        }

        return <p>{'Unsupported binding type: ' + b.type}</p>;
    });

    return (
        <div>
            {subviews}
        </div>
    );
}

type FormProps = {
    binding: AppBinding;
    context: AppContext;
}

export function AppBindingForm(props: FormProps) {
    return (
        <AppsForm
            hideCancel={true}
            isEmbedded={true}
            onExited={() => {
                alert('exited');
            }}
            context={props.context}
            form={props.binding.form}
        />
    )
}


type MenuProps = {
    binding: AppBinding;
    context: AppContext;
};

export function AppBindingMenu(props: MenuProps) {
    const menuItems = props.binding.bindings?.map((menuItem) => {
        return <AppBindingMenuItem binding={menuItem} />
    });

    return (
        <div>
            <h2>
                {props.binding.label}
            </h2>
            {menuItems}
        </div>
    );
}

type MenuItemProps = {
    binding: AppBinding;
    context: AppContext;
};

export function AppBindingMenuItem(props: MenuProps) {
    return (
        <div>
            <span
                className={'fa ' + props.binding.icon}
            />
            {props.binding.label}
        </div>
    )
}
