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
			this.count ++;
			this.root = node;
		}
		else if(this.count < 10 && notASubset(node)){
			insert(node, this.root);
		}
		else{
			if(node.count > this.root.count && notASubset(node)){
				insert(node, this.root);
			}
		}
	};
	this.print = function(){
		var currentNode = this.root;
		while(currentNode){
			console.log(currentNode.phrase, "----", currentNode.count);
			currentNode = currentNode.next;
		}
	};
}

var notASubset = function(node){
	var currentNode = top10.root;
	while(currentNode){
		if(currentNode.phrase.indexOf(node.phrase) !== -1){
			return false;
		}
		currentNode = currentNode.next;
	}
	return true;
};

var insert = function(node, startAt){
	top10.count ++;
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
	if(top10.count > 10){
		top10.root = top10.root.next;
	}	
};

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


//case insensitive?
//ignore numbers, punctuation?
//split into sentences (sentences end in one of these (.?!) but what about Mr. and Mrs. and decimals?)
//find every subset of 3-10 words
//keep track of their counts in a hash
//keep track of the top 10 frequent phrases in a min heap
//trie?
//what to do in case of ties? for now, priority goes to what comes first in the text
//do not count a phrase if every occurance of that phrase is also contained in another longer phrase