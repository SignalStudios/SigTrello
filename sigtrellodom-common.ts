 /*!
 * SigTrello
 *
 * Copyright (C) 2014 Signal Studios
 * Released under the MIT license
 * See LICENSE.txt
 */

///<reference path='jquery-2.1.0.d.ts'/>
///<reference path='chrome.d.ts'/>

module SigTrelloDom {
	export function getOrCreateCached<T>( element : Element, cacheId : string, create : ( element : Element ) => T ) {
		var cached : T = element[cacheId];
		if( cached == null )
			element[cacheId] = cached = create( element );
		return cached;
	}

	export function ownerOf<T>( element : Element, selector : string, cacheId : string, create : ( element : Element ) => T ) : T {
		return getOrCreateCached( $(element).parents(selector).get(0), cacheId, create );
	}

	export function allUnder<T>( element : Element, selector : string, cacheId : string, create : ( element : Element ) => T ) : T[] {
		return $(element).find(selector).map( (index,childElement) => {
			return getOrCreateCached( childElement, cacheId, create );
		}).toArray( );
	}
}
