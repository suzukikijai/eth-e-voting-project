// Import the page's CSS. Webpack will know what to do with it.
import "./stylesheets/app.css";
import "./stylesheets/election.css";
const json = require('./candidates.json');
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

/*
 * When you compile and deploy your Voting contract,
 * truffle stores the abi and deployed address in a json
 * file in the build directory. We will use this information
 * to setup a Voting abstraction. We will use this abstraction
 * later to create an instance of the Voting contract.
 * Compare this against the index.js from our previous tutorial to see the difference
 * https://gist.github.com/maheshmurthy/f6e96d6b3fff4cd4fa7f892de8a1a1b4#file-index-js
 */

import ballot_artifacts from '../build/contracts/Ballot.json'

var Ballot = contract(ballot_artifacts);
var PartyVote;
var CandidateVote;
var items;


//Göra:
//Funktionalitet för att ändra sin röst
//Producera lista med kandidater
//sliders?

// Onload
$(function() {
	items = [json];
	$("#showVoteView").addClass("active");
	$("#content").html(generateVoteView());
	$("#election-card-container-0").html(generatePartyCards(0));
	$(".election-card").click(selectCard);
	$(".cand-cb").click(selectCandidate);
	$("#vote-0").click(storeVote);
	
	$("#showVoteView").click(function(){
		resetActiveCss();
		$("#showVoteView").addClass("active");
		$("#content").html(generateVoteView);
		$("#election-card-container-0").html(generatePartyCards(0));
		$(".election-card").click(selectCard);
		$(".cand-cb").click(selectCandidate);
		$("#vote-0").click(storeVote);
	});
	
	$("#showResultView").click(function(){
		resetActiveCss();
		$("#showResultView").addClass("active");
		$("#content").html(generateResultView);
		generateResultTable();
	});

	$("#showMyVoteView").click(function(){
		resetActiveCss();
		$("#showMyVoteView").addClass("active");
		$("#content").html(generateMyVoteView);
		$("#usersVote").click(getUsersVotes);
	});

	if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source like Metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }

	// From apporg
  Ballot.setProvider(web3.currentProvider);
  web3.eth.defaultAccount = web3.eth.accounts[0];
  
});
//$("#content").html(generateVoteView());
//Generate election 1

//Reset navbar active
function resetActiveCss() {
	$(".active").removeClass("active");
}

function generateCandidateTable(election, party) {
	var candidateTable = "<div class='table-responsive'><table class='table table-bordered'><thead><tr><th><h4>"+ items[0][election].parties[party].party+"</h4></th></tr></thead><tbody>";
	for (var i=0; i<items[0][election].parties[party].candidates.length; i++) {
		candidateTable += "<tr><td>" + items[0][election].parties[party].candidates[i] + "<input type='checkbox' class='cand-cb' id='cand-" + election + "-" + i + "'/></td></tr>";
	}
	candidateTable += "</tbody></table></div>";
	console.log(candidateTable);
	return candidateTable;
}

function generatePartyCards(election) {
	var electionCards = '';
	for (var i=0;i<items[0][election].parties.length;i++) {
		electionCards += "<div onselectstart='return false' id='card-" + election + "-" + i + "' class='election-card'>";
		electionCards += "<h3>" + items[0][election].parties[i].party + "</h3>";
		electionCards += "</div>";
	}
	return electionCards;
}

function generateResultTable() {
	Ballot.deployed().then(function(contractInstance){
		for (let i = 0; i < 3; i++) {
			contractInstance.totalVotesForParty.call(i).then(function(numberOfVotes) {
			  console.log(i + "  " + numberOfVotes);
			   $("#party-" + (i + 1)).html(numberOfVotes.toString());
			});
		  }
		// Get number of votes of candidate 
		for (let i = 1; i < 7; i++) {
		  contractInstance.totalVotesForCandidate.call(i).then(function(numberOfVotes) {
			console.log(i + "  " + numberOfVotes);
			 $("#candidate-" + i).html(numberOfVotes.toString());
		  });
		}
		});
}


