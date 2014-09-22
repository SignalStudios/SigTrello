/*!
 * SigTrello TypeScript definition file for Chrome
 *
 * Copyright (C) 2014 Signal Studios
 * Released under the MIT license
 * See LICENSE.txt
 */

declare module Chrome {
	interface Static {
		extension : Extension;
		storage : Storage;
	}


	interface Storage {
		sync : StorageSync;
	}

	interface StorageSync {
		get<T>( fallbacks : T, onStorageLoaded : (values : T ) => void ) : void;
		set<T>( settings : T, onStorageSaved : () => void ) : void;
	}

	interface Extension {
		getURL( url : string ) : string;
	}
}

interface Document {
	baseURI : string;
}

declare var chrome : Chrome.Static;
