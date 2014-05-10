/*!
 * SigTrello TypeScript definition file for Chrome
 *
 * Copyright (C) 2014 Signal Studios
 * Released under the MIT license
 * See LICENSE.txt
 */

interface ChromeStatic {
	extension : ChromeExtension;
}

interface ChromeExtension {
	getURL( url : string ) : string;
}

interface Document {
	baseURI : string;
}

interface NamedThing {
	name : string;
}

declare var chrome : ChromeStatic;