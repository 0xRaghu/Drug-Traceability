'use strict';

const {Contract} = require('fabric-contract-api');
const utilsClasss = require('./utils');
class PharmanetContract extends Contract{
    constructor(){
        super('org.pharma-network.pharmanet');
        global.utils = new utilsClasss();
        global.manufacturerOrg = 'manufacturer.pharma-network.com';
        global.distributorOrg = 'distributor.pharma-network.com';
        global.retailerOrg = 'retailer.pharma-network.com';
        global.transporterOrg = 'transporter.pharma-network.com';
    }

    /**
     * 
     * @param {*} ctx - The transaction Context
     */
    async instantiate(ctx){
        console.log('Pharmanet Smart Contract Instantiaited');   
    }

    /**
    * Register a new company on the network
    * @param {*} ctx - The transaction context object
    * @param {*} companyCRN - Company Registration Number of the Company that is being registered
    * @param {*} companyName - Name of the Comapny
    * @param {*} location - Location of the Company
    * @param {*} organisationRole - Role of the organisation to which the company belongs. It can be one of the following:
    * Manufacturer, Distributor, Retailer, Transporter
    */

   async registerCompany(ctx, companyCRN, companyName, location, organisationRole){

        //Validate wheteher the company has the certificates of the required organisation
       utils.validateInitiator(ctx, organisationRole+'.pharma-network.com')

        // Create a new composite key for the company
       const companyKey = ctx.stub.createCompositeKey('org.pharma-network.pharmanet.company.', [companyCRN, companyName]);
       // Assign this company a hierarchy key based on the organisation role
       let key = await utils.assignKey(organisationRole);
       // If the organisation role is Transporter then it will not have a hierarchy key
       let companyObject = {
        companyID : companyKey,
        name: companyName,
        location: location,
        organisationRole: organisationRole,
    }
       if(key !== 0 ){
       companyObject.key = key;
       }

       utils.putData(ctx,companyKey, companyObject);
       console.log(companyObject);
       // Create a composite key to store the only campany name on the ledger
       let crnKey = ctx.stub.createCompositeKey('company.',[companyCRN]);
       let dataBuffer = Buffer.from(companyName);
       await ctx.stub.putState(crnKey, dataBuffer);
       // Return value of the company object created to the user
       return companyObject;
   }

   /**
    * It is used by the manufacturer to register a new drug on the ledger.
    * @param {*} ctx 
    * @param {*} drugName 
    * @param {*} serialNo 
    * @param {*} mfgDate 
    * @param {*} expDate 
    * @param {*} companyCRN 
    */

   async addDrug(ctx, drugName, serialNo, mfgDate, expDate, companyCRN){
       // Validate that the organisation issuing this transaction is a manufacturer
       utils.validateInitiator(ctx, manufacturerOrg);
       // Create a new composite key for the drug
       const drugKey = await ctx.stub.createCompositeKey('org.pharma-network.pharmanet.drug.', [drugName, serialNo]);
       // Fetch the name of the company using the companyCRN
       let companyKey = await utils.fetchCompanyKey(ctx, companyCRN);
       // Create a drug object
       let drugObject = {
           productID: drugKey,
           name: drugName,
           manufacturerOrg: companyKey,
           manufacturingDate: mfgDate,
           expiryDate: expDate,
           owner: companyKey,
           shipment: []
       }
       await utils.putData(ctx, drugKey, drugObject);
       console.log(drugObject);
       // Return the drug object created to the user
       return drugObject;
   }

