'use strict';

/**
 * This is a Node.JS application to create shipment object on the ledger
 */

const helper = require('./contractHelper');

async function main(buyerCRN, drugName, listOfAssets, transporterCRN, org) {

	try {
		const regnetContract = await helper.getContractInstance(org);
		console.log('.....Requesting to create shipment');
		const shipmentBuffer= await regnetContract.submitTransaction('createShipment', buyerCRN, drugName, listOfAssets, transporterCRN);

		// process response
		console.log('.....Processing create shipment Transaction  \n\n');
		let shipment = JSON.parse(shipmentBuffer.toString());
		console.log(shipment);
		console.log('\n\n..... New shipment is added on the ledger!');
		return shipment;

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
// let listOfAssets = args[2].toString();
// let transporterCRN = args[3].toString();
// let org = args[4].toString();
// main(buyerCRN, drugName, listOfAssets, transporterCRN, org).then(() => {
// 	console.log('createShipment transaction Submitted on the Network');
// });

module.exports.execute = main;
