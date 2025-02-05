let STORAGE,EXCEPTIONS=[];
let ST={
	exceptions:'ExceptionsList'
}
let exceptionsList=[];
try{
	STORAGE=chrome['storage'];
}catch(e){
	STORAGE=browser['storage'];
}
let textarea=document.querySelector('textarea');
let loading=document.querySelector('p.loading');
let touchesInProgress=0;
let totalExceptions=0;
let textareaLastSeen=textarea.value;
let getExceptions=async function(){
	// Get the list of exceptions from storage
	let exceptions=await STORAGE['sync']['get'](ST.exceptions);
	if(typeof(exceptions)!='object' || exceptions===null){
		return;
	}
	exceptions=exceptions[ST.exceptions];
	if(typeof(exceptions)=='object' && exceptions!==null && exceptions.length>0){
		EXCEPTIONS=exceptions;
	}
};
let saveExceptions=async function(){
	let except=textarea.value;
	if(except.length>1200){
		except.length=1200;
	}
	except=except.split('\n');
	let newList=[];
	for(let i=0,l=except.length;i<l;i++){
		let v=except[i];
		v=v.trim();
		if(v==''){
			continue;
		}
		newList.push(v);
	}
	let obj={};
	obj[ST.exceptions]=newList;
	await STORAGE['sync']['set'](obj);
	EXCEPTIONS=newList;
	totalExceptions=EXCEPTIONS.length;
	return true;
};
let start=async function(){
	
	await getExceptions();
	let textExceptions='';
	for(let i=0,l=EXCEPTIONS.length;i<l;i++){
		EXCEPTIONS[i]=EXCEPTIONS[i].trim();
		if(EXCEPTIONS[i]==''){
			EXCEPTIONS.slice(i,1);
			i--,l--;
			continue;
		}
		textExceptions+=EXCEPTIONS[i];
		textExceptions+='\n';
	}
	totalExceptions=EXCEPTIONS.length;
	textarea.value=textExceptions;
	textareaLastSeen=textExceptions;
	textarea.addEventListener('keyup',()=>{updateExceptions();},false);
	textarea.addEventListener('blur',()=>{updateExceptions(false);},false);
	loading.style.display='none';
	textarea.style.display='block';
};

let updateExceptions=async function(delay=true){
	touchesInProgress++;
	let c=touchesInProgress;
	// Provide some visual hint that it's saving...
	savingInProgress();
	
	
	if(delay){
		await waitingTime(500);
		if(c!=touchesInProgress){
			return;
		}
	}
	if(textareaLastSeen==textarea.value){
		savedNow(c);
		return;
	}
	// Store the new values in storage...
	await saveExceptions();
	textareaLastSeen=textarea.value;
	// Provide some visual hint that it saved
	savedNow(c);
};
let savingInProgress=function(){
	loading.innerText='Saving';
	loading.classList.add('dotdot')
	loading.style.display='block';
};
let savedNow=async function(c){
	let t='Saved! You have '+totalExceptions+' exception';
	if(t!=1){
		t+='s';
	}
	t+=' saved.';
	loading.innerText=t;
	loading.classList.remove('dotdot')
	loading.style.display='block';
	await waitingTime(5000);
	if(c==touchesInProgress){
		loading.style.display='none';
	}
};
let waitingTime=function(amount=1000){
	return new Promise((resolve)=>{
		setTimeout(resolve,amount);
	});
};

start();