// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {AppBinding, AppContext, AppForm} from '@mattermost/types/apps';

import {handleBindingClick} from 'actions/apps';
import {getRhsAppBinding} from 'selectors/rhs';
import {createCallContext} from 'utils/apps';

import AppsForm from 'components/apps_form';
import SearchResultsHeader from 'components/search_results_header';
import Markdown from 'components/markdown';
import {MenuItem} from 'components/channel_info_rhs/menu';

export default function RhsAppBinding() {
    const binding = useSelector(getRhsAppBinding);
    return <RhsAppBindingInner binding={binding} />;
}

export function RhsAppBindingInner(props: {binding: AppBinding}) {
    const {binding} = props;

    const context = createCallContext(
        binding.app_id,
    );

    let view = <h3>{'Loading'}</h3>;
    if (binding) {
        view = (
            <AppBindingView
                app_id={binding.app_id}
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
                overflowY: 'scroll',
            }}>
                {view}
            </div>
        </div>
    );
}

type ViewProps = {
    binding: AppBinding;
    context: AppContext;
    app_id: string;
};

export function AppBindingView(props: ViewProps) {
    const {context} = props;

    const subviews = props.binding.bindings?.map((b, i) => {
        const subviewProps = {
            binding: b,
            context,
            app_id: props.app_id,
            key: i,
        };

        switch (b.type) {
            case 'view':
                return <AppBindingView {...subviewProps} />;
            case 'menu':
                return <AppBindingMenu {...subviewProps} />;
            case 'form':
                return <AppBindingForm {...subviewProps} />;
            case 'button':
                return <AppBindingButton {...subviewProps} />;
            case 'divider':
                return (
                    <div style={styles.containerSpacing}>
                        <Markdown message='-----' />
                    </div>
                );
            case 'markdown':
                return (
                    <div style={styles.containerSpacing}>
                        <Markdown message={b.label} />
                    </div>
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

export function AppBindingButton(props: FormProps) {
    const form: AppForm = {
        fields: [
            {
                name: 'submit',
                type: 'static_select',
                options: [
                    {
                        label: props.binding.label,
                        value: props.binding.label,
                    },
                ],
            },
        ],
        submit_buttons: 'submit',
        submit: props.binding.submit,
    };

    return (
        <div style={styles.containerSpacing}>
            <AppsForm
                hideCancel={true}
                isEmbedded={true}
                onExited={() => {
                    alert('exited');
                }}
                context={props.context}
                form={form}
            />
        </div>
    )
}

type FormProps = {
    binding: AppBinding;
    context: AppContext;
    app_id: string;
}

export function AppBindingForm(props: FormProps) {
    return (
        <div style={styles.containerSpacing}>
            <AppsForm
                hideCancel={true}
                isEmbedded={true}
                onExited={() => {
                    alert('exited');
                }}
                context={props.context}
                form={props.binding.form}
            />
        </div>
    )
}


type MenuProps = {
    binding: AppBinding;
    context: AppContext;
    app_id: string;
};

export function AppBindingMenu(props: MenuProps) {
    const menuItems = props.binding.bindings?.map((menuItem, i) => {
        return <AppBindingMenuItem key={i} binding={menuItem} app_id={props.app_id} context={props.context} />
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
    app_id: string;
};

export function AppBindingMenuItem(props: MenuProps) {
    const dispatch = useDispatch();

    const binding = {...props.binding, app_id: props.app_id};
    const context = {...props.context, app_id: props.app_id};

    return (
        <MenuItem
            icon={(
                <i
                    className={binding.icon ? ('icon icon-' + binding.icon) : ''}
                />
            )}
            text={props.binding.label}
            onClick={() => dispatch(handleBindingClick(binding, context, null))}
            opensSubpanel={true}
            badge={props.binding.hint}
        />
    );
}

const styles = {
    containerSpacing: {
        paddingLeft: '20px',
        paddingRight: '20px',
    }
}
