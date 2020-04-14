'use strict';

/**
 * This is a Node.JS application to view the current state of a drug
 */

const helper = require('./contractHelper');

async function main(drugName, serialNo, org) {

	try {
		const regnetContract = await helper.getContractInstance(org);
		const currentStateBuffer = await regnetContract.submitTransaction('viewDrugCurrentState', drugName, serialNo);

		// process response
		console.log('.....Processing view Current State Transaction  \n\n');
		let currentState = JSON.parse(currentStateBuffer.toString());
		console.log(currentState);
		return currentState;
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
// let org = args[2].toString();

// main(drugName, serialNo, org).then(() => {
// 	console.log('Current Drug State Displayed on the network');
// });

module.exports.execute = main;
