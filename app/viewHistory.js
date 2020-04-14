'use strict';

/**
 * This is a Node.JS application to view the history of a drug registered on the network
 */

const helper = require('./contractHelper');



async function main(drugName, serialNo, org) {

	try {
		const regnetContract = await helper.getContractInstance(org);

		
		console.log('.....Invoking a viewHistory() transaction on the Network');
		const histroryBuffer = await regnetContract.submitTransaction('viewHistory', drugName, serialNo);

		// process response
		console.log('.....Processing view history Transaction response \n\n');
		let history = JSON.parse(histroryBuffer.toString());
		console.log(history);
		console.log('\n\n..... view history Complete!');
		return history;
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
// 	console.log('Histrory Displayed on the network');
// });

module.exports.execute = main;
