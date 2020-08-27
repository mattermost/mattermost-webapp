// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {StripeElements, StripeCardElement, StripeCardElementChangeEvent} from '@stripe/stripe-js';
import {ElementsConsumer, CardElement} from '@stripe/react-stripe-js';

import AlertIcon from 'components/widgets/icons/alert_icon';

import 'components/input.css';
import './card_input.css';

const CARD_ELEMENT_OPTIONS = {
    hidePostalCode: true,
    style: {
        base: {
            height: '48px',
            fontFamily: 'Source Sans Pro',
            fontSize: '18px',
            color: '#32325d',
            fontSmoothing: 'antialiased',
            '::placeholder': {
                color: 'rgb(33,63,107, 0.5)',
                fontSize: '18px',
            },
            ':focus::placeholder': {
                color: 'transparent',
            }
        },
        invalid: {
            color: '#DB3214',
            iconColor: '#DB3214',
        }
    }
};

type OwnProps = {
    error?: string;
    required?: boolean;
    [propName: string]: any; //eslint-disable-line @typescript-eslint/no-explicit-any
}

type Props = {
    elements: StripeElements | null | undefined;
} & OwnProps;

type State = {
    focused: boolean;
    error: string;
    empty: boolean;
    complete: boolean;
}

const REQUIRED_FIELD_TEXT = 'This field is required';
const VALID_CARD_TEXT = 'Please enter a valid credit card';

export interface CardInputType extends React.PureComponent {
    getCard(): StripeCardElement | undefined;
}

class CardInput extends React.PureComponent<Props, State> {
    public constructor(props: Props) {
        super(props);

        this.state = {
            focused: false,
            error: '',
            empty: true,
            complete: false,
        };
    }

    private onFocus = () => {
        const {onFocus} = this.props;

        this.setState({focused: true});

        if (onFocus) {
            onFocus();
        }
    }

    private onBlur = () => {
        const {onBlur} = this.props;

        this.setState({focused: false});
        this.validateInput();

        if (onBlur) {
            onBlur();
        }
    }

    private onChange = (event: StripeCardElementChangeEvent) => {
        this.setState({error: '', empty: event.empty, complete: event.complete});
    }

    private validateInput = () => {
        const {required} = this.props;
        const {empty, complete} = this.state;
        let error = '';

        this.setState({error: ''});
        if (required && empty) {
            error = REQUIRED_FIELD_TEXT;
        } else if (!complete) {
            error = VALID_CARD_TEXT;
        }

        this.setState({error});
    }

    private renderError(error: string) {
        if (!error) {
            return null;
        }

        return (
            <div className='Input-error'>
                <AlertIcon className='Form-error-icon'/>
                {' ' + error}
            </div>
        );
    }

    public getCard(): StripeCardElement | null | undefined {
        return this.props.elements?.getElement(CardElement);
    }

    public render() {
        const {className, error: propError, ...otherProps} = this.props;
        const {empty, focused, error: stateError} = this.state;
        let fieldsetClass = className ? `Input-fieldset ${className}` : 'Input-fieldset';
        let fieldsetErrorClass = className ? `Input-fieldset Input-fieldset-error ${className}` : 'Input-fieldset Input-fieldset-error';
        const showLegend = Boolean(focused || !empty);

        fieldsetClass = showLegend ? fieldsetClass + ' Input-fieldset-legend' : fieldsetClass;
        fieldsetErrorClass = showLegend ? fieldsetErrorClass + ' Input-fieldset-legend' : fieldsetErrorClass;

        const error = propError || stateError;

        return (
            <div className='Input-container'>
                <fieldset className={error ? fieldsetErrorClass : fieldsetClass}>
                    <legend className={showLegend ? 'Input-legend Input-legend-focus' : 'Input-legend'}>{'Card number'}</legend>
                    <CardElement
                        {...otherProps}
                        options={CARD_ELEMENT_OPTIONS}
                        onBlur={this.onBlur}
                        onFocus={this.onFocus}
                        onChange={this.onChange}
                    />
                </fieldset>
                {this.renderError(error)}
            </div>
        );
    }
}

const InjectedCardInput = (props: OwnProps) => {
    return (
        <ElementsConsumer>
            {({elements}) => (
                <CardInput
                    ref={props.forwardedRef}
                    elements={elements}
                    {...props}
                />
            )}
        </ElementsConsumer>
    );
};

export default InjectedCardInput;
