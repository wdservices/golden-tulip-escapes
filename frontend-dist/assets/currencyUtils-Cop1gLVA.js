const n=(r,t="NGN",m="en-NG")=>new Intl.NumberFormat(m,{style:"currency",currency:t,minimumFractionDigits:2,maximumFractionDigits:2}).format(r);export{n as f};
