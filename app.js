let sendAsset="USDT", receiveMethod="Bank US", pickerType="";
let live={usd:null,eur:null}, orderId="";
const $=id=>document.getElementById(id);
const cfg=()=>window.CONFIG||{};
const settings=()=>cfg().settings||cfg();
const payments=()=>cfg().paymentMethods||cfg().payment||{};
const cryptos=()=>cfg().crypto||{};
const admin=()=>String(settings().adminTelegram||"").replace(/^@/,"");
const support=()=>String(settings().supportTelegram||admin()).replace(/^@/,"");
const fee=()=>Number(settings().feePercent||0)/100;
const fmt=n=>Number(n).toLocaleString(undefined,{maximumFractionDigits:8});

function iconAsset(x){return ({USDT:"₮",BTC:"₿",ETH:"Ξ",USDC:"$",SOL:"◎"})[x]||"◆"}
function iconMethod(x){return ({"Bank US":"🏦","Bank EU":"🇪🇺","Bank Canada":"🇨🇦","Bank Australia":"🇦🇺","Zelle":"Z","Venmo":"V","Cash App":"$","PayPal":"P","Wise":"W","E-Wallet":"👛"})[x]||"◆"}
function methodData(){return payments()[receiveMethod]||{}}
function currency(){return methodData().currency||"USD"}

function render(){
 const c=cryptos()[sendAsset]||{};
 const p=methodData();
 $("sendIcon").textContent=iconAsset(sendAsset); $("sendName").textContent=sendAsset; $("sendSub").textContent=c.name||sendAsset;
 $("receiveIcon").textContent=iconMethod(receiveMethod); $("receiveName").textContent=receiveMethod;
 $("receiveSub").textContent=`${p.currency||"USD"} • ${p.status==="request"?"By Request":"Available"}`;
 $("amountToken").textContent=`${iconAsset(sendAsset)} ${sendAsset}`;
 $("receiveSmallIcon").textContent=iconMethod(receiveMethod); $("receiveCurrency").textContent=p.currency||"USD";
 $("receiveCurrencyName").textContent=p.currency==="EUR"?"Euro":p.currency==="CAD"?"Canadian Dollar":p.currency==="AUD"?"Australian Dollar":"US Dollar";
 renderNetwork(); update();
}

function items(type){
 if(type==="crypto")return Object.entries(cryptos()).map(([id,v])=>({id,name:id,sub:v.name||id,icon:iconAsset(id)}));
 return Object.entries(payments()).map(([id,v])=>({id,name:id,sub:`${v.currency||""} • ${v.status==="request"?"By Request":"Available"}`,icon:iconMethod(id)}));
}
function openPicker(type){
 pickerType=type;$("pickerTitle").textContent=type==="crypto"?"You Send From":"You Receive To";
 $("pickerList").innerHTML="";
 items(type).forEach(x=>{
  const b=document.createElement("button");b.className="picker-item";
  b.innerHTML=`<span class="coin-icon">${x.icon}</span><span class="selector-text"><b>${x.name}</b><small>${x.sub}</small></span><span>›</span>`;
  b.onclick=()=>{if(type==="crypto")sendAsset=x.id;else receiveMethod=x.id;closePicker();render()};
  $("pickerList").appendChild(b);
 });
 $("picker").classList.remove("hidden");
}
function closePicker(){$("picker").classList.add("hidden")}
$("sendSelector").onclick=()=>openPicker("crypto");
$("receiveSelector").onclick=()=>openPicker("payment");
$("closePicker").onclick=closePicker;

$("swapBtn").onclick=()=>{
 const old=sendAsset;
 const p=methodData();
 const matching=Object.entries(cryptos()).find(([id])=>id===receiveMethod);
 if(p.currency&&old){const target=Object.entries(payments()).find(([id])=>id===old);if(target){receiveMethod=old;sendAsset=matching?receiveMethod:"USDT"}}
 render();
};

