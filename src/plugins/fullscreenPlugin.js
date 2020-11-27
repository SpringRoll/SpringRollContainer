/* eslint-disable indent */

import { BasePlugin } from '../base-plugins/BasePlugin';
// import { bellhop } from 'bellhop-iframe';

/**
 * A Springroll plugin to easily set up togglable fullscreen
 */
export class FullScreenPlugin extends BasePlugin {

    
    /**
     *  Creates an instance of FullscreenPlugin
     * 
     * @param {string} targetElementSelector -The selector for the element to be made fullscreen
     * @param {string} buttonSelector -The selector for the button to be used to toggle fullscreen on the targetElement
     */
    constructor(targetElementSelector, buttonSelector) {
        super({ name: 'fullscreen' });

        this.toggleButton = document.querySelector(buttonSelector);
        
        this.targetElement = document.querySelector(targetElementSelector);
        
        this.toggleButton.addEventListener('click', () => this.toggleFullscreen());
    }

    /**
     * Toggles fullscreen on the targetElement
     */
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.targetElement.requestFullscreen().then(() => {

            }).catch((err) => {
                console.log(err);
            });
        } else {
            document.exitFullscreen();
        }
    }

    /**
     * Preload is passed the bellhop client which assined to the class property "client"
     */
    async preload({client}) {
        this.client = client;
        return Promise.resolve();
    }
}