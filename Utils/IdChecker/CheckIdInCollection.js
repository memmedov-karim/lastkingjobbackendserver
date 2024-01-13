function CheckIdInCollection(id,collection){
    if(collection.length === 0) return false;
    for(let document of collection){
        if(document._id.toString() === id){
            return true
        }
    }
    return false
}

module.exports =  {CheckIdInCollection};