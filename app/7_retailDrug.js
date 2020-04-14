'use strict';

/**
 * This is a Node.JS application to sell a drug to a customer on the network
 */

const helper = require('./contractHelper');

async function main(drugName, serialNo, retailerCRN, customerAadhar, org) {

	try {
		const regnetContract = await helper.getContractInstance(org);
		
		console.log('.....Storing the details of retail of a drug to a customer');
		await regnetContract.submitTransaction('retailDrug', drugName, serialNo, retailerCRN, customerAadhar);

		// process response
		console.log('\n\n.....Retail Drug Transaction Complete!');

	} catch (error) {

		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);

	} finally {

		// Disconnect from the fabric gateway
		helper.disconnect();

	}
}

// var args = process.argv.slice(2);

// let drugName = args[0].toString();
// let serialNo = args[1].toString();
// let retailerCRN = args[2].toString();
// let customerAadhar = args[0].toString();
// let org = args[1].toString();
// main(drugName, serialNo, retailerCRN, customerAadhar, org).then(() => {
// 	console.log('retailDrug transaction recorded on the ledger');
// });

module.exports.execute = main;
