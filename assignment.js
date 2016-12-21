// PROBLEM:
// Given a string representing a document, write a function which returns the top 10 most frequent repeated phrases. A phrase is a stretch of three to ten consecutive words and cannot span sentences. Only include a phrase if it is not a subset of another, longer phrase (if “calm cool” and “calm cool and collected” are repeated, do not include “calm cool” in the returned set).


//Things I would change:
// Account for Mr., Mrs., etc. for more accurate sentence breaking
// notASubset returns a boolean but also has side effects, which is unexpected behavior
// use look-ahead and look-behind in the trie to account for subsets instead of checking against every node in the heap?
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
			// >= makes sure that longer phrases that come after shorter phrases will pass the conditional and check for subsets
			if(node.count >= this.root.count && this.notASubset(node)){
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
			//if currentNode is a subset of the new node, remove currentNode
			if(node.phrase.indexOf(currentNode.phrase) !== -1){
				if(node.count === currentNode.count){
					this.remove(currentNode);
				}
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
			var prevNode;
			//find the right place to insert
			while(node.count > currentNode.count && currentNode.next){
				prevNode = currentNode;
				currentNode = currentNode.next;
			}
			if(prevNode && currentNode.next){
				node.next = currentNode;
				prevNode.next = node;
			}
			else{
				var temp = currentNode.next;
				currentNode.next = node;
				node.next = temp;
			}
			//remove the min if list is more than 10
			if(this.count > 10){
				this.root = this.root.next;
				this.count --;
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

//check every phrase in the trie and send it to addNode
var addToHeap = function(node, startAt){
		var children = node.children;
		while (children.length){
			var words;
			if(startAt){
				words = startAt.slice();
			}
			else{
				words = [node.word];
			}
			var endOfPhrase = children.pop();
			words.push(endOfPhrase.word);
			if(endOfPhrase.count){
				top10.addNode(words.join(" "), endOfPhrase.count);
				//check if endOfPhrase has any chilren
				//if it does call addToHeap(endOfPhrase, words)
				if(endOfPhrase.children.length){
					addToHeap(endOfPhrase, words);
				}
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
		//remove punctuation and leading/trailing whitespace
		parse(line.replace(/[,:()\n]/,"").trim());
	});
	head.children.forEach(function(child){
		addToHeap(child);
	});
	top10.print();
};

///Code below is for the basic interface

var listResults = function(){
	var currentNode = top10.root;
		while(currentNode){
			var phrase = $("<td></td>").text(currentNode.phrase);
			var occurances = $("<td></td>").text(currentNode.count);
			var resultRow = $("<tr></tr>").prepend(occurances).prepend(phrase);
			$("#results").prepend(resultRow);
			currentNode = currentNode.next;
		}
	var phraseHeader = $("<th></th>").text("Phrase");
	var countHeader = $("<th></th>").text("Occurances");
	var tableHeader = $("<tr></tr>").prepend(countHeader).prepend(phraseHeader);
	$("#results").prepend(tableHeader);
	$("#results").show();
};

$(document).ready(function(){
	$("#analyze").click(function(e){
		e.preventDefault();
		$("#results tr").remove();
		var myString = $("#input").val();
		getFrequentPhrases(myString);
		listResults();
	});
});


