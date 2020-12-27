// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {browserHistory} from 'utils/browser_history';
import * as Selectors from 'selectors/storage';
import * as Actions from 'actions/storage';
import store from 'stores/redux_store.jsx';
import {ErrorPageTypes, StoragePrefixes, LandingPreferenceTypes} from 'utils/constants';
import * as Utils from 'utils/utils.jsx';

const dispatch = store.dispatch;
const getState = store.getState;

class BrowserStoreClass {
    private hasCheckedLocalStorage?: boolean;
    private localStorageSupported?: boolean;

    setItem(name: string, value: string) {
        dispatch(Actions.setItem(name, value));
    }

    getItem(name: string, defaultValue: string) {
        return Selectors.makeGetItem(name, defaultValue)(getState());
    }

    removeItem(name: string) {
        dispatch(Actions.removeItem(name));
    }

    setGlobalItem(name: string, value: string) {
        dispatch(Actions.setGlobalItem(name, value));
    }

    getGlobalItem(name: string, defaultValue: string | null = null) {
        return Selectors.makeGetGlobalItem(name, defaultValue)(getState());
    }

    removeGlobalItem(name: string) {
        dispatch(Actions.removeGlobalItem(name));
    }

    signalLogout() {
        if (this.isLocalStorageSupported()) {
            // PLT-1285 store an identifier in session storage so we can catch if the logout came from this tab on IE11
            const logoutId = Utils.generateId();

            Utils.removePrefixFromLocalStorage(StoragePrefixes.ANNOUNCEMENT);

            sessionStorage.setItem(StoragePrefixes.LOGOUT, logoutId);
            localStorage.setItem(StoragePrefixes.LOGOUT, logoutId);
            localStorage.removeItem(StoragePrefixes.LOGOUT);
        }
    }

    isSignallingLogout(logoutId: string) {
        return logoutId === sessionStorage.getItem(StoragePrefixes.LOGOUT);
    }

    signalLogin() {
        if (this.isLocalStorageSupported()) {
            // PLT-1285 store an identifier in session storage so we can catch if the logout came from this tab on IE11
            const loginId = Utils.generateId();

            sessionStorage.setItem(StoragePrefixes.LOGIN, loginId);
            localStorage.setItem(StoragePrefixes.LOGIN, loginId);
            localStorage.removeItem(StoragePrefixes.LOGIN);
        }
    }

    isSignallingLogin(loginId: string) {
        return loginId === sessionStorage.getItem(StoragePrefixes.LOGIN);
    }

    clear(options?: {exclude: any}) { // TODO add more specific types
        dispatch(Actions.clear(options));
    }

    isLocalStorageSupported() {
        if (this.hasCheckedLocalStorage) {
            return this.localStorageSupported;
        }

        this.localStorageSupported = false;

        try {
            localStorage.setItem('__testLocal__', '1');
            if (localStorage.getItem('__testLocal__') === '1') {
                this.localStorageSupported = true;
            }
            localStorage.removeItem('__testLocal__');
        } catch (e) {
            this.localStorageSupported = false;
        }

        try {
            sessionStorage.setItem('__testSession__', '1');
            sessionStorage.removeItem('__testSession__');
        } catch (e) {
            // Session storage not usable, website is unusable
            browserHistory.push('/error?type=' + ErrorPageTypes.LOCAL_STORAGE);
        }

        this.hasCheckedLocalStorage = true;

        return this.localStorageSupported;
    }

    hasSeenLandingPage() {
        return localStorage.getItem(StoragePrefixes.LANDING_PAGE_SEEN);
    }

    setLandingPageSeen(landingPageSeen: boolean) {
        localStorage.setItem(StoragePrefixes.LANDING_PAGE_SEEN, String(landingPageSeen));
    }

    getLandingPreference(siteUrl?: string) {
        return localStorage.getItem(StoragePrefixes.LANDING_PREFERENCE + String(siteUrl));
    }

    setLandingPreferenceToMattermostApp(siteUrl?: string) {
        localStorage.setItem(StoragePrefixes.LANDING_PREFERENCE + String(siteUrl), LandingPreferenceTypes.MATTERMOSTAPP);
    }

    setLandingPreferenceToBrowser(siteUrl?: string) {
        localStorage.setItem(StoragePrefixes.LANDING_PREFERENCE + String(siteUrl), LandingPreferenceTypes.BROWSER);
    }

    clearLandingPreference(siteUrl?: string) {
        localStorage.removeItem(StoragePrefixes.LANDING_PREFERENCE + String(siteUrl));
    }
}

const BrowserStore = new BrowserStoreClass();
export default BrowserStore;
