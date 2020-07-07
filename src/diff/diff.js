import {render, unmount} from './../render.js';

export function diff(oldDom, newVNode, parentDom = oldDom.parentNode) {
    console.log('diffing', oldVNode, newVNode, parentDom);
    /*
    Lets investigate all possible combinations:
    Primitive VDOM + Text DOM: Compare VDOM value with DOM text content and perform full render if they differ.
    Primitive VDOM + Element DOM : Full render.
    Complex VDOM + Text DOM : Full render.
    Complex VDOM + Element DOM of different type : Full render.
    Complex VDOM + Element DOM of same type : The most interesting combination, place where children reconciliation is performed, see details below.
    Component VDOM + any kind of DOM: Just like in the previous section, is handled separately and will be implemented later.
    As you can see, text and complex nodes are generally incompatible and require full render — fortunately that’s a pretty rare mutation. But what about recursive children reconciliation — it performed as following:
    Current active element is memoized — reconciliation may break focus sometimes.
    DOM children are moved into temporary pool under their respective keys — prefixed index is used as a key by default.
    VDOM children are paired to the pool DOM nodes by key and recursively patched — or rendered from scratch if pair is not found.
    DOM nodes that left unpaired are removed from document.
    New attributes are applied to final parent DOM.
    Focus is returned back to previously active element.
    */

}

export function diffProperties(oldVNode,newVNode, dom) {
    console.log('=');
}

export function diffChildren(oldVNode, newVNode, parent) {
}