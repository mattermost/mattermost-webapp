// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import Constants, {EventTypes, A11yClassNames, A11yAttributeNames, A11yCustomEventTypes} from 'utils/constants.jsx';
import {isKeyPressed, cmdOrCtrlPressed, isDesktopApp} from 'utils/utils';

const listenerOptions = {
    capture: true,
};

export default class A11yController {
    constructor() {
        this.regionHTMLCollection = this.getAllRegions();
        this.sectionHTMLCollection = null;

        this.activeRegion = null;
        this.activeSection = null;
        this.activeElement = null;

        // used to reset navigation whenever navigation within a region occurs (section or element)
        this.resetNavigation = false;

        document.addEventListener(EventTypes.KEY_DOWN, this.handleKeyDown, listenerOptions);
        document.addEventListener(EventTypes.KEY_UP, this.handleKeyUp, listenerOptions);
        document.addEventListener(EventTypes.CLICK, this.handleMouseClick, listenerOptions);
        document.addEventListener(EventTypes.FOCUS, this.handleFocus, listenerOptions);
    }

    destroy() {
        document.removeEventListener(EventTypes.KEY_DOWN, this.handleKeyDown, listenerOptions);
        document.removeEventListener(EventTypes.KEY_UP, this.handleKeyUp, listenerOptions);
        document.removeEventListener(EventTypes.CLICK, this.handleMouseClick, listenerOptions);
        document.removeEventListener(EventTypes.FOCUS, this.handleFocus, listenerOptions);
    }

    // convenience getter/setters

    /**
     * Returns an array of available regions sorted by A11yAttributeNames.SORT_ORDER
     */
    get regions() {
        let elements = this.sortElementsByAttributeOrder(this.regionHTMLCollection);
        elements = elements.filter((element) => {
            return this.elementIsVisible(element);
        });
        return elements;
    }

    /**
     * Returns an array of available sections sorted by A11yAttributeNames.SORT_ORDER and optionally reversed
     */
    get sections() {
        let elements = this.sortElementsByAttributeOrder(this.sectionHTMLCollection);
        elements = elements.filter((element) => {
            return this.elementIsVisible(element);
        });
        if (this.reverseSections) {
            elements.reverse();
        }
        return elements;
    }

    get navInProgress() {
        return this.regions && this.regions.length && this.activeRegion;
    }

    get activeRegionIndex() {
        if (!this.activeRegion) {
            return null;
        }
        return this.regions.indexOf(this.activeRegion);
    }

    get activeSectionIndex() {
        if (!this.activeSection) {
            return null;
        }
        return this.sections.indexOf(this.activeSection);
    }

    get reverseSections() {
        if (!this.activeRegion) {
            return false;
        }
        const reverseSections = this.activeRegion.getAttribute(A11yAttributeNames.ORDER_REVERSE);
        return reverseSections && reverseSections.toLowerCase() === 'true';
    }

    get focusedElement() {
        let focusedElement;
        if (this.activeElement) {
            focusedElement = this.activeElement;
        } else if (this.activeSection) {
            focusedElement = this.activeSection;
        } else if (this.activeRegion) {
            focusedElement = this.activeRegion;
        }
        return focusedElement;
    }

    // public methods

    nextRegion() {
        const regions = this.regions;
        if (!regions || !regions.length) {
            return;
        }
        let newRegion;
        if (!this.activeRegion || this.activeRegionIndex === regions.length - 1 || (this.resetNavigation && this.activeRegionIndex !== 0)) {
            newRegion = regions[0];
        } else {
            newRegion = regions[this.activeRegionIndex + 1];
        }
        this.setActiveRegion(newRegion);
        this.setCurrentFocus();
        this.resetNavigation = false;
    }

    previousRegion() {
        const regions = this.regions;
        if (!regions || !regions.length) {
            return;
        }
        let newRegion;
        if (!this.activeRegion || (this.resetNavigation && this.activeRegionIndex !== 0)) {
            newRegion = regions[0];
        } else if (this.activeRegionIndex === 0) {
            newRegion = regions[regions.length - 1];
        } else {
            newRegion = regions[this.activeRegionIndex - 1];
        }
        this.setActiveRegion(newRegion);
        this.setCurrentFocus();
        this.resetNavigation = false;
    }

    nextSection() {
        const sections = this.sections;
        if (!sections || !sections.length) {
            return;
        }
        let newSection;
        if (this.activeSection && this.activeSectionIndex < sections.length - 1) {
            newSection = sections[this.activeSectionIndex + 1];
        } else {
            newSection = sections[0];
        }
        this.setActiveSection(newSection);
        this.setCurrentFocus();
        this.resetNavigation = true;
    }

