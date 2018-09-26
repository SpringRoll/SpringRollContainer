//Polyfills for IE11
import 'promise-polyfill/src/polyfill';
import 'nodelist-foreach-polyfill';
import 'whatwg-fetch';
import 'array-foreach';
import 'es6-object-assign/auto';
import 'custom-event-polyfill';

export * from './Container';
export * from './Features';
export * from './PageVisibility';
export * from './plugins';
export * from './SavedData';
export * from './SavedDataHandler';
