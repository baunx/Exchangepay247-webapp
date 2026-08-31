let mode="buy";
let selectedMethod="Bank US";
let live={usd:null,eur:null};
let orderId="";
const $=id=>document.getElementById(id);

const fee=()=>Number(CONFIG.settings?.feePercent||0)/100;
const admin=()=>String(CONFIG.settings?.adminTelegram||"").replace(/^@/,"");
const support=()=>String(CONFIG.settings?.supportTelegram||admin()).replace(/^@/,"");

function format(n){return Number(n).toLocaleString(undefined,{maximumFractionDigits:8});}

function setup(){
  const send=mode==="buy"?["USD","EUR"]:["USDT"];
  const receive=mode==="buy"?["USDT"]:["USD","EUR"];
  $("sendAsset").innerHTML=send.map(x=>`<option>${x}</option>`).join("");
  $("receiveAsset").innerHTML=receive.map(x=>`<option>${x}</option>`).join("");
  $("sendLabel").textContent=mode==="buy"?"You Pay":"You Send";
  renderMethods(); update();
}

function marketRate(a,b){
  if(a==="USDT"&&b==="USD") return live.usd;
  if(a==="USD"&&b==="USDT") return live.usd?1/live.usd:null;
  if(a==="USDT"&&b==="EUR") return live.eur;
  if(a==="EUR"&&b==="USDT") return live.eur?1/live.eur:null;
  return null;
}

function calculate(){
  const a=$("sendAsset").value,b=$("receiveAsset").value,n=Number($("amount").value||0);
  const market=marketRate(a,b);
  if(!market||n<0) return null;
  const customerRate=mode==="buy"?market*(1+fee()):market*(1-fee());
  const receive=mode==="buy"?n/customerRate:n*customerRate;
  return {a,b,n,market,customerRate,receive};
}

function update(){
  const c=calculate();
  if(!c){
    $("receive").value="—"; $("marketRate").textContent="Waiting for live rate…"; $("customerRate").textContent="Waiting for live rate…"; return;
  }
  $("receive").value=format(c.receive);
  $("marketRate").textContent=`1 ${c.a} ≈ ${format(c.market)} ${c.b}`;
  $("customerRate").textContent=`1 ${c.a} ≈ ${format(c.customerRate)} ${c.b}`;
}

async function fetchLiveRate(){
  try{
    $("liveStatus").textContent="● UPDATING";
    const controller=new AbortController(); const timer=setTimeout(()=>controller.abort(),10000);
    const r=await fetch("https://api.coinbase.com/v2/exchange-rates?currency=USDT",{cache:"no-store",signal:controller.signal});
    clearTimeout(timer);
    if(!r.ok) throw Error("API "+r.status);
    const d=await r.json();
    const usd=Number(d?.data?.rates?.USD), eur=Number(d?.data?.rates?.EUR);
    if(!(usd>0)||!(eur>0)) throw Error("Invalid rate");
    live={usd,eur};
    $("liveStatus").textContent="● LIVE"; $("liveStatus").classList.add("live-ok"); update();
  }catch(e){
    console.error(e); $("liveStatus").textContent="● RATE UNAVAILABLE"; $("liveStatus").classList.remove("live-ok"); update();
  }
}

function icon(name){
  return {"Bank US":"🏦","Bank EU":"🇪🇺","Zelle":"💜","Venmo":"💳","Cash App":"💵","PayPal":"🅿️","Wise":"🌍","E-Wallet":"👛"}[name]||"💳";
}

function renderMethods(){
  const q=($("methodSearch").value||"").toLowerCase();
  const entries=Object.entries(CONFIG.paymentMethods||{}).filter(([name])=>name.toLowerCase().includes(q));
  $("availableMethods").innerHTML="";
  $("requestMethods").innerHTML="";
  for(const [name,info] of entries){
    const btn=document.createElement("button");
    btn.className="method "+(name===selectedMethod?"selected":"");
    btn.innerHTML=`<span>${icon(name)}</span><b>${name}</b><small>${info.status==="available"?"Available":"By Request"}</small>`;
    btn.onclick=()=>{
      selectedMethod=name;
      if(info.status==="request"){
        window.open(`https://t.me/${support()}`,"_blank");
        return;
      }
      renderMethods();
    };
    (info.status==="available"?$("availableMethods"):$("requestMethods")).appendChild(btn);
  }
}

