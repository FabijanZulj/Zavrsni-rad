import {render, unmount, unmountVNode, convertTextToVNode} from './../render.js';

export function diff(oldVNode, newVNode, parentDom) {
    console.log('diffing','\n', oldVNode,'\n' ,newVNode ,'\n', parentDom);
    
    const newType = newVNode.tag;
    const isAppRoot = typeof oldVNode.tag !== 'function' && oldVNode.__componentInstance;
    const isOldVNodeComponent = typeof oldVNode.tag === 'function';
    const isNewVNodeComponent = typeof newVNode.tag === 'function';
    const oldType = oldVNode.tag;
    const newProps = newVNode.data;
    const oldProps = oldVNode.data;
    let componentInstance;

    if(newVNode === false) {
        console.log('777777777777777777777777777777777777777777777777777777777777777', oldVNode, newVNode);
        unmountVNode(oldVNode);
        console.log('======================================== RETURNING FROM DIFF', newVNode);
        return newVNode;
    }

    if(isAppRoot) {
        console.log('APP IS ROOT');
        newVNode.__dom = oldVNode.__dom;
        newVNode.__componentInstance = oldVNode.__componentInstance;
        newVNode.children = diffChildren(oldVNode.__componentInstance.__currentVNode, newVNode, oldVNode.__dom);
        return newVNode;
    }
    // 
    if(typeof oldVNode !== 'object')
    {
        console.log('OLD VNODE IS NOT AN OBJECT',typeof oldVNode, oldVNode)
        oldVNode = convertTextToVNode(oldVNode);
    }
    if(typeof newVNode !== 'object'){
        console.log('NEW VNODE IS NOT AN OBJECT', typeof newVNode, newVNode);
        newVNode = convertTextToVNode(newVNode);
    }
    newVNode.__dom = oldVNode.__dom;



    // TODO if the props are not the same, we should call updated;
    if (isOldVNodeComponent || isNewVNodeComponent) {
        console.log('DIFFING COMPONENTS');
        return diffComponent(oldVNode,newVNode,parentDom);
    }
    
    
    //CASE 1
    if(oldVNode.isTextNode) {
        //both vnodes are simple text
        if(newVNode.isTextNode !== 'undefined'){
            console.log('BOTH ARE TEXT NODES')
            if(oldVNode.textData !== newVNode.textData) {
                oldVNode.__dom.nodeValue = newVNode.textData;
                oldVNode.textData = newVNode.textData;
                newVNode.__dom = oldVNode.__dom;
            }
            return newVNode;
        } else {
            // newVNode is not simple text-- FULL RENDER
            console.log('newVNode is not simple text-- FULL RENDER');
            unmountVNode(oldVNode);
            
            newVNode.__dom = render(parentDom,newVNode,true);
            return newVNode;
        }
    } else if(newVNode.isTextNode) {
        // oldVNode is not simple text, but the new VNode is simple text - FULL RENDER
        console.log('oldVNode is not simple text, but the new VNode is simple text - FULL RENDEr');
        unmountVNode(oldVNode);
        newVNode.__dom = render(parentDom, newVNode, true);
        console.log('NEW VNODE TO RETURN AND SET TO CHILDREN');
        return newVNode;
    }

    // CASE 2
    // We render the whole node if the element type is not the same
    if(oldVNode.tag !== newVNode.tag) {
        console.log('We render the whole node if the element type is not the same');
        unmountVNode(oldVNode);
        newVNode.__dom = render(parentDom, newVNode, true);
        return newVNode;
    } else {
        // The node types are the same so we do children reconciliation;
        console.log('        // The node types are the same so we do children reconciliation;');
        newVNode.children = diffChildren(oldVNode, newVNode, oldVNode.__dom);
        return newVNode;
    }

    return newVNode;

    // if(typeof newType == 'function') {
    //     if(typeof oldType == 'function' || oldVNode.__componentInstance && oldType === newType) {
    //         componentInstance = newVNode.__componentInstance = oldVNode.__componentInstance;
    //         diffChildren(componentInstance.__currentVDom,newVNode, componentInstance.__currentVDom);
    //     } else {
    //         componentInstance.willMount();
    //         renderedVNode = render(parentDom,newVNode,true);
    //         componentInstance.mounted();
    //     }   
    // }else if(newVNode.tag !== oldVNode.tag) {
    //     console.log('AINT THE SAME');
    //     unmountVNode(oldVNode);
    //     return render(parentDom, newVNode, false);
    // }
    
    // if(oldVNode.__componentInstance) {
    //     diffChildren(oldVNode,newVNode, oldVNode.__dom);
    //     console.log(oldVNode.__componentInstance);
    // }
    
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

function diffComponent(oldVNode,newVNode,parentDom) {
    if(typeof oldVNode.tag === 'function') {
        //oldVnode is a component
        if(typeof newVNode.tag === 'function') {
            // Both are components- we check if they are of the same type.
            if(oldVNode.tag == newVNode.tag) {
                // Both are components of the same type. We now have to check if the props are the same.
                // If the props are the same we dont do anything. If they are not we call Update on the componentInstance
                // TODO- Find a way to compare props.
                // We diff children here since both VDom nodes are components
                newVNode.children = diffChildren(oldVNode,newVNode,oldVNode.__componentInstance.__dom);
                return newVNode
            } else {
                unmountVNode(oldVNode);
                newVNode.__dom = render(parentDom, newVNode, true);
                console.log('======================================== RETURNING FROM DIFF', newVNode);
                return newVNode;
            }
        } else {
            // Old VNode is a component while newVNode is not, it means we Unmount(call destroy), and render the new Component
            unmountVNode(oldVNode);
            newVNode.__dom = render(parentDom, newVNode, true);
            console.log('======================================== RETURNING FROM DIFF', newVNode);
            return newVNode;
        }
    } else {
        // oldVNode is not a component, so the newVnode IS a component. We perform a full render here
        unmountVNode(oldVNode);
        newVNode.__dom = render(parentDom, newVNode, true)
        console.log('======================================== RETURNING FROM DIFF', newVNode);
        return newVNode;
    }
}

export function diffChildren(oldVNode, newVNode, parentDom) {
    const currentActiveElement = document.activeElement;
    const childrenPool = {};
    if(oldVNode.children && oldVNode.children.length > 0) {
        oldVNode.children.forEach((oldChild, __index) => {
            // console.log('oldChild', oldChild);
            // children can be simple strings too so we check if its a object wich means its a VNode
 
            if(oldChild.__elementKey) {
                childrenPool[oldChild.__elementKey] = oldChild;
            } else {
                childrenPool[__index] = oldChild;
            }
        });
    }
    if(newVNode.children && newVNode.children.length > 0) {
        newVNode.children.forEach((newChild, __index ) => {
                if(newChild.__elementKey) {
                    if(childrenPool.hasOwnProperty(newChild.__elementKey)){
                        newVNode.children[__index] = diff(childrenPool[newChild.__elementKey], newChild, parentDom);
                        delete childrenPool[newChild.__elementKey];
                    } else{
                        newVNode.children[__index].__dom = render(parentDom,newChild, true);
                    }
                } else {
                    if(childrenPool.hasOwnProperty(__index)) {
                        newVNode.children[__index] = diff(childrenPool[__index], newChild, parentDom);
                        delete childrenPool[__index];
                    } else {
                        newVNode.children[__index].__dom = render(parentDom, newChild, true);
                    }
                }

            // }
        });
    }
    Object.keys(childrenPool).forEach(keyOfLeftChild => {
        // if(leftoverChild.__dom !== undefined) {
        //     leftoverChild.__dom.remove();
        // } else if(typeof leftoverChild.tag === 'function') {
        //     leftoverChild.__componentInstance.__dom.remove();
        //     leftoverChild.__componentInstance.destroyed();
        // } 
        console.log('=======================================','\n' , oldVNode.children);
        delete oldVNode.children[childrenPool.keyOfLeftChild];
        console.log('=======================================','\n' , oldVNode.children);
        unmountVNode(childrenPool[keyOfLeftChild]);
    });
    currentActiveElement.focus();
    console.log(' CHILDREN RECONCILIATION DONE, we should change children from newVNode to oldVNode', oldVNode,'\n', newVNode);
    return newVNode.children;
    // console.log(' CHILDREN RECONCILIATION DONE, we should change children from newVNode to oldVNode', oldVNode,'\n', newVNode);
    // oldVNode.children = newVNode.children;
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

// updateComponentInstance(oldVNode, newVNode){
// }