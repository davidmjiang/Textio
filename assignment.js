// PROBLEM:
// Given a string representing a document, write a function which returns the top 10 most frequent repeated phrases. A phrase is a stretch of three to ten consecutive words and cannot span sentences. Only include a phrase if it is not a subset of another, longer phrase (if “calm cool” and “calm cool and collected” are repeated, do not include “calm cool” in the returned set).

"use strict";

function TrieNode(word){
	this.word = word;
	this.count = 0;
	this.children = [];
}

//returns the child node if found
//returns null if not found
TrieNode.prototype.findChild = function(word){
	var counter = 0;
	while(counter < this.children.length){
		if(this.children[counter].word === word){
			return this.children[counter];
		}
		else{
			counter ++;
		}
	}
	return null;
};

function HeapNode(phrase, count){
	this.phrase = phrase;
	this.count = count;
	this.next = null;
}

function MinHeap(){
	this.root = null;
	this.count = 0;
	this.addNode = function(phrase, count){
		var node = new HeapNode(phrase, count);
		if(this.count === 0){
			this.insert(node,this.root);	
		}
		else if(this.count < 10 && this.notASubset(node)){
			this.insert(node, this.root);
		}
		else{
			if(node.count > this.root.count && this.notASubset(node)){
				this.insert(node, this.root);
			}
		}
	};
	this.notASubset = function(node){
		var currentNode = this.root;
		while(currentNode){
			if(currentNode.phrase.indexOf(node.phrase) !== -1){
				return false;
			}
			//if currentNode is a subset of the new node, remove it
			if(node.phrase.indexOf(currentNode.phrase) !== -1){
				this.remove(currentNode);
			}
			currentNode = currentNode.next;
		}
		return true;
	};
	this.insert = function(node, startAt){
		//in case the root is removed during notASubstring
		if(this.count === 0){
			this.count ++;
			this.root = node;
		}
		else{
			this.count ++;
			//if the node to insert has a lower count than the first node
			if(startAt.count > node.count){
				node.next = startAt;
				return;
			}
			var currentNode = startAt;
			while(currentNode.count < node.count && currentNode.next){
				currentNode = currentNode.next;
			}
			var temp = currentNode.next;
			currentNode.next = node;
			node.next = temp;
			//remove the min if list is more than 10
			if(this.count > 10){
				this.root = this.root.next;
			}	
		}
	};
	this.remove = function(node){
		if(node.phrase === this.root.phrase){
			this.root = this.root.next;
		}
		else{
			var nodeBefore = this.findNodeBefore(node);
			nodeBefore.next = node.next;
		}
		this.count --;
	};
	//assuming its not the root
	this.findNodeBefore = function(node){
		var currentNode = this.root;
		while(currentNode.next){
			if(currentNode.next.phrase === node.phrase){
				return currentNode;
			}
			currentNode = currentNode.next;
		}
		return false;
	};
	this.print = function(){
		var currentNode = this.root;
		while(currentNode){
			console.log(currentNode.phrase, "----", currentNode.count);
			currentNode = currentNode.next;
		}
	};
}

var head = new TrieNode("");
var top10 = new MinHeap();

//passed in as an array of words
//will return the node representing the last word in the phrase
var addToTrie = function(phrase, startAt){
	var firstWord = phrase[0];
	var rootNode = startAt || head;
	var existingNode = rootNode.findChild(firstWord);
	//check if head's children includes first word of phrase
	//if it does, call recursively on the node containing the first word of the phrase
	if(existingNode){
		//if its the last word, increment the count and return
		if(phrase.length === 1){
			existingNode.count ++;
			return existingNode;
		}
		else{
			return addToTrie(phrase.slice(1), existingNode);
		}
	}
	//if not, create a new node
	//then add the rest of the phrase word by word
	else{
		var newNode = new TrieNode(firstWord);
		rootNode.children.push(newNode);
		var currentNode = newNode;
		var counter = 1;
		while(counter < phrase.length){
			newNode = new TrieNode(phrase[counter]);
			currentNode.children.push(newNode);
			currentNode = newNode;
			counter ++;
		}
		//add a count to the last node
		currentNode.count ++;
		return currentNode;
	}
	//when you reach the last word, increment the count for that node
};

