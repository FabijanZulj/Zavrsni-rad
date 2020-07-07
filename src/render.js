
//TODO: Component elements CAN have native event listeners -- check if 

export function render(parentDom, newVNode) {
    if(newVNode === null && newVNode === false){
        return;
    }
    // console.log(newVNode,parentDom, ' newVNode render.js 2');
    const newNodeTag = newVNode.tag;
    let createdDomNode;

    // if(newVNode.data && newVNode.data.listeners) {
    //     createdDomNode.__listeners = newVNode.data.listeners;
    // }

    if(typeof newNodeTag ==='function' && 'prototype' in newNodeTag && newNodeTag.prototype.isClassComponent) {
        // console.log('CLASS COMPONENT TO RENDER', newVNode);
        newVNode.__componentInstance = new newNodeTag();
        const renderData = newVNode.__componentInstance.render();
        renderData.__componentInstance = newVNode.__componentInstance;
        newVNode.__componentInstance.__currentVNode = renderData;
        newVNode.__componentInstance.__parentDom = parentDom;
        createdDomNode = document.createElement(renderData.tag);
        // console.log('renderData', renderData)
        // need to add event listeners and props from the rendered data
        if(Object.keys(renderData.data.listeners).length !== 0) {
            // console.log(' add listeners to dom node', createdDomNode, newVNode.data.listeners);
            addListenersToDomNode(createdDomNode, renderData.data.listeners);
        }
        // add component name to DOM element so we can compare in diffing.
        createdDomNode.__component = newNodeTag;
        
        // Component will mount hook here
        newVNode.__componentInstance.willMount();
        // ====================================
        parentDom.appendChild(createdDomNode);
        // Component mounted hook here
        newVNode.__dom = createdDomNode;
        newVNode.__componentInstance.__dom = createdDomNode;
        newVNode.__componentInstance.mounted();


        // add event listeners to dom node
        if(Object.keys(newVNode.data.listeners).length !== 0) {
            for(let event in newVNode.data.listeners) {
                newVNode.__componentInstance.__listeners[event] = newVNode.data.listeners[event];
                console.log(' =============================', newVNode.__componentInstance.__listeners);
            }
            console.log(' add listeners to dom node ------ if newVNode.data.listeners has a event with .native, add it here', createdDomNode, newVNode.data.listeners);
        }

        //setting propery to newly rendered domNode
        // console.log('set properties', newVNode.data);
        for(let prop in renderData.data) {
            setProperty(createdDomNode,prop,renderData.data[prop]);
        }

        newVNode.__dom = createdDomNode;
        if(renderData.children.length) {
            for(let child in renderData.children) {
                render(createdDomNode, renderData.children[child]);
            }
        }
    }
    else if(typeof newVNode.tag === 'string') {
        console.log(' newVNode is not a class but a string', newVNode);
        createdDomNode = document.createElement(newVNode.tag);
        parentDom.appendChild(createdDomNode);
        newVNode.__dom = createdDomNode;
        
        //setting propery to newly rendered domNode
        for(let prop in newVNode.data) {
            setProperty(createdDomNode,prop,newVNode.data[prop]);
        }

        // add event listeners to dom node
        if(Object.keys(newVNode.data.listeners).length !== 0) {
            addListenersToDomNode(createdDomNode, newVNode.data.listeners);
        }

        if(newVNode.children.length) {
            for(let child in newVNode.children) {
                render(createdDomNode, newVNode.children[child]);
            }
        }
    } else if(typeof newVNode === 'string'){
        createdDomNode = document.createTextNode(newVNode);
        parentDom.appendChild(createdDomNode);
        //setting propery to newly rendered domNode
        for(let prop in newVNode.data) {
            setProperty(createdDomNode,prop,newVNode.data[prop]);
        }

    }
    if(typeof newVNode.key !== undefined) {
        createdDomNode.__mevactKey = newVNode.key;
    }

    return createdDomNode;
}

export function unmount(vNodeToUnmount) {
    vNodeToUnmount.__dom.remove();
}

export function setProperty(dom, key, value, oldValue) {
    if(key === 'class') {
        key = 'className';
    }
    if(key === 'style') {
        const s = dom.style;
        if(typeof value === 'string') {
            s.cssText = value;
        } else {
            if(typeof oldValue == 'string') {
                s.cssText = '';
                oldValue = null;
            }
            
            if(oldValue){
                for(let i in oldValue) {
                    if(!(value && i in value)) {
                        setStyle(s,i,'');
                    }
                }
                
            }
            if(value) {
                for(let j in value) {
                    // console.log('SETTING style from object j:', j, 'value: ', value, 's: ', s,' dom: ', dom);
                    setStyle(s,j,value[j]);
                }
            }
        }
    }
    else if(key in dom) {
        dom[key] = value;
    }
    // if(key === 'listeners') {
    //     console.log('====================================append listeners to given DOM', value);
    // }
}

export function addListenersToDomNode(domNode, listeners) {
    // console.log('=======================================================', domNode, listeners);
    for(let event in listeners) {
        let name = (event.toLowerCase() in domNode ? event.toLowerCase() : event).slice(2);
        domNode.addEventListener(name, listeners[event]);
    }
}

export function setStyle(style,key,value) {
    if(typeof value == 'number') {
        style[key] = value + 'px';
    } else if(value === null) {
        style[key] = '';
    } else {
        style[key] = value;
    }
}