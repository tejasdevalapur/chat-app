const generateMessage=(username,text)=>{

    return {
        username,
        text,
        createdAt : new Date().getTime()
    }

}

const generatelocationMessage=(username,locationmessage)=>{

    return {
        username,
        locationmessage,
        createdAt: new Date().getTime()
    }

}

module.exports={
    generateMessage,
    generatelocationMessage
}