import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {ClientConfig} from 'mattermost-redux/types/config';
import {GlobalState} from 'mattermost-redux/types/store';

export function appsEnabled(state: GlobalState): boolean {
    const enabled = getConfig(state)?.['FeatureFlagAppsEnabled' as keyof Partial<ClientConfig>];
    return enabled === 'true';
}
