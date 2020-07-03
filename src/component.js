export default class Component {
    constructor(props) {
        this.props = props;
        this.state = {};
        this.__listeners = {};
    }

    onMount() {
        return undefined;
    }

    onUpdate(oldData,newData) {
        return undefined;
    }

    onDestroy() {
        return undefined;
    }
    render() {
        return undefined;
    }
    $emit(eventName, data) {
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
}
Component.prototype.isClassComponent = true;