//take a line and add all phrases in the line to the trie
//add to min heap if necessary
var parse = function(line){
	var words = line.split(" ");
	var numWords = words.length;
	var wordIndex = 0;
	var phraseLength = 3;
	while(wordIndex <= numWords - 3){
		while(phraseLength <= 10 && words[wordIndex + phraseLength - 1]){
			var currentPhrase = words.slice(wordIndex, wordIndex + phraseLength);
			addToTrie(currentPhrase);
			phraseLength ++;
		}
		wordIndex ++;
		phraseLength = 3;
	}
};

var addToHeap = function(node, startAt){
		var children = node.children;
		while (children.length){
			var words = startAt || [node.word];
			var endOfPhrase = children.pop();
			words.push(endOfPhrase.word);
			if(endOfPhrase.count){
				top10.addNode(words.join(" "), endOfPhrase.count);
			} 
			else{
				addToHeap(endOfPhrase, words);
			}
		}
};

var getFrequentPhrases = function(myDocument){
	//downcase everything, mark the end of sentences and split on that
	var sentences = myDocument.toLowerCase().replace(/[!.?]/g, "|").split("|");
	sentences.forEach(function(line){
		parse(line.replace(/[,:()\n]/,"").trim());
	});
	head.children.forEach(function(child){
		addToHeap(child);
	});
	top10.print();
};

var myString = "For the past decade, Oregon’s calling card has been speed: fast players on offense, fast players on defense, and a scheme constructed to run plays faster than opponents could prepare for them. The Ducks outsprinted their Pac-12 opponents time and again, routinely finding themselves prominently mentioned in the national championship conversation.Just two years ago, quarterback Marcus Mariota won the Heisman Trophy by the second-largest margin in the award’s history and the Ducks walloped Florida State, 59–20, in the College Football Playoff semifinal. Last year they won just nine games, dropping out of championship contention quickly, and fans hoped it was a blip on the radar before the team returned to the 10-win plateau. Instead, the Ducks went 4–8 in 2016 — and it wasn’t a good 4–8, either. At least Notre Dame lost seven close games. Oregon got blown out several times.Hypothetically, Helfrich’s strength is developing quarterbacks, but instead he developed a quarterback problem. He hired college football laughingstock Brady Hoke as his defensive coordinator, and Hoke did what Hoke does best: look slightly confused while an aggressively bad thing happened under his watch. The Ducks rank 126th out of 128 FBS teams in scoring defense, never allowing fewer than 26 points in a game — not even against FCS opponent UC Davis, which also fired its coach after the season. Perhaps worst of all, Oregon lost to rival Oregon State for the first time since 2007. So the Ducks fired Helfrich and turned to Willie Taggart, who revived Western Kentucky (0–12 the season before he arrived; 7–5 when he left) and then the University of South Florida (3–9 before he arrived; 10–2 this season), to replace him. This isn’t how Oregon does things: The school hadn’t fired a head coach or hired a head coach from outside the program since 1976, a truly preposterous fact compared with the quickly spinning coaching carousel everybody else in this sport is riding.But none of this is how Oregon does things. The idea of Oregon as a consistent national championship contender is a new one. The program skyrocketed to prominence using a unique formula, and as suddenly as that formula worked, it fizzled out. No, Taggart isn’t even a tad Oregon, but he might be the best option to help Oregon maintain the level its fan base now expects.If you imagine college football’s upper tier as a country club, you can hear everybody snickering at Oregon. The Ducks are among the newest members, having only recently been granted admission. They have no national championships and half of their conference titles have come since 2000. Their rise to success is heavily linked to the rise of Nike, a multibillion-dollar corporation run by free-spending alumnus Phil Knight. They have bad etiquette out on the course — their greatest successes came under Kelly, an offensive innovator who refused to play the way that everybody else expected him to. And they committed the no. 1 sin of country-club membership — they broke the dress code. While many other powerhouses sport the same jersey designs they’ve had since they wore leather helmets, Nike makes the Ducks fly, giving them new, extremely loud uniform combos every game. Oregon isn’t old money, and doesn’t act like it. And nothing makes country-club members more angry than the nouveau riche.The Ducks have to think differently, and not just because the state of Oregon considers itself no. 1 in weirdness. To be a national title contender, a college football program pretty much has to recruit more four- and five-star prospects than two- and three-star players. The state of Oregon produces between zero and two four-star recruits in most years, and it manages only a few five-stars per decade. (The state’s last five-star prospect, per 247Sports.com’s composite rankings: running back Thomas Tyner, in 2013, who played two seasons for the Ducks before retiring due to medical reasons.)";

getFrequentPhrases(myString);


