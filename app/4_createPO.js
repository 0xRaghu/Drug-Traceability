'use strict';

/**
 * This is a Node.JS application to create a PO on the Network
 */

const helper = require('./contractHelper');



async function main(buyerCRN, sellerCRN, drugName, quantity, org) {

	try {
		const regnetContract = await helper.getContractInstance(org);

		
		console.log('.....Requesting to create a PO on the Network');
		const POBuffer = await regnetContract.submitTransaction('createPO', buyerCRN, sellerCRN, drugName, quantity);

		// process response
		console.log('.....Processing createPO Transaction Response \n\n');
		let newPO = JSON.parse(POBuffer.toString());
		console.log(newPO);
		console.log('\n\n.....createPO Transaction Complete!');
		return newPO;

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
// let sellerCRN = args[1].toString();
// let drugName = args[2].toString();
// let quantity = args[3].toString();
// let org = args[4].toString();
// main(buyerCRN, sellerCRN, drugName, quantity, org).then(() => {
// 	console.log('createPO transaction Submitted on the Network');
// });

module.exports.execute = main;
