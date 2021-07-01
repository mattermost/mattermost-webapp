// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useState} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';

import {GlobalState} from 'types/store';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {patchConfig} from 'mattermost-redux/actions/admin';
import Input from 'components/input';
import {StepComponentProps} from 'components/next_steps_view/steps';
import {DispatchFunc} from 'mattermost-redux/types/actions';
import {isEmail} from 'mattermost-redux/utils/helpers';

import './enter_support_email.scss';

function EnterSupportEmail(props: StepComponentProps): JSX.Element {
    const [supportEmail, setSupportEmail] = useState('');
    const [validationError, setValidationError] = useState('');
    const [updateError, setUpdateError] = useState('');
    const {formatMessage} = useIntl();
    const dispatch: DispatchFunc = useDispatch();

    const sEmail = useSelector((state: GlobalState) => {
        const config = getConfig(state);
        return config.SupportEmail ? config.SupportEmail : '';
    });

    useEffect(() => {
        setSupportEmail(sEmail);
    }, [sEmail]);

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSupportEmail(event.target.value);
    };

    const onKeyUp = () => {
        setUpdateError('');
        validateEmail();
    };

    const validateEmail = (): boolean => {
        setValidationError('');
        const valid = isEmail(supportEmail);
        if (!valid) {
            setValidationError(formatMessage({id: 'next_steps_view.enter_support_email_step.invalidEmail', defaultMessage: 'Please enter a valid email.'}));
            return valid;
        }
        return valid;
    };

    const finishStep = async () => {
        setUpdateError('');
        const isValid = validateEmail();
        if (supportEmail !== '' && isValid) {
            const config = JSON.parse(JSON.stringify({
                SupportSettings: {
                    SupportEmail: supportEmail,
                },
            }));

            const {error} = await dispatch(patchConfig(config));
            if (error) {
                setUpdateError(formatMessage({id: 'next_steps_view.enter_support_email_step.error', defaultMessage: 'Something went wrong while setting the support email. Try again.'}));
                return;
            }
        }

        props.onFinish(props.id);
    };

    return (
        <div className='NextStepsView__stepWrapper'>
            <div className='EnterSupportEmailStep'>
                <div className='EnterSupportEmailStep__header'>
                    <h3>
                        <FormattedMessage
                            id='next_steps_view.enter_support_email_step.stayConnected'
                            defaultMessage='Stay connected'
                        />
                    </h3>
                    <FormattedMessage
                        id='next_steps_view.enter_support_email_step.enterTheEmail'
                        defaultMessage="Enter your organization's Support Email address for end user feedback, email notifications, and support requests."
                    />
                </div>
                <div className='EnterSupportEmailStep__body'>
                    <Input
                        placeholder='Email'
                        className='support_input'
                        value={supportEmail}
                        onChange={onChange}
                        onKeyUp={onKeyUp}
                        error={validationError}
                    />
                    {updateError && (
                        <div className='EnterSupportEmailStep__body--error'>
                            <i className='icon icon-alert-outline'/>
                            <span><FormattedMessage id='next_steps_view.enter_support_email_step.error'/></span>
                        </div>
                    )}
                </div>
            </div>
            <div className='NextStepsView__wizardButtons'>
                <button
                    data-testid='InviteMembersStep__finishButton'
                    className={'NextStepsView__button NextStepsView__finishButton primary'}
                    onClick={finishStep}
                >
                    <FormattedMessage
                        id='next_steps_view.invite_members_step.finish'
                        defaultMessage='Finish'
                    />
                </button>
            </div>
        </div>
    );
}
export default EnterSupportEmail;
