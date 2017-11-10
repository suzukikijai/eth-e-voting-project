var PartyVote = ["", "", ""];
var CandidateVote = ["", "", ""];
var items;

$.getJSON("candidates.json", function(data) {
	items = [data];
	console.log(items);
});

//Göra:
//Funktionalitet för att ändra sin röst
//Producera lista med kandidater
//sliders?

// Onload
$(function() {

	//Generate election 1
	$("#election-card-container-0").html(generatePartyCards(0));
	$("#election-card-container-1").html(generatePartyCards(1));
	$("#election-card-container-2").html(generatePartyCards(2));
	
	// Assigning events
	$(".election-card").click(selectCard);
	$(".cand-cb").click(selectCandidate);
	$("#vote-0").click(storeVote);
	$("#vote-1").click(storeVote);
	$("#vote-2").click(storeVote);
});

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

function storeVote(){
	// Get election variable 
	var election = this.id.slice(5);
	var userConfirm = false;
	var confirmMsg;
	if (PartyVote[election] == "") {
		userConfirm =	confirm(items[0][election].election + ":\nDu har valt att rösta blankt.\n\nTryck på avbryt för att göra om.");
	}
	if (CandidateVote[election] == "" && userConfirm == false) {
		userConfirm = confirm(items[0][election].election + ":\nDin röst kommer att bli registrerad med: \n\nParti:" + items[0][election].parties[PartyVote[election]].party + ".\nPartikandidat: Blankt\nTryck på avbryt för att göra om.");
	}
	else if (userConfirm == false) {
		userConfirm = confirm(items[0][election].election + ":\nDin röst kommer att bli registrerad med: \n\nParti: " + items[0][election].parties[PartyVote[election]].party + ".\nPartikandidat: " +items[0][election].parties[PartyVote[election]].candidates[CandidateVote[election]] + "\n\nTryck på avbryt för att göra om.");
	}
	if (userConfirm) {
		$('#checkbox-'+election).removeClass("hidden");
		$('#election-'+election).slideUp("normal");
		$('#election-card-container-'+election).slideUp( "normal");
		$('#vote-'+election).addClass("hidden");
	}
};


function selectCard() {
	var $this = $(this);
	// Get election variable
	var	$thisElection = $this.attr("id").slice(5,6);
	// Get card variable
	var $thisParty = $this.attr("id").slice(7);
	// Add to vote (Find new solution)
	PartyVote[$thisElection] = $thisParty;
	CandidateVote[$thisElection] = "";
	
	//1. No party was previously chosen, select $this party.
	//2. A party was selected a second time, unselect $this party.
	//3. A new party was selected when another was already selected, 
	//	 unselect the previous and select $this party. 
	if (!$(".selected-card")[0]){
		$this.addClass("selected-card");
		$( "#candidate-list-"+$thisElection ).html(generateCandidateTable($thisElection, $thisParty));
		$(".cand-cb").click(selectCandidate); //försvinner de sen?
	}
	else if ($this.hasClass("selected-card")) {
		PartyVote[$thisElection] = "";
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
	$(".cand-cb").prop('checked', false);
	var $this = $(this);
	$(this).prop('checked', true);
	// Get election variable
	var	$thisElection = $this.attr("id").slice(5,6);
	console.log($thisElection);
	// Get card variable
	var $thisParty = $this.attr("id").slice(7);
	console.log($thisParty);
	// Add to vote (Find new solution)
	CandidateVote[$thisElection] = $thisParty;
	console.log(CandidateVote);
}

function startElection() {

}