function marketRate(){
 const cur=currency();
 if(sendAsset==="USDT"&&cur==="USD")return live.usd;
 if(sendAsset==="USDT"&&cur==="EUR")return live.eur;
 return null;
}
function calculate(){
 const n=Number($("amount").value||0),m=marketRate();
 if(!(m>0)||n<=0)return null;
 const customer=m*(1+fee());
 return {n,m,customer,receive:n*customer};
}
function update(){
 const c=calculate(),cur=currency();
 if(!c){$("receive").textContent="—";$("marketRate").textContent="—";$("customerRate").textContent="—";return}
 $("receive").textContent=`${fmt(c.receive)} ${cur}`;
 $("marketRate").textContent=`1 ${sendAsset} ≈ ${fmt(c.m)} ${cur}`;
 $("customerRate").textContent=`1 ${sendAsset} ≈ ${fmt(c.customer)} ${cur}`;
}
function renderNetwork(){
 const nets=cryptos()[sendAsset]?.networks||[];
 $("network").innerHTML=(nets.length?nets:["Not applicable"]).map(x=>`<option>${x}</option>`).join("");
}
async function fetchLiveRate(){
 try{
  $("rateStatus").textContent="Updating live market rate…";
  const r=await fetch("https://api.coinbase.com/v2/exchange-rates?currency=USDT",{cache:"no-store"});
  if(!r.ok)throw Error();
  const d=await r.json();const usd=Number(d.data.rates.USD),eur=Number(d.data.rates.EUR);
  if(!(usd>0)||!(eur>0))throw Error();
  live={usd,eur};$("rateStatus").textContent="● Live market rate";$("rateStatus").classList.add("ok");update();
 }catch(e){$("rateStatus").textContent="Live rate temporarily unavailable";$("rateStatus").classList.remove("ok")}
}
function newOrder(){return "EP247-"+String(Date.now()).slice(-6)}
function showDrawer(id,show){$(id).classList.toggle("hidden",!show)}
function renderPayment(){
 const c=calculate(),p=methodData();
 if(!c)return false;
 if(p.status==="request"){window.open(`https://t.me/${support()}`,"_blank");return false}
 orderId=newOrder();$("orderBadge").textContent=orderId;
 $("paymentTitle").textContent=(p.title||receiveMethod)+" Payment Details";
 $("paymentInfo").innerHTML=(p.fields||[]).map(([k,v])=>`<div class="payment-row"><span>${k}</span><b>${v}</b></div>`).join("");
 $("paySummary").textContent=`${fmt(c.n)} ${sendAsset}`;$("receiveSummary").textContent=`${fmt(c.receive)} ${currency()}`;
 $("methodSummary").textContent=receiveMethod;$("rateSummary").textContent=`1 ${sendAsset} ≈ ${fmt(c.customer)} ${currency()}`;
 return true;
}
function paymentText(){const p=methodData();return (p.title||receiveMethod)+"\n"+(p.fields||[]).map(([k,v])=>`${k}: ${v}`).join("\n")}
$("amount").oninput=update;
$("continueBtn").onclick=()=>{if(renderPayment())showDrawer("paymentStep",true)};
$("backHome").onclick=()=>showDrawer("paymentStep",false);
$("paidBtn").onclick=()=>{showDrawer("paymentStep",false);showDrawer("submitStep",true)};
$("backPayment").onclick=()=>{showDrawer("submitStep",false);showDrawer("paymentStep",true)};
$("copyInfo").onclick=async()=>{try{await navigator.clipboard.writeText(paymentText());$("copyInfo").textContent="✓ COPIED";setTimeout(()=>$("copyInfo").textContent="COPY PAYMENT INFO",1500)}catch(e){alert(paymentText())}};
$("submitOrder").onclick=()=>{
 if(!$("destination").value.trim())return alert("Please enter your receiving information.");
 if(!$("telegram").value.trim())return alert("Please enter your Telegram username.");
 if(!$("confirmCheck").checked)return alert("Please confirm your information.");
 $("successText").textContent=`Order ${orderId} has been submitted. Please send your successful payment screenshot to our admin on Telegram with this Order ID.`;
 $("success").classList.remove("hidden");$("submitOrder").classList.add("hidden");
};
$("sendTelegram").onclick=()=>{
 const text=`Payment screenshot for Order ${orderId}\nTelegram: ${$("telegram").value.trim()}\nTransaction ID: ${$("txid").value.trim()||"N/A"}\nReceiving: ${$("destination").value.trim()}\nNetwork: ${$("network").value}`;
 window.open(`https://t.me/${admin()}?text=${encodeURIComponent(text)}`,"_blank");
};
$("newOrder").onclick=()=>location.reload();
$("supportNav").href=`https://t.me/${support()}`;$("contactBtn").href=`https://t.me/${support()}`;
render();fetchLiveRate();setInterval(fetchLiveRate,Number(settings().refreshMs||60000));
