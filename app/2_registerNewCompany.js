'use strict';

/**
 * This is a Node.JS application to request to create a New Company on the Network
 */

const helper = require('./contractHelper');
async function main(companyID, name, location, org) {

	try {
		console.log (companyID);
		const contract = await helper.getContractInstance(org);

		console.log('.....Requesting to create a New Company on the Network');
		const newCompanyBuffer = await contract.submitTransaction('registerCompany', companyID, name, location, org);
		
		// process response
		console.log('.....Processing New Company Transaction Response \n\n');
		let newCompany = JSON.parse(newCompanyBuffer.toString());
		console.log(newCompany);
		console.log('\n\n..... New Company Transaction Complete!');
		return newCompany;

	} catch (error) {

		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);

	} finally {

		// Disconnect from the fabric gateway
		helper.disconnect();

	}
}




// var args = process.argv.slice(2);
// let companyID = args[0].toString();
// let name = args[1].toString();
// let location = args[2].toString();
// let org = args[3].toString();
// main(companyID, name, location, org).then(() => {
// 	console.log('New Company registered on the Network');
// });
module.exports.execute = main;
