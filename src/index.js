import Component from './component.js';
import {Fragment} from './component.js';
import createElement from './create-element.js';
import {render} from './render.js';

function createMevactApp(rootId,rootComponent, options = {}) {
    const rootVNode = document.getElementById(rootId);
    if(!rootVNode) {
        throw new Error('Element with ID ',rootId, ' does not exist');
    }
    const rootVDom = createElement(rootComponent, null, null);
    render(rootVNode,rootVDom);
    return rootId;
}


export default {
    createMevactApp,
    Component,
    createElement
}