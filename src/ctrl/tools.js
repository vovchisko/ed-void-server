export default {
    name_from_id(str) {
        let parts = str.split('@');
        let child = parts[1].split('/')[1];
        if (!child || child === '*') { child = '' } else { child = ' ' + child}
        return parts[0] + child;
    }
}