function storeVote(){
	// Get election variable 
	var election = this.id.slice(5);
	var userConfirm = false;

	// Ask user to confirm vote based on selection
	if (PartyVote == "") {
		userConfirm =	confirm(items[0][election].election + ":\nDu har valt att rösta blankt.\n\nTryck på avbryt för att göra om.");
	}
	else if (CandidateVote == "" && userConfirm == false) {
		userConfirm = confirm(items[0][election].election + ":\nDin röst kommer att bli registrerad med: \n\nParti:" + items[0][election].parties[PartyVote].party + ".\nPartikandidat: Blankt\nTryck på avbryt för att göra om.");
	}
	else if (userConfirm == false) {
		userConfirm = confirm(items[0][election].election + ":\nDin röst kommer att bli registrerad med: \n\nParti: " + items[0][election].parties[PartyVote].party + ".\nPartikandidat: " +items[0][election].parties[PartyVote].candidates[CandidateVote] + "\n\nTryck på avbryt för att göra om.");
	}
	if (userConfirm) {
		var intParty = parseInt(PartyVote);
		var intCandidate = parseInt(CandidateVote);
		

		if (intParty == 1){
			intCandidate += 3; 
		}
		// Add vote to block 

		Ballot.deployed().then(function(contractInstance){
			contractInstance.vote(intParty + 1, intCandidate + 1, {gas: 400000, from: web3.eth.defaultAccount} );
		});
		$('#checkbox-'+election).removeClass("hidden");
		$('#election-'+election).slideUp("normal");
		$('#election-card-container-'+election).slideUp( "normal");
		$('#vote-'+election).addClass("hidden");
	}
};

function getUsersVotes(){
	// Add vote to block 
    Ballot.deployed().then(function(contractInstance){
		// Get a specific users vote by address -- change from input to automaticly use sender address 
		contractInstance.getVotersPartyVote.call({from: web3.eth.defaultAccount}).then(function(partyTitle){
			contractInstance.getVotersCandidateVote.call({from: web3.eth.defaultAccount}).then(function(candidateTitle){
				$("#userVote").html(web3.toAscii(partyTitle) + " /  " +  web3.toAscii(candidateTitle));
			});
		});
	});
}

function selectCard() {
	var $this = $(this);
	// Get election variable
	var	$thisElection = $this.attr("id").slice(5,6);
	// Get party variable
	var $thisParty = $this.attr("id").slice(7);
	// Add to vote (Find new solution)
	PartyVote = $thisParty;
	// Reset the candidate vote when card is selected
	CandidateVote = "";
	
	//1. No party was previously chosen, select $this party.
	//2. A party was selected a second time, unselect $this party.
	//3. A new party was selected when another was already selected, 
	//	 unselect the previous and select $this party. 
	if (!$(".selected-card")[0]){
		$this.addClass("selected-card");
		$( "#candidate-list-"+$thisElection ).html(generateCandidateTable($thisElection, $thisParty));
		$(".cand-cb").click(selectCandidate); 
	}
	else if ($this.hasClass("selected-card")) {
		PartyVote = "";
		$( "#candidate-list-"+$thisElection ).html("");
		$(".selected-card").removeClass("selected-card");
	}
	else {
		$( "#candidate-list-"+$thisElection ).html("");
		$(".selected-card").removeClass("selected-card");
		$this.addClass("selected-card");
		$( "#candidate-list-"+$thisElection ).html(generateCandidateTable($thisElection, $thisParty));
		$(".cand-cb").click(selectCandidate);
	}

	console.log(PartyVote);
};


function selectCandidate() {
	var $this = $(this);
	
	// If the checkbox is already selected, unselect and reset choice.
	if (!$(this).prop("checked")) {
		$(".cand-cb").prop('checked', false);
		//$(this).prop('checked', true);
		CandidateVote = "";
		console.log(CandidateVote);
	}
	// If the checkbox is unselected, select and add choice.
	else {
		// Get candidate variable
		var $thisCandidate = $this.attr("id").slice(7);

		$(".cand-cb").prop('checked', false);
		$(this).prop('checked', true);
		CandidateVote = $thisCandidate;
		console.log(CandidateVote);
	}
}


function generateVoteView() {
var html = "";
html += "<div id='voteView'>";
html += "<div class='election-header'>";
html += "<h3 class='election-bar-text'>Information</h3>";
html += "</div>";
html += "<div id='info'>";
html += "<div class='election-card-container'>";
html += "<p>Via den internetbaserade röstningstjänsten har du möjlighet att lägga din röst för riksdagsvalet.</p>";
html += "<p>Kombinera din säkerhetsfras du fått via post med denna fras för att få tillgång till din röstningsplånbok.</p>"
html += "<p><b>ask category tunnel picture kit broccol</b></p>"
html += "<p>Din röst lägger du genom att välja ett parti och en kandidat och genomför röstningen genom att trycka på knappen 'Rösta'.</p>";
html += "<p>Vill du rösta blankt eller bara på ett parti trycker du på knappen 'Rösta'.</p>";
html += "<p>Bekräfta att du har valt rätt parti och kandidat och skicka sedan på den gröna Submit-knappen för att lagra din röst.</p>"
html += "<p>Din röst kan du ändra fram till kl 23:59 den 14 september 2018</p>";
html += "</div>";
html += "</div>";
html += "<div class='election-header'>";
html += "<h3 class='election-bar-text'>Riksdagsvalet 2018</h3>";
html += "<img id='checkbox-0' class='checkbox hidden' src='media/checkboxicon.png'></img>";
html += "</div>";
html += "<div id='election-0'>";
html += "<div id='election-card-container-0' class='election-card-container'>";
html += "</div>";
html += "<div id='candidate-list-0'></div>";
html += "<a id='vote-0' class='btn btn-primary'>Rösta Riksdagsvalet</a> ";
html += "</div>";
html += "</div>";
return html;
}

