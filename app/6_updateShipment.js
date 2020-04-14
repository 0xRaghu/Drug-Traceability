'use strict';

/**
 * This is a Node.JS application to update a shipment object already registered on the network
 */

const helper = require('./contractHelper');
async function main(buyerCRN, drugName, transporterCRN, org) {
	try {
		const regnetContract = await helper.getContractInstance(org);

		
		console.log('.....Requesting to update shipment on the Network');
		await regnetContract.submitTransaction('updateShipment', buyerCRN, drugName, transporterCRN);

	} catch (error) {

		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);

	} finally {

		// Disconnect from the fabric gateway
		helper.disconnect();

	}
}
// var args = process.argv.slice(2);
// let buyerCRN = args[0].toString();
// let drugName = args[1].toString();
// let transporterCRN = args[2].toString();
// let org = args[3].toString();
// main(buyerCRN, drugName, transporterCRN, org).then(() => {
// 	console.log('Update Shipment successfully submitted on the Network');
// });

module.exports.execute = main;
