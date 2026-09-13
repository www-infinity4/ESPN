(function(){
  "use strict";

  const games=window.ESPN_FULL_GAMES||[];
  const highlights=window.ESPN_HIGHLIGHTS||[];
  const dayPlan=window.ESPN_DAY_PLAN||[{type:"game",hours:3}];
  const rules=window.ESPN_SEASON_RULES||{highlightSegmentSeconds:600,fullGameBlockHours:3};
  const $=id=>document.getElementById(id);
  const els={
    clock:$("clock"),title:$("nowTitle"),meta:$("nowMeta"),slot:$("slotTime"),enter:$("enter"),
    card:$("stationCard"),cardTitle:$("stationCardTitle"),cardText:$("stationCardText"),guide:$("guideRows"),
    next:$("nextCards"),progress:$("progressBar"),position:$("positionLabel"),remaining:$("remainingLabel"),
    startOver:$("startOver"),rewind:$("rewind"),live:$("joinLive"),share:$("share"),shareStatus:$("shareStatus"),
    source:$("sourceLink"),season:$("seasonLabel"),highlightList:$("highlightList")
  };

  let player=null,ready=false,entered=false,mode="live",shiftBase=0,shiftStarted=0,loadedKey="",schedule=[],scheduleDay="";
  const failed=new Set();

  function hash(text){let h=2166136261;for(let i=0;i<text.length;i++)h=Math.imul(h^text.charCodeAt(i),16777619);return h>>>0;}
  function shuffle(list,seedText){let seed=hash(seedText),a=list.slice();const rnd=()=>{seed+=0x6D2B79F5;let t=seed;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
  function dateKey(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}
  function midnight(d=new Date()){return new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime();}
  function weekKey(d=new Date()){const x=new Date(d.getFullYear(),d.getMonth(),d.getDate());const day=(x.getDay()+6)%7;x.setDate(x.getDate()-day);return dateKey(x);}
  function formatTime(ms){return new Intl.DateTimeFormat("en-US",{hour:"numeric",minute:"2-digit"}).format(new Date(ms));}
  function fmt(sec){sec=Math.max(0,Math.floor(sec));const h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60);return h?`${h}h ${String(m).padStart(2,"0")}m`:`${m}m`;}
  function clockMs(){return mode==="live"?Date.now():shiftBase+(Date.now()-shiftStarted);}
  function thumbnail(item){const id=item&&item.videoId;return id?`https://i.ytimg.com/vi/${id}/hqdefault.jpg`:"";}
  function slotThumb(slot){if(slot.type==="highlights")return thumbnail(highlights[0]);return thumbnail(slot.game);}
  function seasonName(){const m=new Date().getMonth()+1;if((rules.footballMonths||[]).includes(m))return "FOOTBALL SEASON · NFL + PRO SPORTS";if((rules.basketballMonths||[]).includes(m))return "BASKETBALL SEASON · NBA + PRO SPORTS";if((rules.hockeyMonths||[]).includes(m))return "HOCKEY SEASON · NHL + PRO SPORTS";if((rules.baseballMonths||[]).includes(m))return "BASEBALL SEASON · MLB + PRO SPORTS";return "PRO SPORTS VAULT";}

  function chooseDay(now=new Date()){
    const key=dateKey(now);if(key===scheduleDay&&schedule.length)return;
    scheduleDay=key;
    const start=midnight(now),wk=weekKey(now),weekStart=new Date(wk+"T00:00:00").getTime();
    const dayIndex=Math.floor((start-weekStart)/86400000);
    const gameSlots=dayPlan.filter(x=>x.type==="game").length;
    const ordered=shuffle(games,`ESPN-${wk}-weekly-v1`);
    const rotateBy=ordered.length?(dayIndex*gameSlots)%ordered.length:0;
    const rotated=ordered.slice(rotateBy).concat(ordered.slice(0,rotateBy));
    const picked=[];
    for(let i=0;i<gameSlots;i++){
      let pick=rotated.find(g=>!picked.includes(g)&&(!picked.length||!(g.teams||[]).some(t=>(picked[picked.length-1].teams||[]).includes(t))));
      if(!pick)pick=rotated.find(g=>!picked.includes(g))||rotated[i%Math.max(1,rotated.length)];
      if(pick)picked.push(pick);
    }
    let cursor=start,gameIndex=0;
    schedule=dayPlan.map((plan,index)=>{
      const duration=(Number(plan.hours)||1)*3600000;
      const slot={id:`${key}-${index}`,type:plan.type||"game",label:plan.label||"",start:cursor,end:cursor+duration};
      cursor+=duration;
      if(slot.type==="game")slot.game=picked[gameIndex++]||games[gameIndex%Math.max(1,games.length)];
      return slot;
    });
    renderGuide();renderNext();
  }

  function stateAt(ms){chooseDay(new Date(ms));let slot=schedule.find(s=>ms>=s.start&&ms<s.end);if(!slot)slot=schedule[0];if(!slot)return null;return {slot,elapsed:Math.max(0,(ms-slot.start)/1000),remaining:Math.max(0,(slot.end-ms)/1000),duration:Math.max(1,(slot.end-slot.start)/1000)};}
  function highlightAt(st){
    if(!highlights.length)return null;
    const segment=Math.max(60,Number(rules.highlightSegmentSeconds)||600);
    const idx=Math.floor(st.elapsed/segment)%highlights.length;
    const item=highlights[idx];
    return {item,offset:Math.floor(st.elapsed%segment),segment,key:`${st.slot.id}-hl-${idx}`};
  }

  function slotLabel(slot){return slot.type==="highlights"?(slot.label||"ESPN Highlights Mix"):slot.game?slot.game.title:"Sports window";}
  function slotMeta(slot){return slot.type==="highlights"?"Rotating pro-sports highlights · 1-hour block":`${slot.game.league} · ${slot.game.source} · full-game window`;}
  function renderGuide(){
    if(!schedule.length){els.guide.innerHTML='<p class="empty">No sports sources loaded.</p>';return;}
    els.guide.innerHTML=schedule.map(s=>`<article class="guide-row ${s.type==="highlights"?"highlight-window":""}" data-id="${s.id}" style="--thumb:url('${slotThumb(s)}')"><time>${formatTime(s.start)}</time><div><strong>${slotLabel(s)}</strong><span>${slotMeta(s)}</span></div></article>`).join("");
  }
  function renderNext(current){
    if(!schedule.length)return;const idx=current?schedule.findIndex(s=>s.id===current.id):-1;let list=idx>=0?schedule.slice(idx+1):schedule;
    if(list.length<3)list=list.concat(schedule.slice(0,3-list.length));
    list=list.slice(0,3);
    els.next.innerHTML=list.map(s=>`<article class="next-card ${s.type==="highlights"?"highlight-window":""}" style="--thumb:url('${slotThumb(s)}')"><time>${formatTime(s.start)}</time><strong>${slotLabel(s)}</strong><small>${s.type==="highlights"?"ESPN HIGHLIGHTS":s.game.league}</small></article>`).join("");
  }
  function renderHighlights(){
    if(!els.highlightList)return;
    els.highlightList.innerHTML=highlights.map(h=>`<article><img src="https://i.ytimg.com/vi/${h.videoId}/mqdefault.jpg" alt=""><div><strong>${h.title}</strong><small>${h.league} · ${h.source}</small></div></article>`).join("");
  }
  function showCard(title,text){els.card.hidden=false;els.cardTitle.textContent=title;els.cardText.textContent=text;}
  function hideCard(){els.card.hidden=true;}

  function loadHighlight(st,fallback){
    const h=highlightAt(st);if(!h){showCard("ESPN","No highlight sources are loaded.");return;}
    hideCard();
    const key=`${fallback?"fallback-":""}${h.key}`;
    if(loadedKey!==key){loadedKey=key;player.loadVideoById({videoId:h.item.videoId,startSeconds:h.offset});}
  }

  function loadState(st){
    if(!entered||!ready||!st)return;
    if(st.slot.type==="highlights"){loadHighlight(st,false);return;}
    const game=st.slot.game;if(!game)return;
    if(failed.has(game.videoId)){loadHighlight(st,true);return;}
    hideCard();
    const key=`${st.slot.id}:${game.videoId}`;
    if(loadedKey!==key){loadedKey=key;player.loadVideoById({videoId:game.videoId,startSeconds:Math.max(0,Math.floor(st.elapsed))});return;}
    if(mode==="live"&&window.YT&&player.getPlayerState()===YT.PlayerState.PLAYING){const drift=st.elapsed-player.getCurrentTime();if(Math.abs(drift)>4)player.seekTo(st.elapsed,true);}
  }

  function tick(){
    const now=clockMs();chooseDay(new Date(now));const st=stateAt(now);els.clock.textContent=`${formatTime(Date.now())} local`;els.season.textContent=seasonName();if(!st)return;
    let title,meta,sourceVideo;
    if(st.slot.type==="highlights"){
      const h=highlightAt(st);title=h?h.item.title:(st.slot.label||"ESPN Highlights Mix");meta=h?`${st.slot.label||"Highlights"} · ${h.item.league} · ${h.item.source}`:"ESPN Highlights Mix";sourceVideo=h&&h.item.videoId;
    }else{
      title=st.slot.game.title;meta=`${st.slot.game.league} · ${st.slot.game.source} · full-game window`;sourceVideo=st.slot.game.videoId;
    }
    els.title.textContent=title;els.meta.textContent=meta;els.slot.textContent=`${formatTime(st.slot.start)}–${formatTime(st.slot.end)}`;
    els.position.textContent=mode==="live"?"Synced to ESPN live schedule":`Time shifted · ${fmt(st.elapsed)}`;
    els.remaining.textContent=`${fmt(st.remaining)} until next program`;els.progress.style.width=`${Math.min(100,(st.elapsed/st.duration)*100)}%`;
    if(sourceVideo)els.source.href=`https://www.youtube.com/watch?v=${sourceVideo}`;
    const hero=st.slot.type==="highlights"?(highlightAt(st)||{}).item:st.slot.game;document.body.style.setProperty("--hero",`url('${thumbnail(hero)}')`);
    document.querySelectorAll(".guide-row").forEach(r=>r.classList.toggle("current",r.dataset.id===st.slot.id));renderNext(st.slot);loadState(st);
  }

  function enter(){entered=true;els.enter.hidden=true;if(window.YT&&YT.Player)return initPlayer();const s=document.createElement("script");s.src="https://www.youtube.com/iframe_api";document.head.appendChild(s);}
  function initPlayer(){
    if(player)return;
    player=new YT.Player("player",{width:"100%",height:"100%",playerVars:{playsinline:1,controls:1,enablejsapi:1,rel:0,modestbranding:1,origin:location.origin},events:{
      onReady:e=>{ready=true;try{e.target.getIframe().setAttribute("allow","autoplay; encrypted-media; picture-in-picture; fullscreen");}catch(_){}e.target.unMute();e.target.setVolume(100);tick();},
      onError:()=>{const st=stateAt(clockMs());if(st&&st.slot&&st.slot.type==="game"&&st.slot.game)failed.add(st.slot.game.videoId);loadedKey="";setTimeout(tick,120);},
      onStateChange:e=>{if(e.data===YT.PlayerState.ENDED){const st=stateAt(clockMs());loadedKey="";if(st&&st.slot.type==="game"&&st.slot.game)failed.add(st.slot.game.videoId);tick();}}
    }});
  }
  window.onYouTubeIframeAPIReady=initPlayer;

  function startOver(){const live=stateAt(Date.now());if(!live)return;mode="shift";shiftBase=live.slot.start;shiftStarted=Date.now();loadedKey="";tick();}
  function rewind(){mode="shift";shiftBase=clockMs()-30000;shiftStarted=Date.now();loadedKey="";scheduleDay="";tick();}
  function joinLive(){mode="live";loadedKey="";scheduleDay="";tick();}
  function creditShare(){const key="infinity_channel_share_progress_v1";let n=0;try{n=Number(localStorage.getItem(key))||0;}catch(_){}n++;const awarded=n>=10;if(awarded)n=0;try{localStorage.setItem(key,String(n));}catch(_){}try{window.dispatchEvent(new CustomEvent("infinity:share-credit",{detail:{channel:"ESPN",progress:n,awarded}}));}catch(_){}return{n,awarded};}
  async function share(){
    const st=stateAt(clockMs()),title=st?slotLabel(st.slot):"ESPN";
    try{
      if(navigator.share){await navigator.share({title:`${title} · ESPN`,text:`Watch ${title} on ESPN.`,url:location.href});const r=creditShare();els.shareStatus.textContent=r.awarded?"Shared · 1 StarCoin completed!":`Shared · StarCoin progress ${r.n}/10`;}
      else{await navigator.clipboard.writeText(location.href);els.shareStatus.textContent="ESPN link copied.";}
    }catch(e){if(!e||e.name!=="AbortError")els.shareStatus.textContent="Share did not complete.";}
  }

  els.enter.addEventListener("click",enter);els.startOver.addEventListener("click",startOver);els.rewind.addEventListener("click",rewind);els.live.addEventListener("click",joinLive);els.share.addEventListener("click",share);
  renderHighlights();chooseDay(new Date());tick();setInterval(tick,1000);
})();
