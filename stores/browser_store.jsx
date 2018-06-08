// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {browserHistory} from 'utils/browser_history';
import * as Selectors from 'selectors/storage';
import * as Actions from 'actions/storage';
import store from 'stores/redux_store.jsx';
import {ErrorPageTypes, StoragePrefixes} from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';

const dispatch = store.dispatch;
const getState = store.getState;

class BrowserStoreClass {
    setItem(name, value) {
        dispatch(Actions.setItem(name, value));
    }

    getItem(name, defaultValue) {
        return Selectors.makeGetItem(name, defaultValue)(getState());
    }

    removeItem(name) {
        dispatch(Actions.removeItem(name));
    }

    setGlobalItem(name, value) {
        dispatch(Actions.setGlobalItem(name, value));
    }

    getGlobalItem(name, defaultValue = null) {
        return Selectors.makeGetGlobalItem(name, defaultValue)(getState());
    }

    removeGlobalItem(name) {
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

    isSignallingLogout(logoutId) {
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

    isSignallingLogin(loginId) {
        return loginId === sessionStorage.getItem(StoragePrefixes.LOGIN);
    }

    /**
     * Preforms the given action on each item that has the given prefix
     * Signature for action is action(key, value)
     */
    actionOnGlobalItemsWithPrefix(prefix, action) {
        dispatch(Actions.actionOnGlobalItemsWithPrefix(prefix, action));
    }

    actionOnItemsWithPrefix(prefix, action) {
        dispatch(Actions.actionOnItemsWithPrefix(prefix, action));
    }

    clear(options) {
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
            localStorage.removeItem('__testLocal__', '1');
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
        return this.getItem('__landingPageSeen__', false);
    }

    setLandingPageSeen(landingPageSeen) {
        return this.setItem('__landingPageSeen__', landingPageSeen);
    }
}

var BrowserStore = new BrowserStoreClass();
export default BrowserStore;
