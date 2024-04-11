exports.handler = async(event: { authorizationToken: any }) => {
    
    console.log(`The Event From this handler =>> ${JSON.stringify(event)}`)

    const { authorizationToken } = event
    console.log(`This the authorizationToken  =>  ${authorizationToken}`)
    
    async function verifyString (token: String) {
      if('g5U7bG6CzB8sxNpl5W049X0oSfkGSkpW' === token) {
        return true;
      }
      else {
        return false;
      }
    }
    const result: any = await verifyString(authorizationToken);
    console.log(`This is result from the verification :=>>>  ${result}`)

    const response = {
      isAuthorized: result
    }
    return response
}