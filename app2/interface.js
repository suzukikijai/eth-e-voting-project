var PartyVote = ["", "", ""];
var CandidateVote = ["", "", ""];
var items;


//Göra:
//Funktionalitet för att ändra sin röst
//Producera lista med kandidater
//sliders?

// Onload
$.getJSON("candidates.json", function(data) {
	items = [data];
	console.log(items);
	$("#showVoteView").addClass("active");
	$("#content").html(generateVoteView());
	$("#election-card-container-0").html(generatePartyCards(0));
	//$("#election-card-container-1").html(generatePartyCards(1));
	//$("#election-card-container-2").html(generatePartyCards(2));
	$(".election-card").click(selectCard);
	$(".cand-cb").click(selectCandidate);
	$("#vote-0").click(storeVote);
	//$("#vote-1").click(storeVote);
	//$("#vote-2").click(storeVote);
	//$("#voteView").addClass("hidden");
	$("#showResultView").click(function(){
		$("#content").html(generateResultView);
	});
	$("#showVoteView").click(function(){
		resetActiveCss();
		$("#showVoteView").addClass("active");
		$("#content").html(generateVoteView);
		$("#election-card-container-0").html(generatePartyCards(0));
		//$("#election-card-container-1").html(generatePartyCards(1));
		//$("#election-card-container-2").html(generatePartyCards(2));
		$(".election-card").click(selectCard);
		$(".cand-cb").click(selectCandidate);
		$("#vote-0").click(storeVote);
	});
	$("#showResultView").click(function(){
		resetActiveCss();
		$("#showResultView").addClass("active");
		$("#content").html(generateResultView);
	});
	$("#showMyVoteView").click(function(){
		resetActiveCss();
		$("#showMyVoteView").addClass("active");
		$("#content").html(generateMyVoteView);
	});
});
//$("#content").html(generateVoteView());
//Generate election 1
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

}

function storeVote(){
	// Get election variable 
	var election = this.id.slice(5);
	var userConfirm = false;
	var confirmMsg;

	// Ask user to confirm vote based on selection
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
	// Get party variable
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

function generateVoteView() {
var html = "";
html += "<div id='voteView'>";
html += "<div class='election-header'>";
html += "<h3 class='election-bar-text'>Information</h3>";
html += "</div>";
html += "<div id='info'>";
html += "<div class='election-card-container'>";
html += "<p>Via den internetbaserade röstningstjänsten har du möjlighet att lägga din röst för riksdagsvalet, kommunval och valet för landstingsfullmäktige.</p>";
html += "<p>Din röst lägger du genom att välja ett parti och en kandidat och genomför röstningen genom att trycka på knappen 'Rösta'.</p>";
html += "<p>Vill du rösta blankt eller bara på ett parti trycker du på knappen 'Rösta'.</p>";
html += "<p>Din röst kan du ändra fram till och med... </p>";
html += "<p>Logga ut när du har röstat färdigt.</p>";
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

}

function generateResultView() {
var html = "";
html += "<div id='resultView'>";

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
html += "<td>Moderaterna</td>";
html += "<td id='candidate-1'></td>";
html += "</tr>";
html += "<tr>";
html += "<td>Socialdemokraterna</td>";
html += "<td id='candidate-2'></td>";
html += "</tr>";
html += "<tr>";
html += "<td>Blankt</td>";
html += "<td id='candidate-3'></td>";
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
html += "<td id='candidate-1'></td>";
html += "</tr>";
html += "<tr>";
html += "<td>Agneta Gille, 58 år, Barnskötare, Uppsala</td>";
html += "<td id='candidate-2'></td>";
html += "</tr>";
html += "<tr>";
html += "<td>Pyry Niemi, 49 år, Företagare, Bålsta</td>";
html += "<td id='candidate-3'></td>";
html += "</tr>";
html += "</tbody>";
html += "</table>";
html += "</div>";

html += "</div>";
return html;
}
