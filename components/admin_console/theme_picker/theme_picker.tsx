import React from 'react';
import PremadeThemeChooser from 'components/user_settings/display/user_settings_theme/premade_theme_chooser';
import CustomThemeChooser from 'components/user_settings/display/user_settings_theme/custom_theme_chooser';
import { Theme } from 'mattermost-redux/types/themes';
import ThemePickerPreview from './theme_picker_preview';

type Props = {
    defaultName: string,
    actions: {
        saveTheme: (name: string, theme: Theme) => void;
        deleteTheme: (name: string) => void;
        getTheme: (id: string) =>  Promise<{data: Theme}>;
    };
}

type State = {
    selectedName: string;
    selectedTheme?: Theme;
}

export default class ThemePicker extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            selectedName: this.props.defaultName,
        };
    }

    componentDidMount() {
        const self = this;
        this.props.actions.getTheme(this.props.defaultName)
            .then((theme: {data: Theme}) => {
                self.updateSelectedTheme(theme.data);
            });
    }

    selectTheme = (selectedTheme: Theme, selectedName: string) => {
        this.setState({selectedTheme, selectedName});
    }

    updateSelectedTheme = (selectedTheme: Theme) => {
        this.setState({selectedTheme});
    }

    saveSelectedTheme = () => {
        this.props.actions.saveTheme(this.state.selectedTheme!);
    }

    deleteSelectedTheme = () => {
        this.props.actions.deleteTheme(this.state.selectedName!);
    }

    public render() {
        let themeChooser;
        if (this.state.selectedTheme) {
            themeChooser = (
                <div className='theme-picker__wrapper'>
                    <div className='theme-picker__premade-wrapper'>
                        <PremadeThemeChooser
                            theme={this.state.selectedTheme}
                            updateTheme={this.selectTheme}
                        />
                    </div>
                    <hr/>
                    <div className='theme-picker__buttons'>
                        <button onClick={this.saveSelectedTheme}>
                            {'Save Theme'}
                        </button>
                        <button onClick={this.deleteSelectedTheme}>
                            {'Delete Theme'}
                        </button>
                    </div>
                    <hr/>
                    <div className='theme-picker__editor-wrapper'>
                        <div className='theme-picker__custom-wrapper'>
                            <CustomThemeChooser
                                theme={this.state.selectedTheme}
                                updateTheme={this.updateSelectedTheme}
                            />
                        </div>
                        <div className='theme-picker__preview-wrapper'>
                            <ThemePickerPreview theme={this.state.selectedTheme} />
                        </div>
                    </div>
                </div>
            );
        }
        return (
            <div className='wrapper--fixed'>
                <div className='theme-picker'>
                    {themeChooser}
                </div>
            </div>
        );
    }
}