   /**
    * This function is used to create a purchase order
    * @param {*} buyerCRN 
    * @param {*} sellerCRN 
    * @param {*} drugName 
    * @param {*} quantity 
    */
   async createPO(ctx, buyerCRN, sellerCRN, drugName, quantity){
       // Validate that this has been invoked by distributor or retailer

       const initiatorID = ctx.clientIdentity.getX509Certificate();
       if(initiatorID.issuer.organizationName.trim() !== distributorOrg && initiatorID.issuer.organizationName.trim() !== retailerOrg){
			throw new Error('Not authorized to initiate the transaction: ' + initiatorID.issuer.organizationName + ' not authorised to initiate this transaction');
        }
        
       // Create a new composite key for the Purchase Order
       const purchaseOrderKey = await ctx.stub.createCompositeKey('org.pharma-network.pharmanet.purchaseorder.', [buyerCRN, drugName]);
       // Fetch the buyer company key
       let buyerCompanyKey = await utils.fetchCompanyKey(ctx, buyerCRN);        
       let buyerHierarchyKey = await utils.fetchHierarchyKey(ctx, buyerCompanyKey);
       
       // Fetch the seller company key 
       let sellerCompanyKey = await utils.fetchCompanyKey(ctx, sellerCRN);
       let sellerHierarchyKey = await utils.fetchHierarchyKey(ctx, sellerCompanyKey);
       
       if(buyerHierarchyKey-sellerHierarchyKey === 1){
            const purchaseOrderObject = {
                poID: purchaseOrderKey,
                drugName: drugName,
                quantity: quantity,
                buyer: buyerCompanyKey,
                seller: sellerCompanyKey
            };
            utils.putData(ctx, purchaseOrderKey, purchaseOrderObject);
            console.log(purchaseOrderObject);
            // Return the purchase object order created back to the user
            return purchaseOrderObject;
       }
       else{
           throw new Error('This transaction is not possible as the '+ buyerName+ ' cannot purchase from '+ sellerName+ '.');
       }
       
   }

   /**
    * This function is used to create a shipment
    * @param {*} ctx
    * @param {*} buyerCRN 
    * @param {*} drugName 
    * @param {*} listOfAssets 
    * @param {*} transporterCRN 
    */

   async createShipment(ctx, buyerCRN, drugName, listOfAssets, transporterCRN){
    
    // The list of assets is taken as string. Individual assets are extracted from it and stored inside assetArray 
    let purchaseOrderKey = await ctx.stub.createCompositeKey('org.pharma-network.pharmanet.purchaseorder.', [buyerCRN, drugName]);     
    let purchaseOrderObject = await utils.getData(ctx, purchaseOrderKey); 
    if(purchaseOrderObject === undefined){
        throw new Error('Purchase order has not been generated yet.');
    }
    else{
        // The list of assets is taken as string. Individual assets are extracted from it and stored inside assetArray 
        let assetArray = listOfAssets.split('-');
        // Create a shipment key
        let shipmentKey = await ctx.stub.createCompositeKey('org.pharma-network.pharmanet.shipment.',[buyerCRN, drugName]);
        // Fetch the company name of the transporter
        let transporterKey = await utils.fetchCompanyKey(ctx, transporterCRN);

        // Check is done to make sure that the length of the assetArray is same as quantity specified in the purchase order
        if(assetArray.length == purchaseOrderObject.quantity){
            // Composite keys of the assets are being created
            let assetKeysList = [];
            for(let assetKey of assetArray){
                if (await this.viewDrugCurrentState(ctx, drugName, assetKey ) === undefined){
                    throw new Error('Asset with assetkey:'+ assetKey+' not registered on the ledger.');
                }
                let compositeAssetKey = await ctx.stub.createCompositeKey('org.pharma-network.pharmanet.drug.', [drugName, assetKey]);
                assetKeysList.push(compositeAssetKey);
                // Update the owner of the drug to the transporter key
                let drugObject= await utils.getData(ctx,compositeAssetKey);
                drugObject.owner = transporterKey;
                await utils.putData(ctx, compositeAssetKey, drugObject);
            }
        
            let shipmentObject = {
                creator: purchaseOrderObject.seller,
                assets: assetKeysList,
                transporter: transporterKey,
                status: 'in-transit'
            }
            await utils.putData(ctx, shipmentKey, shipmentObject);
            console.log(shipmentObject);
            return shipmentObject;
        }
        else{
            throw new Error('The quantity in the purchase order is not the same as the quantity being placed in the shipment.');
        }
   }
    }
   /**
    * This function is used to update the status of the shipment
    * @param {*} buyerCRN 
    * @param {*} drugName 
    * @param {*} transporterCRN 
    */
   async updateShipment(ctx, buyerCRN, drugName, transporterCRN){

    //Validate if the transaction is invoked by a transporter
    utils.validateInitiator(ctx, transporterOrg);
    // Fetch the shipment object
    let shipmentKey = await ctx.stub.createCompositeKey('org.pharma-network.pharmanet.shipment.',[buyerCRN, drugName]);
    let shipmentObject = await utils.getData(ctx, shipmentKey);
    if(shipmentObject.status === 'in-transit'){
        if(shipmentObject.transporter === await utils.fetchCompanyKey(ctx, transporterCRN)){
            // Update the status to delivered and Update the shipment details on the ledger
            shipmentObject.status = 'delivered';
            await utils.putData(ctx, shipmentKey, shipmentObject);
            // Fetch all the assets keys from the shipment object
            let assetsArray = shipmentObject.assets;
            // Fetch buyer company key
            let buyerCompanyKey = await utils.fetchCompanyKey(ctx, buyerCRN);
            // Update the owner field of each asset to the buyerCompanyKey
            for(let key of assetsArray){
                // Fetch the drug details corresponding to the key
                let drugObject = await utils.getData(ctx,key);
                // Update the owner
                drugObject.owner = buyerCompanyKey;
                // Add the shipment id to the shipment array
                drugObject.shipment.push(shipmentKey);
                console.log(drugObject);
                await utils.putData(ctx, key, drugObject);
            }
        }
        else{
            throw new Error('The transporter is not allowed to update this shipment');
        }
    }
    else{
        throw new Error('The shipment is already delivered to the destination');
    }
    }


