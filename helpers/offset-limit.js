
async function GetOffsetLimit(offset, limit) {
    offset = offset ? parseInt(offset) : 0;
    limit = limit ? parseInt(limit) : 20;
    
    if(isNaN(limit))
    {
      limit=20;
    }
    if(isNaN(offset))
    {
      offset=0;
    }
    if(limit>50)
    {
        limit=50;
    }
    return{
        offset,
        limit
    }
}

module.exports =  GetOffsetLimit;