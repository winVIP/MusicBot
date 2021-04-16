let Dispatcher = undefined;

async function setDispatcher(dispatcher){
    Dispatcher = dispatcher
    return true;
}

async function pause(){
    if(Dispatcher == undefined){
        return "Nothing to pause"
    }
    else{
        await Dispatcher.pause()
        return true
    }
}

async function resume(){
    if(Dispatcher == undefined){
        return "Nothing to resume"
    }
    else{
        await Dispatcher.resume()
        return true
    }
}

module.exports = {
    setDispatcher,
    pause,
    resume
}