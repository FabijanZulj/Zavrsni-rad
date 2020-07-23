import {render, unmount} from './../render.js';

export function diff(oldVNode, newVNode, parentDom) {
    console.log('diffing', oldVNode,typeof oldVNode, newVNode, typeof newVNode, parentDom);
    // console.log('========================== is the data the same', oldVNode.data == newVNode.data);

    // oldVNode is a VNnode, new VNode is a simple text node, not VNode --  FULL RENDER
    if(typeof oldVNode === 'object' && typeof newVNode === 'string') {
        unmount(oldVNode);
        if(oldVNode.__componentInstance !== undefined) {
            oldVNode.__componentInstance.destroyed();
        }
        return render(parentDom, newVNode , false/* shouldRenderChildren = false */);
    }
    if(typeof oldVNode === 'object' && typeof newVNode === 'object') {
        // Check if tags are different, if new tag is different, render the new VNode without children
        // ======= chidren reconciliation will be done later
        if(oldVNode.tag !== newVNode.tag) {
            render(oldVNode.__dom.parentNode, newVNode, false);
            unmount(oldVNode);
        }
        
        if(typeof oldVNode.tag === 'function') {
            diffChildren(oldVNode, newVNode, oldVNode.__componentInstance.__dom);
        } else {

            diffChildren(oldVNode, newVNode, oldVNode.__dom);
        }
    }

    


    // IF tag is typeof function, it means the VNode is a component, if the tag is in children, you have to call updated in child 
    // component, but only if the props changed.



    /*
    Lets investigate all possible combinations:

    Primitive VDOM + Text DOM: Compare VDOM value with DOM text content and perform full render if they differ.

    Primitive VDOM + Element DOM : Full render.

    Complex VDOM + Text DOM : Full render.

    Complex VDOM + Element DOM of different type : Full render.

    Complex VDOM + Element DOM of same type : The most interesting combination, place where children reconciliation is performed, see details below.

    Component VDOM + any kind of DOM: Just like in the previous section, is handled separately and will be implemented later.


    As you can see, text and complex nodes are generally incompatible and require full render 
    — fortunately that’s a pretty rare mutation. But what about recursive children reconciliation — it performed as following:

    Current active element is memoized — reconciliation may break focus sometimes.
    DOM children are moved into temporary pool under their respective keys — prefixed index is used as a key by default.
    VDOM children are paired to the pool DOM nodes by key and recursively patched — or rendered from scratch if pair is not found.
    DOM nodes that left unpaired are removed from document.
    New attributes are applied to final parent DOM.

    Focus is returned back to previously active element.
    */
}

export function diffChildren(oldVNode, newVNode, parentDom) {
    const currentActiveElement = document.activeElement;
    const childrenPool = {};
    if(oldVNode.children.length > 0) {
        oldVNode.children.forEach((oldChild, __index) => {
            // children can be simple strings too so we check if its a object wich means its a VNode
            if(typeof oldChild === 'object') {
                console.log('OLD CHILD =>>>>>>>>>>>>>>>>>', oldChild.__elementKey);
                if(oldChild.__elementKey !== null) {
                    childrenPool[oldChild.__elementKey] = oldChild;
                } else {
                    childrenPool[__index] = oldChild;
                }
            } else {
                childrenPool[__index] = oldChild;
            }
        });
    }
    if(newVNode.children.length > 0) {
        newVNode.children.forEach((newChild, __index ) => {
            if(typeof newChild === 'object') {
                if(newChild.__elementKey !== null) {
                    if(childrenPool.hasOwnProperty(newChild.__elementKey)){
                        diff(childrenPool[newChild.__elementKey], newChild, parentDom);
                        delete childrenPool[newChild.__elementKey];
                    } else{
                        render(parentDom,newChild, true);
                    }
                } else {
                    if(childrenPool.hasOwnProperty(__index)) {
                        diff(childrenPool[__index], newChild, parentDom);
                        delete childrenPool[__index];
                    } else {
                        render(parentDom, newChild, true);
                    }
                }
            } else {
                if(childrenPool.hasOwnProperty(__index)) {
                    if(typeof childrenPool[__index] === 'string' && typeof newChild === 'string') {
                        if(childrenPool[__index] !== newChild) {
                            // this means the strings are not the same, so we have to update the DOM
                            // we do this by acessing the child at __index so we
                            const elementToRemove = parentDom.children[__index];
                            console.log('777777777777777777777777777777777777777777777777777777/', elementToRemove, childrenPool[__index], newChild);
                            elementToRemove.remove();
                        }
                        delete childrenPool[__index];
                    } else {
                        diff(childrenPool[__index], newChild, parentDom);
                        delete childrenPool[__index];
                    }
                } else {
                    render(parentDom, newChild, true);
                }
            }
        });
    }
    Object.keys(childrenPool).forEach(keyOfLeftChild => {
        // if(leftoverChild.__dom !== undefined) {
        //     leftoverChild.__dom.remove();
        // } else if(typeof leftoverChild.tag === 'function') {
        //     leftoverChild.__componentInstance.__dom.remove();
        //     leftoverChild.__componentInstance.destroyed();
        // } 
        unmount(childrenPool[keyOfLeftChild]);
    });
}

export function diffProperties(oldVDom,newVDom, dom) {
    console.log('=');
    const oldProperties = oldVDom.data;
    const newProperties = newVDom.data;
    const oldListeners = oldProperties.listeners;
    const newListeners = newProperties.listeners;
    // update listeners
    // if(newListeners.length > 0) {

    // }
    // if property is not IN DOM, it means its a component propery so we should call updated on the componentInstance

}