function generateMyVoteView() {
var html = "";
html += "<div id='myVoteView'>";
html += "<div class='election-header'>";
html += "<h3 class='election-bar-text'>Min Röst</h3>";
html += "</div>";
html += "<div id='info'>";
html += "<div class='election-card-container'>";
html += "<p>Genom att hämta din röst så kan du säkerställa att den är intakt och att din röst har gått till det parti och kandidat du tänkt rösta på.</p>";
html += "<p>Din röst kan du ändra genom att lägga en ny röst sålänge röstningsperioden är öppen. </p>";
html += "</div>";
html += "</div>";
html += "<a href='#' id='usersVote' class='btn btn-primary'>Hämta din röst</a>";
html += "<p></p>"
html += "<div class='well well-sm'>";
html += "<p>Din röst (Parti / Kandidat):</p>";
html += "<p id='userVote'></p>";
html += "</div>"
html += "</div>";
return html;
}

function generateResultView() {
var html = "";
html += "<div id='resultView'>";
html += "<div class='election-header'>";
html += "<h3 class='election-bar-text'>Valresultat</h3>";
html += "</div>";
html += "<div id='info'>";
html += "<div class='election-card-container'>";
html += "<p>När röstningsperioden är över kan du direkt på den här sidan se valresultatet då detta sammanställs automatiskt utan behovet av en rösträknare.</p>";
html += "</div>";
html += "</div>";
html += "<table class='table table-bordered'>";
html += "<div class='table-responsive'>";
html += "<thead>";
html += "<tr>";
html += "<th>Partier</th>";
html += "<th>Röster</th>";
html += "</tr>";
html += "</thead>";
html += "<tbody>";
html += "<tr>";
html += "<td>Blankt</td>";
html += "<td id='party-1'></td>";
html += "</tr>";
html += "<tr>";
html += "<td>Moderaterna</td>";
html += "<td id='party-2'></td>";
html += "</tr>";
html += "<tr>";
html += "<td>Socialdemokraterna</td>";
html += "<td id='party-3'></td>";
html += "</tr>";
html += "</tbody>";
html += "</table>";
html += "</div>";


html += "<table class='table table-bordered'>";
html += "<div class='table-responsive'>";
html += "<thead>";
html += "<tr>";
html += "<th>Moderaterna: Kandidater</th>";
html += "<th>Röster</th>";
html += "</tr>";
html += "</thead>";
html += "<tbody>";
html += "<tr>";
html += "<td>Ulrika Karlsson, 41 år, riksdagsledamot, Uppsala</td>";
html += "<td id='candidate-1'></td>";
html += "</tr>";
html += "<tr>";
html += "<td>Jessika Vilhelmsson, 41 år, riksdagsledamot, Enköping</td>";
html += "<td id='candidate-2'></td>";
html += "</tr>";
html += "<tr>";
html += "<td>Per Bill, 56 år, riksdagsledamot, Uppsala</td>";
html += "<td id='candidate-3'></td>";
html += "</tr>";
html += "</tbody>";
html += "</table>";
html += "</div>";

html += "<table class='table table-bordered'>";
html += "<div class='table-responsive'>";
html += "<thead>";
html += "<tr>";
html += "<th>Socialdemokraterna: Kandidater</th>";
html += "<th>Röster</th>";
html += "</tr>";
html += "</thead>";
html += "<tbody>";
html += "<tr>";
html += "<td>Ardalan Shekarabi, 35 år, Doktorand i offentlig rätt, Knivsta</td>";
html += "<td id='candidate-4'></td>";
html += "</tr>";
html += "<tr>";
html += "<td>Agneta Gille, 58 år, Barnskötare, Uppsala</td>";
html += "<td id='candidate-5'></td>";
html += "</tr>";
html += "<tr>";
html += "<td>Pyry Niemi, 49 år, Företagare, Bålsta</td>";
html += "<td id='candidate-6'></td>";
html += "</tr>";
html += "</tbody>";
html += "</table>";
html += "</div>";

html += "</div>";
return html;
}
