var queue = new Map();

function set(key, value){
    queue.set(key, value);
}

function remove(key){
    queue.delete(key);
}

function get(key){
    return queue.get(key);
}

function getMap(){
    return queue;
}

module.exports = {
    set,
    remove,
    get,
    getMap
}