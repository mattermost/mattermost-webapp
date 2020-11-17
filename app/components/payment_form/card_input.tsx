// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {StripeElements, StripeCardElement, StripeCardElementChangeEvent} from '@stripe/stripe-js';
import {ElementsConsumer, CardElement} from '@stripe/react-stripe-js';

import {FormattedMessage} from 'react-intl';

import './card_input.css';
import 'components/input.css';

const CARD_ELEMENT_OPTIONS = {
    hidePostalCode: true,
    style: {
        base: {
            fontFamily: 'Open Sans',
            fontSize: '14px',
            opacity: '0.5',
            fontSmoothing: 'antialiased',
        },
    },
};

type OwnProps = {
    error?: string;
    required?: boolean;
    forwardedRef?: any;

    // Stripe doesn't give type exports
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

        let errorMessage;
        if (error === REQUIRED_FIELD_TEXT) {
            errorMessage = (
                <FormattedMessage
                    id='payment.field_required'
                    defaultMessage='This field is required'
                />);
        } else if (error === VALID_CARD_TEXT) {
            errorMessage = (
                <FormattedMessage
                    id='payment.invalid_card_number'
                    defaultMessage='Please enter a valid credit card'
                />);
        }

        return (
            <div className='Input___error'>
                <i className='icon icon-alert-outline'/>
                {errorMessage}
            </div>
        );
    }

    public getCard(): StripeCardElement | null | undefined {
        return this.props.elements?.getElement(CardElement);
    }

    public render() {
        const {className, error: propError, ...otherProps} = this.props;
        const {empty, focused, error: stateError} = this.state;
        let fieldsetClass = className ? `Input_fieldset ${className}` : 'Input_fieldset';
        let fieldsetErrorClass = className ? `Input_fieldset Input_fieldset___error ${className}` : 'Input_fieldset Input_fieldset___error';
        const showLegend = Boolean(focused || !empty);

        fieldsetClass = showLegend ? fieldsetClass + ' Input_fieldset___legend' : fieldsetClass;
        fieldsetErrorClass = showLegend ? fieldsetErrorClass + ' Input_fieldset___legend' : fieldsetErrorClass;

        const error = propError || stateError;

        return (
            <div className='Input_container'>
                <fieldset className={error ? fieldsetErrorClass : fieldsetClass}>
                    <legend className={showLegend ? 'Input_legend Input_legend___focus' : 'Input_legend'}>
                        <FormattedMessage
                            id='payment.card_number'
                            defaultMessage='Card Number'
                        />
                    </legend>
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
