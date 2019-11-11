// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Overlay, Tooltip} from 'react-bootstrap';

import {localizeMessage} from 'utils/utils.jsx';
import SaveButton from 'components/save_button';
import FormError from 'components/form_error';

import AdminHeader from 'components/widgets/admin_console/admin_header';

type Props = {
    config?: object;
    environmentConfig?: object;
    setNavigationBlocked?: (blocked: boolean) => void;
    updateConfig?: (config: object) => {data: object; error: ClientErrorPlaceholder};
}

type State = {
    saveNeeded: boolean;
    saving: boolean;
    serverError: string|null;
    serverErrorId?: string;
    errorTooltip: boolean;
}

type StateKeys = keyof State;

// Placeholder type until ClientError is exported from redux.
// TODO: remove ClientErrorPlaceholder and change the return type of updateConfig
type ClientErrorPlaceholder = {
    message: string;
    server_error_id: string;
}

export default abstract class AdminSettings extends React.Component<Props, State> {
    public constructor(props: Props) {
        super(props);
        const stateInit = {
            saveNeeded: false,
            saving: false,
            serverError: null,
            errorTooltip: false,
        };
        if (props.config) {
            this.state = Object.assign(this.getStateFromConfig(props.config), stateInit);
        } else {
            this.state = stateInit;
        }
    }

    protected abstract getStateFromConfig(config: object): State;

    protected abstract getConfigFromState(config: object): object;

    protected abstract renderTitle(): React.ReactElement;

    protected abstract renderSettings(): React.ReactElement;

    protected handleSaved?: ((config: object) => React.ReactElement);

    protected canSave?: () => boolean;

    private closeTooltip = () => {
        this.setState({errorTooltip: false});
    }

    private openTooltip = (e: React.MouseEvent) => {
        const elm: HTMLElement|null = e.currentTarget.querySelector('.control-label');
        if (elm) {
            const isElipsis = elm.offsetWidth < elm.scrollWidth;
            this.setState({errorTooltip: isElipsis});
        }
    }

    private handleChange = (id: StateKeys, value: any) => {
        this.setState((prevState) => ({
            ...prevState,
            saveNeeded: true,
            [id]: value,
        }));

        if (this.props.setNavigationBlocked) {
            this.props.setNavigationBlocked(true);
        }
    };

    private handleSubmit = (e: React.SyntheticEvent) => {
        e.preventDefault();

        this.doSubmit();
    }

    private doSubmit = async (callback?: () => void) => {
        this.setState({
            saving: true,
            serverError: null,
        });

        // clone config so that we aren't modifying data in the stores
        let config = JSON.parse(JSON.stringify(this.props.config));
        config = this.getConfigFromState(config);

        if (this.props.updateConfig) {
            const {data, error} = await this.props.updateConfig(config);

            if (data) {
                this.setState(this.getStateFromConfig(data));

                this.setState({
                    saveNeeded: false,
                    saving: false,
                });

                if (this.props.setNavigationBlocked) {
                    this.props.setNavigationBlocked(false);
                }

                if (callback) {
                    callback();
                }

                if (this.handleSaved) {
                    this.handleSaved(config);
                }
            } else if (error) {
                this.setState({
                    saving: false,
                    serverError: error.message,
                    serverErrorId: error.server_error_id,
                });

                if (callback) {
                    callback();
                }

                if (this.handleSaved) {
                    this.handleSaved(config);
                }
            }
        }
    };

    private parseInt = (str: string, defaultValue?: number) => {
        const n = parseInt(str, 10);

        if (isNaN(n)) {
            if (defaultValue) {
                return defaultValue;
            }
            return 0;
        }

        return n;
    };

    private parseIntNonNegative = (str: string, defaultValue?: number) => {
        const n = parseInt(str, 10);

        if (isNaN(n) || n < 0) {
            if (defaultValue) {
                return defaultValue;
            }
            return 0;
        }

        return n;
    };

    private parseIntNonZero = (str: string, defaultValue?: number, minimumValue = 1) => {
        const n = parseInt(str, 10);

        if (isNaN(n) || n < minimumValue) {
            if (defaultValue) {
                return defaultValue;
            }
            return 1;
        }

        return n;
    };

    private getConfigValue(config: object, path: string) {
        const pathParts = path.split('.');

        return pathParts.reduce((obj: object|null, pathPart) => {
            if (!obj) {
                return null;
            }
            return obj[(pathPart as keyof object)];
        }, config);
    }

    private setConfigValue(config: object, path: string, value: any) {
        function setValue(obj: object, pathParts: string[]) {
            const part = pathParts[0] as keyof object;

            if (pathParts.length === 1) {
                Object.assign(obj, {[part]: value});
            } else {
                if (obj[part] == null) {
                    Object.assign(obj, {[part]: {}});
                }

                setValue(obj[part], pathParts.slice(1));
            }
        }

        setValue(config, path.split('.'));
    }

    private isSetByEnv = (path: string) => {
        return Boolean(this.props.environmentConfig && this.getConfigValue(this.props.environmentConfig, path));
    };

    public render() {
        return (
            <form
                className='form-horizontal'
                role='form'
                onSubmit={this.handleSubmit}
            >
                <div className='wrapper--fixed'>
                    <AdminHeader>
                        {this.renderTitle()}
                    </AdminHeader>
                    {this.renderSettings()}
                    <div className='admin-console-save'>
                        <SaveButton
                            saving={this.state.saving}
                            disabled={!this.state.saveNeeded || (this.canSave && !this.canSave())}
                            onClick={this.handleSubmit}
                            savingMessage={localizeMessage('admin.saving', 'Saving Config...')}
                        />
                        <div
                            className='error-message'
                            ref='errorMessage'
                            onMouseOver={this.openTooltip}
                            onMouseOut={this.closeTooltip}
                        >
                            <FormError error={this.state.serverError}/>
                        </div>
                        <Overlay
                            show={this.state.errorTooltip}
                            placement='top'
                            target={this.refs.errorMessage}
                        >
                            <Tooltip id='error-tooltip' >
                                {this.state.serverError}
                            </Tooltip>
                        </Overlay>
                    </div>
                </div>
            </form>
        );
    }
}
