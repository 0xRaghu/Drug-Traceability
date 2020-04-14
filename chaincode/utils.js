'use strict';

class utils
{
    /**
     * This function is called by the transactions defined inside the smart contract to validate the initiator of the transaction
     * @param {*} ctx The transaction context
     * @param {*} initiator This variable is used to store the organisation name of the initiating peer
     */

	validateInitiator(ctx, initiator)
	{
		const initiatorID = ctx.clientIdentity.getX509Certificate();
		console.log(initiator); 
		if(initiatorID.issuer.organizationName.trim() !== initiator)
		{
				throw new Error('Not authorized to initiate the transaction: ' + initiatorID.issuer.organizationName + ' not authorised to initiate this transaction');
		}
    }

    /**
     * This function is defined to assign the hierarchy key to the company
     * @param {*} organisationRole Role which this organisation will play as part of the network
     */

    async assignKey(organisationRole)
	{
		//Perform operations to assign the hierarchy key.
	    let key;
        if(organisationRole === 'Manufacturer' || organisationRole === 'manufacturer'){
           key  = 1;
       }
        else if(organisationRole === 'Distributor' || organisationRole === 'distributor'){
           key = 2;
       }
        else if(organisationRole === 'Retailer' || organisationRole === 'retailer'){
           key = 3;
       }
        else if(organisationRole === 'Transporter' || organisationRole === 'transporter'){
        key = 0;
    }
        else{
           throw new Error(organisationRole + ' is not a valid organisation role');
       }
       return key;
    }
    /**
     * This function is used to fetch the name of the company based on the CRN
     * @param {*} ctx 
     * @param {*} companyCRN 
     */
    async fetchCompanyKey(ctx, companyCRN){
        let companyKey = await ctx.stub.createCompositeKey('company.', [companyCRN]);
        let companyBuffer = await ctx.stub.getState(companyKey);
        let companyName = companyBuffer.toString();
        let CompanyKey = await ctx.stub.createCompositeKey('org.pharma-network.pharmanet.company.', [companyCRN, companyName]);
        return CompanyKey;
    }

    async fetchHierarchyKey(ctx, key){
        console.log("Key: ", key);
        let object = await this.getData(ctx, key);
        console.log("Object", object);
        let hierarchyKey = object.key;
        return hierarchyKey;
       
    }
    //Stores any JSONvalue on the ledger
    async putData(ctx, key, JSONvalue)
    {
        // Convert the JSON object to a buffer and send it to blockchain for storage
        let dataBuffer = Buffer.from(JSON.stringify(JSONvalue));
        await ctx.stub.putState(key, dataBuffer);
    }

    //returns the JSON object for the key
    async getData(ctx, key)
    {
        let dataBuffer= await ctx.stub.getState(key).catch(err => console.log(err));
        let dataObject= JSON.parse(dataBuffer.toString())
        return dataObject;
    }
}

module.exports=utils;