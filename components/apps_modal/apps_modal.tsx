// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {AppCall, AppCallResponse, AppField, AppForm, AppModalState} from 'mattermost-redux/types/apps';
import {InteractiveDialogConfig, DialogElement} from 'mattermost-redux/types/integrations';

import EmojiMap from 'utils/emoji_map';

import InteractiveDialog from './interactive_dialog';

type FormValues = {
    [name: string]: any;
};

type Props = {
    modal?: AppModalState;
    onHide: () => void;
    actions: {
        doAppCall: (call: AppCall) => Promise<{data: AppCallResponse}>;
    };
    emojiMap: EmojiMap;
};

const AppsModal: React.FC<Props> = (props: Props) => {
    if (!props.modal) {
        return null;
    }

    const submitDialog = async (submission: {values: FormValues}): Promise<{data: AppCallResponse}> => {
        if (!props.modal) {
            return {data: {type: 'error', error: 'There has been an error submitting the dialog. Contact the app developer. Details: props.modal is not defined'}};
        }

        const call: AppCall = {
            ...props.modal.call,
            type: '',
            values: submission.values,
        };

        try {
            const res = await props.actions.doAppCall(call);
            return res;
        } catch (e) {
            return {data: {type: 'error', error: e.message}};
        }
    };

    const onHide = () => {
        return props.onHide();
    };

    const {form, call} = props.modal;
    const f = {
        ...form,
        app_id: call.context.app_id,
        url: call.url || '',
    };
    const dialog = appFormToInteractiveDialog(f);
    const dialogProps = makeDialogProps(dialog);

    return (
        <InteractiveDialog
            {...dialogProps}
            modal={props.modal}
            onHide={onHide}
            emojiMap={props.emojiMap}
            actions={{
                submit: submitDialog,
            }}
        />
    );
};

export default AppsModal;

function makeDialogProps(data: InteractiveDialogConfig) {
    return {
        url: data.url,
        callbackId: data.dialog.callback_id,
        elements: data.dialog.elements,
        title: data.dialog.title,
        introductionText: data.dialog.introduction_text,
        iconUrl: data.dialog.icon_url,
        submitLabel: data.dialog.submit_label,
        notifyOnCancel: data.dialog.notify_on_cancel,
        state: data.dialog.state,
        appID: data.app_id,
    };
}

export function appFormToInteractiveDialog(form: AppForm & {app_id: string; url: string}): InteractiveDialogConfig {
    const fields = form.fields || [];
    const elements = fields.map(fieldToDialogElement);
    const config: InteractiveDialogConfig = {
        app_id: form.app_id,
        url: form.url,
        trigger_id: '',
        dialog: {
            title: form.title || '',
            elements,
            introduction_text: form.header || '',
            state: '',
            submit_label: '',
            notify_on_cancel: false,
            callback_id: '',
        },
    };

    return config;
}

type SubDialogElement = {
    type: string;
    subtype: string;
    options: {text: string; value: string}[];
    data_source: string;
}

type SubDialogMaker = (field: AppField) => SubDialogElement;

const makeTextField: SubDialogMaker = (field) => {
    let type = 'text';
    let subtype = field.subtype || '';
    if (field.subtype === 'textarea') {
        type = 'textarea';
        subtype = '';
    }
    return {
        type,
        subtype,
        options: [],
        data_source: '',
    };
};

const makeBooleanField: SubDialogMaker = () => {
    return {
        type: 'bool',
        subtype: '',
        options: [],
        data_source: '',
    };
};

// const makeRadioField: SubDialogMaker = () => {
//     return {
//         type: 'radio',
//         subtype: '',
//         options: [],
//         data_source: '',
//     };
// };

const makeStaticSelectField: SubDialogMaker = (field) => {
    let options: {text: string; value: string}[] = [];
    if (field.options) {
        options = field.options?.map((opt) => ({
            text: opt.label,
            value: opt.value,
        }));
    }

    return {
        type: 'select',
        subtype: '',
        options,
        data_source: '',
    };
};

const makeDynamicSelectField: SubDialogMaker = (field) => {
    return {
        type: 'select',
        subtype: 'dynamic',
        options: [],
        data_source: field.source_url || '',
    };
};

const makeUserSelectField: SubDialogMaker = () => {
    return {
        type: 'select',
        subtype: '',
        options: [],
        data_source: 'users',
    };
};

const makeChannelSelectField: SubDialogMaker = () => {
    return {
        type: 'select',
        subtype: '',
        options: [],
        data_source: 'channels',
    };
};

enum FieldType {
    text = 'text',
    static_select = 'static_select',
    dynamic_select = 'dynamic_select',
    bool = 'bool',
    user = 'user',
    channel = 'channel',
}

const makeSubDialogField: SubDialogMaker = (field) => {
    switch (field.type) {
    case FieldType.text:
        return makeTextField(field);
    case FieldType.bool:
        return makeBooleanField(field);
    case FieldType.static_select:
        return makeStaticSelectField(field);
    case FieldType.dynamic_select:
        return makeDynamicSelectField(field);
    case FieldType.user:
        return makeUserSelectField(field);
    case FieldType.channel:
        return makeChannelSelectField(field);
    default:
        return makeTextField(field);
    }
};

export const fieldToDialogElement = (field: AppField): DialogElement => {
    const subField = makeSubDialogField(field);

    const element: DialogElement = {
        ...subField,
        name: field.name,
        display_name: field.modal_label || 'No label',
        default: field.value || '',
        placeholder: field.hint || '',
        optional: !field.is_required,
        min_length: field.min_length || 0,
        max_length: field.max_length || 0,
        help_text: field.description || '',
    };

    return element;
};
