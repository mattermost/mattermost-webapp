// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {injectIntl, IntlShape} from 'react-intl';

import {AppCallResponse, AppField, AppForm, AppFormValues, AppSelectOption, AppCallType, AppCallRequest} from 'mattermost-redux/types/apps';
import {AppCallTypes, AppCallResponseTypes} from 'mattermost-redux/constants/apps';

import {makeCallErrorResponse} from 'utils/apps';

import {sendEphemeralPost} from 'actions/global_actions';

import AppsForm from './apps_form';

type Props = {
    intl: IntlShape;
    form?: AppForm;
    call?: AppCallRequest;
    onHide: () => void;
    actions: {
        doAppCall: (call: AppCallRequest, type: AppCallType, intl: IntlShape) => Promise<{data: AppCallResponse}>;
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

    submitForm = async (submission: {values: AppFormValues}): Promise<{data: AppCallResponse<any>}> => {
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
            return {data: makeCallErrorResponse(makeErrorMsg(errMsg))};
        }

        const call = this.getCall();
        if (!call) {
            const errMsg = this.props.intl.formatMessage({id: 'apps.error.form.no_call', defaultMessage: '`call` is not defined'});
            return {data: makeCallErrorResponse(makeErrorMsg(errMsg))};
        }

        const res = await this.props.actions.doAppCall({
            ...call,
            values: submission.values,
        }, AppCallTypes.SUBMIT, this.props.intl);

        const callResp = res.data;
        switch (callResp.type) {
        case AppCallResponseTypes.OK:
            if (callResp.markdown) {
                sendEphemeralPost(callResp.markdown, call.context.channel_id, call.context.root_id || call.context.post_id, callResp.app_metadata?.bot_user_id);
            }
            break;
        case AppCallResponseTypes.FORM:
            this.setState({form: callResp.form});
            break;
        case AppCallResponseTypes.NAVIGATE:
        case AppCallResponseTypes.ERROR:
            break;
        default:
            return {data: makeCallErrorResponse(makeErrorMsg(this.props.intl.formatMessage(
                {id: 'apps.error.responses.unknown_type', defaultMessage: 'App response type not supported. Response type: {type}.'},
                {type: callResp.type},
            )))};
        }
        return res;
    };

    refreshOnSelect = async (field: AppField, values: AppFormValues): Promise<{data: AppCallResponse<any>}> => {
        const makeErrMsg = (message: string) => this.props.intl.formatMessage(
            {
                id: 'apps.error.form.refresh',
                defaultMessage: 'There has been an error updating the modal. Contact the app developer. Details: {details}',
            },
            {details: message},
        );
        const {form} = this.state;
        if (!form) {
            return {data: makeCallErrorResponse(makeErrMsg(this.props.intl.formatMessage({id: 'apps.error.form.no_form', defaultMessage: '`form` is not defined.'})))};
        }

        const call = this.getCall();
        if (!call) {
            return {data: makeCallErrorResponse(makeErrMsg(this.props.intl.formatMessage({id: 'apps.error.form.no_call', defaultMessage: '`call` is not defined.'})))};
        }

        if (!field.refresh) {
            // Should never happen
            return {data: makeCallErrorResponse(makeErrMsg(this.props.intl.formatMessage({id: 'apps.error.form.refresh_no_refresh', defaultMessage: 'Called refresh on no refresh field.'})))};
        }

        const res = await this.props.actions.doAppCall({
            ...call,
            selected_field: field.name,
            values,
        }, AppCallTypes.FORM, this.props.intl);

        const callResp = res.data;
        switch (callResp.type) {
        case AppCallResponseTypes.FORM:
            this.setState({form: callResp.form});
            break;
        case AppCallResponseTypes.OK:
        case AppCallResponseTypes.NAVIGATE:
            return {data: makeCallErrorResponse(makeErrMsg(this.props.intl.formatMessage(
                {id: 'apps.error.responses.unexpected_type', defaultMessage: 'App response type was not expected. Response type: {type}.'},
                {type: callResp.type},
            )))};
        case AppCallResponseTypes.ERROR:
            break;
        default:
            return {data: makeCallErrorResponse(makeErrMsg(this.props.intl.formatMessage(
                {id: 'apps.error.responses.unknown_type', defaultMessage: 'App response type not supported. Response type: {type}.'},
                {type: callResp.type},
            )))};
        }
        return res;
    };

    performLookupCall = async (field: AppField, formValues: AppFormValues, userInput: string): Promise<AppSelectOption[]> => {
        const call = this.getCall();
        if (!call) {
            return [];
        }

        const res = await this.props.actions.doAppCall({
            ...call,
            values: formValues,
            query: userInput,
            selected_field: field.name,
        }, AppCallTypes.LOOKUP, this.props.intl);

        // TODO Surface errors?
        if (res.data.type !== AppCallResponseTypes.OK) {
            return [];
        }

        const data = res.data.data as {items: AppSelectOption[]};
        if (data.items && data.items.length) {
            return data.items;
        }

        return [];
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
                call={call}
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
