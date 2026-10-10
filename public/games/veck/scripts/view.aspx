
(function(w,pid,pindex,zone,res){
    var x='cpmsx';var y=w.location.href.split('#')[0].split('').reduce(function(a,b){return(a<<5)-a+b.charCodeAt(0)>>>1},0);y=(10+((y*7)%26)).toString(36)+y.toString(36);    
    w[x]=w[y]=w[x]||w[y]||{};(w[y].libcmd=w[y].libcmd||[]).push({kind:'asynctagcb',pid:pid,zone:zone,pindex:pindex,res:res});
})(window,88824,0,{zonefile:'1137_54105_gameapi',dev:false,staging:false,prod:true},null);