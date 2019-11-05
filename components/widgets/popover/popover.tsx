import React from 'react';
import { Popover as BSPopover } from 'react-bootstrap';

export type Sizes = 'xs' | 'xsmall' | 'sm' | 'small' | 'medium' | 'lg' | 'large';


interface Props {
    id: string;
    children?: JSX.Element | JSX.Element[] | string;
    popoverStyle?: 'info';
    popoverSize?: Sizes;
    title?: React.ReactNode;
    placement?: 'bottom' | 'top' | 'right' | 'left';
}

const Popover: React.FC<Props> = (props: Props) => (<BSPopover
    bsStyle={props.popoverStyle}
    placement={props.placement}
    bsClass="popover"
    bsSize={props.popoverSize}
    {...props}
>
    {props.children}
</BSPopover>);

Popover.defaultProps = {
    placement: 'right',
    popoverStyle: 'info',
    popoverSize: 'small'
    
}
export default Popover;