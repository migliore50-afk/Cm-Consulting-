
(function(){
  const KEY="cm_assistant_v7";
  const get=()=>{try{return JSON.parse(localStorage.getItem(KEY)||"{}")}catch(e){return{}}};
  const set=x=>{try{localStorage.setItem(KEY,JSON.stringify({...get(),...x}))}catch(e){}};

  function mount(){
    if(document.getElementById("cm-assistant")) return;
    const el=document.createElement("aside");
    el.id="cm-assistant";
    el.innerHTML=`
      <button class="cm-ai-toggle" aria-label="Apri Assistente CM">
        <span class="cm-ai-avatar"><img src="assets/assistente-cm-retina-480.webp" alt="Assistente CM"></span>
        <span>Assistente CM</span>
      </button>
      <div class="cm-ai-panel" role="dialog" aria-label="Assistente CM">
        <div class="cm-ai-top">
          <div class="cm-ai-person">
            <span class="cm-ai-avatar large"><img src="assets/assistente-cm-retina-480.webp" alt="Assistente CM"></span>
            <div><strong>Assistente CM</strong><small>Ti accompagno passo passo</small></div>
          </div>
          <button class="cm-ai-close" aria-label="Chiudi">×</button>
        </div>
        <div class="cm-ai-body">
          <div class="cm-ai-bubble">Ciao, sono l'Assistente CM.<br>Dimmi semplicemente di cosa hai bisogno e ti aiuto a preparare la richiesta.</div>
          <div class="cm-ai-actions">
            <button data-go="fideiussioni.html">Mi serve una fideiussione</button>
            <button data-go="capacita-finanziaria.html">Capacità finanziaria</button>
            <button data-go="richiedi-preventivo.html">Non so esattamente cosa mi serve</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(el);

    const panel=el.querySelector(".cm-ai-panel");
    const toggle=el.querySelector(".cm-ai-toggle");
    const close=el.querySelector(".cm-ai-close");
    toggle.onclick=()=>{panel.classList.add("open");set({dismissed:false})};
    close.onclick=()=>{panel.classList.remove("open");set({dismissed:true})};
    el.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>location.href=b.dataset.go);
    setTimeout(()=>{if(!get().dismissed) panel.classList.add("open")},1800);
  }

  function formUX(){
    document.querySelectorAll("form").forEach(form=>{
      const controls=[...form.querySelectorAll("input,select,textarea")];
      controls.forEach(c=>{
        c.addEventListener("blur",()=>{
          if(c.required && !c.value.trim()){
            c.classList.add("cm-field-error");
          } else c.classList.remove("cm-field-error");
        });
        c.addEventListener("input",()=>c.classList.remove("cm-field-error"));
      });
    });
  }
  window.CMAssistant={mount,formUX};
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",()=>{mount();formUX()});
  else {mount();formUX();}
})();
