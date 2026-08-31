let sendType="crypto", receiveType="payment";
let sendAsset="USDT", receiveMethod="Bank US";
let live={usd:null,eur:null}, orderId="";
const $=id=>document.getElementById(id);
const fee=()=>Number(CONFIG.settings?.feePercent||0)/100;
const admin=()=>String(CONFIG.settings?.adminTelegram||"").replace(/^@/,"");
const support=()=>String(CONFIG.settings?.supportTelegram||admin()).replace(/^@/,"");
const fmt=n=>Number(n).toLocaleString(undefined,{maximumFractionDigits:8});

function assetIcon(x){return ({USDT:"₮",BTC:"₿",ETH:"Ξ"})[x]||"●"}
function methodIcon(x){return ({"Bank US":"🏦","Bank EU":"🇪🇺","Zelle":"💜","Venmo":"💳","Cash App":"💵","PayPal":"🅿️","Wise":"🌍","E-Wallet":"👛"})[x]||"💳"}

function getItems(type){
 if(type==="crypto") return Object.entries(CONFIG.crypto||{}).map(([id,v])=>({id,name:v.name||id,sub:(v.networks||[]).join(" • "),icon:assetIcon(id),type}));
 return Object.entries(CONFIG.paymentMethods||{}).map(([id,v])=>({id,name:id,sub:v.status==="available"?`${v.currency||""} • Available`:`${v.currency||""} • By Request`,icon:methodIcon(id),type}));
}

function renderChoice(){
 const isCrypto=sendType==="crypto";
 const s=CONFIG.crypto?.[sendAsset]||{};
 const p=CONFIG.paymentMethods?.[receiveMethod]||{};
 $("sendIcon").textContent=assetIcon(sendAsset);
 $("sendName").textContent=sendAsset;
 $("sendSub").textContent=s.name||sendAsset;
 $("receiveIcon").textContent=methodIcon(receiveMethod);
 $("receiveName").textContent=receiveMethod;
 $("receiveSub").textContent=p.status==="available"?`${p.currency||""} • Available`:`${p.currency||""} • By Request`;
 $("amountUnit").textContent=isCrypto?sendAsset:(p.currency||"USD");
 renderNetwork();
 update();
}

function openPicker(type){
 const items=getItems(type);
 $("pickerTitle").textContent=type==="crypto"?"Select Crypto":"Select Payment Method";
 $("pickerList").innerHTML="";
 items.forEach(x=>{
   const b=document.createElement("button"); b.className="picker-item";
   b.innerHTML=`<span class="asset-icon">${x.icon}</span><span class="select-content"><b>${x.name}</b><small>${x.sub}</small></span><span>›</span>`;
   b.onclick=()=>{
     if(type==="crypto"){sendType="crypto";sendAsset=x.id;if(receiveType==="crypto")receiveType="payment";}
     else {receiveType="payment";receiveMethod=x.id;if(sendType==="payment")sendType="crypto";}
     closePicker();renderChoice();
   };
   $("pickerList").appendChild(b);
 });
 $("picker").classList.remove("hidden");
}
function closePicker(){$("picker").classList.add("hidden")}
$("sendPicker").onclick=()=>openPicker("crypto");
$("receivePicker").onclick=()=>openPicker("payment");
$("closePicker").onclick=closePicker;

