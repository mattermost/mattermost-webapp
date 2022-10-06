import {handleBindingClick} from 'actions/apps';
import {MenuItem} from 'components/channel_info_rhs/menu';
import React from 'react';
import {useDispatch} from 'react-redux';
import {CommonProps} from './common_props';
import Icon from './icon';

export function AppBindingMenu(props: CommonProps) {
    const menuItems = props.binding.bindings?.map((menuItem, i) => {
        return (
            <AppBindingMenuItem
                {...props}
                key={menuItem.label}
                binding={menuItem}
            />
        );
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

export function AppBindingMenuItem(props: CommonProps) {
    const dispatch = useDispatch();

    const binding = {...props.binding, app_id: props.app_id};
    const context = {...props.context, app_id: props.app_id};

    return (
        <MenuItem
            icon={<Icon src={binding.icon}/>}
            text={props.binding.label}
            onClick={() => dispatch(handleBindingClick(binding, context, null))}
            opensSubpanel={true}
            badge={props.binding.hint}
        />
    );
}
