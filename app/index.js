const express = require('express');
const app = express();
const cors = require('cors');
const port = 3000;

// Import all function modules

const addToWallet = require('./1_addToWallet');
const registerNewCompany = require('./2_registerNewCompany');
const addDrug = require('./3_addDrug');
const createPO = require('./4_createPO');
const createShipment = require('./5_createShipment');
const updateShipment = require('./6_updateShipment');
const retailDrug = require('./7_retailDrug');
const viewHistory = require('./viewHistory');
const viewCurrentState = require('./viewCurrentState');

// Define Express app settings
app.use(cors());
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.set('title', 'Supply Chain App');

app.get('/', (req, res) => res.send('Hello World'));

app.post('/addToWallet', (req, res) => {
    addToWallet.execute(req.body.org).then (() => {
        console.log('User Credentials added to wallet');
        const result = {
            status: 'success',
            message: 'User credentials added to wallet'
        };
        res.json(result);
    })
    .catch((e) => {
        const result = {
            status: 'error',
            message: 'Failed',
            error: e
        };
        res.status(500).send(result);
    });
});

app.post('/registerNewCompany', (req, res) => {
    registerNewCompany.execute(req.body.companyID, req.body.name, req.body.location, req.body.org).then((company) => {
        console.log('Register New Company submitted on the Network');
        const result = {
            status: 'success',
            message: 'New Company registered on the Network',
            company: company
        };
        res.json(result);
    })
    .catch((e) => {
        const result = {
            status: 'error',
            message: 'Failed',
            error: e
        };
        res.status(500).send(result);
    }); 
});

app.post('/addDrug', (req, res) => {
    addDrug.execute(req.body.drugName, req.body.serialNo,req.body.mfgDate,req.body.expDate, req.body.companyCRN,req.body.org).then ((drug) => {
        console.log('Add Drug Transaction submitted on the Network');
        const result = {
            status: 'success',
            message: 'Add Drug Transaction submitted on the Network',
            drug: drug
        };
        res.json(result);
    })
    .catch((e) => {
        const result = {
            status: 'error',
            message: 'Failed',
            error: e
        };
        res.status(500).send(result);
    });
});

app.post('/createPO', (req, res) => {
    createPO.execute(req.body.buyerCRN, req.body.sellerCRN, req.body.drugName, req.body.quantity, req.body.org).then ((purchaseOrder) => {
        console.log('createPO request submitted on the Network');
        const result = {
            status: 'success',
            message: 'createPO request submitted on the Network',
            PO: purchaseOrder
        };
        res.json(result);
    })
    .catch((e) => {
        const result = {
            status: 'error',
            message: 'Failed',
            error: e
        };
        res.status(500).send(result);
    });
});

app.post('/createShipment', (req, res) => {
    createShipment.execute(req.body.buyerCRN, req.body.drugName, req.body.listOfAssets, req.body.transporterCRN, req.body.org).then ((shipment) => {
        console.log('Create Shipment request submitted on the Network');
        const result = {
            status: 'success',
            message: 'Create Shipment Registration request submitted on the Network',
            shipment: shipment
        };
        res.json(result);
    })
    .catch((e) => {
        const result = {
            status: 'error',
            message: 'Failed',
            error: e
        };
        res.status(500).send(result);
    });
});

app.post('/updateShipment', (req, res) => {
    updateShipment.execute(req.body.buyerCRN, req.body.drugName, req.body.transporterCRN, req.body.org).then (() => {
        console.log('Update Shipment request submitted on the Network');
        const result = {
            status: 'success',
            message: 'Update Shipment request submitted on the Network'
        };
        res.json(result);
    })
    .catch((e) => {
        const result = {
            status: 'error',
            message: 'Failed',
            error: e
        };
        res.status(500).send(result);
    });
});

app.post('/retailDrug', (req, res) => {
    retailDrug.execute(req.body.drugName, req.body.serialNo, req.body.retailerCRN, req.body.customerAadhar, req.body.org).then (() => {
        console.log('Retail Drug request submitted on the Network');
        const result = {
            status: 'success',
            message: 'Retail Drug request submitted on the Network'
        };
        res.json(result);
    })
    .catch((e) => {
        const result = {
            status: 'error',
            message: 'Failed',
            error: e
        };
        res.status(500).send(result);
    });
});

app.post('/viewHistory', (req, res) => {
    viewHistory.execute(req.body.drugName, req.body.serialNo, req.body.org).then ((history) => {
        console.log('View History request submitted on the Network');
        const result = {
            status: 'success',
            message: 'View History request submitted on the Network',
            history: history
        };
        res.json(result);
    })
    .catch((e) => {
        const result = {
            status: 'error',
            message: 'Failed',
            error: e
        };
        res.status(500).send(result);
    });
});

app.post('/viewCurrentState', (req, res) => {
    
    viewCurrentState.execute(req.body.drugName, req.body.serialNo, req.body.org).then ((currentState) => {
        console.log('View Current State request submitted on the Network');
        const result = {
            status: 'success',
            message: 'View Current State submitted on the Network',
            currentState: currentState
        };
        res.json(result);
    })
    .catch((e) => {
        const result = {
            status: 'error',
            message: 'Failed',
            error: e
        };
        res.status(500).send(result);
    });
});

app.listen(port, () => console.log(`Distributed App listening on port ${port}!`));
