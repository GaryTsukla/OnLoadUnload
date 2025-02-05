let RUNTIME,TABS,MENUS,STORAGE,EXCEPTIONS=[];
let ST={
	exceptions:'ExceptionsList'
}
let exceptionsList=[];
try{
	RUNTIME=chrome['runtime'];
	TABS=chrome['tabs'];
	MENUS=chrome['contextMenus'];
	STORAGE=chrome['storage'];
}catch(e){
	RUNTIME=browser['runtime'];
	TABS=browser['tabs'];
	MENUS=browser['contextMenus'];
	STORAGE=browser['storage'];
}
let awaitedUpdates=false;
// Unloads all tabs, except active tabs
let unloadAllTabs=async function(){
	await getExceptions();
	let tabs;
	try{
		tabs = await TABS['query']({'active':false});
	}catch(e){
		console.log('No tabs unloaded');
		return;
	}
	let c=0;
	let d=0;
	let e=0;
	for(let i=0,l=tabs.length;i<l;i++){
		let rcd=await unloadThisTab(tabs[i],c,d,e);
		c=rcd[0];
		d=rcd[1];
		e=rcd[2];
	}
	consoleWhatHappened(c,d,e);
};
let unloadThisTab=async function(tab,c,d,e){
	try{
		// Check if it's already discarded
		if(tab['discarded']){
			return [c,++d,e];
		}
		await TABS['discard'](tab['id']);
		return [++c,d,e];
	}catch(e){
		/* tab skipped */
		return [c,d,e];
	}
};
let unloadThisTabExclude=async function(tab,c,d,e){
	try{
		// Check for exception
		if(tab['url'] || tab['pendingUrl']){
			let url = tab['url'] || tab['pendingUrl'];
			if(typeof(url)=='string'){
				for(let i=0,l=EXCEPTIONS.length;i<l;i++){
					if(url.includes(EXCEPTIONS[i])){
						return [c,d,++e];
					}
				}
			}
		}
		// Check if it's already discarded
		if(tab['discarded']){
			return [c,++d,e];
		}
		await TABS['discard'](tab['id']);
		return [++c,d,e];
	}catch(e){
		/* tab skipped */
		return [c,d,e];
	}
};
let consoleWhatHappened=function(c,d,e){
	let str='';
	if(c>0){
		if(c>1){
			str+=c+' tabs unloaded';
		}else{
			str+='1 tab unloaded';
		}
	}else{
		str+='No tabs unloaded';
	}
	if(d>0){
		if(d>1){
			str+='. '+d+' tabs were already unloaded';
		}else{
			str+='. 1 tab was already unloaded';
		}
	}
	if(e>0){
		if(e>1){
			str+='. '+e+' tabs were excluded';
		}else{
			str+='. 1 tab was excluded';
		}
	}
	console.log(str);
};
let getExceptions=async function(){
	// Get the list of exceptions from storage
	let exceptions=await STORAGE['sync']['get'](ST.exceptions);
	exceptions=exceptions[ST.exceptions];
	if(typeof(exceptions)=='object' && exceptions!==null && exceptions.length>0){
		EXCEPTIONS=exceptions;
		if(EXCEPTIONS.length>0){
			unloadThisTab=unloadThisTabExclude;
		}
	}
};
// Creates a menu item so the user can discard all inactive tabs on command
// Added a settings button, for additional options
let createMenuItem=async function(){
	MENUS['onClicked']['addListener'](checkMenuItem);
	try{
		MENUS['create']({
			'title':'Unload All Inactive Tabs',
			'contexts':['all'],
			'id':'unloadAllTabs'
		},checkError);
	}catch(e){
		/* Menu already created */
	}
	try{
		MENUS['create']({
			'type':'separator',
			'contexts':['page'],
			'id':'seperator'
		},checkError);
	}catch(e){
		/* Menu already created */
	}
	try{
		MENUS['create']({
			'title':'Open Settings',
			'contexts':['page'],
			'id':'openSettings'
		},checkError);
	}catch(e){
		/* Menu already created */
	}
	awaitedUpdates=true;
};
let openSettings=function(){
	TABS['create']({
		'active':true,
		'url':'settings.html'
	});
};
let checkError=function(){
	if(RUNTIME['lastError']){
		if(RUNTIME['lastError']['message']){
			if(
				RUNTIME['lastError']['message']=='Cannot create item with duplicate id unloadAllTabs' ||
				RUNTIME['lastError']['message']=='Cannot create item with duplicate id seperator' ||
				RUNTIME['lastError']['message']=='Cannot create item with duplicate id openSettings'
			){
				return;
			}
		}
		console.log('Error Found: ',RUNTIME['lastError']);
	}
}
// When someone clicks the menu item
let checkMenuItem=function(info){
	if(info['menuItemId']=='unloadAllTabs'){
		unloadAllTabs();
	}else if(info['menuItemId']=='openSettings'){
		openSettings();
	}
};

// Unload all the tabs, when user starts chrome
RUNTIME['onStartup']['addListener'](()=>{
	unloadAllTabs();
});
// Make sure menu item gets created for the user
createMenuItem();