function showStep(n){
  [1,2,3].forEach(i=>$("step"+i).classList.toggle("hidden",i!==n));
  [1,2,3].forEach(i=>$("s"+i).classList.toggle("active",i<=n));
  window.scrollTo({top:0,behavior:"smooth"});
}

function newOrderId(){return "EP247-"+String(Date.now()).slice(-6);}

function renderPayment(){
  const c=calculate(), info=CONFIG.paymentMethods[selectedMethod];
  if(!c||!info||info.status!=="available") return false;
  orderId=newOrderId(); $("orderBadge").textContent=orderId;
  $("paymentTitle").textContent=info.title+" Payment Details";
  $("paymentInfo").innerHTML=info.fields.map(([k,v])=>`<div class="payment-row"><span>${k}</span><strong>${v}</strong></div>`).join("");
  $("paySummary").textContent=`${format(c.n)} ${c.a}`;
  $("receiveSummary").textContent=`${format(c.receive)} ${c.b}`;
  $("methodSummary").textContent=selectedMethod;
  $("rateSummary").textContent=`1 ${c.a} ≈ ${format(c.customerRate)} ${c.b}`;
  return true;
}

function paymentText(){
  const info=CONFIG.paymentMethods[selectedMethod];
  return info.title+"\n"+info.fields.map(([k,v])=>`${k}: ${v}`).join("\n");
}

document.querySelectorAll(".mode").forEach(b=>b.onclick=()=>{
  document.querySelectorAll(".mode").forEach(x=>x.classList.remove("active"));
  b.classList.add("active"); mode=b.dataset.mode; setup();
});
$("amount").oninput=update; $("sendAsset").onchange=update; $("receiveAsset").onchange=update;
$("methodSearch").oninput=renderMethods;

$("supportButton").onclick=()=>window.open(`https://t.me/${support()}`,"_blank");

$("toPayment").onclick=()=>{
  const info=CONFIG.paymentMethods[selectedMethod];
  if(info?.status==="request") return window.open(`https://t.me/${support()}`,"_blank");
  if(!renderPayment()) return alert("Live rate is not available yet.");
  showStep(2);
};
$("toSubmit").onclick=()=>showStep(3);
$("back1").onclick=()=>showStep(1);
$("back2").onclick=()=>showStep(2);

$("copyInfo").onclick=async()=>{
  try{await navigator.clipboard.writeText(paymentText());$("copyInfo").textContent="✓ COPIED";setTimeout(()=>$("copyInfo").textContent="📋 COPY PAYMENT INFO",1500)}
  catch(e){alert(paymentText())}
};

$("submitOrder").onclick=()=>{
  if(!$("destination").value.trim()) return alert("Please enter your receiving information.");
  if(!$("telegram").value.trim()) return alert("Please enter your Telegram username.");
  if(!$("confirmCheck").checked) return alert("Please confirm your information.");
  $("successText").textContent=`Order ${orderId} has been submitted. Please send your successful payment screenshot to our admin on Telegram with this Order ID.`;
  $("success").classList.remove("hidden"); $("submitOrder").classList.add("hidden");
};

$("sendTelegram").onclick=()=>{
  const text=`Payment screenshot for Order ${orderId}\nTelegram: ${$("telegram").value.trim()}\nTransaction ID: ${$("txid").value.trim()||"N/A"}\nReceiving: ${$("destination").value.trim()}\nNetwork: ${$("network").value}`;
  window.open(`https://t.me/${admin()}?text=${encodeURIComponent(text)}`,"_blank");
};
$("newOrder").onclick=()=>location.reload();

setup(); fetchLiveRate(); setInterval(fetchLiveRate,Number(CONFIG.settings?.refreshMs||60000));
