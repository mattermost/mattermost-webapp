// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import ReactSelect, {ValueType} from 'react-select';
import {ActionResult} from 'mattermost-redux/types/actions';
import {UserProfile} from 'mattermost-redux/types/users';

import * as I18n from 'i18n/i18n.jsx';
import SettingItemMax from 'components/setting_item_max.jsx';
import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';
import {isKeyPressed} from 'utils/utils.jsx';
import Constants from 'utils/constants';

type Actions = {
    updateMe: (user: UserProfile) => Promise<ActionResult>;
};

type Props = {
    user: UserProfile;
    locale: string;
    updateSection: (section: string) => void;
    actions: Actions;
};

type SelectedOption = {
    value: string;
    label: string;
}

type State = {
    isSaving: boolean;
    openMenu: boolean;
    locale: string;
    serverError?: string;
    selectedOption: SelectedOption;
};

export default class ManageLanguage extends React.PureComponent<Props, State> {
    reactSelectContainer: React.RefObject<HTMLDivElement>;
    constructor(props: Props) {
        super(props);
        const locales: any = I18n.getLanguages();
        const userLocale = props.locale;
        const selectedOption = {
            value: locales[userLocale].value,
            label: locales[userLocale].name,
        };
        this.reactSelectContainer = React.createRef();

        this.state = {
            locale: props.locale,
            selectedOption,
            isSaving: false,
            openMenu: false,
        };
    }

    componentDidMount() {
        const reactSelectContainer = this.reactSelectContainer.current;
        if (reactSelectContainer) {
            reactSelectContainer.addEventListener(
                'keydown',
                this.handleContainerKeyDown,
            );
        }
    }

    componentWillUnmount() {
        if (this.reactSelectContainer.current) {
            this.reactSelectContainer.current.removeEventListener(
                'keydown',
                this.handleContainerKeyDown,
            );
        }
    }

    handleContainerKeyDown = (e: KeyboardEvent) => {
        const modalBody = document.querySelector('.modal-body');
        if (isKeyPressed(e, Constants.KeyCodes.ESCAPE) && this.state.openMenu) {
            modalBody?.classList.remove('no-scroll');
            this.setState({openMenu: false});
            e.stopPropagation();
        }
    };

    handleKeyDown = (e: React.KeyboardEvent) => {
        const modalBody = document.querySelector('.modal-body');
        if (isKeyPressed(e, Constants.KeyCodes.ENTER)) {
            modalBody?.classList.add('no-scroll');
            this.setState({openMenu: true});
        }
    };

    setLanguage = (selectedOption: ValueType<SelectedOption>) => {
        if (selectedOption && 'value' in selectedOption) {
            this.setState({
                locale: selectedOption.value,
                selectedOption,
            });
        }
    };

    changeLanguage = () => {
        if (this.props.user.locale === this.state.locale) {
            this.props.updateSection('');
        } else {
            this.submitUser({
                ...this.props.user,
                locale: this.state.locale,
            });
        }
    };

    submitUser = (user: UserProfile) => {
        this.setState({isSaving: true});

        this.props.actions.updateMe(user).then((res) => {
            if ('data' in res) {
                // Do nothing since changing the locale essentially refreshes the page
            } else if ('error' in res) {
                let serverError;
                const {error} = res;
                if (error instanceof Error) {
                    serverError = error.message;
                } else {
                    serverError = error;
                }
                this.setState({serverError, isSaving: false});
            }
        });
    };

    handleMenuClose = () => {
        const modalBody = document.querySelector('.modal-body');
        if (modalBody) {
            modalBody.classList.remove('no-scroll');
        }
        this.setState({openMenu: false});
    };

    handleMenuOpen = () => {
        const modalBody = document.querySelector('.modal-body');
        if (modalBody) {
            modalBody.classList.add('no-scroll');
        }
        this.setState({openMenu: true});
    };

    render() {
        let serverError;
        if (this.state.serverError) {
            serverError = (
                <label className='has-error'>{this.state.serverError}</label>
            );
        }

        const options: SelectedOption[] = [];
        const locales: any = I18n.getLanguages();

        const languages = Object.keys(locales).
            map((l) => {
                return {
                    value: locales[l].value as string,
                    name: locales[l].name,
                    order: locales[l].order,
                };
            }).
            sort((a, b) => a.order - b.order);

        languages.forEach((lang) => {
            options.push({value: lang.value, label: lang.name});
        });

        const reactStyles = {
            menuPortal: (provided: React.CSSProperties) => ({
                ...provided,
                zIndex: 9999,
            }),
        };

        const input = (
            <div key='changeLanguage'>
                <br/>
                <label
                    className='control-label'
                    id='changeInterfaceLanguageLabel'
                >
                    <FormattedMessage
                        id='user.settings.languages.change'
                        defaultMessage='Change interface language'
                    />
                </label>
                <div
                    ref={this.reactSelectContainer}
                    className='pt-2'
                >
                    <ReactSelect
                        className='react-select react-select-top'
                        classNamePrefix='react-select'
                        id='displayLanguage'
                        menuIsOpen={this.state.openMenu}
                        menuPortalTarget={document.body}
                        styles={reactStyles}
                        options={options}
                        clearable={false}
                        onChange={this.setLanguage}
                        onKeyDown={this.handleKeyDown}
                        value={this.state.selectedOption}
                        onMenuClose={this.handleMenuClose}
                        onMenuOpen={this.handleMenuOpen}
                        aria-labelledby='changeInterfaceLanguageLabel'
                    />
                    {serverError}
                </div>
                <div>
                    <br/>
                    <FormattedMarkdownMessage
                        id='user.settings.languages.promote'
                        defaultMessage='Select which language Mattermost displays in the user interface.\n \nWould you like to help with translations? Join the [Mattermost Translation Server](!http://translate.mattermost.com/) to contribute.'
                    />
                </div>
            </div>
        );

        return (
            <SettingItemMax
                title={
                    <FormattedMessage
                        id='user.settings.display.language'
                        defaultMessage='Language'
                    />
                }
                width='medium'
                submit={this.changeLanguage}
                saving={this.state.isSaving}
                inputs={[input]}
                updateSection={this.props.updateSection}
            />
        );
    }
}
