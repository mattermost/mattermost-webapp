// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState, useEffect} from 'react';
import {CSSTransition} from 'react-transition-group';
import {FormattedMessage, useIntl} from 'react-intl';
import debounce from 'lodash/debounce';

import QuickInput from 'components/quick_input';

import Constants from 'utils/constants';

import LaptopEarthSVG from 'components/common/svg_images_components/laptop-earth_svg';
import useValidateUrl from 'components/common/hooks/useValidateUrl';

import {trackEvent} from 'actions/telemetry_actions';

import {Animations, mapAnimationReasonToClass, PreparingWorkspacePageProps} from './steps';

import Title from './title';
import Description from './description';
import PageBody from './page_body';
import ProgressPath from './progress_path';
import UrlStatus from './url_status';
import LeftCol from './left_col';

import './url.scss';

type Props = Omit<PreparingWorkspacePageProps, 'next'> & {
    url: string;
    setUrl: (url: string) => void;
    className?: string;
    next: (inferredProtocol: 'http' | 'https' | null) => void;
}

const reportValidationError = debounce((url: string, valid: boolean) => {
    if (!valid && url) {
        trackEvent('first_admin_setup', 'validate_url_error');
    }
}, 700, {leading: false});

const Url = (props: Props) => {
    const {formatMessage} = useIntl();
    const [userEdited, setUserEdited] = useState(false);
    const urlValidator = useValidateUrl();

    useEffect(() => {
        urlValidator.validate(props.url);
    }, []);
    useEffect(() => {
        if (props.show) {
            props.onPageView();
        }
    }, [props.show]);

    useEffect(() => {
        reportValidationError(props.url, urlValidator.result.valid);
    }, [props.url, urlValidator.result.valid]);

    const onNext = async (e?: React.KeyboardEvent | React.MouseEvent) => {
        if (e && (e as React.KeyboardEvent).key) {
            if ((e as React.KeyboardEvent).key !== Constants.KeyCodes.ENTER[0]) {
                return;
            }
        }
        if (urlValidator.verifying || !urlValidator.result.valid) {
            return;
        }
        props.next(urlValidator.result.inferredProtocol);
    };
    let className = 'Url-body';
    if (props.className) {
        className += ' ' + props.className;
    }
    return (
        <CSSTransition
            in={props.show}
            timeout={Animations.PAGE_SLIDE}
            classNames={mapAnimationReasonToClass('Url', props.transitionDirection)}
            mountOnEnter={true}
            unmountOnExit={true}
        >
            <div className={className}>
                <LeftCol/>
                <div className='Url-right-col'>
                    <div className='Url-form-wrapper'>
                        <ProgressPath
                            style={{
                                top: '15px',
                            }}
                        >
                            <LaptopEarthSVG/>
                        </ProgressPath>
                        {props.previous}
                        <Title>
                            <FormattedMessage
                                id={'onboarding_wizard.url.title'}
                                defaultMessage='Confirm your server’s URL'
                            />
                        </Title>
                        <Description>
                            <FormattedMessage
                                id={'onboarding_wizard.url.description'}
                                defaultMessage='This is the URL that users will use to access Mattermost. <a>See Documentation</a> for more.'
                                values={{
                                    a: (chunks: React.ReactNode | React.ReactNodeArray) => (
                                        <a
                                            href='https://docs.mattermost.com/configure/configuration-settings.html#site-url'
                                            target='_blank'
                                            rel='noreferrer'
                                        >
                                            {chunks}
                                        </a>
                                    ),
                                }}
                            />
                        </Description>
                        <PageBody>
                            <QuickInput
                                placeholder={
                                    formatMessage({
                                        id: 'onboarding_wizard.url.placeholder',
                                        defaultMessage: 'your-workspace',
                                    })
                                }
                                value={props.url}
                                onChange={(e) => {
                                    props.setUrl(e.target.value);
                                    setUserEdited(true);
                                    urlValidator.validate(e.target.value);
                                }}
                                className='Url__input'
                                onKeyUp={onNext}
                                autoFocus={true}
                            />
                            <UrlStatus
                                checking={urlValidator.verifying}
                                error={urlValidator.result.error}
                                valid={urlValidator.result.valid}
                                userEdited={userEdited}
                            />
                        </PageBody>
                        <div>
                            <button
                                className='primary-button'
                                onClick={onNext}
                                disabled={urlValidator.verifying || !urlValidator.result.valid}
                            >
                                <FormattedMessage
                                    id={'onboarding_wizard.next'}
                                    defaultMessage='Continue'
                                />
                            </button>
                            {
                                userEdited && !urlValidator.verifying && !urlValidator.result.valid && (

                                    <button
                                        className='tertiary-button'
                                        onClick={props.skip}
                                    >
                                        <FormattedMessage
                                            id={'onboarding_wizard.url.skip'}
                                            defaultMessage='I’ll do this later'
                                        />
                                    </button>
                                )
                            }
                        </div>
                    </div>
                </div>
            </div>
        </CSSTransition>
    );
};
export default Url;
