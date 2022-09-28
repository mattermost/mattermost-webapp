// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ReactNode} from 'react';
import {FormattedMessage} from 'react-intl';

import SaveButton from 'components/save_button';
import Constants from 'utils/constants';
import {isKeyPressed} from 'utils/utils';

type Props = {
    inputs: ReactNode;
    containerStyle?: string;
    clientError?: string;
    serverError?: string;
    extraInfo?: string | JSX.Element;
    infoPosition?: string;
    section?: string;
    updateSection: (section: string) => void;
    submit?: (setting?: string) => void;
    disableEnterSubmit?: boolean;
    submitExtra?: ReactNode;
    saving?: boolean;
    title: ReactNode;
    width?: string;
    cancelButtonText?: ReactNode;
    shiftEnter?: boolean;
    saveButtonText?: string;
    setting?: string;
}

export default class SettingItemMax extends React.PureComponent<Props> {
    static defaultProps = {
        infoPosition: 'bottom',
        saving: false,
        section: '',
        containerStyle: '',
    };
    private settingList: React.RefObject<HTMLDivElement>

    constructor(props: Props) {
        super(props);
        this.settingList = React.createRef();
    }

    componentDidMount() {
        if (this.settingList.current) {
            const focusableElements = this.settingList.current.querySelectorAll('.btn:not(.save-button):not(.btn-cancel), input.form-control, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (focusableElements.length > 0) {
                (focusableElements[0] as HTMLElement).focus();
            } else {
                this.settingList.current.focus();
            }
        }

        document.addEventListener('keydown', this.onKeyDown);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.onKeyDown);
    }

    onKeyDown = (e: any) => {
        if (this.props.shiftEnter && e.key === Constants.KeyCodes.ENTER[0] && e.shiftKey) {
            return;
        }
        if (this.props.disableEnterSubmit !== true &&
                isKeyPressed(e, Constants.KeyCodes.ENTER) &&
                this.props.submit && e.target.tagName !== 'SELECT' &&
                e.target.parentElement &&
                e.target.parentElement.className !== 'react-select__input' &&
                !e.target.classList.contains('btn-cancel') &&
                this.settingList.current && this.settingList.current.contains(e.target)) {
            this.handleSubmit(e);
        }
    }

    handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        if (!this.props.submit) {
            return;
        }

        if (this.props.setting) {
            this.props.submit(this.props.setting);
        } else {
            this.props.submit();
        }
    }

    handleUpdateSection = (e: React.MouseEvent<HTMLButtonElement>) => {
        this.props.updateSection(this.props.section ?? '');
        e.preventDefault();
    }

    render() {
        let clientError = null;
        if (this.props.clientError) {
            clientError = (
                <div className='form-group'>
                    <label
                        id='clientError'
                        className='col-sm-12 has-error'
                    >
                        {this.props.clientError}
                    </label>
                </div>
            );
        }

        let serverError = null;
        if (this.props.serverError) {
            serverError = (
                <div className='form-group'>
                    <label
                        id='serverError'
                        className='col-sm-12 has-error'
                    >
                        {this.props.serverError}
                    </label>
                </div>
            );
        }

        let extraInfo = null;
        let hintClass = 'setting-list__hint';
        if (this.props.infoPosition === 'top') {
            hintClass = 'pb-3';
        }

        if (this.props.extraInfo) {
            extraInfo = (
                <div
                    id='extraInfo'
                    className={hintClass}
                >
                    {this.props.extraInfo}
                </div>
            );
        }

        let submit = null;
        if (this.props.submit) {
            submit = (
                <SaveButton
                    defaultMessage={this.props.saveButtonText}
                    saving={this.props.saving}
                    disabled={this.props.saving}
                    onClick={this.handleSubmit}
                />
            );
        }

        const inputs = this.props.inputs;
        let widthClass;
        if (this.props.width === 'full') {
            widthClass = 'col-sm-12';
        } else if (this.props.width === 'medium') {
            widthClass = 'col-sm-10 col-sm-offset-2';
        } else {
            widthClass = 'col-sm-9 col-sm-offset-3';
        }

        let title;
        if (this.props.title) {
            title = (
                <h4
                    id='settingTitle'
                    className='col-sm-12 section-title'
                >
                    {this.props.title}
                </h4>
            );
        }

        let listContent = (
            <div className='setting-list-item'>
                {inputs}
                {extraInfo}
            </div>
        );

        if (this.props.infoPosition === 'top') {
            listContent = (
                <div>
                    {extraInfo}
                    {inputs}
                </div>
            );
        }

        let cancelButtonText;
        if (this.props.cancelButtonText) {
            cancelButtonText = this.props.cancelButtonText;
        } else {
            cancelButtonText = (
                <FormattedMessage
                    id='setting_item_max.cancel'
                    defaultMessage='Cancel'
                />
            );
        }

        return (
            <section
                className={`section-max form-horizontal ${this.props.containerStyle}`}
            >
                {title}
                <div className={widthClass}>
                    <div
                        tabIndex={-1}
                        ref={this.settingList}
                        className='setting-list'
                    >
                        {listContent}
                        <div className='setting-list-item'>
                            <hr/>
                            {this.props.submitExtra}
                            {serverError}
                            {clientError}
                            {submit}
                            <button
                                id={'cancelSetting'}
                                className='btn btn-sm btn-cancel cursor--pointer style--none'
                                onClick={this.handleUpdateSection}
                            >
                                {cancelButtonText}
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        );
    }
}
