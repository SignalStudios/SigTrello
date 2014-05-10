/*!
 * SigTrello TypeScript definition file for Trello
 *
 * Copyright (C) 2014 Signal Studios
 * Released under the MIT license
 * See LICENSE.txt
 */

interface TrelloAuthorizeScope {
	read	: boolean;
	write	: boolean;
	account	: boolean;
}

interface TrelloAuthorizeArgs {
	type		: string;
	name		: string;
	persist		: boolean;
	interactive	: boolean;
	scope		: TrelloAuthorizeScope;
	expiration	: string;
}

interface TrelloList {
	name	: string;
	id		: string;
}

interface TrelloCard {
	name	: string;
	id		: string;
	url		: string;
}

interface TrelloChecklistItem {
	name	: string;
	id		: string;
}

interface TrelloChecklist {
	name		: string;
	id			: string;
	checkItems	: TrelloChecklistItem[];
}

interface TrelloFuture {
	done( callback : ( result : any ) => void ) : TrelloFuture;
}

interface TrelloGetParams {
	fields	: string;
}

interface TrelloPostParams {
	name?	: string;
	desc?	: string;
	due?	: string;
}

interface TrelloPutParams {
	value?	: string;
}

interface TrelloStatic {
	authorize( args : TrelloAuthorizeArgs ) : void;
	authorized( ) : boolean;
	get	( url : string, params?: TrelloGetParams ) : TrelloFuture;
	post( url : string, params : TrelloPostParams ) : TrelloFuture;
	put	( url : string, params : TrelloPutParams ) : TrelloFuture;
}

declare var Trello: TrelloStatic;