    previousSection() {
        const sections = this.sections;
        if (!sections || !sections.length) {
            return;
        }
        let newSection;
        if (this.activeSection && this.activeSectionIndex > 0) {
            newSection = sections[this.activeSectionIndex - 1];
        } else if (this.activeSection && this.activeSectionIndex === 0) {
            newSection = sections[sections.length - 1];
        } else {
            newSection = sections[0];
        }
        this.setActiveSection(newSection);
        this.setCurrentFocus();
        this.resetNavigation = true;
    }

    nextElement(element, elementPath = []) {
        if (elementPath && elementPath.length) {
            // is the current element in an active region?
            if (elementPath.indexOf(this.activeRegion) < 0) {
                const region = elementPath.find((pathElement) => {
                    if (!pathElement.classList) {
                        return false;
                    }
                    return pathElement.classList.contains(A11yClassNames.REGION);
                });
                if (region) {
                    this.setActiveRegion(region, false);
                }
            }

            // is the current element in an active section?
            if (elementPath.indexOf(this.activeSection) < 0) {
                const section = elementPath.find((pathElement) => {
                    if (!pathElement.classList) {
                        return false;
                    }
                    return pathElement.classList.contains(A11yClassNames.SECTION);
                });
                if (section) {
                    this.setActiveSection(section);
                }
            }
        }
        this.setActiveElement(element);
        this.setCurrentFocus();
        this.resetNavigation = true;
    }

    cancelNavigation() {
        this.clearActiveRegion();
        this.setCurrentFocus();
    }

    // private methods

    setActiveRegion(element, focusChildIfNeeded = true) {
        if ((!element || element === this.activeRegion) && !this.resetNavigation) {
            return;
        }

        // clear previous active region
        this.clearActiveRegion();

        // setup new active region
        this.activeRegion = element;
        this.activeRegion.addEventListener(A11yCustomEventTypes.UPDATE, this.handleActiveRegionUpdate);
        this.activeRegion.dispatchEvent(new Event(A11yCustomEventTypes.ACTIVATE));

        // apply visual updates to active region
        this.updateActiveRegion();

        // retrieve all sections for the new active region
        this.sectionHTMLCollection = this.getAllSectionsForRegion(this.activeRegion);

        // should the visual focus start on a child section
        const focusChild = this.activeRegion.getAttribute(A11yAttributeNames.FOCUS_CHILD);
        if (focusChildIfNeeded && focusChild && focusChild.toLowerCase() === 'true' && this.sections && this.sections.length) {
            this.setActiveSection(this.sections[0]);
        }
    }

    setActiveSection(element) {
        if (!element || element === this.activeSection) {
            return;
        }

        // clear previous active section
        this.clearActiveSection();

        // setup new active section
        this.activeSection = element;
        this.activeSection.addEventListener(A11yCustomEventTypes.UPDATE, this.handleActiveSectionUpdate);
        this.activeSection.dispatchEvent(new Event(A11yCustomEventTypes.ACTIVATE));

        // apply visual updates to active section
        this.updateActiveSection();
    }

    setActiveElement(element) {
        if (!element || element === this.activeElement) {
            return;
        }

        // clear previous active element
        this.clearActiveElement();

        // setup new active element
        this.activeElement = element;
        this.activeElement.addEventListener(A11yCustomEventTypes.UPDATE, this.handleActiveElementUpdate);
        this.activeElement.dispatchEvent(new Event(A11yCustomEventTypes.ACTIVATE));

        // apply visual updates to active element
        this.updateActiveElement();
    }

    setCurrentFocus() {
        this.clearCurrentFocus();
        if (!this.focusedElement) {
            return;
        }

        this.focusedElement.focus();

        // apply visual updates to focused element
        this.udpateCurrentFocus();
    }

    updateActiveRegion() {
        if (!this.activeRegion) {
            return;
        }
        this.activeRegion.classList.add(A11yClassNames.ACTIVE);

        // ensure active region element is focusable
        if (!this.activeRegion.getAttribute('tabindex')) {
            this.activeRegion.setAttribute('tabindex', -1);
        }
    }

    updateActiveSection() {
        if (!this.activeSection) {
            return;
        }
        this.activeSection.classList.add(A11yClassNames.ACTIVE);

        // ensure active section element is focusable
        if (!this.activeSection.getAttribute('tabindex')) {
            this.activeSection.setAttribute('tabindex', -1);
        }
    }

    updateActiveElement() {
        if (!this.activeElement) {
            return;
        }
        this.activeElement.classList.add(A11yClassNames.ACTIVE);
    }

    udpateCurrentFocus() {
        if (!this.focusedElement) {
            return;
        }
        this.focusedElement.classList.add(A11yClassNames.FOCUSED);
    }