function marketRate(){
 const target=CONFIG.paymentMethods?.[receiveMethod]?.currency;
 if(sendAsset==="USDT"&&target==="USD") return live.usd;
 if(sendAsset==="USDT"&&target==="EUR") return live.eur;
 if(sendAsset==="BTC"||sendAsset==="ETH") return null;
 return null;
}
function calculate(){
 const n=Number($("amount").value||0), market=marketRate();
 if(!market||n<=0)return null;
 const rate=market*(1+fee());
 return {n,market,rate,receive:n*rate};
}
function update(){
 const c=calculate();
 if(!c){$("receive").textContent="—";$("marketRate").textContent="Waiting for live rate…";$("customerRate").textContent="Waiting for live rate…";return}
 $("receive").textContent=`${fmt(c.receive)} ${CONFIG.paymentMethods[receiveMethod]?.currency||"USD"}`;
 $("marketRate").textContent=`1 ${sendAsset} ≈ ${fmt(c.market)} ${CONFIG.paymentMethods[receiveMethod]?.currency||"USD"}`;
 $("customerRate").textContent=`1 ${sendAsset} ≈ ${fmt(c.rate)} ${CONFIG.paymentMethods[receiveMethod]?.currency||"USD"}`;
}
function renderNetwork(){
 const nets=CONFIG.crypto?.[sendAsset]?.networks||[];
 $("network").innerHTML=(nets.length?nets:["Not applicable"]).map(x=>`<option>${x}</option>`).join("");
}
async function fetchLiveRate(){
 try{
  $("liveStatus").textContent="● UPDATING";
  const r=await fetch("https://api.coinbase.com/v2/exchange-rates?currency=USDT",{cache:"no-store"});
  if(!r.ok)throw Error();
  const d=await r.json(); const usd=Number(d?.data?.rates?.USD),eur=Number(d?.data?.rates?.EUR);
  if(!(usd>0)||!(eur>0))throw Error();
  live={usd,eur};$("liveStatus").textContent="● LIVE";$("liveStatus").classList.add("live-ok");update();
 }catch(e){$("liveStatus").textContent="● RATE UNAVAILABLE";$("liveStatus").classList.remove("live-ok")}
}
function showStep(n){[1,2,3].forEach(i=>$("step"+i).classList.toggle("hidden",i!==n));[1,2,3].forEach(i=>$("s"+i).classList.toggle("active",i<=n));scrollTo({top:0,behavior:"smooth"})}
function newOrderId(){return "EP247-"+String(Date.now()).slice(-6)}
function renderPayment(){
 const c=calculate(),info=CONFIG.paymentMethods?.[receiveMethod];
 if(!c||!info||info.status!=="available")return false;
 orderId=newOrderId();$("orderBadge").textContent=orderId;$("paymentTitle").textContent=info.title+" Payment Details";
 $("paymentInfo").innerHTML=info.fields.map(([k,v])=>`<div class="payment-row"><span>${k}</span><strong>${v}</strong></div>`).join("");
 $("paySummary").textContent=`${fmt(c.n)} ${sendAsset}`;$("receiveSummary").textContent=`${fmt(c.receive)} ${info.currency||"USD"}`;
 $("methodSummary").textContent=receiveMethod;$("rateSummary").textContent=`1 ${sendAsset} ≈ ${fmt(c.rate)} ${info.currency||"USD"}`;return true;
}
function paymentText(){const i=CONFIG.paymentMethods[receiveMethod];return i.title+"\n"+i.fields.map(([k,v])=>`${k}: ${v}`).join("\n")}
$("amount").oninput=update;
$("toPayment").onclick=()=>{const p=CONFIG.paymentMethods?.[receiveMethod];if(p?.status==="request")return window.open(`https://t.me/${support()}`,"_blank");if(!renderPayment())return alert("Live rate is not available for this pair yet.");showStep(2)};
$("toSubmit").onclick=()=>showStep(3);$("back1").onclick=()=>showStep(1);$("back2").onclick=()=>showStep(2);
$("copyInfo").onclick=async()=>{try{await navigator.clipboard.writeText(paymentText());$("copyInfo").textContent="✓ COPIED";setTimeout(()=>$("copyInfo").textContent="📋 COPY PAYMENT INFO",1500)}catch(e){alert(paymentText())}};
$("submitOrder").onclick=()=>{if(!$("destination").value.trim())return alert("Please enter your receiving information.");if(!$("telegram").value.trim())return alert("Please enter your Telegram username.");if(!$("confirmCheck").checked)return alert("Please confirm your information.");$("successText").textContent=`Order ${orderId} has been submitted. Please send your successful payment screenshot to our admin on Telegram with this Order ID.`;$("success").classList.remove("hidden");$("submitOrder").classList.add("hidden")};
$("sendTelegram").onclick=()=>{const text=`Payment screenshot for Order ${orderId}\nTelegram: ${$("telegram").value.trim()}\nTransaction ID: ${$("txid").value.trim()||"N/A"}\nReceiving: ${$("destination").value.trim()}\nNetwork: ${$("network").value}`;window.open(`https://t.me/${admin()}?text=${encodeURIComponent(text)}`,"_blank")};
$("newOrder").onclick=()=>location.reload();

renderChoice();fetchLiveRate();setInterval(fetchLiveRate,Number(CONFIG.settings?.refreshMs||60000));
