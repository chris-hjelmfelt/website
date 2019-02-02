
// Contract Info
const contract_address = "0x2087bdee3a8d5ba7616b9aa657f67e8ec13822e1";
const abi = [
	{
		"constant": false,
		"inputs": [
			{
				"name": "bookId",
				"type": "uint256"
			}
		],
		"name": "checkIn",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "bookId",
				"type": "uint256"
			}
		],
		"name": "checkOut",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "getUsers",
		"outputs": [
			{
				"name": "",
				"type": "address[20]"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"name": "users",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	}
];

// Info to find contract and its ABI
var contract = web3.eth.contract(abi).at(contract_address);
// object to hold addresses
var users = {1:"0x0000000000000000000000000000000000000000", 2:"0x0000000000000000000000000000000000000000"};

// Set web3 provider
if (typeof web3 !== 'undefined')
{
  web3 = new Web3(web3.currentProvider);
} 
else 
{
  web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
}
var account = 0;
// Get an account address
web3.eth.getAccounts((err, res) => { 
	if (typeof res[0] === 'undefined') {
		document.getElementById('message').innerHTML = 'You need to login to metamask';
	}else{        
		account = res[0];
	} 
});


// On page load
window.addEventListener('load', () => {	
  // Check for Metamask
  if(typeof(web3) === 'undefined') {
	  document.getElementById('message').innerHTML = 'Error: You need to install Metamask.';
	  return console.log("Metamask is not installed");
  }   
  
  
  // Get the users and mark books that are checked out
  function getUsers() {
	// Get the list of users from the contract
	contract.getUsers.call((error, result) => {
	  if(error) {
		  return console.log(error);
	  }
	  users = result;		 	
	  // Mark the book that have been checked out  (only using first five instead of users.length)
	  for (i=0; i < 5; i++) {		
		if (users[i] !== '0x0000000000000000000000000000000000000000') {
			document.getElementById(i).innerHTML = "Not Available"
			document.getElementById(i).disabled = true;	  
		}
		if (users[i] == account) {				
		  document.getElementById("ret" + i).style.display = "block";
	    }
	  }		  
	});	
  }  
  getUsers(); 	  
  
}); 



// Check out a book
function checkOut(bookId) {
	var bookName = document.getElementById('name' + bookId).innerHTML;
	console.log("checking out: " + bookName);

	contract.checkOut(bookId, {from: account}, function(error, result){
		if(error)		   
		   console.error(error);
	});
	
	document.getElementById('message').innerHTML = bookName + " is being checked out. Please wait...";
	
	var myResult = 0x0000000000000000000000000000000000000000;
	var update = setInterval(function(){
		console.log('working...');
		contract.getUsers.call((error, result) => {
		  if(error) {
			  clearInterval(update);
			  return console.log(error);			  
		  }		
		  myResult = result[bookId];		  
		});	
		
		if (myResult === account) {
		  location.reload();
		  clearInterval(update);				 		
		}		
	}, 2000);		
};  
  

// Return a book
function checkIn(retId) {
	var bookId = retId.substring(3, 4);
	var bookName = document.getElementById('name' + bookId).innerHTML;
	console.log("returning: " + bookName);
	
	contract.checkIn(bookId, {from: account}, function(error, result){
		if(error)		   
		   console.error(error);
	});	
	
	document.getElementById('message').innerHTML = bookName + " is being returned. Please wait...";
	
	var myResult = account;
	var update = setInterval(function(){
		console.log('working...');
		contract.getUsers.call((error, result) => {
		  if(error) {
			  clearInterval(update);
			  return console.log(error);			  
		  }		
		  myResult = result[bookId];			  
		});	
		
		if (myResult === '0x0000000000000000000000000000000000000000') {
		  location.reload();
		  clearInterval(update);				 		
		}		
	}, 2000);			
};




