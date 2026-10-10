
(function(zonevars) {
	
	var zonemasters = zonevars.zonemasters;
	var top_loc=null,top_href="",top_hash="";
	function getQueryHash() {
		top_hash = (top_hash=top_href.match(/[\?\&]cpmstarhash=([^\&\#]*)/))==null?"":"#"+top_hash[1];		
	}
	try { top_loc=window.top.location; top_href=top_loc.href; top_hash=top_loc.hash; } catch(err) {
		var top_win = window;
		try { while (top_win.parent && top_win.parent.document !== top_win.document && top_win.parent.document.location.href) { top_win = top_win.parent; } } catch(e) {}		
		try { top_loc = top_win.location; top_href = top_loc.href; } catch(e) {}
		getQueryHash();
	}
	if(!top_hash) getQueryHash();
	try { 
		if (typeof(Storage) && !top_hash) {
			top_hash = localStorage.getItem('cpmstarhash');
		}
	} catch(e) {
		console.log("There was an error trying to detemine the debug state: ", e);
	}

    var x=(10+((x*7)%26)).toString(36)+(x=window.location.href.split('').reduce(function(a,b){return(a<<5)-a+b.charCodeAt(0)>>>1},0));
	var y=window.location.href.split('').reduce(function(a,b){return(a<<5)-a+b.charCodeAt(0)>>>1},0);y=(10+((y*7)%26)).toString(36)+y.toString(36);
	var z=window.location.href.split('').reduce(function(a,b){return(a<<5)-a+b.charCodeAt(0)>>>0},0);z=(10+((z*7)%26)).toString(36)+z.toString(36);
	var q=window.location.href.split('#')[0].split('').reduce(function(a,b){return(a<<5)-a+b.charCodeAt(0)>>>1},0);q=(10+((q*7)%26)).toString(36)+q.toString(36);
	var cpmstarx="cpmstarx";
	if(window[x]) window[y] = window[x];
	if(window[y]) window[z] = window[y];
	if(window[z]) window[q] = window[z];
	if(window[q]) window[cpmstarx] = window[q];
    
    var dev = top_hash == "#cpmstarDev";
	var staging = (top_hash == "#cpmstarStaging" || top_hash == "#urlzing");
	if(typeof window[cpmstarx]!=="object") window[x] = window[y] = window[z] = window[q] = window[cpmstarx] = {};
	
	if(typeof(window[cpmstarx].zonevars)==="object") return;
	window[cpmstarx].zonevars = zonevars;

	var ver = "1409";
	window[cpmstarx].zonevars.ver = ver;


	if(top_hash == "#urlzing") {
		var qs = new URLSearchParams(window.location.search);
		if(qs.has('cpmstarDev')) {
			dev = true;
		}
	}

	for(var i=0; i<zonemasters.length; i++) { //Insert all the zonemasters
		var zonemasterobj = (typeof zonemasters[i]==="string")?{path:'/cached/zonemasters/'+zonemasters[i]}:zonemasters[i];

		var s = document.createElement('script'); 
		s.type = 'text/javascript'; 
		s.async = true;
		
		var proto = (window.location.protocol == "http:")?"http:":"https:";
		if(zonemasterobj.host == null) {            
			if(dev) zonemasterobj.host = "dev.server.cpmstar.com";
			else if(staging) zonemasterobj.host = "staging.server.cpmstar.com";
			else if(proto == "https:") zonemasterobj.host = "ssl.cdne.cpmstar.com";
			else zonemasterobj.host = "cdn.cpmstar.com";
		}else{
			if(staging) {
				if(zonevars.jbcheck) zonevars.jbcheck.host = "staging.urlzing.com";				
				zonemasterobj.host = "staging.urlzing.com"; 				
			}
		}
		
		s.src = proto + "//" + zonemasterobj.host + zonemasterobj.path + "?ver="+ver;
		var s2=document.getElementsByTagName('script')[0];
		s2.parentNode.insertBefore(s, s2);
	}
})(
{
  "zonemasters": [
    "mobilemodules.js",
    {
      "path": "/cached/zonemasters/cpmstarjsgameapi.js",
      "api": "game"
    }
  ],
  "requests": {
    "hb": {
      "kind": "hb",
      "pbjsfile": "starprebid.js",
      "PREBID_TIMEOUT": 850,
      "adUnits": [
        {
          "bids": [
            {
              "bidder": "rubicon",
              "params": {
                "accountId": "23330",
                "siteId": "549412",
                "zoneId": "3423928"
              },
              "campaignid": "494743",
              "campaignids": {},
              "filters": [
                {
                  "type": "Country",
                  "data": "Northern Mariana Islands",
                  "exclude": false
                },
                {
                  "type": "Impressions",
                  "data": "",
                  "exclude": true
                }
              ]
            }
          ],
          "mediaTypes": {
            "banner": {
              "sizes": [
                [
                  728,
                  90
                ]
              ]
            }
          },
          "fallback": {
            "poolid": 88823,
            "width": 728,
            "height": 90
          },
          "minBid": 0,
          "floors": {
            "currency": "USD",
            "schema": {
              "fields": [
                "mediaType"
              ]
            },
            "values": {
              "banner": 0
            }
          },
          "code": "/Legion_Platforms_[Kour.io]/$88823",
          "gamFilters": [
            {
              "type": "Country",
              "data": "WORLDWIDE",
              "exclude": true
            },
            {
              "type": "Param",
              "data": "gampb=1",
              "exclude": true
            },
            {
              "type": "Param",
              "data": "json=c_o",
              "exclude": true
            }
          ],
          "gamAdUnitCode": "23317370125",
          "gamCampaignid": 510811,
          "gamPageUrl": "kour.io",
          "gamDiscrep": 1,
          "gamDiscrepGross": 0.01,
          "gamDiscrepLocalGross": 0.01
        },
        {
          "bids": [
            {
              "bidder": "unruly",
              "params": {
                "siteId": 203384
              },
              "campaignid": 466076,
              "campaignids": {
                "300x250": 466076
              },
              "filters": [
                {
                  "type": "Country",
                  "data": "Northern Mariana Islands",
                  "exclude": false
                },
                {
                  "type": "Impressions",
                  "data": "",
                  "exclude": true
                }
              ]
            },
            {
              "bidder": "rubicon",
              "params": {
                "accountId": "23330",
                "siteId": "549412",
                "zoneId": "3423928"
              },
              "campaignid": "494743",
              "campaignids": {},
              "filters": [
                {
                  "type": "Country",
                  "data": "Northern Mariana Islands",
                  "exclude": false
                },
                {
                  "type": "Impressions",
                  "data": "",
                  "exclude": true
                }
              ]
            }
          ],
          "mediaTypes": {
            "banner": {
              "sizes": [
                [
                  300,
                  250
                ]
              ]
            }
          },
          "fallback": {
            "poolid": 88824,
            "width": 300,
            "height": 250
          },
          "minBid": 0,
          "floors": {
            "currency": "USD",
            "schema": {
              "fields": [
                "mediaType"
              ]
            },
            "values": {
              "banner": 0
            }
          },
          "code": "/Legion_Platforms_[Kour.io]/$88824",
          "gamFilters": [
            {
              "type": "Country",
              "data": "WORLDWIDE",
              "exclude": true
            },
            {
              "type": "Param",
              "data": "gampb=1",
              "exclude": true
            },
            {
              "type": "Param",
              "data": "json=c_o",
              "exclude": true
            }
          ],
          "gamAdUnitCode": "23316638265",
          "gamCampaignid": 510809,
          "gamPageUrl": "kour.io",
          "gamDiscrep": 1,
          "gamDiscrepGross": 0.01,
          "gamDiscrepLocalGross": 0.01
        },
        {
          "bids": [
            {
              "bidder": "rubicon",
              "params": {
                "accountId": "23330",
                "siteId": "549412",
                "zoneId": "3423928"
              },
              "campaignid": "494743",
              "campaignids": {},
              "filters": [
                {
                  "type": "Country",
                  "data": "Northern Mariana Islands",
                  "exclude": false
                },
                {
                  "type": "Impressions",
                  "data": "",
                  "exclude": true
                }
              ]
            }
          ],
          "mediaTypes": {
            "banner": {
              "sizes": [
                [
                  300,
                  600
                ]
              ]
            }
          },
          "fallback": {
            "poolid": 88827,
            "width": 300,
            "height": 600
          },
          "minBid": 0,
          "floors": {
            "currency": "USD",
            "schema": {
              "fields": [
                "mediaType"
              ]
            },
            "values": {
              "banner": 0
            }
          },
          "code": "/Legion_Platforms_[Kour.io]/$88827",
          "gamFilters": [
            {
              "type": "Country",
              "data": "WORLDWIDE",
              "exclude": true
            },
            {
              "type": "Param",
              "data": "gampb=1",
              "exclude": true
            },
            {
              "type": "Param",
              "data": "json=c_o",
              "exclude": true
            }
          ],
          "gamAdUnitCode": "23317369336",
          "gamCampaignid": 510810,
          "gamPageUrl": "kour.io",
          "gamDiscrep": 1,
          "gamDiscrepGross": 0.01,
          "gamDiscrepLocalGross": 0.01
        },
        {
          "bids": [
            {
              "bidder": "unruly",
              "params": {
                "siteId": 203384
              },
              "campaignid": 462998,
              "campaignids": {},
              "filters": [
                {
                  "type": "Country",
                  "data": "Italy",
                  "exclude": false
                },
                {
                  "type": "Country",
                  "data": "Northern Mariana Islands",
                  "exclude": false
                },
                {
                  "type": "Impressions",
                  "data": "",
                  "exclude": true
                }
              ]
            },
            {
              "bidder": "unruly",
              "params": {
                "siteId": 203384
              },
              "campaignid": 466076,
              "campaignids": {
                "300x250": 466076
              },
              "filters": [
                {
                  "type": "Country",
                  "data": "Northern Mariana Islands",
                  "exclude": false
                },
                {
                  "type": "Impressions",
                  "data": "",
                  "exclude": true
                }
              ]
            },
            {
              "bidder": "rubicon",
              "params": {
                "accountId": "23330",
                "siteId": "549412",
                "zoneId": "3423928",
                "sizes": [
                  201
                ],
                "video": {
                  "language": "en",
                  "minduration": 0,
                  "maxduration": 30,
                  "protocols": [
                    2,
                    3,
                    5,
                    6
                  ],
                  "startdelay": 0,
                  "mimes": [
                    "video/mp4",
                    "application/javascript"
                  ],
                  "linearity": 1,
                  "api": [
                    1,
                    2
                  ],
                  "boxingallowed": 1,
                  "pos": 1
                }
              },
              "campaignid": "494744",
              "campaignids": {},
              "filters": [
                {
                  "type": "Country",
                  "data": "Northern Mariana Islands",
                  "exclude": false
                },
                {
                  "type": "Impressions",
                  "data": "",
                  "exclude": true
                }
              ]
            },
            {
              "bidder": "openx",
              "params": {
                "delDomain": "cpmstar-d.openx.net",
                "unit": "56087316",
                "video": {
                  "mimes": [
                    "application/javascript",
                    "video/mp4"
                  ]
                }
              },
              "campaignid": 497519,
              "campaignids": {},
              "filters": [
                {
                  "type": "Country",
                  "data": "Northern Mariana Islands",
                  "exclude": false
                },
                {
                  "type": "Impressions",
                  "data": "",
                  "exclude": true
                }
              ]
            }
          ],
          "mediaTypes": {
            "video": {
              "placement": 1,
              "playerSize": [
                960,
                540
              ],
              "w": 960,
              "h": 540,
              "context": "instream",
              "pos": 1,
              "api": [
                1,
                2
              ],
              "protocols": [
                2,
                3,
                5,
                6
              ],
              "mimes": [
                "video/mp4",
                "application/json"
              ],
              "minduration": 0,
              "maxduration": 30,
              "linearity": 1
            }
          },
          "fallback": {
            "kind": "video",
            "poolid": 88831,
            "vast": true
          },
          "minBid": 0,
          "floors": {
            "currency": "USD",
            "schema": {
              "fields": [
                "mediaType"
              ]
            },
            "values": {
              "video": 0
            }
          },
          "code": "instream",
          "gamPageUrl": "kour.io"
        },
        {
          "bids": [],
          "mediaTypes": {
            "banner": {
              "sizes": [
                [
                  728,
                  90
                ],
                [
                  800,
                  100
                ],
                [
                  970,
                  90
                ],
                [
                  320,
                  50
                ],
                [
                  300,
                  50
                ],
                [
                  216,
                  36
                ]
              ]
            }
          },
          "fallback": {
            "poolid": 88832
          },
          "minBid": 0,
          "floors": {
            "currency": "USD",
            "schema": {
              "fields": [
                "mediaType"
              ]
            },
            "values": {
              "banner": 0
            }
          },
          "code": "anchor"
        }
      ],
      "PBJS_TIMEOUT": 3000,
      "publisherid": 54105,
      "bidderDiscreps": {
        "rubicon": {
          "tagperadunit": false,
          "totalgross": 434.65156,
          "totallocalgross": 441.4290522176516,
          "discrep": 0.9846464744819065
        },
        "google": {
          "tagperadunit": true,
          "totalgross": 0.03,
          "totallocalgross": 0.03,
          "discrep": 1
        },
        "unruly": {
          "tagperadunit": false,
          "totalgross": 0.03,
          "totallocalgross": 0.03,
          "discrep": 1
        },
        "openx": {
          "tagperadunit": true,
          "totalgross": 0.01,
          "totallocalgross": 0.01,
          "discrep": 1
        }
      }
    },
    "instream": {
      "kind": "json",
      "vast": true,
      "poolid": 88831
    },
    "anchor": {
      "kind": "banner",
      "poolid": 88832
    },
    "pageviews": {
      "poolid": 88833
    }
  },
  "modules": [
    {
      "kind": "banner",
      "info": {
        "name": "POOL 88823"
      },
      "conditions": {
        "target": {
          "kind": "replace",
          "find": "$88823"
        }
      },
      "options": {
        "maxHeight": 90
      },
      "request": "hb",
      "adUnitPath": "/Legion_Platforms_[Kour.io]/$88823"
    },
    {
      "kind": "banner",
      "info": {
        "name": "POOL 88824"
      },
      "conditions": {
        "target": {
          "kind": "replace",
          "find": "$88824"
        }
      },
      "options": {
        "maxHeight": 250
      },
      "request": "hb",
      "adUnitPath": "/Legion_Platforms_[Kour.io]/$88824"
    },
    {
      "kind": "banner",
      "info": {
        "name": "POOL 88827"
      },
      "conditions": {
        "target": {
          "kind": "replace",
          "find": "$88827"
        }
      },
      "options": {
        "maxHeight": 600
      },
      "request": "hb",
      "adUnitPath": "/Legion_Platforms_[Kour.io]/$88827"
    },
    {
      "kind": "anchor",
      "info": {
        "name": "anchor"
      },
      "conditions": {
        "target": {
          "kind": "replace",
          "find": "$88832"
        },
        "wait": true
      },
      "options": {
        "maxHeight": 100
      },
      "request": "hb",
      "adUnitPath": "anchor"
    },
    {
      "info": {
        "name": "preroll"
      },
      "blueprint": "instreamvideo",
      "request": "hb",
      "adUnitPath": "instream",
      "options": {
        "requireViewable": false,
        "autoSizeToTarget": true
      },
      "conditions": {
        "wait": true
      },
      "css": {
        ".cpmsvideoclosebanner:after": {
          "content": "'Start Game'"
        }
      }
    },
    {
      "info": {
        "name": "interstitial"
      },
      "blueprint": "instreamvideo"
    },
    {
      "info": {
        "name": "rewardedvideo"
      },
      "blueprint": "instreamvideo",
      "adUnitPath": "instream",
      "options": {
        "autoSkippability": false
      }
    }
  ],
  "options": {
    "referrerRevshare": 1
  },
  "info": {
    "id": 1137,
    "tags": [],
    "zonepools": {
      "88823": {
        "module": "POOL 88823"
      },
      "88824": {
        "module": "POOL 88824"
      },
      "88827": {
        "module": "POOL 88827"
      },
      "88831": {
        "module": "rewardedvideo"
      },
      "88832": {
        "module": "anchor"
      }
    }
  }
}
);