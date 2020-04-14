'use strict';

/**
 * This is a Node.JS application to add drug on the Network
 */

const helper = require('./contractHelper');

async function main(drugName, serialNo, mfgDate, expDate, companyCRN, org) {

	try {
		const regnetContract = await helper.getContractInstance(org);

		
		console.log('.....Requesting to register a new drug on the Network');
		const newDrugBuffer = await regnetContract.submitTransaction('addDrug', drugName, serialNo, mfgDate, expDate, companyCRN);

		// process response
		console.log('.....Processing the transaction to add new drug  \n\n');
		let newDrug = JSON.parse(newDrugBuffer.toString());
		console.log(newDrug);
		console.log('\n\n..... New Drug successfully added on the ledger!');
		return newDrug;

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
// let mfgDate = args[2].toString();
// let expDate = args[3].toString();
// let companyCRN = args[4].toString();
// let org = args[5].toString();
// main(drugName, serialNo, mfgDate, expDate, companyCRN, org).then(() => {
// 	console.log(' New Drug added on the ledger');
// });

module.exports.execute = main;
