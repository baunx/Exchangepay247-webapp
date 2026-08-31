let mode="buy";
let selectedMethod="Bank US";
let live={usd:null,eur:null};
let orderId="";
const $=id=>document.getElementById(id);

function fill(sel,items){sel.innerHTML=items.map(x=>`<option>${x}</option>`).join("");}

function setup(){
  if(mode==="buy"){
    fill($("sendAsset"),["USD","EUR"]);
    fill($("receiveAsset"),["USDT"]);
  }else{
    fill($("sendAsset"),["USDT"]);
    fill($("receiveAsset"),["USD","EUR"]);
  }
  $("sendLabel").textContent=mode==="buy"?"You Pay":"You Send";
  renderMethods();
  update();
}

function marketRate(a,b){
  if(a==="USDT"&&b==="USD") return live.usd;
  if(a==="USD"&&b==="USDT") return live.usd ? 1/live.usd : null;
  if(a==="USDT"&&b==="EUR") return live.eur;
  if(a==="EUR"&&b==="USDT") return live.eur ? 1/live.eur : null;
  return null;
}

function calculate(){
  const a=$("sendAsset").value,b=$("receiveAsset").value,n=Number($("amount").value||0);
  const market=marketRate(a,b), fee=CONFIG.feePercent/100;
  if(!market) return null;

  // Fee only: BUY = customer pays market + fee; SELL = customer receives market - fee.
  const customerRate=mode==="buy"?market*(1+fee):market*(1-fee);
  const receive=mode==="buy"?n/customerRate:n*customerRate;
  return {a,b,n,market,customerRate,receive};
}

function update(){
  const c=calculate();
  $("fee").textContent=`${CONFIG.feePercent.toFixed(2)}%`;
  if(!c){
    $("receive").value="—"; $("marketRate").textContent="Waiting…"; $("customerRate").textContent="Waiting…"; return;
  }
  $("receive").value=c.receive.toLocaleString(undefined,{maximumFractionDigits:8});
  $("marketRate").textContent=`1 ${c.a} ≈ ${c.market.toLocaleString(undefined,{maximumFractionDigits:8})} ${c.b}`;
  $("customerRate").textContent=`1 ${c.a} ≈ ${c.customerRate.toLocaleString(undefined,{maximumFractionDigits:8})} ${c.b}`;
}

async function fetchLiveRate(){
  try{
    const r=await fetch("https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=usd,eur",{cache:"no-store"});
    if(!r.ok) throw new Error("rate request failed");
    const d=await r.json();
    live.usd=Number(d.tether.usd); live.eur=Number(d.tether.eur);
    $("liveStatus").textContent="● LIVE";
    $("liveStatus").classList.add("live-ok");
    update();
  }catch(e){
    $("liveStatus").textContent="● RATE ERROR";
    $("liveStatus").classList.remove("live-ok");
  }
}

function renderMethods(){
  $("methodList").innerHTML=Object.keys(CONFIG.payment).map(name=>{
    const icon={ "Bank US":"🏦","Bank EU":"🇪🇺","Zelle":"💜","Venmo":"💳","Cash App":"💵","PayPal":"🅿️","Wise":"🌍","E-Wallet":"👛"}[name]||"💳";
    return `<button class="method ${name===selectedMethod?"selected":""}" data-name="${name}">
      <span>${icon}</span><b>${name}</b>
    </button>`;
  }).join("");
  document.querySelectorAll(".method").forEach(b=>b.onclick=()=>{selectedMethod=b.dataset.name;renderMethods()});
}

function showStep(n){
  [1,2,3].forEach(i=>$("step"+i).classList.toggle("hidden",i!==n));
  [1,2,3].forEach(i=>$("s"+i).classList.toggle("active",i<=n));
  window.scrollTo({top:0,behavior:"smooth"});
}

function newOrderId(){
  const d=new Date();
  return "EP247-"+String(d.getTime()).slice(-6);
}

function renderPayment(){
  const c=calculate();
  orderId=newOrderId();
  $("orderBadge").textContent=orderId;
  const info=CONFIG.payment[selectedMethod];
  $("paymentTitle").textContent=info.title+" Payment Details";
  $("paymentInfo").innerHTML=info.fields.map(([k,v])=>
    `<div class="payment-row"><span>${k}</span><strong>${v}</strong></div>`).join("");
  $("paySummary").textContent=`${c.n} ${c.a}`;
  $("receiveSummary").textContent=`${c.receive.toLocaleString(undefined,{maximumFractionDigits:8})} ${c.b}`;
  $("methodSummary").textContent=selectedMethod;
  $("rateSummary").textContent=`1 ${c.a} ≈ ${c.customerRate.toLocaleString(undefined,{maximumFractionDigits:8})} ${c.b}`;
}

function paymentText(){
  const info=CONFIG.payment[selectedMethod];
  return info.title+"\n"+info.fields.map(([k,v])=>`${k}: ${v}`).join("\n");
}

document.querySelectorAll(".mode").forEach(b=>b.onclick=()=>{
  document.querySelectorAll(".mode").forEach(x=>x.classList.remove("active"));
  b.classList.add("active"); mode=b.dataset.mode; setup();
});
$("amount").oninput=update;
$("sendAsset").onchange=update;
$("receiveAsset").onchange=update;

$("toPayment").onclick=()=>{
  if(!calculate()) return alert("Live rate is not available yet.");
  renderPayment(); showStep(2);
};
$("toSubmit").onclick=()=>showStep(3);
$("back1").onclick=()=>showStep(1);
$("back2").onclick=()=>showStep(2);

$("copyInfo").onclick=async()=>{
  try{await navigator.clipboard.writeText(paymentText()); $("copyInfo").textContent="✓ COPIED"; setTimeout(()=>$("copyInfo").textContent="📋 COPY PAYMENT INFO",1500)}
  catch(e){alert(paymentText())}
};

$("proof").onchange=()=>{
  $("fileText").textContent=$("proof").files[0]?`✓ ${$("proof").files[0].name}`:"📎 Upload screenshot / receipt";
};

$("submitOrder").onclick=()=>{
  if(!$("destination").value.trim()) return alert("Please enter your receiving information.");
  if(!$("telegram").value.trim()) return alert("Please enter your Telegram username.");
  if(!$("confirmCheck").checked) return alert("Please confirm your payment information.");

  $("successText").textContent=`Order ${orderId} has been submitted. Please send your successful payment screenshot to our admin on Telegram with this Order ID.`;
  $("success").classList.remove("hidden");
  $("submitOrder").classList.add("hidden");
};

$("sendTelegram").onclick=()=>{
  const username=String(CONFIG.adminTelegram||"").replace(/^@/,"");
  const text=encodeURIComponent(
    `Payment screenshot for Order ${orderId}\n`+
    `Telegram: ${$("telegram").value.trim()}\n`+
    `Transaction ID: ${$("txid").value.trim()||"N/A"}`
  );
  window.open(`https://t.me/${username}?text=${text}`,"_blank");
};

$("newOrder").onclick=()=>location.reload();

setup();
fetchLiveRate();
setInterval(fetchLiveRate,CONFIG.refreshMs);