   /**
    * This function is used by the retailer to sell the drug to a customer
    * @param {*} drugName 
    * @param {*} serialNo 
    * @param {*} retailerCRN 
    * @param {*} customerAadhar 
    */
   async retailDrug(ctx, drugName, serialNo, retailerCRN, customerAadhar){
       utils.validateInitiator(ctx, retailerOrg);
       let retailCompanyKey = await utils.fetchCompanyKey(ctx, retailerCRN);
       let drugKey = await ctx.stub.createCompositeKey('org.pharma-network.pharmanet.drug.', [drugName, serialNo]);
       let drugObject = await utils.getData(ctx, drugKey);
       console.log(drugObject);
       if(drugObject.owner === retailCompanyKey){
            drugObject.owner = customerAadhar;
            let newDrugBuffer = Buffer.from(JSON.stringify(drugObject));
            await ctx.stub.putState(drugKey, newDrugBuffer);
            console.log(drugObject);
            return drugObject;
       }
       else{
           throw new Error('The owner of the drug is not this retailer. Hence this transaction can\'t be proccessed');
       }
       
   }

   /**
    * This transaction is used to view the history of the drug
    * @param {*} ctx 
    * @param {*} drugName 
    * @param {*} serialNo 
    */
   async viewHistory(ctx, drugName, serialNo)
    {
        const drugKey = ctx.stub.createCompositeKey('org.pharma-network.pharmanet.drug.', [drugName, serialNo]);
        let complete_history=[];
        let history = await ctx.stub.getHistoryForKey(drugKey);
        //console.log(history.next());
        let result= await history.next();
        //console.log(result.done);
        let flag =0;
        do
            {
                let jsonHistory={};
                jsonHistory.TxId = result.value.tx_id;
                jsonHistory.Value = JSON.parse(result.value.value.toString('utf8'));
                complete_history.push(jsonHistory);
                if(result.done)
                    flag = 1;
                result= await history.next();

            } while(flag == 0)
        await history.close();
        console.log(complete_history);
        return (complete_history);
    }

   /**
    * This function is used to view the current state of the drug
    * @param {*} drugName 
    * @param {*} serialNo 
    */
   async viewDrugCurrentState(ctx,drugName, serialNo){
       let drugKey = await ctx.stub.createCompositeKey('org.pharma-network.pharmanet.drug.',[drugName, serialNo]);
       let drugBuffer = await ctx.stub.getState(drugKey);
       let drugObject = JSON.parse(drugBuffer.toString());
       console.log(drugObject);
        return drugObject;
   }
}
module.exports = PharmanetContract;