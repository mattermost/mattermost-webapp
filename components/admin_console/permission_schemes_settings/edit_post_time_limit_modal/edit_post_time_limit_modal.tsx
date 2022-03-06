// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Modal} from 'react-bootstrap';

import {AdminConfig} from 'mattermost-redux/types/config';
import {ActionFunc} from 'mattermost-redux/types/actions';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import {Constants} from 'utils/constants';
import {localizeMessage} from 'utils/utils.jsx';
import {t} from 'utils/i18n';

const INT32_MAX = 2147483647;

type Props ={
    config: Partial<AdminConfig>;
    show: boolean;
    onClose: () => void;
    actions: {
        updateConfig: (config: AdminConfig) => ActionFunc & Partial<{error?: ClientErrorPlaceholder}>;
        getConfig: () => ActionFunc;
    };
}

type ClientErrorPlaceholder = {
    message: string;
    server_error_id: string;
}

export default function EditPostTimeLimitModal(props: Props) {
    const [saving, setSaving] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState('');
    const [postEditTimeLimit, setPostEditTimeLimit] = React.useState<number | string>(parseInt(props.config.ServiceSettings!.PostEditTimeLimit.toString(), 10));

    React.useEffect(() => {
        props.actions.getConfig();
    }, []);

    const save = async () => {
        setSaving(true);
        setErrorMessage('');

        const val = parseInt(postEditTimeLimit.toString(), 10);
        if (val !== Constants.UNSET_POST_EDIT_TIME_LIMIT) {
            if (val.toString() === 'NaN' || val <= 0 || val > INT32_MAX) {
                setErrorMessage(localizeMessage('edit_post.time_limit_modal.invalid_time_limit', 'Invalid time limit'));
                setSaving(false);
                return false;
            }
        }

        const newConfig = JSON.parse(JSON.stringify(props.config));
        newConfig.ServiceSettings.PostEditTimeLimit = val;

        const {error} = await props.actions.updateConfig(newConfig);
        if (error) {
            setErrorMessage(error.message);
            setSaving(false);
        } else {
            setSaving(false);
            props.onClose();
        }

        return true;
    };

    const handleOptionChange = (e: React.FormEvent<HTMLInputElement>) => {
        const {value} = e.currentTarget;
        if (value === Constants.ALLOW_EDIT_POST_ALWAYS) {
            setPostEditTimeLimit(Constants.UNSET_POST_EDIT_TIME_LIMIT);
        } else {
            setPostEditTimeLimit('');
        }
    };

    const handleSecondsChange = (e: React.FormEvent<HTMLInputElement>) => {
        const {value} = e.currentTarget;
        setPostEditTimeLimit(value);
    };

    return (
        <Modal
            dialogClassName='a11y__modal admin-modal edit-post-time-limit-modal'
            show={props.show}
            role='dialog'
            aria-labelledby='editPostTimeModalLabel'
            onHide={props.onClose}
        >
            <Modal.Header
                closeButton={true}
            >
                <Modal.Title
                    componentClass='h1'
                    id='editPostTimeModalLabel'
                >
                    <FormattedMessage
                        id='edit_post.time_limit_modal.title'
                        defaultMessage='Configure Global Edit Post Time Limit'
                    />
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <FormattedMarkdownMessage
                    id='edit_post.time_limit_modal.description'
                    defaultMessage='Setting a time limit **applies to all users** who have the "Edit Post" permissions in any permission scheme.'
                />
                <div className='pl-3 pb-3 pt-3'>
                    <div className='pt-3'>
                        <input
                            id='anytime'
                            type='radio'
                            name='limit'
                            value={Constants.ALLOW_EDIT_POST_ALWAYS}
                            checked={postEditTimeLimit === Constants.UNSET_POST_EDIT_TIME_LIMIT}
                            onChange={handleOptionChange}
                        />
                        <label htmlFor='anytime'>
                            <FormattedMessage
                                id='edit_post.time_limit_modal.option_label_anytime'
                                defaultMessage='Anytime'
                            />
                        </label>
                    </div>
                    <div className='pt-2'>
                        <input
                            id='timelimit'
                            type='radio'
                            name='limit'
                            value={Constants.ALLOW_EDIT_POST_TIME_LIMIT}
                            checked={postEditTimeLimit !== Constants.UNSET_POST_EDIT_TIME_LIMIT}
                            onChange={handleOptionChange}
                        />
                        <label htmlFor='timelimit'>
                            <FormattedMessage
                                id='edit_post.time_limit_modal.option_label_time_limit.preinput'
                                defaultMessage='Can edit for'
                            />
                        </label>
                        <input
                            type='number'
                            className='form-control inline'
                            min='0'
                            step='1'
                            max={INT32_MAX}
                            id='editPostTimeLimit'
                            readOnly={postEditTimeLimit === Constants.UNSET_POST_EDIT_TIME_LIMIT}
                            onChange={handleSecondsChange}
                            value={postEditTimeLimit === Constants.UNSET_POST_EDIT_TIME_LIMIT ? '' : postEditTimeLimit}
                        />
                        <label htmlFor='timelimit'>
                            <FormattedMessage
                                id='edit_post.time_limit_modal.option_label_time_limit.postinput'
                                defaultMessage='seconds after posting'
                            />
                        </label>
                    </div>
                    <div className='pt-3 light'>
                        <FormattedMessage
                            id='edit_post.time_limit_modal.subscript'
                            defaultMessage='Set the length of time users have to edit their messages after posting.'
                        />
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <div className='edit-post-time-limit-modal__error'>
                    {errorMessage}
                </div>
                <button
                    type='button'
                    className='btn btn-cancel'
                    onClick={props.onClose}
                >
                    <FormattedMessage
                        id='confirm_modal.cancel'
                        defaultMessage='Cancel'
                    />
                </button>
                <button
                    id='linkModalCloseButton'
                    type='button'
                    className='btn btn-default'
                    onClick={save}
                    disabled={saving}
                >
                    <FormattedMessage
                        id={saving ? t('save_button.saving') : t('edit_post.time_limit_modal.save_button')}
                        defaultMessage='Save Edit Time'
                    />
                </button>
            </Modal.Footer>
        </Modal>
    );
}