    clearActiveRegion() {
        if (this.activeRegion) {
            this.activeRegion.classList.remove(A11yClassNames.ACTIVE);
            this.activeRegion.dispatchEvent(new Event(A11yCustomEventTypes.DEACTIVATE));
            this.activeRegion.removeEventListener(A11yCustomEventTypes.UPDATE, this.handleActiveRegionUpdate);
            this.activeRegion = null;
        }
        this.clearActiveSection();
    }

    clearActiveSection() {
        if (this.activeSection) {
            this.activeSection.classList.remove(A11yClassNames.ACTIVE);
            this.activeSection.dispatchEvent(new Event(A11yCustomEventTypes.DEACTIVATE));
            this.activeSection.removeEventListener(A11yCustomEventTypes.UPDATE, this.handleActiveSectionUpdate);
            this.activeSection = null;
        }
        this.clearActiveElement();
    }

    clearActiveElement() {
        if (this.activeElement) {
            if (this.activeElement !== this.activeRegion && this.activeElement !== this.activeSection) {
                this.activeElement.classList.remove(A11yClassNames.ACTIVE);
                this.activeElement.dispatchEvent(new Event(A11yCustomEventTypes.DEACTIVATE));
            }
            this.activeElement.removeEventListener(A11yCustomEventTypes.UPDATE, this.handleActiveElementUpdate);
            this.activeElement = null;
        }
    }

    clearCurrentFocus(blurActiveElement = false) {
        Array.from(document.getElementsByClassName(A11yClassNames.FOCUSED)).forEach((element) => {
            element.classList.remove(A11yClassNames.FOCUSED);
        });
        if (blurActiveElement) {
            document.activeElement.blur();
        }
    }

    // helper methods

    getAllRegions() {
        return document.getElementsByClassName(A11yClassNames.REGION);
    }

    getAllSectionsForRegion(region) {
        if (!region) {
            return null;
        }
        return region.getElementsByClassName(A11yClassNames.SECTION);
    }

    sortElementsByAttributeOrder(elements) {
        if (!elements || !elements.length) {
            return [];
        }
        return Array.from(elements).sort((elementA, elementB) => {
            const elementAOrder = elementA.getAttribute(A11yAttributeNames.SORT_ORDER);
            const elementBOrder = elementB.getAttribute(A11yAttributeNames.SORT_ORDER);
            return elementAOrder - elementBOrder;
        });
    }

    elementIsVisible(element) {
        return element && element.offsetParent;
    }

    // event handling methods

    handleKeyDown = (event) => {
        const modifierKeys = {
            ctrlIsPressed: event.ctrlKey || (!event.ctrlKey && event.metaKey),
            altIsPressed: event.altKey,
            shiftIsPressed: event.shiftKey,
        };
        switch (true) {
        case isKeyPressed(event, Constants.KeyCodes.TILDE):
            if (modifierKeys.ctrlIsPressed) {
                event.preventDefault();
                if (modifierKeys.shiftIsPressed) {
                    this.previousRegion();
                } else {
                    this.nextRegion();
                }
            }
            break;
        case isKeyPressed(event, Constants.KeyCodes.F6):
            if (!isDesktopApp && !cmdOrCtrlPressed(event)) {
                return;
            }
            if (modifierKeys.shiftIsPressed) {
                this.previousRegion();
            } else {
                this.nextRegion();
            }
            break;
        case isKeyPressed(event, Constants.KeyCodes.UP):
            if (!this.navInProgress) {
                return;
            }
            event.preventDefault();
            if (this.reverseSections) {
                this.nextSection();
            } else {
                this.previousSection();
            }
            break;
        case isKeyPressed(event, Constants.KeyCodes.DOWN):
            if (!this.navInProgress) {
                return;
            }
            event.preventDefault();
            if (this.reverseSections) {
                this.previousSection();
            } else {
                this.nextSection();
            }
            break;
        case isKeyPressed(event, Constants.KeyCodes.ESCAPE):
            this.cancelNavigation();
            break;
        }
    }

    handleMouseClick = (e) => {
        if (!this.navInProgress || e.target === this.activeElement) {
            return;
        }
        this.cancelNavigation();
    }

    handleFocus = (event) => {
        this.nextElement(event.target, event.path);
    }

    handleActiveRegionUpdate = () => {
        this.updateActiveRegion();
        this.udpateCurrentFocus();
    }

    handleActiveSectionUpdate = () => {
        this.updateActiveSection();
        this.udpateCurrentFocus();
    }

    handleActiveElementUpdate = () => {
        this.updateActiveElement();
        this.udpateCurrentFocus();
    }
}
