import {diff} from './diff/diff.js';

export default class Component {
    constructor(props) {
        this.props = props;
        this.__listeners = {};
        if(this.state() !== 'undefined' && this.state() !== null) {
            this.state = initializeState.bind(this)(this.state);
        }
    }

    state() {
        return null;
    }

    willMount() {
        return undefined;
    }

    mounted() {
        return undefined;
    }

    updated(oldData,newData) {
        return undefined;
    }

    destroyed() {
        return undefined;
    }
    render() {
        return undefined;
    }
}

function initializeState (data) {
    let state = data.call();
    const proxyStateHandler = {
        get: (object, objectKey) => {
            console.log('getter ------------------------------------------------------------------', object[objectKey]);
            return object[objectKey];
        },
        set: (object, objectKey, value) => {
            if(objectKey in object) {
                const prevState = object[objectKey];
                const nextState = value;

                object[objectKey] = value;
                diff(this.__currentVNode, this.render(), this.__parentDom);
                
                this.updated(prevState, nextState);
                return true;
            } else {
                return false;
            }
        }
    }
    return new Proxy(state, proxyStateHandler);
};

Component.prototype.$emit = (eventName, data) => {
    if(this.__listeners[eventName]){
        this.__listeners[eventName](data);
        return;
    }else if(this.__listeners['on'+eventName]) {
        this.__listeners['on'+eventName](data);
        return;
    } else if(this.__listeners['on'+eventName.charAt(0).toUpperCase() + eventName.slice(1)]) {
        this.__listeners['on'+eventName.charAt(0).toUpperCase() + eventName.slice(1)](data)
    }
}
Component.prototype.isClassComponent = true;
