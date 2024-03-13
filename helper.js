module.exports = {

    buildJsonResponse(_code, _message, _data){
        let response = { code : _code, message : _message, data : _data }
        return response;
    },

    buildResponse(response, _code, _message, _data){
        return response.json(this.buildJsonResponse(_code, _message, _data))
    }

    

}