(()=>{
  const body=document.body;
  const header=document.querySelector(".site-header");
  const toggle=document.querySelector("[data-nav-toggle]");
  const overlay=document.querySelector("[data-overlay]");
  const overlayClose=document.querySelector("[data-overlay-close]");
  const navLinks=[...document.querySelectorAll("[data-page-link]")];
  const overlayLinks=[...document.querySelectorAll("[data-overlay-link]")];
  const reduceMotion=window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const closeMenu=()=>{
    body.classList.remove("nav-open");
    if(toggle)toggle.setAttribute("aria-expanded","false");
  };

  if(toggle&&overlay){
    toggle.addEventListener("click",()=>{
      const open=body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded",String(open));
    });
    overlay.addEventListener("click",(event)=>{
      if(event.target===overlay)closeMenu();
    });
  }

  if(overlayClose)overlayClose.addEventListener("click",closeMenu);
  overlayLinks.forEach((link)=>link.addEventListener("click",closeMenu));
  navLinks.forEach((link)=>link.addEventListener("click",closeMenu));

  const page=body.dataset.page;
  if(page){
    [...navLinks,...overlayLinks].forEach((link)=>{
      if(link.dataset.pageLink===page)link.setAttribute("aria-current","page");
    });
  }

  const revealItems=[...document.querySelectorAll(".reveal")];
  if(revealItems.length){
    if(reduceMotion||!("IntersectionObserver" in window)){
      revealItems.forEach((item)=>item.classList.add("is-visible"));
    }else{
      const revealObserver=new IntersectionObserver((entries,observer)=>{
        entries.forEach((entry)=>{
          if(entry.isIntersecting){
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },{threshold:.15});
      revealItems.forEach((item)=>revealObserver.observe(item));
    }
  }

  const counters=[...document.querySelectorAll("[data-counter]")];
  const runCounter=(el)=>{
    const target=Number(el.dataset.counter||0);
    const suffix=el.dataset.suffix||"";
    if(reduceMotion){
      el.textContent=`${target}${suffix}`;
      return;
    }
    const start=performance.now();
    const duration=1300;
    const tick=(now)=>{
      const progress=Math.min((now-start)/duration,1);
      const current=Math.floor(progress*target);
      el.textContent=`${current}${suffix}`;
      if(progress<1)requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if(counters.length){
    if(reduceMotion||!("IntersectionObserver" in window)){
      counters.forEach(runCounter);
    }else{
      const counterObserver=new IntersectionObserver((entries,observer)=>{
        entries.forEach((entry)=>{
          if(entry.isIntersecting){
            runCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },{threshold:.35});
      counters.forEach((counter)=>counterObserver.observe(counter));
    }
  }

  const pattern=document.querySelector("[data-parallax]");
  let parallaxEnabled=!reduceMotion&&window.innerWidth>=768&&Boolean(pattern);
  const onResize=()=>{parallaxEnabled=!reduceMotion&&window.innerWidth>=768&&Boolean(pattern);};
  window.addEventListener("resize",onResize);

  let ticking=false;
  const applyScrollState=()=>{
    ticking=false;
    const y=window.scrollY||0;
    if(header)header.classList.toggle("scrolled",y>80);
    if(parallaxEnabled&&pattern)pattern.style.transform=`translate3d(0,${Math.round(y*0.4)}px,0)`;
  };

  const onScroll=()=>{
    if(ticking)return;
    ticking=true;
    window.requestAnimationFrame(applyScrollState);
  };

  window.addEventListener("scroll",onScroll,{passive:true});
  applyScrollState();
})();
