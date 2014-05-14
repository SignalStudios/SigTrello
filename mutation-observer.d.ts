/*!
 * SigTrello TypeScript definition file for MutationObserver
 *
 * Copyright (C) 2014 Signal Studios
 * Released under the MIT license
 * See LICENSE.txt
 */

interface Window {
	MutationObserver		: MutationObserverFactory;
	WebKitMutationObserver	: MutationObserverFactory;
	MozMutationObserver		: MutationObserverFactory;
}

interface MutationObserverFactory {
	new ( callback : ( mutations : MutationRecord [] ) => void ) : MutationObserver;
}
