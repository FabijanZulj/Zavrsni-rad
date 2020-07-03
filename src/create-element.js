export default function createElement(tag, data, ...children) {
    const normalizedProps = {};
    normalizedProps.listeners = {};
    let key = null;
    for(let i in data){
        if(i[0] == 'o' && i[1]=='n'){
            normalizedProps['listeners'][i] = data[i];

            // console.log('normalized props', normalizedProps);
        }else if(i == 'key'){
            key = data[i];
        } else {
            normalizedProps[i] = data[i];
        }
    }
    // console.log(normalizedProps, ' normalizedProps');

    return {
        tag,
        data: normalizedProps,
        children,
        __dom: undefined,
        __componentInstance: undefined,
        __elementKey: key
    };
}