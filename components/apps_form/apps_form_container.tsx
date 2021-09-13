// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {injectIntl, IntlShape} from 'react-intl';

import {AppField, AppForm, AppFormValues, AppCallRequest, FormResponseData, AppLookupResponse} from 'mattermost-redux/types/apps';
import {AppCallTypes, AppCallResponseTypes} from 'mattermost-redux/constants/apps';

import {DoAppCall, DoAppCallResult, PostEphemeralCallResponseForContext} from 'types/apps';
import {makeCallErrorResponse} from 'utils/apps';

import AppsForm from './apps_form_component';

type Props = {
    intl: IntlShape;
    form?: AppForm;
    call?: AppCallRequest;
    onHide: () => void;
    actions: {
        doAppCall: DoAppCall<any>;
        postEphemeralCallResponseForContext: PostEphemeralCallResponseForContext;
    };
};

type State = {
    form?: AppForm;
}

class AppsFormContainer extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {form: props.form};
    }

    submitForm = async (submission: {values: AppFormValues}): Promise<DoAppCallResult<FormResponseData>> => {
        //TODO use FormResponseData instead of Any
        const makeErrorMsg = (msg: string) => {
            return this.props.intl.formatMessage(
                {
                    id: 'apps.error.form.submit.pretext',
                    defaultMessage: 'There has been an error submitting the modal. Contact the app developer. Details: {details}',
                },
                {details: msg},
            );
        };
        const {form} = this.state;
        if (!form) {
            const errMsg = this.props.intl.formatMessage({id: 'apps.error.form.no_form', defaultMessage: '`form` is not defined'});
            return {error: makeCallErrorResponse(makeErrorMsg(errMsg))};
        }

        const call = this.getCall();
        if (!call) {
            const errMsg = this.props.intl.formatMessage({id: 'apps.error.form.no_call', defaultMessage: '`call` is not defined'});
            return {error: makeCallErrorResponse(makeErrorMsg(errMsg))};
        }

        const res = await this.props.actions.doAppCall({
            ...call,
            values: submission.values,
        }, AppCallTypes.SUBMIT, this.props.intl) as DoAppCallResult<FormResponseData>;

        if (res.error) {
            return res;
        }

        const callResp = res.data!;
        switch (callResp.type) {
        case AppCallResponseTypes.OK:
            if (callResp.markdown) {
                this.props.actions.postEphemeralCallResponseForContext(
                    callResp,
                    callResp.markdown,
                    call.context,
                );
            }
            break;
        case AppCallResponseTypes.FORM:
            this.setState({form: callResp.form});
            break;
        case AppCallResponseTypes.NAVIGATE:
        default:
            return {error: makeCallErrorResponse(makeErrorMsg(this.props.intl.formatMessage(
                {
                    id: 'apps.error.responses.unknown_type',
                    defaultMessage: 'App response type not supported. Response type: {type}.',
                }, {
                    type: callResp.type,
                },
            )))};
        }
        return res;
    };

    refreshOnSelect = async (field: AppField, values: AppFormValues): Promise<DoAppCallResult<FormResponseData>> => {
        const makeErrMsg = (message: string) => this.props.intl.formatMessage(
            {
                id: 'apps.error.form.refresh',
                defaultMessage: 'There has been an error updating the modal. Contact the app developer. Details: {details}',
            },
            {details: message},
        );
        const {form} = this.state;
        if (!form) {
            return {error: makeCallErrorResponse(makeErrMsg(this.props.intl.formatMessage({
                id: 'apps.error.form.no_form',
                defaultMessage: '`form` is not defined.',
            })))};
        }

        const call = this.getCall();
        if (!call) {
            return {error: makeCallErrorResponse(makeErrMsg(this.props.intl.formatMessage({
                id: 'apps.error.form.no_call',
                defaultMessage: '`call` is not defined.',
            })))};
        }

        if (!field.refresh) {
            // Should never happen
            return {error: makeCallErrorResponse(makeErrMsg(this.props.intl.formatMessage({
                id: 'apps.error.form.refresh_no_refresh',
                defaultMessage: 'Called refresh on no refresh field.',
            })))};
        }

        const res = await this.props.actions.doAppCall({
            ...call,
            selected_field: field.name,
            values,
        }, AppCallTypes.FORM, this.props.intl);

        if (res.error) {
            return res;
        }

        const callResp = res.data!;
        switch (callResp.type) {
        case AppCallResponseTypes.FORM:
            this.setState({form: callResp.form});
            break;
        case AppCallResponseTypes.OK:
        case AppCallResponseTypes.NAVIGATE:
            return {error: makeCallErrorResponse(makeErrMsg(this.props.intl.formatMessage({
                id: 'apps.error.responses.unexpected_type',
                defaultMessage: 'App response type was not expected. Response type: {type}.',
            }, {
                type: callResp.type,
            },
            )))};
        default:
            return {error: makeCallErrorResponse(makeErrMsg(this.props.intl.formatMessage({
                id: 'apps.error.responses.unknown_type',
                defaultMessage: 'App response type not supported. Response type: {type}.',
            }, {
                type: callResp.type,
            },
            )))};
        }
        return res;
    };

    performLookupCall = async (field: AppField, values: AppFormValues, userInput: string): Promise<DoAppCallResult<AppLookupResponse>> => {
        const intl = this.props.intl;
        const makeErrorMsg = (message: string) => intl.formatMessage(
            {
                id: 'apps.error.form.refresh',
                defaultMessage: 'There has been an error fetching the select fields. Contact the app developer. Details: {details}',
            },
            {details: message},
        );
        const call = this.getCall();
        if (!call) {
            return {error: makeCallErrorResponse(makeErrorMsg(intl.formatMessage({
                id: 'apps.error.form.no_call',
                defaultMessage: '`call` is not defined.',
            })))};
        }

        return this.props.actions.doAppCall({
            ...call,
            values,
            selected_field: field.name,
            query: userInput,
        }, AppCallTypes.LOOKUP, intl);
    }

    getCall = (): AppCallRequest | null => {
        const {form} = this.state;

        const {call} = this.props;
        if (!call) {
            return null;
        }

        return {
            ...call,
            ...form?.call,
            expand: {
                ...form?.call?.expand,
                ...call.expand,
            },
        };
    }

    onHide = () => {
        this.props.onHide();
    };

    render() {
        const call = this.getCall();
        if (!call) {
            return null;
        }

        const {form} = this.state;
        if (!form) {
            return null;
        }

        return (
            <AppsForm
                form={form}
                onHide={this.onHide}
                actions={{
                    submit: this.submitForm,
                    performLookupCall: this.performLookupCall,
                    refreshOnSelect: this.refreshOnSelect,
                }}
            />
        );
    }
}

export default injectIntl(AppsFormContainer);
