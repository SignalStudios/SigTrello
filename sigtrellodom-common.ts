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
	function getOrCreateCached<T>( element : Element, cacheId : string, create : ( element : Element ) => T, invalidate? : ( cached : T ) => boolean ) {
		var cached : T = element[cacheId];
		if( cached == null || (invalidate && invalidate(cached)) )
			element[cacheId] = cached = create( element );
		return cached;
	}

	function invalidateCached( element : Element, cacheId : string ) {
		element[cacheId] = null;
	}

	export function ownerOf<T>( element : Element, selector : string, cacheId : string, create : ( element : Element ) => T, invalidate? : ( cached : T ) => boolean ) : T {
		return getOrCreateCached( $(element).parents(selector).get(0), cacheId, create, invalidate );
	}

	export function allUnder<T>( element : Element, selector : string, cacheId : string, create : ( element : Element ) => T, invalidate? : ( cached : T ) => boolean ) : T[] {
		return $(element).find(selector).map( (index,childElement) => {
			return getOrCreateCached( childElement, cacheId, create, invalidate );
		}).toArray( );
	}
}
